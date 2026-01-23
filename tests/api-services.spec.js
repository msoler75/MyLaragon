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

describe('API de servicios - Detección a través de services.json', () => {
  let servicesData;
  const servicesJsonPath = path.join(__dirname, '..', 'src', 'neutralino', 'services.json');
  
  beforeAll(() => {
    // Verificar que services.json existe en el directorio src/neutralino
    if (!fs.existsSync(servicesJsonPath)) {
      throw new Error(`services.json no encontrado en: ${servicesJsonPath}`);
    }
    
    // Cargar y parsear el archivo
    const content = fs.readFileSync(servicesJsonPath, 'utf-8');
    servicesData = JSON.parse(content);
  });

  it('services.json debe existir en src/neutralino', () => {
    assert.ok(fs.existsSync(servicesJsonPath), 'services.json no existe en src/neutralino');
  });

  it('services.json debe tener formato válido con propiedad "services"', () => {
    assert.ok(servicesData, 'No se pudo parsear services.json');
    assert.ok(servicesData.services, 'services.json no tiene propiedad "services"');
    assert.ok(Array.isArray(servicesData.services), '"services" debe ser un array');
  });

  it('debe detectar al menos 3 servicios disponibles', () => {
    const services = servicesData.services;
    console.log(`\n[TEST] Servicios encontrados: ${services.length}`);
    services.forEach(s => {
      console.log(`  - ${s.name} (id: ${s.id}): ${s.versions?.length || 0} versiones`);
    });
    
    assert.ok(services.length >= 3, 
      `Se esperaban al menos 3 servicios, pero se encontraron ${services.length}`);
  });

  it('cada servicio debe tener estructura válida', () => {
    servicesData.services.forEach(service => {
      // Verificar propiedades requeridas
      assert.ok(service.id, `Servicio sin id: ${JSON.stringify(service)}`);
      assert.ok(service.name, `Servicio ${service.id} sin name`);
      assert.ok(service.versions, `Servicio ${service.id} sin versions`);
      assert.ok(Array.isArray(service.versions), `Servicio ${service.id}: versions debe ser array`);
      assert.ok(service.installPath, `Servicio ${service.id} sin installPath`);
      
      // Verificar que tenga al menos una versión
      assert.ok(service.versions.length > 0, 
        `Servicio ${service.id} no tiene versiones disponibles`);
    });
  });

  it('cada versión debe tener url y filename válidos', () => {
    servicesData.services.forEach(service => {
      service.versions.forEach((version, idx) => {
        assert.ok(version.version, 
          `Servicio ${service.id}, versión ${idx}: falta propiedad "version"`);
        assert.ok(version.url, 
          `Servicio ${service.id}, versión ${version.version}: falta propiedad "url"`);
        assert.ok(version.filename, 
          `Servicio ${service.id}, versión ${version.version}: falta propiedad "filename"`);
        
        // Verificar que la URL sea válida
        assert.ok(version.url.startsWith('http'), 
          `Servicio ${service.id}, versión ${version.version}: URL no comienza con http`);
        
        // Verificar que filename tenga extensión válida (.zip o .exe para instaladores)
        const validExtensions = ['.zip', '.exe', '.msi'];
        const hasValidExtension = validExtensions.some(ext => version.filename.endsWith(ext));
        assert.ok(hasValidExtension, 
          `Servicio ${service.id}, versión ${version.version}: filename debe terminar en ${validExtensions.join(' o ')}`);
      });
    });
  });

  it('services.json debe estar presente en neutralino/www/ después del build', () => {
    const wwwPath = path.join(__dirname, '..', 'neutralino', 'www', 'services.json');
    
    // Si existe el directorio www, verificar que el archivo esté ahí
    const wwwDir = path.join(__dirname, '..', 'neutralino', 'www');
    if (fs.existsSync(wwwDir)) {
      assert.ok(fs.existsSync(wwwPath), 
        'services.json debe estar en neutralino/www/ después del build');
      
      // Verificar que el contenido sea idéntico
      const wwwContent = fs.readFileSync(wwwPath, 'utf-8');
      const wwwData = JSON.parse(wwwContent);
      assert.deepEqual(wwwData.services.length, servicesData.services.length,
        'El services.json en www/ debe tener el mismo número de servicios');
    } else {
      console.log('[TEST] Directorio neutralino/www/ no existe (build no ejecutado)');
    }
  });

  it('services.json debe estar en el dist después de npm run dist', () => {
    const distPath = path.join(__dirname, '..', 'neutralino', 'dist', 'WebServDev', 'services.json');
    const distDir = path.join(__dirname, '..', 'neutralino', 'dist', 'WebServDev');
    
    if (fs.existsSync(distDir)) {
      assert.ok(fs.existsSync(distPath), 
        'services.json debe estar en neutralino/dist/WebServDev/ después de npm run dist');
      
      // Verificar contenido
      const distContent = fs.readFileSync(distPath, 'utf-8');
      const distData = JSON.parse(distContent);
      assert.deepEqual(distData.services.length, servicesData.services.length,
        'El services.json en dist debe tener el mismo número de servicios');
        
      console.log(`\n[TEST] ✓ services.json presente en dist con ${distData.services.length} servicios`);
    } else {
      console.log('[TEST] Directorio de distribución no existe (npm run dist no ejecutado)');
    }
  });

  it('debe incluir Apache como uno de los servicios', () => {
    const apache = servicesData.services.find(s => s.id === 'apache');
    assert.ok(apache, 'No se encontró Apache en la lista de servicios');
    assert.ok(apache.versions.length > 0, 'Apache debe tener al menos una versión');
    console.log(`\n[TEST] Apache encontrado con ${apache.versions.length} versiones disponibles`);
  });

  it('debe incluir PHP como uno de los servicios', () => {
    const php = servicesData.services.find(s => s.id === 'php');
    assert.ok(php, 'No se encontró PHP en la lista de servicios');
    assert.ok(php.versions.length > 0, 'PHP debe tener al menos una versión');
    console.log(`[TEST] PHP encontrado con ${php.versions.length} versiones disponibles`);
  });

  it('debe incluir MySQL como uno de los servicios', () => {
    const mysql = servicesData.services.find(s => s.id === 'mysql' || s.id === 'mariadb');
    assert.ok(mysql, 'No se encontró MySQL/MariaDB en la lista de servicios');
    assert.ok(mysql.versions.length > 0, 'MySQL/MariaDB debe tener al menos una versión');
    console.log(`[TEST] ${mysql.name} encontrado con ${mysql.versions.length} versiones disponibles`);
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

  it('getRemoteServices debe intentar cargar desde /www/services.json', () => {
    assert.ok(shimContent.includes('/www/services.json'), 
      'getRemoteServices no incluye la ruta /www/services.json');
  });

  it('getRemoteServices debe tener logging para debugging', () => {
    assert.ok(shimContent.includes('[SHIM] getRemoteServices'), 
      'getRemoteServices no tiene logging para debugging');
  });

  it('getRemoteServices debe intentar múltiples rutas como fallback', () => {
    const hasMultiplePaths = 
      shimContent.includes('/www/services.json') &&
      shimContent.includes('/services.json') &&
      shimContent.includes('./services.json');
    
    assert.ok(hasMultiplePaths, 
      'getRemoteServices debe intentar múltiples rutas como fallback');
  });
});
