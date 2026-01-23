/**
 * Filesystem Adapter - Abstracción unificada para DEV y PROD
 * 
 * En DEV: usa fetch() a /api/* (proxy de Vite)
 * En PROD: usa Neutralino.filesystem (nativo)
 */

export class FilesystemAdapter {
  constructor(isDev, neutralino = null) {
    this.isDev = isDev;
    this.neutralino = neutralino || globalThis.Neutralino;
  }

  async readFile(path) {
    if (this.isDev) {
      try {
        const response = await fetch('/api/read-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.content || data;
      } catch (e) {
        throw new Error(`Failed to read file ${path}: ${e.message}`);
      }
    }
    
    if (!this.neutralino?.filesystem) {
      throw new Error('Neutralino filesystem not available');
    }
    return this.neutralino.filesystem.readFile(path);
  }

  async writeFile(path, content) {
    if (this.isDev) {
      const response = await fetch('/api/write-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }
    
    if (!this.neutralino?.filesystem) {
      throw new Error('Neutralino filesystem not available');
    }
    return this.neutralino.filesystem.writeFile(path, content);
  }

  async readDir(path) {
    if (this.isDev) {
      const response = await fetch('/api/read-dir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      // dev-server devuelve { entries: [...] }, mantener ese formato
      return data;
    }
    
    if (!this.neutralino?.filesystem) {
      throw new Error('Neutralino filesystem not available');
    }
    return this.neutralino.filesystem.readDirectory(path);
  }

  async fileExists(path) {
    if (this.isDev) {
      try {
        const response = await fetch('/api/file-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.exists || false;
      } catch {
        return false;
      }
    }
    
    try {
      await this.readFile(path);
      return true;
    } catch {
      return false;
    }
  }

  async execCommand(cmd) {
    if (this.isDev) {
      const response = await fetch('/api/exec-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }
    
    if (!this.neutralino?.os) {
      throw new Error('Neutralino OS not available');
    }
    return this.neutralino.os.execCommand(cmd);
  }
}

/**
 * Función helper para crear adaptador según entorno
 */
export function createFilesystemAdapter() {
  const isDev = checkIsDev();
  return new FilesystemAdapter(isDev);
}

function checkIsDev() {
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return false;
  }
  
  const port = String(window.location.port);
  const isVitePort = port === '5173' || port === '3000' || port === '5174';
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
  
  return isVitePort || (isLocal && !globalThis.NL_TOKEN);
}

/**
 * Node.js Filesystem Adapter - Para tests en Node.js
 * Usa directamente fs, path, child_process (módulos nativos)
 */
export class NodeFilesystemAdapter {
  constructor() {
    // Los módulos se cargan dinámicamente al crear la instancia
    this.ready = this._init();
  }

  async _init() {
    if (typeof window !== 'undefined') {
      throw new Error('NodeFilesystemAdapter only available in Node.js environment');
    }
    
    // Importación dinámica para ESM
    const fs = await import('fs');
    const path = await import('path');
    const { exec } = await import('child_process');
    
    this.fs = fs.default || fs;
    this.path = path.default || path;
    this.exec = exec;
    
    return true;
  }

  async readFile(path) {
    await this.ready;
    return this.fs.readFileSync(path, 'utf-8');
  }

  async writeFile(path, content) {
    await this.ready;
    this.fs.writeFileSync(path, content, 'utf-8');
    return { success: true };
  }

  async readDir(path) {
    await this.ready;
    const entries = this.fs.readdirSync(path);
    // Devolver en formato compatible con dev-server: { entries: [{ entry, type }] }
    const result = [];
    for (const name of entries) {
      const fullPath = this.path.join(path, name);
      const stats = this.fs.statSync(fullPath);
      result.push({
        entry: name,
        type: stats.isDirectory() ? 'DIRECTORY' : 'FILE'
      });
    }
    return { entries: result };
  }

  async fileExists(path) {
    await this.ready;
    return this.fs.existsSync(path);
  }

  async execCommand(cmd) {
    await this.ready;
    return new Promise((resolve, reject) => {
      this.exec(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            stdOut: stdout || '',
            stdErr: stderr || '',
            exitCode: error.code || 1
          });
        } else {
          resolve({
            stdOut: stdout || '',
            stdErr: stderr || '',
            exitCode: 0
          });
        }
      });
    });
  }
}

/**
 * Función helper para crear adaptador de Node.js para tests
 */
export function createNodeFilesystemAdapter() {
  return new NodeFilesystemAdapter();
}
