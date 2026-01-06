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
  language: 'es' // es, en, de
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
  const iniPath = path.join(userConfig.laragonPath, 'usr', 'laragon.ini');
  const config = {};
  try {
    if (fs.existsSync(iniPath)) {
      const content = fs.readFileSync(iniPath, 'utf-8');
      const lines = content.split('\n');
      let section = '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          section = trimmed.slice(1, -1);
        } else if (trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=');
          if (!config[section]) config[section] = {};
          config[section][key] = value;
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
  const phpVersion = config.php?.Version;
  
  if (config.apache && config.apache.Version) {
    const apacheBase = path.join(userConfig.laragonPath, 'bin', 'apache', config.apache.Version);
    const documentRoot = config.apache?.DocumentRoot || userConfig.projectsPath;
    const apacheConfigs = [
      { label: 'OPEN_DOCROOT', path: documentRoot, type: 'folder' },
      { label: 'httpd.conf', path: path.join(apacheBase, 'conf', 'httpd.conf') },
      { label: 'httpd-vhosts.conf', path: path.join(apacheBase, 'conf', 'extra', 'httpd-vhosts.conf') },
      { label: 'php.ini', path: phpVersion ? path.join(userConfig.laragonPath, 'bin', 'php', phpVersion, 'php.ini') : '' }
    ].filter(c => c.path);

    services.push({ 
      name: 'Apache', 
      type: 'apache', 
      version: config.apache.Version,
      configs: apacheConfigs
    });
  }

  if (config.mysql && config.mysql.Version) {
    const mysqlBase = path.join(userConfig.laragonPath, 'bin', 'mysql', config.mysql.Version);
    const mysqlConfigs = [
      { label: 'my.ini', path: path.join(mysqlBase, 'my.ini') },
      { label: 'error.log', path: path.join(userConfig.laragonPath, 'data', 'mysql', 'error.log') }
    ];

    services.push({ 
      name: 'MySQL', 
      type: 'mysql', 
      version: config.mysql.Version,
      configs: mysqlConfigs
    });
  }

  if (config.nginx && config.nginx.Version) {
    const nginxBase = path.join(userConfig.laragonPath, 'bin', 'nginx', config.nginx.Version);
    const documentRoot = config.apache?.DocumentRoot || userConfig.projectsPath; // Nginx suele compartirlo
    const nginxConfigs = [
      { label: 'OPEN_DOCROOT', path: documentRoot, type: 'folder' },
      { label: 'nginx.conf', path: path.join(nginxBase, 'conf', 'nginx.conf') },
      { label: 'php.ini', path: phpVersion ? path.join(userConfig.laragonPath, 'bin', 'php', phpVersion, 'php.ini') : '' }
    ].filter(c => c.path);
    services.push({ name: 'Nginx', type: 'nginx', version: config.nginx.Version, configs: nginxConfigs });
  }
  if (config.postgresql && config.postgresql.Version) {
    services.push({ name: 'PostgreSQL', type: 'postgresql', version: config.postgresql.Version });
  }
  if (config.redis && config.redis.Version) {
    services.push({ name: 'Redis', type: 'redis', version: config.redis.Version });
  }
  if (config.memcached && config.memcached.Version) {
    services.push({ name: 'Memcached', type: 'memcached', version: config.memcached.Version });
  }
  
  // Mailpit detection
  let mailpitVersion = config.mailpit?.Version;
  if (!mailpitVersion) {
    const mailpitDir = path.join(userConfig.laragonPath, 'bin', 'mailpit');
    if (fs.existsSync(mailpitDir)) {
      const dirs = fs.readdirSync(mailpitDir).filter(f => fs.statSync(path.join(mailpitDir, f)).isDirectory());
      if (dirs.length > 0) mailpitVersion = dirs[0];
    }
  }
  if (mailpitVersion) {
    services.push({ name: 'Mailpit', type: 'mailpit', version: mailpitVersion });
  }

  // MongoDB detection
  let mongodbVersion = config.mongodb?.Version;
  if (!mongodbVersion) {
    const mongodbDir = path.join(userConfig.laragonPath, 'bin', 'mongodb');
    if (fs.existsSync(mongodbDir)) {
      const dirs = fs.readdirSync(mongodbDir).filter(f => fs.statSync(path.join(mongodbDir, f)).isDirectory());
      if (dirs.length > 0) mongodbVersion = dirs[0];
    }
  }
  if (mongodbVersion) {
    services.push({ name: 'MongoDB', type: 'mongodb', version: mongodbVersion });
  }
  
  return services;
}

// Handlers IPC
ipcMain.handle('get-services', async (event, hiddenServices = []) => {
  // console.log('get-services handler called');
  try {
    const services = detectServices();
    // console.log('Detected services:', services);
    const servicesWithStatus = await Promise.all(
      services.map(async (service) => {
        // Si el servicio está oculto, no verificamos su estado para ahorrar recursos
        if (hiddenServices.includes(service.name)) {
          return { ...service, status: 'hidden' };
        }
        const status = await getServiceStatus(service);
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

ipcMain.handle('open-env-vars', async () => {
  exec('rundll32.exe sysdm.cpl,EditEnvironmentVariables');
});

async function getServiceStatus(service) {
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
    
    processRunning = await checkProcess(processName);
    portInUse = await checkPort(port);
    
    let status;
    let details = '';
    
    if (processRunning && portInUse) {
      status = 'running';
      details = `Proceso ${processName} corriendo y puerto ${port} en uso.`;
    } else if (processRunning && !portInUse) {
      status = 'running_but_port_not_listening';
      details = `Proceso ${processName} corriendo pero puerto ${port} no está escuchando.`;
    } else if (!processRunning && portInUse) {
      status = 'port_occupied_by_other';
      details = `Puerto ${port} ocupado por otro proceso.`;
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

async function checkProcess(processName) {
  return new Promise((resolve) => {
    exec(`tasklist /FI "IMAGENAME eq ${processName}" /NH`, (error, stdout) => {
      resolve(stdout.includes(processName));
    });
  });
}

async function checkPort(port) {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr LISTENING | findstr :${port}`, (error, stdout) => {
      resolve(stdout.trim() !== '');
    });
  });
}

async function startService(service) {
  let binPath = path.join(userConfig.laragonPath, 'bin', service.type, service.version);
  if (fs.existsSync(path.join(binPath, 'bin'))) {
    binPath = path.join(binPath, 'bin');
  }
  
  console.log('Starting service:', service.name, 'binPath:', binPath);
  
  switch (service.type) {
    case 'apache':
      console.log('Executing apache start');
      const httpdPath = path.join(binPath, 'httpd.exe');
      const confPath = path.join(userConfig.laragonPath, 'bin', service.type, service.version, 'conf', 'httpd.conf');
      const apacheProcess = spawn(httpdPath, ['-f', confPath], { cwd: binPath, detached: true, stdio: 'ignore' });
      apacheProcess.unref();
      break;
    case 'nginx':
      const nginxProcess = spawn(path.join(binPath, 'nginx.exe'), [], { cwd: binPath, detached: true, stdio: 'ignore' });
      nginxProcess.unref();
      break;
    case 'mysql':
    case 'mariadb':
      const myIni = path.join(userConfig.laragonPath, 'bin', service.type, service.version, 'my.ini');
      const mysqlProcess = spawn(path.join(binPath, 'mysqld.exe'), ['--defaults-file=' + myIni, '--standalone'], { cwd: binPath, detached: false, stdio: ['ignore', 'pipe', 'pipe'] });
      mysqlProcess.stderr.on('data', (data) => {
        console.error('MySQL stderr:', data.toString());
      });
      mysqlProcess.stdout.on('data', (data) => {
        console.log('MySQL stdout:', data.toString());
      });
      mysqlProcess.on('exit', (code) => {
        console.log('MySQL exited with code:', code);
      });
      // No unref, let it run
      break;
    case 'postgresql':
      // PostgreSQL es más complejo, requiere pg_ctl
      break;
    case 'redis':
      const redisConf = path.join(userConfig.laragonPath, 'bin', service.type, service.version, 'redis.conf');
      const redisProcess = spawn(path.join(binPath, 'redis-server.exe'), [redisConf], { cwd: binPath, detached: true, stdio: 'ignore' });
      redisProcess.unref();
      break;
    case 'memcached':
      const memcachedProcess = spawn(path.join(binPath, 'memcached.exe'), [], { cwd: binPath, detached: true, stdio: 'ignore' });
      memcachedProcess.unref();
      break;
    case 'mailpit':
      const mailpitProcess = spawn(path.join(binPath, 'mailpit.exe'), [], { cwd: binPath, detached: true, stdio: 'ignore' });
      mailpitProcess.unref();
      break;
    case 'mongodb':
      const mongoDataPath = path.join(userConfig.laragonPath, 'data', 'mongodb');
      if (!fs.existsSync(mongoDataPath)) fs.mkdirSync(mongoDataPath, { recursive: true });
      const mongoProcess = spawn(path.join(binPath, 'mongod.exe'), ['--dbpath', mongoDataPath], { cwd: binPath, detached: true, stdio: 'ignore' });
      mongoProcess.unref();
      break;
  }
}

async function stopService(service) {
  switch (service.type) {
    case 'apache':
      await execAsync('taskkill /F /IM httpd.exe');
      break;
    case 'nginx':
      await execAsync('taskkill /F /IM nginx.exe');
      break;
    case 'mysql':
    case 'mariadb':
      await execAsync('taskkill /F /IM mysqld.exe');
      break;
    case 'postgresql':
      // pg_ctl stop
      break;
    case 'redis':
      await execAsync('taskkill /F /IM redis-server.exe');
      break;
    case 'memcached':
      await execAsync('taskkill /F /IM memcached.exe');
      break;
    case 'mailpit':
      await execAsync('taskkill /F /IM mailpit.exe');
      break;
    case 'mongodb':
      await execAsync('taskkill /F /IM mongod.exe');
      break;
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
      for (const service of services) {
        try {
          // Solo iniciar si no está ya corriendo
          const statusResult = await getServiceStatus(service);
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