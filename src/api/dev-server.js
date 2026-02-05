import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { detectServices, loadAppConfig, loadServicesConfig, getAllServicesAvailable, getAvailableVersions } from '../neutralino/lib/services-detector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.resolve(__dirname, '../../');

function logToFile(level, message) {
  const logPath = path.resolve(basePath, 'app-debug.log');
  const timestamp = new Date().toISOString();
  const prefixedMessage = `[DEV-SERVER] ${timestamp} [${level}] ${message}\n`;
  try {
    fs.appendFileSync(logPath, prefixedMessage);
  } catch (err) {
    console.error('Error writing to dev-server log file:', err);
  }
}

function logger(level, message) {
  console.log(`[${level}] ${message}`);
  logToFile(level, message);
}

// Capturar errores no manejados
process.on('uncaughtException', (err) => {
  logger('FATAL', `uncaughtException: ${err}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger('FATAL', `unhandledRejection: ${reason}`);
  process.exit(1);
});

const nodeAdapter = {
  async readDir(dirPath) {
    logger('ADAPTER', `readDir called: ${dirPath}`);
    try {
      const resolvedPath = path.isAbsolute(dirPath) ? dirPath : path.resolve(basePath, dirPath);
      logger('ADAPTER', `Resolved path for readdir: ${resolvedPath}`);
      const entries = fs.readdirSync(resolvedPath);
      logger('ADAPTER', `readdir returned ${entries.length} entries`);
      const result = [];
      
      for (const name of entries) {
        const fullPath = path.join(resolvedPath, name);
        const stats = fs.statSync(fullPath);
        result.push({
          entry: name,
          type: stats.isDirectory() ? 'DIRECTORY' : 'FILE'
        });
      }
      
      logger('ADAPTER', `readDir result: ${result.length} items`);
      return { entries: result };
    } catch (err) {
      // Don't log ENOENT or ENOTDIR errors as they are expected during service detection
      if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
        logger('ERROR', `[ADAPTER] readDir error: ${err}`);
      }
      throw err;
    }
  },

  async fileExists(filePath) {
    logger('ADAPTER', `fileExists called: ${filePath}`);
    try {
      filePath = filePath.replace(/\\/g, '/');
      const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(basePath, filePath);
      logger('ADAPTER', `Resolved path for exists: ${resolvedPath}`);
      const exists = fs.existsSync(resolvedPath);
      logger('ADAPTER', `fileExists: ${exists ? 'EXISTS' : 'NOT EXISTS'}`);
      return { exists };
    } catch {
      logger('ADAPTER', 'fileExists: NOT EXISTS');
      return { exists: false };
    }
  },

  async readFile(filePath) {
    logger('ADAPTER', `readFile called: ${filePath}`);
    try {
      filePath = filePath.replace(/\\/g, '/');
      const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(basePath, filePath);
      logger('ADAPTER', `Resolved path: ${resolvedPath}`);
      const content = fs.readFileSync(resolvedPath, 'utf-8');
      logger('ADAPTER', `readFile success: ${content.length} bytes`);
      return content;
    } catch (err) {
      // Don't log ENOENT errors as they are expected during file operations
      if (err.code !== 'ENOENT') {
        logger('ERROR', `[ADAPTER] readFile error: ${err}`);
      }
      throw err;
    }
  },

  async writeFile(filePath, content) {
    logger('ADAPTER', `writeFile called: ${filePath}`);
    try {
      fs.writeFileSync(filePath, content, { flag: 'a' }); // append mode
      logger('ADAPTER', 'writeFile success');
      return { success: true };
    } catch (err) {
      logger('ERROR', `[ADAPTER] writeFile error: ${err}`);
      throw err;
    }
  },

  async execCommand(command) {
    logger('ADAPTER', `execCommand called: ${command}`);
    return new Promise((resolve) => {
      exec(command, { cwd: basePath }, (error, stdout, stderr) => {
        logger('ADAPTER', `execCommand result: ${JSON.stringify({ error: error?.message, stdout: stdout?.slice(0, 100), stderr: stderr?.slice(0, 100) })}`);
        resolve({
          exitCode: error ? error.code || 1 : 0,
          stdout: stdout || '',
          stderr: stderr || ''
        });
      });
    });
  }
};


/////////////////// HTTP SERVER ///////////////////

const server = http.createServer(async (req, res) => {
  logger('REQUEST', `${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    logger('REQUEST', 'OPTIONS preflight response');
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Health check (support both GET and HEAD for wait-on)
  if (req.url === '/health' && (req.method === 'GET' || req.method === 'HEAD')) {
    logger('REQUEST', 'Handling /health');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (req.method === 'GET') {
      res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    } else {
      res.end(); // HEAD requests don't send body
    }
    logger('REQUEST', '/health response sent');
    return;
  }
  
  // Read dir endpoint
  if (req.url === '/api/read-dir' && req.method === 'POST') {
    logger('REQUEST', 'Handling /api/read-dir');
    let body = '';
    
    req.on('data', chunk => {
      logger('REQUEST', `Received chunk: ${chunk.length} bytes`);
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      let dirPath = null;
      try {
        logger('REQUEST', `Body complete: ${body}`);
        const parsed = JSON.parse(body);
        dirPath = parsed.path;
        logger('REQUEST', `Parsed dirPath: ${dirPath}`);
        
        const result = await nodeAdapter.readDir(dirPath);
        logger('REQUEST', `Adapter returned: ${JSON.stringify(result)}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        logger('REQUEST', '/api/read-dir response sent');
      } catch (err) {
        logger('ERROR', `/api/read-dir error for path "${dirPath}": ${err.message}`);
        logger('ERROR', `Full error: ${err.stack}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message, path: dirPath }));
      }
    });
    
    req.on('error', (err) => {
      logger('ERROR', `Request error: ${err}`);
    });
    
    return;
  }
  
  // File exists endpoint
  if (req.url === '/api/file-exists' && req.method === 'POST') {
    logger('REQUEST', 'Handling /api/file-exists');
    let body = '';
    
    req.on('data', chunk => {
      logger('REQUEST', `Received chunk: ${chunk.length} bytes`);
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        logger('REQUEST', `Body complete: ${body}`);
        const { path: filePath } = JSON.parse(body);
        logger('REQUEST', `Parsed filePath: ${filePath}`);
        
        const result = await nodeAdapter.fileExists(filePath);
        logger('REQUEST', `Adapter returned: ${JSON.stringify(result)}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        logger('REQUEST', '/api/file-exists response sent');
      } catch (err) {
        logger('ERROR', `/api/file-exists error: ${err}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    
    req.on('error', (err) => {
      logger('ERROR', `Request error: ${err}`);
    });
    
    return;
  }
  
  // Directory exists endpoint
  if (req.url === '/api/dir-exists' && req.method === 'POST') {
    logger('REQUEST', 'Handling /api/dir-exists');
    let body = '';
    
    req.on('data', chunk => {
      logger('REQUEST', `Received chunk: ${chunk.length} bytes`);
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        logger('REQUEST', `Body complete: ${body}`);
        const { path: dirPath } = JSON.parse(body);
        logger('REQUEST', `Parsed dirPath: ${dirPath}`);
        
        const resolvedPath = path.isAbsolute(dirPath) ? dirPath : path.resolve(basePath, dirPath);
        logger('REQUEST', `Resolved path: ${resolvedPath}`);
        
        const exists = fs.existsSync(resolvedPath);
        logger('REQUEST', `dirExists: ${exists ? 'EXISTS' : 'NOT EXISTS'}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ exists }));
        logger('REQUEST', '/api/dir-exists response sent');
      } catch (err) {
        logger('ERROR', `/api/dir-exists error: ${err}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    
    req.on('error', (err) => {
      logger('ERROR', `Request error: ${err}`);
    });
    
    return;
  }
  
  // Create directory endpoint
  if (req.url === '/api/create-dir' && req.method === 'POST') {
    logger('REQUEST', 'Handling /api/create-dir');
    let body = '';
    
    req.on('data', chunk => {
      logger('REQUEST', `Received chunk: ${chunk.length} bytes`);
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        logger('REQUEST', `Body complete: ${body}`);
        const { path: dirPath, recursive } = JSON.parse(body);
        logger('REQUEST', `Parsed dirPath: ${dirPath}, recursive: ${recursive}`);
        
        const resolvedPath = path.isAbsolute(dirPath) ? dirPath : path.resolve(basePath, dirPath);
        logger('REQUEST', `Resolved path: ${resolvedPath}`);
        
        if (recursive) {
          fs.mkdirSync(resolvedPath, { recursive: true });
        } else {
          fs.mkdirSync(resolvedPath);
        }
        logger('REQUEST', 'Directory created successfully');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        logger('REQUEST', '/api/create-dir response sent');
      } catch (err) {
        logger('ERROR', `/api/create-dir error: ${err}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    
    req.on('error', (err) => {
      logger('ERROR', `Request error: ${err}`);
    });
    
    return;
  }
  
  // Read file endpoint
  if (req.url === '/api/read-file' && req.method === 'POST') {
    logger('REQUEST', 'Handling /api/read-file');
    let body = '';
    
    req.on('data', chunk => {
      logger('REQUEST', `Received chunk: ${chunk.length} bytes`);
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        logger('REQUEST', `Body complete: ${body}`);
        let { path: filePath } = JSON.parse(body);
        logger('REQUEST', `Parsed filePath: ${filePath}`);
        
        filePath = filePath.replace(/\\/g, '/');
        const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(basePath, filePath);
        logger('REQUEST', `Resolved path: ${resolvedPath}`);
        
        const content = fs.readFileSync(resolvedPath, 'utf-8');
        logger('REQUEST', `Read ${content.length} bytes`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ content }));
        logger('REQUEST', '/api/read-file response sent');
      } catch (err) {
        logger('ERROR', `/api/read-file error: ${err}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    
    req.on('error', (err) => {
      logger('ERROR', `Request error: ${err}`);
    });
    
    return;
  }
  
  // Write log endpoint
  if (req.url === '/api/write-log' && req.method === 'POST') {
    logger('REQUEST', 'Handling /api/write-log');
    let body = '';
    
    req.on('data', chunk => {
      logger('REQUEST', `Received chunk: ${chunk.length} bytes`);
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        logger('REQUEST', `Body complete: ${body}`);
        const { message } = JSON.parse(body);
        logger('REQUEST', `Log message: ${message}`);
        
        const logPath = path.join(process.cwd(), 'app-debug.log');
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${message}\n`;
        
        await nodeAdapter.writeFile(logPath, logLine);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        logger('REQUEST', '/api/write-log response sent');
      } catch (err) {
        logger('ERROR', `/api/write-log error: ${err}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    
    req.on('error', (err) => {
      logger('ERROR', `Request error: ${err}`);
    });
    
    return;
  }
  
  // Exec command endpoint
  if (req.url === '/api/exec-command' && req.method === 'POST') {
    logger('REQUEST', 'Handling /api/exec-command');
    let body = '';
    
    req.on('data', chunk => {
      logger('REQUEST', `Received chunk: ${chunk.length} bytes`);
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        logger('REQUEST', `Body complete: ${body}`);
        const { command } = JSON.parse(body);
        logger('REQUEST', `Command: ${command}`);
        
        const result = await nodeAdapter.execCommand(command);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        logger('REQUEST', '/api/exec-command response sent');
      } catch (err) {
        logger('ERROR', `/api/exec-command error: ${err}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    
    req.on('error', (err) => {
      logger('ERROR', `Request error: ${err}`);
    });
    
    return;
  }
  
  
  // Get all services information (installed, available, status)
  // PARA DEV: Para comprobar este método se puede usar node test-get-services.js  (y así no arrancar todo el servidor dev)
  if (req.url === '/api/get-services' && req.method === 'GET') {
    logger('REQUEST', 'Handling /api/get-services');
    
    try {
      logger('REQUEST', `Calling getAllServicesAvailable with appPath: ${basePath}`);
      
      // Debug getAvailableVersions
      const phpVersions = await getAvailableVersions(nodeAdapter, basePath, 'php');
      logger('DEBUG', `getAvailableVersions for php: ${JSON.stringify(phpVersions)}`);
      
      const result = await getAllServicesAvailable({
        fsAdapter: nodeAdapter,
        appPath: basePath,
        userConfig: {},
        log: (msg) => logger('DEBUG', msg)
      });
      
      logger('REQUEST', `getAllServicesAvailable returned ${result.length} services`);
      
      // Simulate shim processing: add status checks
      for (const service of result) {
        try {
          // Simple status check (in dev, assume not running)
          service.running = false;
          service.status = service.installedVersion ? 'stopped' : 'not-installed';
          service.portInUse = false;
          service.canStart = service.installedVersion && !service.running;
          service.canStop = service.running;
        } catch (e) {
          logger('WARN', `Error checking status for ${service.name}: ${e.message}`);
          service.running = false;
          service.status = 'unknown';
        }
      }
      
      // Return structured response like shim
      const response = {
        all: result,
        installer: result.filter(s => s.type !== 'language'),
        services: result.filter(s => s.currentVersion && s.type !== 'language')
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      logger('REQUEST', `/api/get-services response sent with ${result.length} total services`);
    } catch (err) {
      logger('ERROR', `/api/get-services error: ${err}`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    
    return;
  }
  
  // 404
  logger('REQUEST', '404 Not Found');
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.on('error', (err) => {
  logger('ERROR', `Server error: ${err}`);
  process.exit(1);
});

server.on('connection', (socket) => {
  logger('SERVER', `New connection from ${socket.remoteAddress}`);
  
  socket.on('error', (err) => {
    logger('ERROR', `Socket error: ${err}`);
  });
});

const PORT = 5174;
server.listen(PORT, () => {
  logger('SERVER', `🚀 Debug API Server running on http://localhost:${PORT}`);
  logger('SERVER', 'Endpoints: /health, /api/read-dir, /api/file-exists, /api/dir-exists, /api/create-dir, /api/read-file, /api/write-log, /api/exec-command, /api/get-services');
  logger('SERVER', 'Ready to accept requests');
});
