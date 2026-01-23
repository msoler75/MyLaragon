/**
 * Test completo de todos los endpoints de la API REST
 * Verifica que dev-server.js funciona correctamente
 */

import { describe, it, beforeAll, afterAll } from 'vitest';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const API_BASE = 'http://localhost:5174';

let serverProcess = null;

// Helper para hacer requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  return response;
}

describe('API REST - Dev Server Endpoints', { timeout: 30000 }, () => {
  
  beforeAll(async () => {
    console.log('[TEST] Iniciando dev-server...');
    
    // Iniciar el servidor
    serverProcess = spawn('node', ['src/api/dev-server.js'], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let serverStarted = false;
    
    serverProcess.stdout.on('data', (data) => {
      const message = data.toString();
      if (message.includes('Ready to accept requests')) {
        serverStarted = true;
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('[SERVER ERROR]', data.toString());
    });

    // Esperar a que el servidor esté listo (máximo 10 segundos)
    const startTime = Date.now();
    while (!serverStarted && (Date.now() - startTime) < 10000) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!serverStarted) {
      throw new Error('Server no arrancó en 10 segundos');
    }

    // Esperar 1 segundo adicional para asegurar que está listo
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[TEST] Servidor iniciado correctamente');
  });

  afterAll(async () => {
    if (serverProcess) {
      console.log('[TEST] Deteniendo servidor...');
      serverProcess.kill();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  });

  describe('GET /health', () => {
    it('debe responder con status ok', async () => {
      const response = await apiRequest('/health', { method: 'GET' });
      
      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      assert.strictEqual(response.headers.get('content-type'), 'application/json', 'Content-Type debe ser JSON');
      
      const data = await response.json();
      assert.strictEqual(data.status, 'ok', 'Status debe ser "ok"');
      assert.ok(data.timestamp, 'Debe incluir timestamp');
      assert.ok(typeof data.timestamp === 'number', 'Timestamp debe ser un número');
    });
  });

  describe('HEAD /health', () => {
    it('debe responder sin body', async () => {
      const response = await apiRequest('/health', { method: 'HEAD' });
      
      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      
      const text = await response.text();
      assert.strictEqual(text, '', 'HEAD no debe devolver body');
    });
  });

  describe('POST /api/read-dir', () => {
    it('debe listar contenido del directorio PHP', async () => {
      const response = await apiRequest('/api/read-dir', {
        method: 'POST',
        body: JSON.stringify({ path: './neutralino/bin/php' })
      });

      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      
      const data = await response.json();
      assert.ok(data.entries, 'Debe devolver propiedad "entries"');
      assert.ok(Array.isArray(data.entries), 'entries debe ser un array');
      assert.ok(data.entries.length > 0, 'Debe haber al menos una versión de PHP');
      
      // Verificar estructura de cada entrada
      const firstEntry = data.entries[0];
      assert.ok(firstEntry.entry, 'Cada entrada debe tener propiedad "entry"');
      assert.ok(firstEntry.type, 'Cada entrada debe tener propiedad "type"');
      assert.ok(['FILE', 'DIRECTORY'].includes(firstEntry.type), 'type debe ser FILE o DIRECTORY');
    });

    it('debe listar contenido del directorio Apache', async () => {
      const response = await apiRequest('/api/read-dir', {
        method: 'POST',
        body: JSON.stringify({ path: './neutralino/bin/apache' })
      });

      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      
      const data = await response.json();
      assert.ok(data.entries, 'Debe devolver propiedad "entries"');
      assert.ok(Array.isArray(data.entries), 'entries debe ser un array');
    });

    it('debe manejar directorio inexistente', async () => {
      const response = await apiRequest('/api/read-dir', {
        method: 'POST',
        body: JSON.stringify({ path: './directorio-que-no-existe' })
      });

      assert.strictEqual(response.status, 500, 'Status code debe ser 500 para directorio inexistente');
      
      const data = await response.json();
      assert.ok(data.error, 'Debe devolver un mensaje de error');
    });
  });

  describe('POST /api/file-exists', () => {
    it('debe devolver true para directorio PHP existente', async () => {
      const response = await apiRequest('/api/file-exists', {
        method: 'POST',
        body: JSON.stringify({ path: './neutralino/bin/php' })
      });

      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      
      const data = await response.json();
      assert.ok(data.hasOwnProperty('exists'), 'Debe devolver propiedad "exists"');
      assert.strictEqual(data.exists, true, 'PHP directory debe existir');
    });

    it('debe devolver false para archivo inexistente', async () => {
      const response = await apiRequest('/api/file-exists', {
        method: 'POST',
        body: JSON.stringify({ path: './archivo-que-no-existe.txt' })
      });

      assert.strictEqual(response.status, 200, 'Status code debe ser 200 incluso si no existe');
      
      const data = await response.json();
      assert.strictEqual(data.exists, false, 'Archivo inexistente debe devolver false');
    });

    it('debe verificar existencia de app.ini', async () => {
      const response = await apiRequest('/api/file-exists', {
        method: 'POST',
        body: JSON.stringify({ path: './app.ini' })
      });

      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      
      const data = await response.json();
      assert.strictEqual(data.exists, true, 'app.ini debe existir');
    });
  });

  describe('POST /api/read-file', () => {
    it('debe leer contenido de app.ini', async () => {
      const response = await apiRequest('/api/read-file', {
        method: 'POST',
        body: JSON.stringify({ path: './app.ini' })
      });

      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      assert.strictEqual(response.headers.get('content-type'), 'text/plain', 'Content-Type debe ser text/plain');
      
      const content = await response.text();
      assert.ok(content.length > 0, 'Contenido no debe estar vacío');
      assert.ok(content.includes('['), 'app.ini debe tener formato INI con secciones');
    });

    it('debe leer contenido de package.json', async () => {
      const response = await apiRequest('/api/read-file', {
        method: 'POST',
        body: JSON.stringify({ path: './package.json' })
      });

      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      
      const content = await response.text();
      const json = JSON.parse(content);
      assert.ok(json.name, 'package.json debe tener propiedad name');
      assert.ok(json.version, 'package.json debe tener propiedad version');
    });

    it('debe manejar archivo inexistente', async () => {
      const response = await apiRequest('/api/read-file', {
        method: 'POST',
        body: JSON.stringify({ path: './archivo-inexistente.txt' })
      });

      assert.strictEqual(response.status, 500, 'Status code debe ser 500 para archivo inexistente');
      
      const data = await response.json();
      assert.ok(data.error, 'Debe devolver un mensaje de error');
    });
  });

  describe('POST /api/write-log', () => {
    const testLogPath = join(projectRoot, 'app-debug.log');
    
    it('debe escribir mensaje en el log', async () => {
      const testMessage = `[TEST] Mensaje de prueba ${Date.now()}`;
      
      const response = await apiRequest('/api/write-log', {
        method: 'POST',
        body: JSON.stringify({ message: testMessage })
      });

      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      
      const data = await response.json();
      assert.strictEqual(data.success, true, 'Debe devolver success: true');
      
      // Verificar que el mensaje se escribió en el log
      await new Promise(resolve => setTimeout(resolve, 100)); // Esperar a que se escriba
      const logContent = await fs.readFile(testLogPath, 'utf-8');
      assert.ok(logContent.includes(testMessage), 'El log debe contener el mensaje escrito');
    });

    it('debe añadir timestamp al mensaje', async () => {
      const testMessage = '[TEST] Mensaje sin timestamp';
      
      const response = await apiRequest('/api/write-log', {
        method: 'POST',
        body: JSON.stringify({ message: testMessage })
      });

      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      
      // Verificar que el mensaje tiene timestamp ISO
      await new Promise(resolve => setTimeout(resolve, 100));
      const logContent = await fs.readFile(testLogPath, 'utf-8');
      const logLines = logContent.split('\n');
      const lastLine = logLines.filter(l => l.includes(testMessage))[0];
      
      assert.ok(lastLine, 'Debe encontrar el mensaje en el log');
      assert.ok(lastLine.match(/\[\d{4}-\d{2}-\d{2}T/), 'Debe incluir timestamp ISO al inicio');
    });

    it('debe manejar mensajes con caracteres especiales', async () => {
      const testMessage = '[TEST] Mensaje con "comillas" y ñ, á, é';
      
      const response = await apiRequest('/api/write-log', {
        method: 'POST',
        body: JSON.stringify({ message: testMessage })
      });

      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      const logContent = await fs.readFile(testLogPath, 'utf-8');
      assert.ok(logContent.includes(testMessage), 'Debe manejar caracteres especiales correctamente');
    });
  });

  describe('GET /api/get-services', () => {
    it('debe devolver lista de servicios detectados', async () => {
      const response = await apiRequest('/api/get-services', { method: 'GET' });
      
      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      assert.strictEqual(response.headers.get('content-type'), 'application/json', 'Content-Type debe ser JSON');
      
      const services = await response.json();
      assert.ok(Array.isArray(services), 'Respuesta debe ser un array');
      assert.ok(services.length > 0, 'Debe haber al menos un servicio');
      
      // Verificar estructura de al menos un servicio
      const service = services[0];
      assert.ok(service.id, 'Servicio debe tener id');
      assert.ok(service.name, 'Servicio debe tener nombre');
      assert.ok(service.type, 'Servicio debe tener tipo');
    });
  });

  describe('POST /api/exec-command', () => {
    it('debe ejecutar comandos del sistema', async () => {
      const response = await apiRequest('/api/exec-command', {
        method: 'POST',
        body: JSON.stringify({ command: 'echo test' })
      });
      
      assert.strictEqual(response.status, 200, 'Status code debe ser 200');
      assert.strictEqual(response.headers.get('content-type'), 'application/json', 'Content-Type debe ser JSON');
      
      const result = await response.json();
      assert.ok(result.stdout !== undefined, 'Debe tener stdout');
      assert.ok(result.stderr !== undefined, 'Debe tener stderr');
      assert.ok(typeof result.exitCode === 'number', 'Debe tener exitCode numérico');
      assert.ok(result.stdout.includes('test'), 'Output debe contener "test"');
    });
  });

  describe('Endpoint inexistente', () => {
    it('debe devolver 404 para endpoint no definido', async () => {
      const response = await apiRequest('/api/endpoint-inexistente', {
        method: 'POST',
        body: JSON.stringify({})
      });

      assert.strictEqual(response.status, 404, 'Status code debe ser 404');
      
      const data = await response.json();
      assert.ok(data.error, 'Debe devolver un mensaje de error');
    });
  });

  describe('CORS Headers', () => {
    it('debe incluir headers CORS en todas las respuestas', async () => {
      const response = await apiRequest('/health', { method: 'GET' });
      
      assert.ok(response.headers.get('access-control-allow-origin'), 'Debe incluir Access-Control-Allow-Origin');
      assert.strictEqual(response.headers.get('access-control-allow-origin'), '*', 'CORS debe permitir todos los orígenes');
    });

    it('debe responder a OPTIONS preflight', async () => {
      const response = await apiRequest('/api/read-dir', {
        method: 'OPTIONS'
      });

      assert.strictEqual(response.status, 204, 'OPTIONS debe devolver 204');
      assert.ok(response.headers.get('access-control-allow-methods'), 'Debe incluir métodos permitidos');
    });
  });

  describe('Integración completa', () => {
    it('debe ejecutar flujo completo: verificar directorio → listar → verificar archivo', async () => {
      // 1. Verificar que existe el directorio
      const existsRes = await apiRequest('/api/file-exists', {
        method: 'POST',
        body: JSON.stringify({ path: './neutralino/bin/php' })
      });
      const existsData = await existsRes.json();
      assert.strictEqual(existsData.exists, true, 'Directorio PHP debe existir');

      // 2. Listar versiones disponibles
      const readDirRes = await apiRequest('/api/read-dir', {
        method: 'POST',
        body: JSON.stringify({ path: './neutralino/bin/php' })
      });
      const readDirData = await readDirRes.json();
      assert.ok(readDirData.entries.length > 0, 'Debe haber versiones de PHP');

      // 3. Verificar que existe el directorio de una versión específica
      const firstVersion = readDirData.entries[0].entry;
      const versionPath = `./neutralino/bin/php/${firstVersion}`;
      const fileExistsRes = await apiRequest('/api/file-exists', {
        method: 'POST',
        body: JSON.stringify({ path: versionPath })
      });
      const fileExistsData = await fileExistsRes.json();
      assert.strictEqual(fileExistsData.exists, true, `Directorio ${firstVersion} debe existir`);

      // 4. Escribir resultado en log
      const logRes = await apiRequest('/api/write-log', {
        method: 'POST',
        body: JSON.stringify({ 
          message: `[TEST] Detectadas ${readDirData.entries.length} versiones de PHP` 
        })
      });
      const logData = await logRes.json();
      assert.strictEqual(logData.success, true, 'Log debe escribirse correctamente');
    });
  });
});
