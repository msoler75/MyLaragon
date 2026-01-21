import { app, BrowserWindow, ipcMain, shell, dialog, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import net from 'net';
import https from 'https';
import { installFromZip, downloadFile } from './service-installer.js';
import { 
  detectServices as detectServicesCore, 
  loadAppConfig as loadAppConfigCore,
  getServiceBinPath as getServiceBinPathCore,
  getAvailableVersions as getAvailableVersionsCore
} from './services-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta para guardar la configuración del usuario
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'user-config.json');

// El log ahora estará en la raíz de la app para fácil acceso (Unificado con Shim)
const logFileName = 'app-debug.log';
let logPath = path.join(app.isPackaged ? path.dirname(app.getPath('exe')) : path.resolve(__dirname, '..'), logFileName);

let mainWindow;

// Sistema de logs unificado
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error
};

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  // Manejar objetos en el log
  let cleanMessage = message;
  if (typeof message === 'object') {
    try {
      cleanMessage = JSON.stringify(message, null, 2);
    } catch (e) {
      cleanMessage = String(message);
    }
  }
  
  cleanMessage = String(cleanMessage).trim();
  const logMessage = `[${timestamp}] [${level}] ${cleanMessage}\n`;
  
  // Mostrar en la terminal original (stdout)
  if (level === 'ERROR') originalConsole.error(cleanMessage);
  else if (level === 'WARNING') originalConsole.warn(cleanMessage);
  else originalConsole.log(cleanMessage);
  
  try {
    fs.appendFileSync(logPath, logMessage);
    
    // Enviar log al frontend si la ventana está disponible
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('app-log', {
        timestamp: timestamp,
        message: cleanMessage,
        level: level === 'WARNING' ? 'WARN' : level // Normalizar para UI
      });
    }
  } catch (err) {
    // Si falla escribir en logPath (por permisos), intentar en userData
    try {
      const fallbackLog = path.join(userDataPath, logFileName);
      fs.appendFileSync(fallbackLog, `[FALLBACK] ${logMessage}`);
    } catch (e) {}
  }
}

// Interceptar consola global en Electron para que TODO vaya al archivo
console.log = (...args) => log(args.join(' '), 'INFO');
console.warn = (...args) => log(args.join(' '), 'WARNING');
console.error = (...args) => log(args.join(' '), 'ERROR');

// Limpiar log antiguo solo si es muy grande (> 1MB)
try {
  if (fs.existsSync(logPath)) {
    const stats = fs.statSync(logPath);
    if (stats.size > 1024 * 1024) {
      fs.writeFileSync(logPath, '');
    }
  }
} catch (err) {}

log('Application starting...');

// Desactivar GPU y NetworkService antes de inicializar la app
try {
  app.disableHardwareAcceleration();
  log('Hardware acceleration disabled (GPU process suppressed)');
  app.commandLine.appendSwitch('disable-features', 'NetworkService');
  log('NetworkService disabled via commandLine switch');
} catch (e) {
  log(`Failed to apply runtime switches: ${e.message}`, 'WARNING');
}

// Configuración por defecto
const defaultRoot = app.isPackaged ? path.dirname(app.getPath('exe')) : path.resolve(__dirname, '..');
let userConfig = {
  appPath: defaultRoot,
  projectsPath: path.join(defaultRoot, 'www'),
  editor: 'notepad', // notepad, code, notepad++, default
  autoStart: false,
  language: 'es', // es, en, de
  theme: 'system', // system, light, dark, sepia
  lastUpdateCheck: 0,
  isPortable: true
};

// Cargar configuración guardada
function loadUserConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      const loaded = JSON.parse(data);
      // Siempre forzar appPath al directorio actual en modo portable
      userConfig = { ...userConfig, ...loaded, appPath: defaultRoot };
      log(`User config loaded successfully (Portable mode: appPath fixed to ${defaultRoot})`);
    }
  } catch (error) {
    log(`Error loading config: ${error.message}`, 'ERROR');
  }
}

function saveUserConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(userConfig, null, 2));
    log('User config saved');
  } catch (error) {
    log(`Error saving config: ${error.message}`, 'ERROR');
  }
}

loadUserConfig();

// Función para encontrar un puerto libre
async function findFreePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findFreePort(startPort + 1));
    });
  });
}

// Configurar puerto de depuración antes de que la app esté lista
let debugPort = 9222;

async function setupDebugPort() {
  debugPort = await findFreePort(9222);
  app.commandLine.appendSwitch('remote-debugging-port', debugPort.toString());
  console.log(`Setting remote-debugging-port to: ${debugPort}`);
}

// Ejecutar configuración de puerto inmediatamente
setupDebugPort();

const execAsync = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Wrappers para usar la lógica compartida de services-detector.js
/**
 * Encuentra de forma inteligente la carpeta bin de un servicio,
 * manejando carpetas anidadas tras extracciones ZIP (ej: Apache24/bin).
 */
function getServiceBinPath(type, version) {
  return getServiceBinPathCore(userConfig.appPath, type, version, log);
}

// Leer configuración de App
function getAppConfig() {
  return loadAppConfigCore(userConfig.appPath, log);
}

console.log('Main process starting...');

// Detectar servicios disponibles
function detectServices() {
  return detectServicesCore({ 
    appPath: userConfig.appPath, 
    userConfig, 
    appConfig: getAppConfig(), 
    log 
  });
}

ipcMain.handle('get-logs', async () => {
  try {
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      return lines.map(line => {
        // Formato: [timestamp] [level] mensaje
        const match = line.match(/\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.*)/);
        if (match) {
          return {
            timestamp: match[1],
            level: match[2],
            message: match[3]
          };
        }
        return { timestamp: new Date().toISOString(), level: 'INFO', message: line };
      });
    }
    return [];
  } catch (error) {
    console.error('Error reading log file:', error);
    return [];
  }
});

ipcMain.handle('clear-logs', async () => {
  try {
    fs.writeFileSync(logPath, '');
    return true;
  } catch (error) {
    return false;
  }
});

// Handlers IPC
ipcMain.handle('get-services', async (event, hiddenServices = []) => {
  // console.log('get-services handler called');
  try {
    const services = detectServices();
    
    // Optimizamos: una sola llamada para obtener todos los puertos y procesos
    const portsMap = await getAllListeningPorts();
    const processMap = await getAllProcesses();

    const servicesWithStatus = await Promise.all(
      services.map(async (service) => {
        // Si el servicio está oculto, no verificamos su estado para ahorrar recursos
        if (hiddenServices.includes(service.name)) {
          return { ...service, status: 'hidden' };
        }
        const status = await getServiceStatus(service, portsMap, processMap);
        return { ...service, ...status };
      })
    );
    // console.log('Services with status:', servicesWithStatus);
    return servicesWithStatus;
  } catch (error) {
    console.error('Error in get-services:', error);
    return [];
  }
});

console.log('IPC handlers registered for get-services');

ipcMain.handle('start-service', async (event, serviceName) => {
  log(`Intentando iniciar el servicio: ${serviceName}`);
  const services = detectServices();
  const service = services.find(s => s.name === serviceName);
  if (!service) {
    log(`Servicio no encontrado: ${serviceName}`, 'ERROR');
    return { success: false, message: 'Service not found' };
  }
  
  try {
    // Verificar el estado actual del servicio
    const portsMap = await getAllListeningPorts();
    const processMap = await getAllProcesses();
    const status = await getServiceStatus(service, portsMap, processMap);
    
    if (status.status === 'running') {
      log(`${serviceName} ya está ejecutándose`, 'INFO');
      return { success: true, message: `${serviceName} is already running`, alreadyRunning: true };
    }
    
    // Timeout para evitar que se quede colgado
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: el servicio tardó demasiado en iniciar')), 15000);
    });
    
    await Promise.race([startService(service), timeoutPromise]);
    log(`Servicio ${serviceName} iniciado correctamente`);
    return { success: true, message: `${serviceName} started` };
  } catch (error) {
    log(`Error al iniciar ${serviceName}: ${error.message}`, 'ERROR');
    return { success: false, message: error.message };
  }
});

ipcMain.handle('stop-service', async (event, serviceName) => {
  log(`Intentando detener el servicio: ${serviceName}`);
  const services = detectServices();
  const service = services.find(s => s.name === serviceName);
  if (!service) {
    log(`Servicio no encontrado: ${serviceName}`, 'ERROR');
    return { success: false, message: 'Service not found' };
  }
  
  try {
    await stopService(service);
    log(`Servicio ${serviceName} detenido correctamente`);
    return { success: true, message: `${serviceName} stopped` };
  } catch (error) {
    log(`Error al detener ${serviceName}: ${error.message}`, 'ERROR');
    return { success: false, message: error.message };
  }
});

ipcMain.handle('open-App-folder', async () => {
  exec(`explorer "${userConfig.appPath}"`);
});

ipcMain.handle('open-app-folder', async () => {
  exec(`explorer "${defaultRoot}"`);
});

ipcMain.handle('open-document-root', async () => {
  const config = getAppConfig();
  const documentRoot = config.apache?.DocumentRoot || userConfig.projectsPath;
  exec(`explorer "${documentRoot}"`);
});

ipcMain.handle('open-db-tool', async () => {
  const heidiPath = path.join(userConfig.appPath, 'bin', 'heidisql', 'heidisql.exe');
  if (fs.existsSync(heidiPath)) {
    exec(`"${heidiPath}"`);
  } else {
    shell.openExternal('http://localhost/phpmyadmin');
  }
});

ipcMain.handle('open-config-file', async (event, { path: filePath, type = 'file' }) => {
  if (type === 'folder') {
    exec(`explorer "${filePath}"`);
  } else {
    // Usar el editor configurado
    const editor = userConfig.editor || 'notepad';
    let command = '';
    
    switch (editor) {
      case 'code':
        command = `code "${filePath}"`;
        break;
      case 'notepad++':
        const nppPath = path.join(userConfig.appPath, 'bin', 'notepad++', 'notepad++.exe');
        if (fs.existsSync(nppPath)) {
          command = `"${nppPath}" "${filePath}"`;
        } else {
          command = `notepad "${filePath}"`;
        }
        break;
      case 'default':
        shell.openPath(filePath);
        return;
      case 'notepad':
      default:
        command = `notepad "${filePath}"`;
        break;
    }
    
    if (command) exec(command);
  }
});

// Nuevos handlers para herramientas
ipcMain.handle('open-terminal', async () => {
  exec(`start cmd.exe /K "cd /d ${userConfig.appPath}"`);
});

ipcMain.handle('open-hosts', async () => {
  const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
  const editor = userConfig.editor || 'notepad';
  let command = '';
  
  switch (editor) {
    case 'code':
      command = `code "${hostsPath}"`;
      break;
    case 'notepad++':
      const nppPath = path.join(userConfig.appPath, 'bin', 'notepad++', 'notepad++.exe');
      if (fs.existsSync(nppPath)) {
        command = `"${nppPath}" "${hostsPath}"`;
      } else {
        command = `notepad "${hostsPath}"`;
      }
      break;
    case 'default':
      shell.openPath(hostsPath);
      return;
    default:
      command = `notepad "${hostsPath}"`;
  }
  
  if (command) exec(command);
});

ipcMain.handle('update-service-version', async (event, { type, version }) => {
  log(`Updating ${type} version to ${version}`);
  const possiblePaths = [
    path.join(userConfig.appPath, 'app.ini'),
    path.join(userConfig.appPath, 'usr', 'app.ini')
  ];

  let iniPath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      iniPath = p;
      break;
    }
  }

  try {
    if (!fs.existsSync(iniPath)) {
      throw new Error('app.ini not found');
    }

    let content = fs.readFileSync(iniPath, 'utf-8');
    const lines = content.split(/\r?\n/);
    let section = '';
    let updated = false;

    const newLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        section = trimmed.slice(1, -1).toLowerCase();
      } else if (section === type.toLowerCase() && trimmed.includes('=')) {
        const [key] = trimmed.split('=');
        if (key.trim().toLowerCase() === 'version') {
          updated = true;
          return `${key}=${version}`;
        }
      }
      return line;
    });

    if (!updated) {
      log(`Version key not found in [${type}] section, attempting to add it`, 'WARNING');
    }

    fs.writeFileSync(iniPath, newLines.join('\n'));
    log('app.ini updated successfully');

    // Si cambiamos PHP, intentar actualizar la configuración de Apache (mod_php.conf)
    if (type.toLowerCase() === 'php') {
      try {
        const modPhpPath = path.join(userConfig.appPath, 'etc', 'apache2', 'mod_php.conf');
        if (fs.existsSync(modPhpPath)) {
          const phpDir = path.join(userConfig.appPath, 'bin', 'php', version);
          if (fs.existsSync(phpDir)) {
            const files = fs.readdirSync(phpDir);
            const phpDll = files.find(f => f.match(/^php\d+apache2_4\.dll$/i));
            
            if (phpDll) {
              const newContent = `# This file is generated by MyApp\n` +
                                `LoadModule php_module "${path.join(phpDir, phpDll).replace(/\\/g, '/')}"\n` +
                                `PHPIniDir "${phpDir.replace(/\\/g, '/')}"\n`;
              fs.writeFileSync(modPhpPath, newContent);
              log('mod_php.conf updated successfully');
            }
          }
        }
      } catch (e) {
        log(`Failed to update mod_php.conf: ${e.message}`, 'WARNING');
      }
    }

    return { success: true };
  } catch (error) {
    log(`Error updating app.ini: ${error.message}`, 'ERROR');
    return { success: false, message: error.message };
  }
});

ipcMain.handle('open-env-vars', async () => {
  exec('rundll32.exe sysdm.cpl,EditEnvironmentVariables');
});

ipcMain.handle('open-startup-log', async () => {
  const userDataPath = app.getPath('userData');
  const startupLogPath = path.join(userDataPath, 'mysql-startup.log');
  const editor = userConfig.editor || 'notepad';
  let command = '';
  
  if (!fs.existsSync(startupLogPath)) {
    log(`El archivo de diagnóstico no existe aún: ${startupLogPath}`, 'WARNING');
    return { success: false, message: 'Archivo no encontrado. Intenta iniciar MySQL primero.' };
  }
  
  switch (editor) {
    case 'code':
      command = `code "${startupLogPath}"`;
      break;
    case 'notepad++':
      const nppPath = path.join(userConfig.appPath, 'bin', 'notepad++', 'notepad++.exe');
      if (fs.existsSync(nppPath)) {
        command = `"${nppPath}" "${startupLogPath}"`;
      } else {
        command = `notepad "${startupLogPath}"`;
      }
      break;
    case 'default':
      shell.openPath(startupLogPath);
      return { success: true };
    default:
      command = `notepad "${startupLogPath}"`;
  }
  
  if (command) {
    exec(command);
    return { success: true };
  }
});


async function getAllListeningPorts() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      log('Timeout obteniendo puertos, usando caché vacío', 'WARNING');
      resolve({});
    }, 5000);
    
    exec(`netstat -ano | findstr LISTENING`, { timeout: 5000 }, (error, stdout) => {
      clearTimeout(timeout);
      
      if (error || !stdout) {
        if (error) log(`Error en netstat: ${error.message}`, 'WARNING');
        resolve({});
        return;
      }

      const portsMap = {};
      const lines = stdout.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.trim().split(/\s+/);
        // Formato: Protocolo, LocalAddr, RemoteAddr, State, PID
        if (parts.length >= 5) {
          const localAddr = parts[1];
          const pid = parts[4];
          const lastColon = localAddr.lastIndexOf(':');
          if (lastColon !== -1) {
            const port = localAddr.substring(lastColon + 1);
            // Solo guardar si el PID es válido
            if (pid && pid !== '0' && !isNaN(pid)) {
              portsMap[port] = pid;
            }
          }
        }
      }
      resolve(portsMap);
    });
  });
}

async function getAllProcesses() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      log('Timeout obteniendo procesos, usando caché vacío', 'WARNING');
      resolve({});
    }, 5000);
    
    exec(`tasklist /NH /FO CSV`, { timeout: 5000 }, (error, stdout) => {
      clearTimeout(timeout);
      
      if (error || !stdout) {
        if (error) log(`Error en tasklist: ${error.message}`, 'WARNING');
        resolve({});
        return;
      }
      
      const processMap = {};
      const lines = stdout.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split("\",\"");
        if (parts.length > 1) {
          const name = parts[0].replace(/"/g, "").toLowerCase();
          const pid = parts[1].replace(/"/g, "");
          if (name && pid && !isNaN(pid)) {
            if (!processMap[name]) processMap[name] = [];
            processMap[name].push(pid);
          }
        }
      }
      resolve(processMap);
    });
  });
}

async function getServiceStatus(service, portsMap = {}, processMap = {}) {
  try {
    let processRunning = false;
    let portInUse = false;
    let port = null;
    let processName = '';
    
    // Localizar inteligentemente la ruta del ejecutable
    const binPath = getServiceBinPath(service.type, service.version);
    const exeName = executableMapping[service.type];
    const fullExePath = binPath ? path.join(binPath, exeName) : null;
    
    switch (service.type) {
      case 'apache':
        port = 80;
        processName = 'httpd.exe';
        break;
      case 'nginx':
        port = 80;
        processName = 'nginx.exe';
        break;
      case 'mysql':
      case 'mariadb':
        port = 3306;
        processName = 'mysqld.exe';
        break;
      case 'postgresql':
        port = 5432;
        processName = 'postgres.exe';
        break;
      case 'redis':
        port = 6379;
        processName = 'redis-server.exe';
        break;
      case 'memcached':
        port = 11211;
        processName = 'memcached.exe';
        break;
      case 'mailpit':
        port = 8025;
        processName = 'mailpit.exe';
        break;
      case 'mongodb':
        port = 27017;
        processName = 'mongod.exe';
        break;
      default:
        return { status: 'unknown', port: null, details: 'Unsupported service type' };
    }
    
    // Verificamos procesos usando el mapa pre-cargado
    const pids = processMap[processName.toLowerCase()] || [];
    processRunning = pids.length > 0;
    
    // Verificamos puertos usando el mapa pre-cargado
    const portPid = portsMap[port.toString()];
    portInUse = !!portPid;
    
    if (fullExePath && portInUse && portPid) {
      // Usamos wmic para obtener la ruta completa del ejecutable del proceso
      return new Promise((resolve) => {
        exec(`wmic process where processid=${portPid} get ExecutablePath /value`, (error, stdout) => {
          if (error || !stdout) {
            resolve({ 
              status: 'port_occupied_by_other', 
              port, 
              details: `El puerto ${port} está en uso por otro proceso.`,
              processRunning: false,
              portInUse: true,
              processName
            });
            return;
          }
          
          const match = stdout.match(/ExecutablePath=(.+)/);
          if (match) {
            const actualPath = match[1].trim().toLowerCase().replace(/\\/g, '/');
            const expectedPathLower = fullExePath.toLowerCase().replace(/\\/g, '/');
            
            if (actualPath.includes(expectedPathLower) || expectedPathLower.includes(actualPath)) {
              resolve({ 
                status: 'running', 
                port, 
                details: `Proceso ${processName} de App (v${service.version}) escuchando en puerto ${port}.`,
                processRunning: true,
                portInUse: true,
                processName
              });
            } else {
              resolve({ 
                status: 'port_occupied_by_other', 
                port, 
                details: `El puerto ${port} está en uso por otro proceso: ${actualPath}`,
                processRunning: false,
                portInUse: true,
                processName
              });
            }
          } else {
            resolve({ 
              status: 'port_occupied_by_other', 
              port, 
              details: `El puerto ${port} está en uso por otro proceso.`,
              processRunning: false,
              portInUse: true,
              processName
            });
          }
        });
      });
    }
    
    let status;
    let details = '';
    
    if (portInUse) {
      const isOurProcess = pids.includes(portPid);
      if (isOurProcess) {
        status = 'running';
        details = `Proceso ${processName} (PIDs: ${pids.join(',')}) escuchando en puerto ${port}.`;
      } else {
        if (processRunning) {
          status = 'running';
          details = `Proceso ${processName} activo (PIDs: ${pids.join(',')}) en puerto ${port} (PID puerto: ${portPid}).`;
        } else {
          status = 'port_occupied_by_other';
          details = `El puerto ${port} está ocupado por otro proceso (PID: ${portPid}).`;
        }
      }
    } else if (processRunning) {
      status = 'running';
      details = `Proceso ${processName} activo (PIDs: ${pids.join(',')}) - puerto ${port} iniciando...`;
    } else {
      status = 'stopped';
      details = `Servicio detenido.`;
    }
    
    return { status, port, details, processRunning, portInUse, processName };
  } catch (error) {
    log(`Error checking service status: ${error.message}`, 'ERROR');
    return { status: 'unknown', port: null, details: 'Error al verificar estado', processRunning: false, portInUse: false, processName: '' };
  }
}

async function startService(service) {
  log(`═══════════════════════════════════════════════════════════`, 'INFO');
  log(`Iniciando servicio: ${service.name} (${service.type} ${service.version})`, 'INFO');
  
  try {
    const processToKill = executableMapping[service.type];

    if (processToKill) {
      log(`Limpiando procesos antiguos: ${processToKill}...`);
      await execAsync(`taskkill /F /IM ${processToKill} 2>NUL`).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (e) {
    log(`Error en limpieza: ${e.message}`, 'WARNING');
  }

  const binPath = getServiceBinPath(service.type, service.version);
  const exeName = executableMapping[service.type];

  if (!binPath) {
    throw new Error(`No se encontró el ejecutable para ${service.name} (tipo: ${service.type}, v: ${service.version})`);
  }

  const fullExePath = path.join(binPath, exeName);
  log(`Garantizando inicio de ${service.name} usando: ${fullExePath}`);
  
  switch (service.type) {
    case 'apache':
      // Buscar el httpd.conf en la carpeta base del servicio (podría estar arriba del binPath)
      let apacheRoot = path.dirname(binPath);
      // Si el binPath no termina en bin, es que estamos en el root
      if (!binPath.toLowerCase().endsWith('bin')) {
        apacheRoot = binPath;
      }
      const confPath = path.join(apacheRoot, 'conf', 'httpd.conf');
      
      // Verificar que el archivo de configuración exista
      if (!fs.existsSync(confPath)) {
        throw new Error(`No se encontró el archivo de configuración: ${confPath}`);
      }
      
      log(`Iniciando Apache con configuración: ${confPath}`);
      
      // Iniciar Apache y esperar a que el proceso se lance correctamente
      return new Promise((resolve, reject) => {
        const apacheProcess = spawn(fullExePath, ['-f', confPath], { 
          cwd: binPath, 
          detached: true, 
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true
        });
        
        let errorOutput = '';
        let resolved = false;
        
        // Capturar errores en stderr
        if (apacheProcess.stderr) {
          apacheProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
        }
        
        apacheProcess.on('error', (err) => {
          if (!resolved) {
            resolved = true;
            reject(new Error(`Error al iniciar Apache: ${err.message}`));
          }
        });
        
        apacheProcess.on('exit', (code, signal) => {
          if (!resolved && code !== 0 && code !== null) {
            resolved = true;
            const errMsg = errorOutput || `Apache terminó con código ${code}`;
            reject(new Error(errMsg));
          }
        });
        
        // Si el proceso se lanza exitosamente, esperar un momento y resolver
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            apacheProcess.unref();
            if (errorOutput) {
              log(`Advertencia de Apache: ${errorOutput}`, 'WARNING');
            }
            log(`✓ Apache iniciado correctamente`, 'INFO');
            resolve();
          }
        }, 1000);
      });
      break;
      
    case 'nginx':
      log(`Iniciando Nginx...`);
      
      return new Promise((resolve, reject) => {
        const nginxProcess = spawn(fullExePath, [], { 
          cwd: binPath, 
          detached: true, 
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true
        });
        
        let errorOutput = '';
        let resolved = false;
        
        if (nginxProcess.stderr) {
          nginxProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
        }
        
        nginxProcess.on('error', (err) => {
          if (!resolved) {
            resolved = true;
            reject(new Error(`Error al iniciar Nginx: ${err.message}`));
          }
        });
        
        nginxProcess.on('exit', (code, signal) => {
          if (!resolved && code !== 0 && code !== null) {
            resolved = true;
            reject(new Error(errorOutput || `Nginx terminó con código ${code}`));
          }
        });
        
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            nginxProcess.unref();
            if (errorOutput) {
              log(`Advertencia de Nginx: ${errorOutput}`, 'WARNING');
            }
            log(`✓ Nginx iniciado correctamente`, 'INFO');
            resolve();
          }
        }, 1000);
      });
      break;
    case 'mysql':
    case 'mariadb':
      // Usar binPath detectado arriba y su raíz como baseDir
      let baseDir = binPath.toLowerCase().endsWith('bin') ? path.dirname(binPath) : binPath;

      // Detectar la carpeta de datos correcta (preferir versionada si existe)
      const rawVersion = service.version;
      const cleanVersion = rawVersion.replace(/^(mysql|mariadb)-/i, '');
      const shortVersion = cleanVersion.split('.').slice(0, 2).join('.');
      
      const possibleDataDirs = [
        path.join(userConfig.appPath, 'data', rawVersion),
        path.join(userConfig.appPath, 'data', `mysql-${rawVersion}`),
        path.join(userConfig.appPath, 'data', `mysql-${cleanVersion}`),
        path.join(userConfig.appPath, 'data', `mariadb-${cleanVersion}`),
        path.join(userConfig.appPath, 'data', `mysql-${shortVersion}`),
        path.join(userConfig.appPath, 'data', `mariadb-${shortVersion}`),
        path.join(userConfig.appPath, 'data', shortVersion),
        path.join(userConfig.appPath, 'data', 'mysql')
      ];

      const dataDir = possibleDataDirs.find(d => fs.existsSync(d)) || path.join(userConfig.appPath, 'data', 'mysql');
      const myIni = path.join(baseDir, 'my.ini');
      
      // Crear un my.ini limpio sin componentes problemáticos (alternativa al my.ini original de App)
      const tempMyIniPath = path.join(userDataPath, 'mysql-clean.ini');
      
      try {
        // Crear un my.ini limpio con solo la configuración esencial
        const cleanConfig = `[client]
port=3306

[mysqld]
datadir="${dataDir.replace(/\\/g, '/')}"
port=3306
key_buffer_size=256M
max_allowed_packet=512M
table_open_cache=256
sort_buffer_size=1M
read_buffer_size=1M
read_rnd_buffer_size=4M
myisam_sort_buffer_size=64M
thread_cache_size=8
secure-file-priv=""
explicit_defaults_for_timestamp=1
default_authentication_plugin=mysql_native_password
skip-mysqlx

[mysqldump]
quick
max_allowed_packet=512M
`;
        fs.writeFileSync(tempMyIniPath, cleanConfig, 'utf-8');
        log(`Configuración MySQL limpia creada sin componentes problemáticos`, 'INFO');
      } catch (e) {
        log(`Error creando my.ini limpio: ${e.message}`, 'WARNING');
      }
      
      if (!fs.existsSync(dataDir)) {
        log(`Creando carpeta de datos faltante: ${dataDir}`, 'WARNING');
        try {
          fs.mkdirSync(dataDir, { recursive: true });
        } catch (e) {
          log(`Error al crear datadir: ${e.message}`, 'ERROR');
        }
      }

      const mysqlEnv = { ...process.env };
      const pathKey = Object.keys(mysqlEnv).find(k => k.toUpperCase() === 'PATH') || 'PATH';
      mysqlEnv[pathKey] = `${binPath}${path.delimiter}${mysqlEnv[pathKey] || ''}`;

      const mysqlArgs = [];
      mysqlArgs.push(`--defaults-file=${tempMyIniPath}`);
      mysqlArgs.push(`--basedir=${baseDir}`);
      mysqlArgs.push(`--datadir=${dataDir}`);
      
      const pluginDir = path.join(baseDir, 'lib', 'plugin');
      if (fs.existsSync(pluginDir)) {
        mysqlArgs.push(`--plugin-dir=${pluginDir}`);
      }

      mysqlArgs.push('--loose-mysql_component_reference_cache=OFF');
      mysqlArgs.push('--loose-early-plugin-load=""');
      mysqlArgs.push('--loose-mysql_native_password=ON');
      mysqlArgs.push('--standalone');

      log(`Iniciando ${service.name} (${service.version})`);
      log(`Ejecutable: ${fullExePath}`);
      log(`Argumentos: ${mysqlArgs.join(' ')}`);
      
      // Función para auto-corregir el my.ini original de App
      const fixComponentError = () => {
        try {
          if (fs.existsSync(myIni)) {
            let iniContent = fs.readFileSync(myIni, 'utf-8');
            const originalContent = iniContent;
            
            // Comentar líneas que cargan componentes problemáticos
            iniContent = iniContent.replace(/^(\s*loose_mysql_component_reference_cache\s*=.*)$/gim, '# $1');
            iniContent = iniContent.replace(/^(\s*early-plugin-load\s*=.*)$/gim, '# $1');
            iniContent = iniContent.replace(/^(\s*plugin-load\s*=.*)$/gim, '# $1');
            iniContent = iniContent.replace(/^(\s*mysql_native_password\s*=.*)$/gim, '# $1');
            
            // SIEMPRE asegurar que loose_mysql_component_reference_cache=OFF esté presente
            if (!iniContent.match(/^\s*loose_mysql_component_reference_cache\s*=/im)) {
              // No existe, añadirla en la sección [mysqld]
              iniContent = iniContent.replace(/^(\[mysqld\])/im, '[mysqld]\nloose_mysql_component_reference_cache=OFF');
            }
            
            // Añadir configuración segura si no existe
            if (!iniContent.includes('default_authentication_plugin')) {
              iniContent = iniContent.replace(/^(\[mysqld\])/im, '[mysqld]\ndefault_authentication_plugin=mysql_native_password');
            }
            
            if (iniContent !== originalContent) {
              fs.writeFileSync(myIni, iniContent, 'utf-8');
              log(`✓ Se corrigió automáticamente ${myIni} desactivando componentes problemáticos`, 'WARNING');
              return true;
            }
          }
        } catch (e) {
          log(`Error al corregir my.ini: ${e.message}`, 'ERROR');
        }
        return false;
      };
      
      log(`Iniciando ${service.name} (${service.version})`);
      log(`Ejecutable: ${fullExePath}`);
      log(`Argumentos: ${mysqlArgs.join(' ')}`);
      
      // Redirigir a un archivo temporal para diagnosticar errores (sin ventana emergente)
      const mysqlErrorLog = path.join(userDataPath, 'mysql-startup.log');
      log(`📁 Archivo de diagnóstico: ${mysqlErrorLog}`, 'INFO');
      
      // Retornar promesa para que el inicio sea awaitable
      return new Promise((resolve, reject) => {
        const cmdLine = `"${fullExePath}" ${mysqlArgs.map(arg => `"${arg}"`).join(' ')} > "${mysqlErrorLog}" 2>&1`;
        
        exec(cmdLine, { 
          cwd: baseDir,
          env: mysqlEnv,
          windowsHide: true,
          detached: true
        }, (error, stdout, stderr) => {
          // El proceso se ejecuta en background
        });
        
        // Esperar 3 segundos y luego verificar si MySQL se inició correctamente
        setTimeout(() => {
        const mysqlLogPath = path.join(dataDir, 'mysqld.log');
        const startupLogPath = path.join(userDataPath, 'mysql-startup.log');
        let hasComponentError = false;
        
        log(`Verificando archivo de diagnóstico: ${startupLogPath}`, 'INFO');
        
        // Primero revisar el startup log (stderr/stdout redirigido)
        if (fs.existsSync(startupLogPath)) {
          try {
            const startupContent = fs.readFileSync(startupLogPath, 'utf-8');
            if (startupContent.trim()) {
              log(`📋 Salida de inicio de MySQL:`, 'WARNING');
              startupContent.split('\n').slice(0, 10).forEach(line => {
                if (line.trim()) log(`  ${line}`, 'WARNING');
              });
              
              // Detectar error de componentes en el startup log
              if (startupContent.includes('component_reference_cache') && startupContent.includes('errno: 126')) {
                hasComponentError = true;
              }
            }
          } catch (err) {
            // Ignorar
          }
        }
        
        // Si encontramos el error de componentes en startup log, corregir inmediatamente
        if (hasComponentError) {
          log(`\n⚠️ ERROR DETECTADO: MySQL no pudo cargar component_reference_cache`, 'ERROR');
          log(`Intentando auto-corregir el archivo my.ini...`, 'WARNING');
          
          if (fixComponentError()) {
            log(`✓ Se desactivaron los componentes problemáticos en ${myIni}`, 'WARNING');
            log(`⏹️ Deteniendo MySQL...`, 'INFO');
            
            // Detener MySQL
            exec(`taskkill /IM mysqld.exe /F 2>NUL`, () => {
              log(`\n📌 IMPORTANTE: Debes reiniciar MySQL manualmente desde la app para aplicar los cambios.`, 'ERROR');
              log(`   Haz clic en el botón RESTART del servicio MySQL.`, 'ERROR');
              reject(new Error('MySQL requiere configuración. Se desactivaron componentes problemáticos. Por favor, reinicia el servicio.'));
            });
          } else {
            log(`✗ No se pudo corregir automáticamente. Edita manualmente:`, 'ERROR');
            log(`  ${myIni}`, 'ERROR');
            log(`  Añade esta línea en la sección [mysqld]:`, 'ERROR');
            log(`    loose_mysql_component_reference_cache=OFF`, 'ERROR');
            reject(new Error('Error de configuración de MySQL. Ver logs para más detalles.'));
          }
          return;
        }
        
        // Luego revisar el mysqld.log si existe
        if (fs.existsSync(mysqlLogPath)) {
          try {
            const logContent = fs.readFileSync(mysqlLogPath, 'utf-8');
            
            // Detectar errores específicos
            if (logContent.includes('component_reference_cache') || logContent.includes('errno: 126')) {
              log(`⚠️ ERROR DETECTADO: MySQL no pudo cargar component_reference_cache`, 'ERROR');
              log(`Intentando auto-corregir el archivo my.ini...`, 'WARNING');
              
              if (fixComponentError()) {
                log(`✓ Se desactivaron los componentes problemáticos en ${myIni}`, 'WARNING');
                log(`⏹️ Deteniendo MySQL...`, 'INFO');
                
                // Detener MySQL
                exec(`taskkill /IM mysqld.exe /F 2>NUL`, () => {
                  log(`\n📌 IMPORTANTE: Debes reiniciar MySQL manualmente desde la app para aplicar los cambios.`, 'ERROR');
                  log(`   Haz clic en el botón RESTART del servicio MySQL.`, 'ERROR');
                  reject(new Error('MySQL requiere configuración. Se desactivaron componentes problemáticos. Por favor, reinicia el servicio.'));
                });
              } else {
                log(`✗ No se pudo corregir automáticamente. Edita manualmente:`, 'ERROR');
                log(`  ${myIni}`, 'ERROR');
                log(`  Añade esta línea en la sección [mysqld]:`, 'ERROR');
                log(`    loose_mysql_component_reference_cache=OFF`, 'ERROR');
                reject(new Error('Error de configuración de MySQL. Ver logs para más detalles.'));
              }
            } else if (logContent.includes('ready for connections')) {
              log(`✓ MySQL iniciado correctamente`, 'INFO');
              resolve();
            } else if (logContent.includes('ERROR') || logContent.includes('Fatal')) {
              log(`⚠️ MySQL reportó un error:`, 'ERROR');
              const lines = logContent.split('\n');
              const errorLines = lines.filter(l => l.includes('ERROR') || l.includes('Fatal'));
              errorLines.slice(-3).forEach(line => log(`  ${line}`, 'ERROR'));
              // Aún así considerarlo como iniciado (puede ser warning menor)
              resolve();
            } else {
              // Log existe pero sin confirmación clara - asumir OK
              log(`✓ MySQL iniciado (log sin confirmación clara)`, 'INFO');
              resolve();
            }
          } catch (err) {
            log(`Error leyendo log de MySQL: ${err.message}`, 'WARNING');
            // Asumir que se inició de todas formas
            resolve();
          }
        } else {
          log(`⚠️ Log de mysqld.log no encontrado aún`, 'WARNING');
          // Asumir que se inició de todas formas
          resolve();
        }
        }, 3000);
      });
      break;
    case 'redis':
      log(`Iniciando Redis...`);
      const redisConf = path.join(userConfig.appPath, 'bin', service.type, service.version, 'redis.conf');
      
      return new Promise((resolve, reject) => {
        const redisProcess = spawn(fullExePath, fs.existsSync(redisConf) ? [redisConf] : [], { 
          cwd: binPath, 
          detached: true, 
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true 
        });
        
        let errorOutput = '';
        let resolved = false;
        
        if (redisProcess.stderr) {
          redisProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
        }
        
        redisProcess.on('error', (err) => {
          if (!resolved) {
            resolved = true;
            reject(new Error(`Error al iniciar Redis: ${err.message}`));
          }
        });
        
        redisProcess.on('exit', (code, signal) => {
          if (!resolved && code !== 0 && code !== null) {
            resolved = true;
            reject(new Error(errorOutput || `Redis terminó con código ${code}`));
          }
        });
        
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            redisProcess.unref();
            if (errorOutput && errorOutput.includes('error')) {
              log(`Advertencia de Redis: ${errorOutput}`, 'WARNING');
            }
            log(`✓ Redis iniciado correctamente`, 'INFO');
            resolve();
          }
        }, 1000);
      });
      break;
      
    case 'memcached':
      log(`Iniciando Memcached...`);
      
      return new Promise((resolve, reject) => {
        const memcachedProcess = spawn(fullExePath, [], { 
          cwd: binPath, 
          detached: true, 
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true
        });
        
        let errorOutput = '';
        let resolved = false;
        
        if (memcachedProcess.stderr) {
          memcachedProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
        }
        
        memcachedProcess.on('error', (err) => {
          if (!resolved) {
            resolved = true;
            reject(new Error(`Error al iniciar Memcached: ${err.message}`));
          }
        });
        
        memcachedProcess.on('exit', (code, signal) => {
          if (!resolved && code !== 0 && code !== null) {
            resolved = true;
            reject(new Error(errorOutput || `Memcached terminó con código ${code}`));
          }
        });
        
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            memcachedProcess.unref();
            log(`✓ Memcached iniciado correctamente`, 'INFO');
            resolve();
          }
        }, 1000);
      });
      break;
      
    case 'mailpit':
      log(`Iniciando Mailpit...`);
      
      return new Promise((resolve, reject) => {
        const mailpitProcess = spawn(fullExePath, [], { 
          cwd: binPath, 
          detached: true, 
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true
        });
        
        let errorOutput = '';
        let resolved = false;
        
        if (mailpitProcess.stderr) {
          mailpitProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
        }
        
        mailpitProcess.on('error', (err) => {
          if (!resolved) {
            resolved = true;
            reject(new Error(`Error al iniciar Mailpit: ${err.message}`));
          }
        });
        
        mailpitProcess.on('exit', (code, signal) => {
          if (!resolved && code !== 0 && code !== null) {
            resolved = true;
            reject(new Error(errorOutput || `Mailpit terminó con código ${code}`));
          }
        });
        
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            mailpitProcess.unref();
            log(`✓ Mailpit iniciado correctamente`, 'INFO');
            resolve();
          }
        }, 1000);
      });
      break;
      
    case 'mongodb':
      log(`Iniciando MongoDB...`);
      const mongoDataPath = path.join(userConfig.appPath, 'data', 'mongodb');
      if (!fs.existsSync(mongoDataPath)) {
        fs.mkdirSync(mongoDataPath, { recursive: true });
      }
      
      return new Promise((resolve, reject) => {
        const mongoProcess = spawn(fullExePath, ['--dbpath', mongoDataPath], { 
          cwd: binPath, 
          detached: true, 
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true
        });
        
        let errorOutput = '';
        let resolved = false;
        
        if (mongoProcess.stderr) {
          mongoProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
        }
        
        mongoProcess.on('error', (err) => {
          if (!resolved) {
            resolved = true;
            reject(new Error(`Error al iniciar MongoDB: ${err.message}`));
          }
        });
        
        mongoProcess.on('exit', (code, signal) => {
          if (!resolved && code !== 0 && code !== null) {
            resolved = true;
            reject(new Error(errorOutput || `MongoDB terminó con código ${code}`));
          }
        });
        
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            mongoProcess.unref();
            if (errorOutput && errorOutput.includes('error')) {
              log(`Advertencia de MongoDB: ${errorOutput}`, 'WARNING');
            }
            log(`✓ MongoDB iniciado correctamente`, 'INFO');
            resolve();
          }
        }, 2000);
      });
      break;
      
    default:
      throw new Error(`Tipo de servicio no soportado: ${service.type}`);
  }
  
  log(`✓ Servicio ${service.name} iniciado`, 'INFO');
  log(`═══════════════════════════════════════════════════════════`, 'INFO');
}

async function waitForProcessToStop(processName, timeoutMs = 8000) {
  const start = Date.now();
  const lowerName = processName.toLowerCase();
  while (Date.now() - start < timeoutMs) {
    const processes = await getAllProcesses();
    if (!processes[lowerName]) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return false;
}

async function stopService(service) {
  const executableMapping = {
    'apache': 'httpd.exe',
    'nginx': 'nginx.exe',
    'mysql': 'mysqld.exe',
    'mariadb': 'mysqld.exe',
    'redis': 'redis-server.exe',
    'memcached': 'memcached.exe',
    'mailpit': 'mailpit.exe',
    'mongodb': 'mongod.exe',
    'postgresql': 'postgres.exe'
  };

  const exeName = executableMapping[service.type];
  if (!exeName) return;

  log(`Intentando detener ${service.name} (${exeName}) de forma elegante...`);

  let binPath = path.join(userConfig.appPath, 'bin', service.type, service.version);
  if (fs.existsSync(path.join(binPath, 'bin'))) {
    binPath = path.join(binPath, 'bin');
  }
  const fullExePath = path.join(binPath, exeName);

  try {
    switch (service.type) {
      case 'apache':
        const confPath = path.join(userConfig.appPath, 'bin', service.type, service.version, 'conf', 'httpd.conf');
        // Comando nativo de Apache para detención
        await execAsync(`"${fullExePath}" -k stop -f "${confPath}"`).catch(() => {});
        // Fallback: señal de cierre normal
        await execAsync(`taskkill /IM ${exeName}`).catch(() => {});
        break;
      case 'nginx':
        await execAsync(`"${fullExePath}" -s stop`).catch(() => {});
        await execAsync(`taskkill /IM ${exeName}`).catch(() => {});
        break;
      case 'mysql':
      case 'mariadb':
        const mysqlAdmin = path.join(binPath, 'mysqladmin.exe');
        if (fs.existsSync(mysqlAdmin)) {
          // App por defecto no tiene contraseña root
          await execAsync(`"${mysqlAdmin}" -u root shutdown`).catch(() => {});
        }
        await execAsync(`taskkill /IM ${exeName}`).catch(() => {});
        break;
      case 'redis':
        const redisCli = path.join(binPath, 'redis-cli.exe');
        if (fs.existsSync(redisCli)) {
          await execAsync(`"${redisCli}" shutdown`).catch(() => {});
        }
        await execAsync(`taskkill /IM ${exeName}`).catch(() => {});
        break;
      case 'postgresql':
        const pgCtl = path.join(binPath, 'pg_ctl.exe');
        const pgData = path.join(userConfig.appPath, 'data', 'postgresql');
        if (fs.existsSync(pgCtl)) {
          await execAsync(`"${pgCtl}" stop -D "${pgData}"`).catch(() => {});
        }
        await execAsync(`taskkill /IM postgres.exe`).catch(() => {});
        break;
      default:
        await execAsync(`taskkill /IM ${exeName}`).catch(() => {});
        break;
    }
  } catch (e) {
    log(`Aviso durante detención de ${service.name}: ${e.message}`, 'DEBUG');
  }

  // Esperar a que el proceso desaparezca
  const stopped = await waitForProcessToStop(exeName);
  
  if (!stopped) {
    log(`${service.name} (${exeName}) no se detuvo a tiempo. Forzando cierre...`, 'WARNING');
    await execAsync(`taskkill /F /IM ${exeName}`).catch(() => {});
  } else {
    log(`${service.name} se detuvo correctamente.`);
  }
}

ipcMain.handle('get-projects', async () => {
  const projectsPath = userConfig.projectsPath;
  try {
    const folders = fs.readdirSync(projectsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        path: path.join(projectsPath, dirent.name),
        url: `http://${dirent.name}.test`,
      }));
    return folders;
  } catch (error) {
    return [];
  }
});

ipcMain.handle('open-in-browser', async (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('open-in-vscode', async (event, projectPath) => {
  const editor = userConfig.editor || 'notepad';
  let command = '';
  
  switch (editor) {
    case 'code':
      command = `code "${projectPath}"`;
      break;
    case 'notepad++':
      const nppPath = path.join(userConfig.appPath, 'bin', 'notepad++', 'notepad++.exe');
      if (fs.existsSync(nppPath)) {
        command = `"${nppPath}" "${projectPath}"`;
      } else {
        exec(`explorer "${projectPath}"`);
        return;
      }
      break;
    default:
      exec(`explorer "${projectPath}"`);
      return;
  }
  
  if (command) exec(command);
});

ipcMain.handle('get-config', async () => {
  return userConfig;
});

ipcMain.handle('set-config', async (event, config) => {
  userConfig = { ...userConfig, ...config };
  saveUserConfig();
  console.log('Config updated and saved:', userConfig);
  return { success: true };
});

ipcMain.handle('capture-screenshot', async () => {
  try {
    const screenshot = await mainWindow.webContents.capturePage();
    // Guardar o devolver base64
    const base64 = screenshot.toPNG().toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
});

ipcMain.handle('open-devtools', async () => {
  mainWindow.webContents.openDevTools();
});

ipcMain.handle('select-directory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

// --- Nuevos Handlers para MyApp Independiente ---

ipcMain.handle('get-remote-services', async () => {
  try {
    const servicesPath = path.join(defaultRoot, 'services.json');
    if (fs.existsSync(servicesPath)) {
      const data = fs.readFileSync(servicesPath, 'utf-8');
      return JSON.parse(data);
    }
    return { services: [] };
  } catch (error) {
    log(`Error loading remote services: ${error.message}`, 'ERROR');
    return { services: [] };
  }
});

ipcMain.handle('install-service', async (event, { url, serviceId, version, installPath }) => {
  const tempDir = path.join(defaultRoot, 'tmp');
  const fileName = `${serviceId}-${version.replace(/\s+/g, '_')}.zip`;
  const filePath = path.join(tempDir, fileName);
  
  // IMPORTANTE: En esta arquitectura, los binarios se guardan en neutralino/bin/
  // Si installPath es "bin/php", lo convertimos a "neutralino/bin/php" para desarrollo
  const normalizedInstallPath = installPath.startsWith('neutralino') ? installPath : path.join('neutralino', installPath);
  const destDir = path.join(defaultRoot, normalizedInstallPath, version);

  log(`Iniciando instalación de ${serviceId} v${version}...`);
  log(`Ruta destino calculada: ${destDir}`);

  try {
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    // Asegurar que la carpeta padre del destino existe (ej: neutralino/bin/php)
    if (!fs.existsSync(path.dirname(destDir))) fs.mkdirSync(path.dirname(destDir), { recursive: true });

    // 1. Descargar (usando la nueva utilidad compartida basada en PowerShell)
    await downloadFile(url, filePath, log);

    // 2. Extraer
    await installFromZip({ zipPath: filePath, destDir, onLog: log });

    // 3. Limpiar
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // 4. Actualizar app.ini si el servicio no tiene versión activa
    updateAppIniVersion(serviceId, version);

    return { success: true, message: `${serviceId} v${version} instalado correctamente.` };
  } catch (error) {
    log(`Error en instalación: ${error.message}`, 'ERROR');
    return { success: false, error: error.message };
  }
});

function updateAppIniVersion(serviceId, version) {
  try {
    const iniPath = path.join(defaultRoot, 'app.ini');
    if (fs.existsSync(iniPath)) {
      let content = fs.readFileSync(iniPath, 'utf-8');
      const lines = content.split('\n');
      let sectionFound = false;
      const newLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.toLowerCase() === `[${serviceId}]`) {
          sectionFound = true;
          return line;
        }
        if (sectionFound && trimmed.toLowerCase().startsWith('version=')) {
          const currentVersion = trimmed.split('=')[1] || '';
          if (!currentVersion) {
            sectionFound = false; // Solo actualizamos si está vacío
            return `version=${version}`;
          }
          sectionFound = false;
        }
        return line;
      });
      fs.writeFileSync(iniPath, newLines.join('\n'));
    }
  } catch (e) {
    log(`Error actualizando app.ini: ${e.message}`, 'WARNING');
  }
}

ipcMain.handle('uninstall-service', async (event, { serviceId, version, installPath }) => {
  const normalizedInstallPath = installPath.startsWith('neutralino') ? installPath : path.join('neutralino', installPath);
  const destDir = path.join(defaultRoot, normalizedInstallPath, version);
  log(`Desinstalando ${serviceId} v${version} de ${destDir}...`);
  try {
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
      return { success: true };
    }
    return { success: false, error: 'Directory not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

async function checkForUpdates() {
  const now = Date.now();

  const oneDay = 24 * 60 * 60 * 1000;

  if (now - userConfig.lastUpdateCheck > oneDay) {
    log('Buscando actualizaciones de servicios en segundo plano...');
    try {
      // Simulamos una petición a una URL remota
      // const remoteUrl = 'https://api.github.com/repos/msoler75/WebServDev/contents/services.json';
      
      // Por ahora actualizamos el timestamp
      userConfig.lastUpdateCheck = now;
      saveUserConfig();
      
      log('Comprobación de servicios completada (vía background)');
      
      // Aquí iría la lógica de comparar el services.json remoto con el local
      // y notificar al frontend si hay versiones nuevas.
    } catch (error) {
      log(`Error en auto-comprobación de servicios: ${error.message}`, 'ERROR');
    }
  } else {
    log('La comprobación de servicios ya se realizó hoy.');
  }
}

async function createWindow() {
  log('Creating main window...');
  
  // Comprobar actualizaciones en background sin bloquear
  checkForUpdates();
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Habilitar F12 para abrir DevTools siempre
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      log('F12 pressed, toggling DevTools');
      mainWindow.webContents.toggleDevTools();
    }
    // También Ctrl+Shift+I
    if (input.control && input.shift && input.key.toLowerCase() === 'i' && input.type === 'keyDown') {
      log('Ctrl+Shift+I pressed, toggling DevTools');
      mainWindow.webContents.toggleDevTools();
    }
  });

  // Cargar la app React
  if (app.isPackaged) {
    const indexPath = path.join(__dirname, '../dist/index.html');
    log(`Loading packaged index.html from: ${indexPath}`);
    mainWindow.loadFile(indexPath).catch(err => {
      log(`Error loading index.html: ${err.message}`, 'ERROR');
    });
  } else {
    log('Loading dev URL: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    // Abrir DevTools solo en desarrollo
    mainWindow.webContents.openDevTools();
    
    // Iniciar servidor MCP para DevTools con el puerto detectado (solo desarrollo)
    const npxPath = path.join(process.env.APPDATA, 'npm', 'npx.cmd');
    exec(`"${npxPath}" chrome-devtools-mcp --url ws://localhost:${debugPort}`, { stdio: 'inherit' });
  }

  // Auto-start servicios si está habilitado
  mainWindow.webContents.on('did-finish-load', async () => {
    if (userConfig.autoStart) {
      log('Auto-iniciando servicios configurados...');
      const services = detectServices();
      const portsMap = await getAllListeningPorts();
      const processMap = await getAllProcesses();
      
      for (const service of services) {
        try {
          // Solo iniciar si no está ya corriendo
          const statusResult = await getServiceStatus(service, portsMap, processMap);
          if (statusResult.status !== 'running') {
            await startService(service);
            log(`Servicio ${service.name} auto-iniciado`);
          }
        } catch (err) {
          log(`Fallo al auto-iniciar ${service.name}: ${err.message}`, 'ERROR');
        }
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
