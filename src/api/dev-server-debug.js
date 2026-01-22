import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.resolve(__dirname, '../../neutralino');

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
  
  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    console.log('[REQUEST] Handling /health');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
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
  console.log('[SERVER] Endpoints: /health, /api/read-dir, /api/file-exists');
  console.log('[SERVER] Ready to accept requests');
});
