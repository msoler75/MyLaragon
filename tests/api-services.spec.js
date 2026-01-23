/**
 * Test de integración para verificar que la API de servicios
 * funciona correctamente en el entorno de Neutralino
 */

import { describe, it, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('API de servicios - Detección a través de services-detector', () => {
  let servicesData;
  const shimPath = path.join(__dirname, '..', 'src', 'neutralino', 'neutralino-shim.js');
  
  beforeAll(() => {
    // Verificar que neutralino-shim.js existe
    if (!fs.existsSync(shimPath)) {
      throw new Error(`neutralino-shim.js no encontrado en: ${shimPath}`);
    }
    
    // Verificar que importa getAllServicesAvailable
    const content = fs.readFileSync(shimPath, 'utf-8');
    if (!content.includes('getAllServicesAvailable')) {
      throw new Error('neutralino-shim.js no importa getAllServicesAvailable');
    }
  });

  it('neutralino-shim.js debe importar getAllServicesAvailable', () => {
    const content = fs.readFileSync(shimPath, 'utf-8');
    assert.ok(content.includes('getAllServicesAvailable'), 'neutralino-shim.js debe importar getAllServicesAvailable');
  });

  it('no debe haber endpoints públicos que expongan services.json', () => {
    const shimContent = fs.readFileSync(shimPath, 'utf-8');
    assert.ok(!shimContent.includes('/api/services.json'), 'No debe haber endpoints públicos para services.json');
  });
});

describe('Integración con neutralino-shim.js', () => {
  let shimContent;
  const shimPath = path.join(__dirname, '..', 'src', 'neutralino', 'neutralino-shim.js');
  
  beforeAll(() => {
    if (fs.existsSync(shimPath)) {
      shimContent = fs.readFileSync(shimPath, 'utf-8');
    }
  });

  it('neutralino-shim.js debe tener la función getRemoteServices', () => {
    assert.ok(shimContent, 'No se pudo leer neutralino-shim.js');
    assert.ok(shimContent.includes('getRemoteServices'), 
      'neutralino-shim.js no contiene la función getRemoteServices');
  });

  it('getRemoteServices debe tener logging para debugging', () => {
    assert.ok(shimContent.includes('[SHIM] getRemoteServices'), 
      'getRemoteServices no tiene logging para debugging');
  });
});
