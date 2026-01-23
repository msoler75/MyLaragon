import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { detectServices, loadAppConfig } from '../neutralino/lib/services-detector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.resolve(__dirname, '../../');

console.log('[DEBUG] Starting server...');
console.log('[DEBUG] basePath:', basePath);

// Capturar errores no manejados
process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] unhandledRejection:', reason);
  process.exit(1);
});

const nodeAdapter = {
  async readDir(dirPath) {
    console.log('[ADAPTER] readDir called:', dirPath);
    try {
      const entries = await fs.readdir(dirPath);
      console.log('[ADAPTER] readdir returned', entries.length, 'entries');
      const result = [];
      
      for (const name of entries) {
        const fullPath = path.join(dirPath, name);
        const stats = await fs.stat(fullPath);
        result.push({
          entry: name,
          type: stats.isDirectory() ? 'DIRECTORY' : 'FILE'
        });
      }
      
      console.log('[ADAPTER] readDir result:', result.length, 'items');
      return { entries: result };
    } catch (err) {
      console.error('[ADAPTER] readDir error:', err);
      throw err;
    }
  },

  async fileExists(filePath) {
    console.log('[ADAPTER] fileExists called:', filePath);
    try {
      await fs.access(filePath);
      console.log('[ADAPTER] fileExists: true');
      return { exists: true };
    } catch {
      console.log('[ADAPTER] fileExists: false');
      return { exists: false };
    }
  },

  async readFile(filePath) {
    console.log('[ADAPTER] readFile called:', filePath);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      console.log('[ADAPTER] readFile success:', content.length, 'bytes');
      return content;
    } catch (err) {
      console.error('[ADAPTER] readFile error:', err);
      throw err;
    }
  },

  async writeFile(filePath, content) {
    console.log('[ADAPTER] writeFile called:', filePath);
    try {
      await fs.writeFile(filePath, content, { flag: 'a' }); // append mode
      console.log('[ADAPTER] writeFile success');
      return { success: true };
    } catch (err) {
      console.error('[ADAPTER] writeFile error:', err);
      throw err;
    }
  },

  async execCommand(command) {
    console.log('[ADAPTER] execCommand called:', command);
    return new Promise((resolve) => {
      exec(command, { cwd: basePath }, (error, stdout, stderr) => {
        console.log('[ADAPTER] execCommand result:', { error: error?.message, stdout: stdout?.slice(0, 100), stderr: stderr?.slice(0, 100) });
        resolve({
          exitCode: error ? error.code || 1 : 0,
          stdout: stdout || '',
          stderr: stderr || ''
        });
      });
    });
  }
};

const server = http.createServer((req, res) => {
  console.log('[REQUEST]', req.method, req.url);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    console.log('[REQUEST] OPTIONS preflight response');
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Health check (support both GET and HEAD for wait-on)
  if (req.url === '/health' && (req.method === 'GET' || req.method === 'HEAD')) {
    console.log('[REQUEST] Handling /health');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (req.method === 'GET') {
      res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    } else {
      res.end(); // HEAD requests don't send body
    }
    console.log('[REQUEST] /health response sent');
    return;
  }
  
  // Read dir endpoint
  if (req.url === '/api/read-dir' && req.method === 'POST') {
    console.log('[REQUEST] Handling /api/read-dir');
    let body = '';
    
    req.on('data', chunk => {
      console.log('[REQUEST] Received chunk:', chunk.length, 'bytes');
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        console.log('[REQUEST] Body complete:', body);
        const { path: dirPath } = JSON.parse(body);
        console.log('[REQUEST] Parsed dirPath:', dirPath);
        
        const result = await nodeAdapter.readDir(dirPath);
        console.log('[REQUEST] Adapter returned:', result);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        console.log('[REQUEST] /api/read-dir response sent');
      } catch (err) {
        console.error('[REQUEST] /api/read-dir error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    
    req.on('error', (err) => {
      console.error('[REQUEST] Request error:', err);
    });
    
    return;
  }
  
  // File exists endpoint
  if (req.url === '/api/file-exists' && req.method === 'POST') {
    console.log('[REQUEST] Handling /api/file-exists');
    let body = '';
    
    req.on('data', chunk => {
      console.log('[REQUEST] Received chunk:', chunk.length, 'bytes');
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        console.log('[REQUEST] Body complete:', body);
        const { path: filePath } = JSON.parse(body);
        console.log('[REQUEST] Parsed filePath:', filePath);
        
        const result = await nodeAdapter.fileExists(filePath);
        console.log('[REQUEST] Adapter returned:', result);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        console.log('[REQUEST] /api/file-exists response sent');
      } catch (err) {
        console.error('[REQUEST] /api/file-exists error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    
    req.on('error', (err) => {
      console.error('[REQUEST] Request error:', err);
    });
    
    return;
  }
  
  // Read file endpoint
  if (req.url === '/api/read-file' && req.method === 'POST') {
    console.log('[REQUEST] Handling /api/read-file');
    let body = '';
    
    req.on('data', chunk => {
      console.log('[REQUEST] Received chunk:', chunk.length, 'bytes');
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        console.log('[REQUEST] Body complete:', body);
        const { path: filePath } = JSON.parse(body);
        console.log('[REQUEST] Parsed filePath:', filePath);
        
        const content = await nodeAdapter.readFile(filePath);
        console.log('[REQUEST] Read', content.length, 'bytes');
        
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(content);
        console.log('[REQUEST] /api/read-file response sent');
      } catch (err) {
        console.error('[REQUEST] /api/read-file error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    
    req.on('error', (err) => {
      console.error('[REQUEST] Request error:', err);
    });
    
    return;
  }
  
  // Write log endpoint
  if (req.url === '/api/write-log' && req.method === 'POST') {
    console.log('[REQUEST] Handling /api/write-log');
    let body = '';
    
    req.on('data', chunk => {
      console.log('[REQUEST] Received chunk:', chunk.length, 'bytes');
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        console.log('[REQUEST] Body complete:', body);
        const { message } = JSON.parse(body);
        console.log('[REQUEST] Log message:', message);
        
        const logPath = path.join(process.cwd(), 'app-debug.log');
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${message}\n`;
        
        await nodeAdapter.writeFile(logPath, logLine);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        console.log('[REQUEST] /api/write-log response sent');
      } catch (err) {
        console.error('[REQUEST] /api/write-log error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    
    req.on('error', (err) => {
      console.error('[REQUEST] Request error:', err);
    });
    
    return;
  }
  
  // Exec command endpoint
  if (req.url === '/api/exec-command' && req.method === 'POST') {
    console.log('[REQUEST] Handling /api/exec-command');
    let body = '';
    
    req.on('data', chunk => {
      console.log('[REQUEST] Received chunk:', chunk.length, 'bytes');
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        console.log('[REQUEST] Body complete:', body);
        const { command } = JSON.parse(body);
        console.log('[REQUEST] Command:', command);
        
        const result = await nodeAdapter.execCommand(command);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        console.log('[REQUEST] /api/exec-command response sent');
      } catch (err) {
        console.error('[REQUEST] /api/exec-command error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    
    req.on('error', (err) => {
      console.error('[REQUEST] Request error:', err);
    });
    
    return;
  }
  
  // Get services endpoint
  if (req.url === '/api/get-services' && req.method === 'GET') {
    console.log('[REQUEST] Handling /api/get-services');
    
    (async () => {
      try {
        // Always use real detectServices function, same as production
        const appConfig = await loadAppConfig(nodeAdapter, basePath);
        const services = await detectServices({
          fsAdapter: nodeAdapter,
          appPath: basePath,
          userConfig: {},
          appConfig,
          log: console.log
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(services));
        console.log('[REQUEST] /api/get-services response sent');
      } catch (err) {
        console.error('[REQUEST] /api/get-services error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    })();
    
    return;
  }
  
  // Serve services.json
  if (req.url === '/services.json' && req.method === 'GET') {
    console.log('[REQUEST] Handling /services.json');
    
    (async () => {
      try {
        const servicesPath = path.join(basePath, 'services.json');
        const content = await nodeAdapter.readFile(servicesPath);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(content);
        console.log('[REQUEST] /services.json response sent');
      } catch (err) {
        console.error('[REQUEST] /services.json error:', err);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    })();
    
    return;
  }
  
  // 404
  console.log('[REQUEST] 404 Not Found');
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.on('error', (err) => {
  console.error('[SERVER] Server error:', err);
  process.exit(1);
});

server.on('connection', (socket) => {
  console.log('[SERVER] New connection from', socket.remoteAddress);
  
  socket.on('error', (err) => {
    console.error('[SOCKET] Socket error:', err);
  });
});

const PORT = 5174;
server.listen(PORT, () => {
  console.log(`[SERVER] 🚀 Debug API Server running on http://localhost:${PORT}`);
  console.log('[SERVER] Endpoints: /health, /api/read-dir, /api/file-exists, /api/read-file, /api/write-log, /api/exec-command, /api/get-services, /services.json');
  console.log('[SERVER] Ready to accept requests');
});
