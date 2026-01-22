/**
 * Servidor API para DEV - Expone las funciones reales de lib/
 * NO duplica lógica, solo transporta las funciones existentes vía HTTP
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Importar las funciones REALES de lib/ (Node.js version)
import { detectServices, loadAppConfig, getAvailableVersions, getServiceBinPath } from '../neutralino/lib/services-detector.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health check para wait-on
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Crear adapter para Node.js
const nodeAdapter = {
  async readFile(filePath) {
    return await fs.readFile(filePath, 'utf-8');
  },
  async writeFile(filePath, content) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  },
  async readDir(dirPath) {
    const entries = await fs.readdir(dirPath);
    const result = [];
    for (const name of entries) {
      const fullPath = path.join(dirPath, name);
      const stats = await fs.stat(fullPath);
      result.push({ entry: name, type: stats.isDirectory() ? 'DIRECTORY' : 'FILE' });
    }
    return result;
  },
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
};

// Endpoints básicos de filesystem
app.post('/api/read-file', async (req, res) => {
  try {
    const { path: filePath } = req.body;
    const content = await nodeAdapter.readFile(filePath);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/write-file', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    await nodeAdapter.writeFile(filePath, content);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/file-exists', async (req, res) => {
  try {
    const { path: filePath } = req.body;
    const exists = await nodeAdapter.fileExists(filePath);
    res.json({ exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/read-dir', async (req, res) => {
  try {
    const { path: dirPath } = req.body;
    const entries = await nodeAdapter.readDir(dirPath);
    res.json({ entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/exec', async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) throw new Error('No command provided');
    
    const { stdout, stderr } = await execAsync(command, { timeout: 900000 });
    res.json({ stdout, stderr, exitCode: 0, success: true });
  } catch (err) {
    res.json({
      stdout: err.stdout || '',
      stderr: err.stderr || err.message,
      exitCode: err.code || 1,
      success: false
    });
  }
});

app.post('/api/write-log', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ success: true, empty: true });
    
    const logPath = path.resolve(rootDir, 'app-debug.log');
    const finalMsg = message.endsWith('\n') ? message : message + '\n';
    await fs.appendFile(logPath, finalMsg, 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clear-logs', async (req, res) => {
  try {
    const logPath = path.resolve(rootDir, 'app-debug.log');
    await fs.writeFile(logPath, '', 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoints de alto nivel que usan las funciones REALES de lib/
app.post('/api/detect-services', async (req, res) => {
  try {
    const { appPath, userConfig, appConfig } = req.body;
    const services = await detectServices({
      fsAdapter: nodeAdapter,
      appPath,
      userConfig,
      appConfig,
      log: console.log
    });
    res.json({ services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/get-available-versions', async (req, res) => {
  try {
    const { appPath, serviceType } = req.body;
    const versions = await getAvailableVersions(nodeAdapter, appPath, serviceType);
    res.json({ versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.API_PORT || 5174;

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});

export default app;
