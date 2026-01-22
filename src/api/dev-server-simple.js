/**
 * Servidor API SIMPLE para DEV - Version minimalista para debug
 */
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

console.log('[SERVER] Middlewares configurados');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test endpoint simple
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// readDir endpoint
app.post('/api/read-dir', async (req, res) => {
  console.log('[API] read-dir request received');
  console.log('[API] Body:', req.body);
  
  try {
    const { path: dirPath } = req.body;
    console.log('[API] Reading directory:', dirPath);
    
    const items = await fs.readdir(dirPath);
    console.log('[API] Found', items.length, 'items');
    
    const entries = [];
    for (const name of items) {
      const fullPath = path.join(dirPath, name);
      const stats = await fs.stat(fullPath);
      entries.push({ 
        entry: name, 
        type: stats.isDirectory() ? 'DIRECTORY' : 'FILE' 
      });
    }
    
    console.log('[API] Sending response with', entries.length, 'entries');
    res.json({ entries });
  } catch (err) {
    console.error('[API] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// fileExists endpoint
app.post('/api/file-exists', async (req, res) => {
  console.log('[API] file-exists request received');
  
  try {
    const { path: filePath } = req.body;
    console.log('[API] Checking file:', filePath);
    
    try {
      await fs.access(filePath);
      console.log('[API] File exists: true');
      res.json({ exists: true });
    } catch {
      console.log('[API] File exists: false');
      res.json({ exists: false });
    }
  } catch (err) {
    console.error('[API] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5174;

app.listen(PORT, () => {
  console.log(`\n🚀 Simple API Server running on http://localhost:${PORT}`);
  console.log(`   Test: http://localhost:${PORT}/health\n`);
});
