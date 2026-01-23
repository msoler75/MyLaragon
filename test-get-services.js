import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { getAllServicesAvailable, getAvailableVersions } from './src/neutralino/lib/services-detector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.resolve(__dirname);

console.log('[DEBUG] basePath:', basePath);

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
      // Don't log ENOENT or ENOTDIR errors as they are expected during service detection
      if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
        console.error('[ADAPTER] readDir error:', err);
      }
      throw err;
    }
  },

  async readFile(filePath) {
    console.log('[ADAPTER] readFile called:', filePath);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      console.log('[ADAPTER] readFile returned', content.length, 'characters');
      return content;
    } catch (err) {
      console.error('[ADAPTER] readFile error:', err);
      throw err;
    }
  },

  async writeFile(filePath, content) {
    console.log('[ADAPTER] writeFile called:', filePath);
    try {
      await fs.writeFile(filePath, content, 'utf8');
      console.log('[ADAPTER] writeFile completed');
    } catch (err) {
      console.error('[ADAPTER] writeFile error:', err);
      throw err;
    }
  },

  async fileExists(filePath) {
    console.log('[ADAPTER] fileExists called:', filePath);
    try {
      await fs.access(filePath);
      console.log('[ADAPTER] fileExists: true');
      return true;
    } catch {
      console.log('[ADAPTER] fileExists: false');
      return false;
    }
  },

  async execCommand(command, options = {}) {
    console.log('[ADAPTER] execCommand called:', command);
    return new Promise((resolve, reject) => {
      exec(command, { ...options, cwd: basePath }, (error, stdout, stderr) => {
        const result = {
          exitCode: error ? error.code : 0,
          stdout: stdout || '',
          stderr: stderr || ''
        };
        console.log('[ADAPTER] execCommand result:', result);
        if (error && !options.ignoreExitCode) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
};

async function testGetServices() {
  try {
    console.log('[TEST] Calling getAllServicesAvailable with appPath:', basePath);

    // Debug getAvailableVersions
    const phpVersions = await getAvailableVersions(nodeAdapter, basePath, 'php');
    console.log('[DEBUG] getAvailableVersions for php:', phpVersions);

    const result = await getAllServicesAvailable({
      fsAdapter: nodeAdapter,
      appPath: basePath,
      userConfig: {},
      log: console.log
    });

    console.log('[TEST] getAllServicesAvailable returned', result.length, 'services');
    result.forEach(s => {
      console.log(`[TEST] Service ${s.name}: installed=${s.installedVersion}, available=${JSON.stringify(s.availableVersions)}`);
    });

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
        console.warn(`[TEST] Error checking status for ${service.name}:`, e.message);
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

    console.log('[TEST] Response:');
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('[TEST] Error:', err);
  }
}

testGetServices();