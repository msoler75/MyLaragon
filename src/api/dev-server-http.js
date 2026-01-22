/**
 * Servidor HTTP puro para probar - SIN Express
 */
import http from 'http';
import fs from 'fs/promises';
import path from 'path';

const server = http.createServer(async (req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  
  // read-dir
  if (req.url === '/api/read-dir' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { path: dirPath } = JSON.parse(body);
        console.log('  Reading:', dirPath);
        
        const items = await fs.readdir(dirPath);
        const entries = [];
        
        for (const name of items) {
          const fullPath = path.join(dirPath, name);
          const stats = await fs.stat(fullPath);
          entries.push({ entry: name, type: stats.isDirectory() ? 'DIRECTORY' : 'FILE' });
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ entries }));
        console.log('  Response sent:', entries.length, 'items');
      } catch (err) {
        console.error('  Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  
  // file-exists
  if (req.url === '/api/file-exists' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { path: filePath } = JSON.parse(body);
        console.log('  Checking:', filePath);
        
        try {
          await fs.access(filePath);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ exists: true }));
          console.log('  Exists: true');
        } catch {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ exists: false }));
          console.log('  Exists: false');
        }
      } catch (err) {
        console.error('  Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const PORT = 5174;

server.listen(PORT, () => {
  console.log(`\n🚀 HTTP API Server running on http://localhost:${PORT}`);
  console.log(`   Test: curl http://localhost:${PORT}/health\n`);
});
