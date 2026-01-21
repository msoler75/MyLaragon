
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.resolve(__dirname, '../app-debug.log');

test('Integridad de interceptación en Electron main.js', async () => {
    const mainJsPath = path.resolve(__dirname, '../electron/main.js');
    const content = fs.readFileSync(mainJsPath, 'utf-8');
    
    assert.ok(content.includes('console.log ='), 'Electron debería interceptar console.log');
    assert.ok(content.includes('fs.appendFileSync(logPath'), 'Electron debería escribir en el archivo de log');
});

test('Integridad de interceptación en Neutralino Shim (con Buffer)', async () => {
    // La fuente de verdad ahora está en src/neutralino/
    const shimPath = path.resolve(__dirname, '../src/neutralino/neutralino-shim.js');
    const content = fs.readFileSync(shimPath, 'utf-8');
    
    assert.ok(content.includes('console.log ='), 'Shim debería interceptar console.log');
    assert.ok(content.includes('logBuffer = []'), 'Shim debería tener un buffer para logs tempranos');
    assert.ok(content.includes('flushBuffer'), 'Shim debería tener una función para vaciar el buffer');
    assert.ok(content.includes('/api/write-log'), 'Shim debería usar la API de logs en modo DEV');
});

test('Verificación de API de logs en vite.config.js', async () => {
    const viteConfigPath = path.resolve(__dirname, '../vite.config.js');
    const content = fs.readFileSync(viteConfigPath, 'utf-8');
    
    assert.ok(content.includes('/api/write-log'), 'vite.config.js debería proveer el endpoint /api/write-log');
    assert.ok(content.includes('fs.appendFileSync(logPath, message)'), 'El endpoint /api/write-log debería escribir físicamente');
});
