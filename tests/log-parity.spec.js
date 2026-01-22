
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.resolve(__dirname, '../app-debug.log');

test('Integridad de interceptación en Neutralino Shim (con Buffer)', async () => {
    // La fuente de verdad ahora está en src/neutralino/
    const shimPath = path.resolve(__dirname, '../src/neutralino/neutralino-shim.js');
    const content = fs.readFileSync(shimPath, 'utf-8');
    
    assert.ok(content.includes('console.log ='), 'Shim debería interceptar console.log');
    assert.ok(content.includes('logBuffer = []'), 'Shim debería tener un buffer para logs tempranos');
    assert.ok(content.includes('flushBuffer'), 'Shim debería tener una función para vaciar el buffer');
    assert.ok(content.includes('/api/write-log'), 'Shim debería usar la API de logs en modo DEV');
});

test('Verificación de API de logs en dev-server', async () => {
    const devServerPath = path.resolve(__dirname, '../src/api/dev-server.js');
    const content = fs.readFileSync(devServerPath, 'utf-8');
    
    assert.ok(content.includes('/api/write-log'), 'dev-server.js debería proveer el endpoint /api/write-log');
    assert.ok(content.includes('writeFile') || content.includes('appendFile'), 'El endpoint /api/write-log debería escribir físicamente');
});
