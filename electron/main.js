import { app, BrowserWindow, ipcMain, shell, dialog, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta para guardar la configuración del usuario
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'user-config.json');
const logPath = path.join(userDataPath, 'app.log');

// Sistema de logs simple
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  console.log(logMessage.trim());
  try {
    fs.appendFileSync(logPath, logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
}

// Limpiar log antiguo al iniciar
try {
  if (fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '');
  }
} catch (err) {}

log('Application starting...');

// Configuración por defecto
let userConfig = {
  laragonPath: 'C:\\laragon',
  projectsPath: 'C:\\laragon\\www',
  editor: 'notepad', // notepad, code, notepad++, default
  autoStart: false,
  language: 'es', // es, en, de
  theme: 'system' // system, light, dark, sepia
};

// Cargar configuración guardada
function loadUserConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      userConfig = { ...userConfig, ...JSON.parse(data) };
      log('User config loaded successfully');
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

// Leer configuración de Laragon
function getLaragonConfig() {
  const possiblePaths = [
    path.join(userConfig.laragonPath, 'laragon.ini'),
    path.join(userConfig.laragonPath, 'usr', 'laragon.ini')
  ];

  let iniPath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      iniPath = p;
      break;
    }
  }

  const config = {};
  try {
    if (fs.existsSync(iniPath)) {
      const content = fs.readFileSync(iniPath, 'utf-8');
      const lines = content.split('\n');
      let section = '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          section = trimmed.slice(1, -1).toLowerCase();
        } else if (trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=');
          if (!config[section]) config[section] = {};
          config[section][key.trim().toLowerCase()] = value.trim();
        }
      }
    } else {
      log(`Laragon config not found at: ${iniPath}`, 'WARNING');
    }
  } catch (error) {
    log(`Error reading laragon.ini: ${error.message}`, 'ERROR');
  }
  return config;
}

console.log('Main process starting...');

// Detectar servicios disponibles
function detectServices() {
  const config = getLaragonConfig();
  const services = [];

  const getAvailableVersions = (serviceType) => {
    const pathsToCheck = [serviceType];
    // Aliases comunes en Laragon
    if (serviceType === 'mysql') pathsToCheck.push('mariadb');
    if (serviceType === 'mariadb') pathsToCheck.push('mysql');
    
    let allVersions = [];

    for (const type of pathsToCheck) {
      const binPath = path.join(userConfig.laragonPath, 'bin', type);
      if (fs.existsSync(binPath)) {
        try {
          const dirs = fs.readdirSync(binPath)
            .filter(f => fs.statSync(path.join(binPath, f)).isDirectory());
          allVersions = [...allVersions, ...dirs];
        } catch (e) {}
      }
    }
    
    // Eliminar duplicados y ordenar descendente
    return [...new Set(allVersions)].sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
  };

  const availablePhp = getAvailableVersions('php');
  const phpVersion = config.php?.version || (availablePhp.length > 0 ? availablePhp[0] : undefined);
  
  if (config.apache && config.apache.version) {
    const apacheBase = path.join(userConfig.laragonPath, 'bin', 'apache', config.apache.version);
    const documentRoot = config.apache?.documentroot || userConfig.projectsPath;
    const apacheConfigs = [
      { label: 'OPEN_DOCROOT', path: documentRoot, type: 'folder' },
      { label: 'httpd.conf', path: path.join(apacheBase, 'conf', 'httpd.conf') },
      { label: 'httpd-vhosts.conf', path: path.join(apacheBase, 'conf', 'extra', 'httpd-vhosts.conf') },
      { label: 'php.ini', path: phpVersion ? path.join(userConfig.laragonPath, 'bin', 'php', phpVersion, 'php.ini') : '' },
      { label: 'php_errors.log', path: path.join(userConfig.laragonPath, 'tmp', 'php_errors.log') }
    ].filter(c => c.path && (c.type === 'folder' || fs.existsSync(c.path)));

    services.push({ 
      name: 'Apache', 
      type: 'apache', 
      version: config.apache.version,
      phpVersion: phpVersion,
      configs: apacheConfigs,
      availableVersions: getAvailableVersions('apache'),
      availablePhpVersions: getAvailableVersions('php')
    });
  }

  if (config.mysql && config.mysql.version) {
    const mysqlBase = path.join(userConfig.laragonPath, 'bin', 'mysql', config.mysql.version);
    const mysqlConfigs = [
      { label: 'my.ini', path: path.join(mysqlBase, 'my.ini') },
      { label: 'error.log', path: path.join(userConfig.laragonPath, 'data', 'mysql', 'error.log') }
    ];

    services.push({ 
      name: 'MySQL', 
      type: 'mysql', 
      version: config.mysql.version,
      configs: mysqlConfigs,
      availableVersions: getAvailableVersions('mysql')
    });
  }

  if (config.nginx && config.nginx.version) {
    const nginxBase = path.join(userConfig.laragonPath, 'bin', 'nginx', config.nginx.version);
    const documentRoot = config.apache?.documentroot || userConfig.projectsPath; // Nginx suele compartirlo
    const nginxConfigs = [
      { label: 'OPEN_DOCROOT', path: documentRoot, type: 'folder' },
      { label: 'nginx.conf', path: path.join(nginxBase, 'conf', 'nginx.conf') },
      { label: 'php.ini', path: phpVersion ? path.join(userConfig.laragonPath, 'bin', 'php', phpVersion, 'php.ini') : '' },
      { label: 'php_errors.log', path: path.join(userConfig.laragonPath, 'tmp', 'php_errors.log') }
    ].filter(c => c.path && (c.type === 'folder' || fs.existsSync(c.path)));
    services.push({ 
      name: 'Nginx', 
      type: 'nginx', 
      version: config.nginx.version, 
      phpVersion: phpVersion,
      configs: nginxConfigs,
      availableVersions: getAvailableVersions('nginx'),
      availablePhpVersions: getAvailableVersions('php')
    });
  }
  if (config.postgresql && config.postgresql.version) {
    services.push({ 
      name: 'PostgreSQL', 
      type: 'postgresql', 
      version: config.postgresql.version,
      availableVersions: getAvailableVersions('postgresql')
    });
  }
  if (config.redis && config.redis.version) {
    services.push({ 
      name: 'Redis', 
      type: 'redis', 
      version: config.redis.version,
      availableVersions: getAvailableVersions('redis')
    });
  }
  if (config.memcached && config.memcached.version) {
    services.push({ 
      name: 'Memcached', 
      type: 'memcached', 
      version: config.memcached.version,
      availableVersions: getAvailableVersions('memcached')
    });
  }
  
  // Mailpit detection
  let mailpitVersion = config.mailpit?.version;
  if (!mailpitVersion) {
    const mailpitDir = path.join(userConfig.laragonPath, 'bin', 'mailpit');
    if (fs.existsSync(mailpitDir)) {
      const dirs = fs.readdirSync(mailpitDir).filter(f => {
        const fullPath = path.join(mailpitDir, f);
        return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'mailpit.exe'));
      });
      if (dirs.length > 0) mailpitVersion = dirs[0];
    }
  }
  if (mailpitVersion) {
    const mailpitBase = path.join(userConfig.laragonPath, 'bin', 'mailpit', mailpitVersion);
    const mailpitConfigs = [
      { label: 'mailpit.log', path: path.join(mailpitBase, 'mailpit.log') }
    ];

    services.push({ 
      name: 'Mailpit', 
      type: 'mailpit', 
      version: mailpitVersion,
      configs: mailpitConfigs,
      availableVersions: getAvailableVersions('mailpit')
    });
  }

  // MongoDB detection
  let mongodbVersion = config.mongodb?.version;
  if (!mongodbVersion) {
    const mongodbDir = path.join(userConfig.laragonPath, 'bin', 'mongodb');
    if (fs.existsSync(mongodbDir)) {
      const dirs = fs.readdirSync(mongodbDir).filter(f => {
        const fullPath = path.join(mongodbDir, f);
        return fs.statSync(fullPath).isDirectory() && 
               (fs.existsSync(path.join(fullPath, 'mongod.exe')) || fs.existsSync(path.join(fullPath, 'bin', 'mongod.exe')));
      });
      if (dirs.length > 0) mongodbVersion = dirs[0];
    }
  }
  if (mongodbVersion) {
    const mongodbBase = path.join(userConfig.laragonPath, 'bin', 'mongodb', mongodbVersion);
    const mongodbConfigs = [
      { label: 'mongod.cfg', path: path.join(mongodbBase, 'bin', 'mongod.cfg') }
    ].filter(c => fs.existsSync(c.path));

    services.push({ 
      name: 'MongoDB', 
      type: 'mongodb', 
      version: mongodbVersion,
      configs: mongodbConfigs,
      availableVersions: getAvailableVersions('mongodb')
    });
  }
  
  return services;
}

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
  console.log('start-service called for:', serviceName);
  const services = detectServices();
  const service = services.find(s => s.name === serviceName);
  if (!service) {
    console.log('Service not found:', serviceName);
    return { success: false, message: 'Service not found' };
  }
  
  try {
    console.log('Starting service:', service);
    await startService(service);
    console.log('Service started successfully');
    return { success: true, message: `${serviceName} started` };
  } catch (error) {
    console.error('Error starting service:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('stop-service', async (event, serviceName) => {
  const services = detectServices();
  const service = services.find(s => s.name === serviceName);
  if (!service) return { success: false, message: 'Service not found' };
  
  try {
    await stopService(service);
    return { success: true, message: `${serviceName} stopped` };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('open-laragon-folder', async () => {
  exec(`explorer "${userConfig.laragonPath}"`);
});

ipcMain.handle('open-document-root', async () => {
  const config = getLaragonConfig();
  const documentRoot = config.apache?.DocumentRoot || userConfig.projectsPath;
  exec(`explorer "${documentRoot}"`);
});

ipcMain.handle('open-db-tool', async () => {
  const heidiPath = path.join(userConfig.laragonPath, 'bin', 'heidisql', 'heidisql.exe');
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
        const nppPath = path.join(userConfig.laragonPath, 'bin', 'notepad++', 'notepad++.exe');
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
  exec(`start cmd.exe /K "cd /d ${userConfig.laragonPath}"`);
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
      const nppPath = path.join(userConfig.laragonPath, 'bin', 'notepad++', 'notepad++.exe');
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
    path.join(userConfig.laragonPath, 'laragon.ini'),
    path.join(userConfig.laragonPath, 'usr', 'laragon.ini')
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
      throw new Error('laragon.ini not found');
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
    log('laragon.ini updated successfully');

    // Si cambiamos PHP, intentar actualizar la configuración de Apache (mod_php.conf)
    if (type.toLowerCase() === 'php') {
      try {
        const modPhpPath = path.join(userConfig.laragonPath, 'etc', 'apache2', 'mod_php.conf');
        if (fs.existsSync(modPhpPath)) {
          const phpDir = path.join(userConfig.laragonPath, 'bin', 'php', version);
          if (fs.existsSync(phpDir)) {
            const files = fs.readdirSync(phpDir);
            const phpDll = files.find(f => f.match(/^php\d+apache2_4\.dll$/i));
            
            if (phpDll) {
              const newContent = `# This file is generated by MyLaragon\n` +
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
    log(`Error updating laragon.ini: ${error.message}`, 'ERROR');
    return { success: false, message: error.message };
  }
});

ipcMain.handle('open-env-vars', async () => {
  exec('rundll32.exe sysdm.cpl,EditEnvironmentVariables');
});

async function getAllListeningPorts() {
  return new Promise((resolve) => {
    // Optimizamos usando findstr para filtrar solo puertos en escucha
    exec(`netstat -ano | findstr LISTENING`, (error, stdout) => {
      if (error || !stdout) {
        resolve({});
        return;
      }

      const portsMap = {};
      const lines = stdout.split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        // Formato: Protocolo, LocalAddr, RemoteAddr, State, PID
        if (parts.length >= 5) {
          const localAddr = parts[1];
          const pid = parts[4];
          const lastColon = localAddr.lastIndexOf(':');
          if (lastColon !== -1) {
            const port = localAddr.substring(lastColon + 1);
            portsMap[port] = pid;
          }
        }
      }
      resolve(portsMap);
    });
  });
}

async function getAllProcesses() {
  return new Promise((resolve) => {
    // Obtenemos todos los procesos de una vez en formato CSV
    exec(`tasklist /NH /FO CSV`, (error, stdout) => {
      if (error || !stdout) {
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
          if (!processMap[name]) processMap[name] = [];
          processMap[name].push(pid);
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
    
    let status;
    let details = '';
    
    if (portInUse) {
      const isOurProcess = pids.includes(portPid);
      if (isOurProcess) {
        status = 'running';
        details = `Proceso ${processName} (PIDs: ${pids.join(',')}) escuchando en puerto ${port}.`;
      } else {
        status = 'port_occupied_by_other';
        details = `El puerto ${port} está ocupado por otro proceso (PID: ${portPid}).`;
      }
    } else if (processRunning) {
      status = 'running_but_port_not_listening';
      details = `Proceso ${processName} activo pero puerto ${port} no está escuchando.`;
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
  // Asegurarnos de cerrar cualquier instancia previa del mismo tipo de proceso 
  // para evitar conflictos de versión o puertos
  try {
    const processToKill = {
      'apache': 'httpd.exe',
      'nginx': 'nginx.exe',
      'mysql': 'mysqld.exe',
      'mariadb': 'mysqld.exe',
      'redis': 'redis-server.exe',
      'memcached': 'memcached.exe',
      'mailpit': 'mailpit.exe',
      'mongodb': 'mongod.exe'
    }[service.type];

    if (processToKill) {
      log(`Cleaning up old ${processToKill} before starting version ${service.version}...`);
      await execAsync(`taskkill /F /IM ${processToKill}`).catch(() => {}); // Ignorar error si no hay procesos
    }
  } catch (e) {
    log(`Cleanup failed: ${e.message}`, 'WARNING');
  }

  let binPath = path.join(userConfig.laragonPath, 'bin', service.type, service.version);
  if (fs.existsSync(path.join(binPath, 'bin'))) {
    binPath = path.join(binPath, 'bin');
  }
  
  const executableMapping = {
    'apache': 'httpd.exe',
    'nginx': 'nginx.exe',
    'mysql': 'mysqld.exe',
    'mariadb': 'mysqld.exe',
    'redis': 'redis-server.exe',
    'memcached': 'memcached.exe',
    'mailpit': 'mailpit.exe',
    'mongodb': 'mongod.exe'
  };

  const exeName = executableMapping[service.type];
  const fullExePath = path.join(binPath, exeName);

  if (!fs.existsSync(fullExePath)) {
    throw new Error(`No se encontró el ejecutable en: ${fullExePath}`);
  }

  log(`Garantizando inicio de ${service.name} usando: ${fullExePath}`);
  
  switch (service.type) {
    case 'apache':
      const confPath = path.join(userConfig.laragonPath, 'bin', service.type, service.version, 'conf', 'httpd.conf');
      const apacheProcess = spawn(fullExePath, ['-f', confPath], { cwd: binPath, detached: true, stdio: 'ignore' });
      apacheProcess.unref();
      break;
    case 'nginx':
      const nginxProcess = spawn(fullExePath, [], { cwd: binPath, detached: true, stdio: 'ignore' });
      nginxProcess.unref();
      break;
    case 'mysql':
    case 'mariadb':
      const baseDir = path.join(userConfig.laragonPath, 'bin', service.type, service.version);
      const dataDir = path.join(userConfig.laragonPath, 'data', service.type === 'mysql' ? 'mysql' : 'mariadb');
      const myIni = path.join(baseDir, 'my.ini');
      
      // Asegurar que el PATH incluya el directorio bin para cargar DLLs
      const mysqlEnv = { ...process.env };
      mysqlEnv.PATH = `${binPath};${mysqlEnv.PATH}`;

      const mysqlArgs = [
        `--defaults-file=${myIni}`,
        `--basedir=${baseDir}`,
        `--datadir=${dataDir}`,
        '--standalone'
      ];

      log(`Iniciando MySQL con basedir: ${baseDir}`);
      const mysqlProcess = spawn(fullExePath, mysqlArgs, { 
        cwd: binPath, 
        detached: false, 
        env: mysqlEnv,
        stdio: ['ignore', 'pipe', 'pipe'] 
      });
      
      mysqlProcess.stderr.on('data', (data) => {
        log(`MySQL stderr: ${data.toString()}`, 'ERROR');
      });
      // Dejamos que corra en background sin unref para monitorear errores iniciales
      break;
    case 'redis':
      const redisConf = path.join(userConfig.laragonPath, 'bin', service.type, service.version, 'redis.conf');
      const redisProcess = spawn(fullExePath, [redisConf], { cwd: binPath, detached: true, stdio: 'ignore' });
      redisProcess.unref();
      break;
    case 'memcached':
      const memcachedProcess = spawn(fullExePath, [], { cwd: binPath, detached: true, stdio: 'ignore' });
      memcachedProcess.unref();
      break;
    case 'mailpit':
      const mailpitProcess = spawn(fullExePath, [], { cwd: binPath, detached: true, stdio: 'ignore' });
      mailpitProcess.unref();
      break;
    case 'mongodb':
      const mongoDataPath = path.join(userConfig.laragonPath, 'data', 'mongodb');
      if (!fs.existsSync(mongoDataPath)) fs.mkdirSync(mongoDataPath, { recursive: true });
      const mongoProcess = spawn(fullExePath, ['--dbpath', mongoDataPath], { cwd: binPath, detached: true, stdio: 'ignore' });
      mongoProcess.unref();
      break;
  }
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

  let binPath = path.join(userConfig.laragonPath, 'bin', service.type, service.version);
  if (fs.existsSync(path.join(binPath, 'bin'))) {
    binPath = path.join(binPath, 'bin');
  }
  const fullExePath = path.join(binPath, exeName);

  try {
    switch (service.type) {
      case 'apache':
        const confPath = path.join(userConfig.laragonPath, 'bin', service.type, service.version, 'conf', 'httpd.conf');
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
          // Laragon por defecto no tiene contraseña root
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
        const pgData = path.join(userConfig.laragonPath, 'data', 'postgresql');
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
      const nppPath = path.join(userConfig.laragonPath, 'bin', 'notepad++', 'notepad++.exe');
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

let mainWindow;

async function createWindow() {
  log('Creating main window...');
  // Iniciar servidor MCP para DevTools con el puerto detectado
  console.log(`Using debug port for MCP: ${debugPort}`);
  
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
      console.log('Auto-starting services...');
      const services = detectServices();
      const portsMap = await getAllListeningPorts();
      const processMap = await getAllProcesses();
      
      for (const service of services) {
        try {
          // Solo iniciar si no está ya corriendo
          const statusResult = await getServiceStatus(service, portsMap, processMap);
          if (statusResult.status !== 'running') {
            await startService(service);
            console.log(`Auto-started ${service.name}`);
          }
        } catch (err) {
          console.error(`Failed to auto-start ${service.name}:`, err);
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