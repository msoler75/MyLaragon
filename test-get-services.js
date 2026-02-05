// test-get-services.js
// Script para probar getAllServicesAvailable directamente sin arrancar el servidor completo


import { getAllServicesAvailable, loadServicesConfig } from './src/neutralino/lib/services-detector.js';
import path from 'path';
import fs from 'fs/promises';

const basePath = path.resolve('./');

// Adaptador que solo acepta rutas absolutas
const nodeAdapter = {
  _resolve(p) {
    // Si es absoluta, usar tal cual
    if (path.isAbsolute(p)) return p;
    // Si ya contiene basePath (aunque sea relativa), no modificar
    const norm = p.replace(/\\/g, '/');
    const baseNorm = basePath.replace(/\\/g, '/');
    if (norm.startsWith(baseNorm)) return norm;
    return path.resolve(basePath, p);
  },
  async readDir(dirPath) {
    const resolvedPath = this._resolve(dirPath);
    const entries = await fs.readdir(resolvedPath);
    const result = [];
    for (const name of entries) {
      const fullPath = path.join(resolvedPath, name);
      const stats = await fs.stat(fullPath);
      result.push({
        entry: name,
        type: stats.isDirectory() ? 'DIRECTORY' : 'FILE'
      });
    }
    return { entries: result };
  },
  async fileExists(filePath) {
    const resolvedPath = this._resolve(filePath);
    try {
      await fs.access(resolvedPath);
      return { exists: true };
    } catch {
      return { exists: false };
    }
  },
  async readFile(filePath) {
    const resolvedPath = this._resolve(filePath);
    console.log('[nodeAdapter.readFile] Intentando leer:', resolvedPath);
    return await fs.readFile(resolvedPath, 'utf-8');
  },
  async writeFile(filePath, content) {
    await fs.writeFile(filePath, content, { flag: 'a' });
    return { success: true };
  },
  async execCommand(command) {
    return { exitCode: 0, stdout: '', stderr: '' };
  }
};

// DEBUG: Mostrar rutas relativas y absolutas que probará loadServicesConfig
async function debugLoadServicesConfig() {
  const possiblePaths = [
    'src/neutralino/services.json',
    'neutralino/www/services.json',
    'neutralino/services.json'
  ];
  console.log('Rutas que probará loadServicesConfig:');
  for (const p of possiblePaths) {
    const abs = nodeAdapter._resolve(p);
    const rel = path.relative(basePath, abs);
    console.log(' - Relativa:', p, '| Absoluta:', abs, '| Relativa calculada:', rel, '| existe:', await nodeAdapter.fileExists(abs));
  }
}

(async () => {
  await debugLoadServicesConfig();
  try {
    const result = await getAllServicesAvailable({
      fsAdapter: nodeAdapter,
      appPath: basePath,
      userConfig: {},
      log: console.log
    });
    console.log('getAllServicesAvailable result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
})();
