import { test, describe, beforeEach, afterEach } from 'vitest';
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import { getAvailableVersions, getServiceBinPath } from "../src/neutralino/lib/services-detector.js";
import { createNodeFilesystemAdapter } from "../src/neutralino/lib/fs-adapter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

describe("Detección de PHP - Test Controlado", () => {
  let tmpDir;
  let fsAdapter;
  let testVersions;

  beforeEach(async () => {
    // Crear directorio temporal para el test
    tmpDir = path.join(require('os').tmpdir(), `webservdev-test-${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    // Crear estructura neutralino/bin/php
    const phpDir = path.join(tmpDir, "neutralino", "bin", "php");
    fs.mkdirSync(phpDir, { recursive: true });

    fsAdapter = createNodeFilesystemAdapter();

    // Preparar al menos 2 versiones de PHP
    testVersions = ["8.1.34 (TS)", "8.2.30 (TS)"];

    for (const version of testVersions) {
      const versionDir = path.join(phpDir, version);
      fs.mkdirSync(versionDir, { recursive: true });

      // Crear archivo php.exe falso (tamaño > 0 para que no se borre)
      const exePath = path.join(versionDir, "php.exe");
      fs.writeFileSync(exePath, "fake php executable content for testing", "utf8");
    }

    console.log(`[TEST SETUP] Creado entorno de test en: ${tmpDir}`);
    console.log(`[TEST SETUP] Versiones preparadas: ${testVersions.join(", ")}`);
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      // Limpiar archivos php.exe de tamaño cero (creados para test)
      function cleanEmptyExes(dir) {
        if (!fs.existsSync(dir)) return;

        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            cleanEmptyExes(fullPath);
          } else if (entry.name === "php.exe") {
            const stats = fs.statSync(fullPath);
            if (stats.size === 0) {
              console.log(`[TEST CLEANUP] Borrando php.exe vacío: ${fullPath}`);
              fs.unlinkSync(fullPath);
            }
          }
        }
      }

      cleanEmptyExes(tmpDir);

      // Borrar directorio temporal completo
      fs.rmSync(tmpDir, { recursive: true, force: true });
      console.log(`[TEST CLEANUP] Directorio temporal borrado: ${tmpDir}`);
    }
  });

  test("debe detectar versiones de PHP instaladas cuando existen ejecutables", async () => {
    // Usar services-detector.js para detectar versiones
    const versions = await getAvailableVersions(fsAdapter, tmpDir, "php");

    console.log("[TEST] Versiones detectadas:", versions);

    // Verificar que se detectaron las versiones preparadas
    assert.ok(versions.length >= testVersions.length, `Se esperaban al menos ${testVersions.length} versiones, se encontraron ${versions.length}`);

    for (const expectedVersion of testVersions) {
      assert.ok(versions.includes(expectedVersion), `Versión ${expectedVersion} no fue detectada`);
    }
  });

  test("debe encontrar el binPath correcto para cada versión de PHP", async () => {
    for (const version of testVersions) {
      const binPath = await getServiceBinPath(fsAdapter, tmpDir, "php", version);

      assert.ok(binPath !== null, `No se encontró binPath para versión ${version}`);

      const expectedPath = path.join(tmpDir, "neutralino", "bin", "php", version);
      // Normalizar las rutas para comparar (Windows usa \ pero Node.js puede devolver /)
      const normalizedBinPath = path.normalize(binPath).replace(/\\/g, '/');
      const normalizedExpected = path.normalize(expectedPath).replace(/\\/g, '/');
      
      assert.strictEqual(normalizedBinPath, normalizedExpected, `binPath incorrecto para ${version}`);

      // Verificar que el ejecutable existe
      const exePath = path.join(binPath, "php.exe");
      assert.ok(fs.existsSync(exePath), `Ejecutable no existe: ${exePath}`);

      // Verificar que no es de tamaño cero
      const stats = fs.statSync(exePath);
      assert.ok(stats.size > 0, `php.exe tiene tamaño cero: ${exePath}`);
    }
  });

  test("debe manejar versiones que no existen", async () => {
    // Usar un directorio diferente que no tenga versiones preparadas
    const emptyDir = path.join(require('os').tmpdir(), `webservdev-test-empty-${Date.now()}`);
    fs.mkdirSync(emptyDir, { recursive: true });
    
    try {
      const nonExistentVersion = "9.9.99 (TS)";
      const binPath = await getServiceBinPath(fsAdapter, emptyDir, "php", nonExistentVersion);
      
      // En un directorio vacío, no debería encontrar nada
      assert.strictEqual(binPath, null, `No debería encontrar binPath para versión inexistente ${nonExistentVersion} en directorio vacío`);
    } finally {
      // Limpiar directorio vacío
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });
});
