/**
 * Tests de API HTTP - Categoría 2
 * 
 * Estos tests validan que los endpoints del servidor local (shim en modo DEV)
 * funcionan correctamente mediante llamadas HTTP reales.
 * 
 * REQUISITO: El servidor debe estar corriendo (npm run dev)
 * ALTERNATIVA: Usar before para levantar el servidor automáticamente
 */

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';

const API_BASE = 'http://localhost:5174';

describe('API del Servidor Local (HTTP)', () => {
  
  before(async () => {
    // Opcional: Levantar servidor automáticamente si no está corriendo
    // Por ahora asumimos que el usuario ejecuta npm run dev manualmente
    
    // Esperar a que el servidor esté listo
    let retries = 10;
    while (retries > 0) {
      try {
        await fetch(`${API_BASE}/health`);
        break;
      } catch {
        retries--;
        if (retries === 0) {
          throw new Error('Servidor no disponible. Ejecuta "npm run dev" primero');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  });

  test('GET /api/get-services debe devolver lista de servicios', async () => {
    const response = await fetch(`${API_BASE}/api/get-services`);
    assert.ok(response.ok, 'Request falló');
    
    const services = await response.json();
    assert.ok(Array.isArray(services), 'Respuesta debe ser un array');
    assert.ok(services.length > 0, 'Debe haber al menos un servicio');
    
    // Verificar estructura de servicio
    const service = services[0];
    assert.ok(service.id, 'Servicio debe tener id');
    assert.ok(service.name, 'Servicio debe tener nombre');
    assert.ok(service.type, 'Servicio debe tener tipo');
  });

  test('POST /api/write-log debe escribir en app-debug.log', async () => {
    const testMessage = `[TEST-API] ${new Date().toISOString()} - Test de escritura de log`;
    
    const response = await fetch(`${API_BASE}/api/write-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: testMessage })
    });
    
    assert.ok(response.ok, 'Request de log falló');
    
    // Verificar que se escribió en el archivo
    const fs = await import('node:fs');
    const path = await import('node:path');
    const logPath = path.resolve(process.cwd(), 'app-debug.log');
    
    if (fs.existsSync(logPath)) {
      const logContent = fs.readFileSync(logPath, 'utf8');
      assert.ok(logContent.includes(testMessage), 'Log no se escribió correctamente');
    }
  });

  test('POST /api/exec-command debe ejecutar comandos', async () => {
    const response = await fetch(`${API_BASE}/api/exec-command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'echo test' })
    });
    
    assert.ok(response.ok, 'Ejecución de comando falló');
    
    const result = await response.json();
    assert.ok(result.stdout, 'Debe tener stdout');
    assert.ok(result.stdout.includes('test'), 'Output debe contener "test"');
  });
});
