import { test, describe } from 'vitest';
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import { getAvailableVersions, getServiceBinPath } from "../src/neutralino/lib/services-detector.js";
import { createNodeFilesystemAdapter } from "../src/neutralino/lib/fs-adapter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

describe("Detección de Binarios PHP", () => {
  const phpPath = path.join(ROOT, "neutralino", "bin", "php");
  const fsAdapter = createNodeFilesystemAdapter();

  test("La carpeta neutralino/bin/php debe existir", () => {
    const exists = fs.existsSync(phpPath);
    assert.strictEqual(exists, true, "La ruta " + phpPath + " no existe");
  });

  test("El motor de detección debe encontrar las versiones válidas de PHP", async () => {
    // Usamos la lógica REAL de la aplicación
    const versions = await getAvailableVersions(fsAdapter, ROOT, "php");
    
    console.log("[TEST] Versiones detectadas:", versions);
    
    if (fs.existsSync(phpPath)) {
      assert.ok(versions.length > 0, "No se detectaron versiones de PHP");
    }

    // Verificar que cada versión tiene su ejecutable
    for (const v of versions) {
      const binPath = await getServiceBinPath(fsAdapter, ROOT, "php", v);
      assert.ok(binPath !== null, `Versión ${v} reportada pero ejecutable no encontrado`);
      
      const exePath = path.join(binPath, "php.exe");
      assert.ok(fs.existsSync(exePath), `Ejecutable no existe: ${exePath}`);
    }
  });

  test("Inconsistencias: No deben existir carpetas de versión sin ejecutable", async () => {
    if (!fs.existsSync(phpPath)) return;

    const entries = fs.readdirSync(phpPath, { withFileTypes: true });
    const physicalFolders = entries.filter(e => e.isDirectory()).map(e => e.name);
    const detectedVersions = await getAvailableVersions(fsAdapter, ROOT, "php");
    
    physicalFolders.forEach(folder => {
        const isValid = detectedVersions.includes(folder);
        assert.ok(isValid, `ERROR DE INTEGRIDAD: La carpeta '${folder}' existe en /bin/php pero está vacía o corrupta. El motor de la app la ignora, por lo tanto el test falla para que limpies o arregles esa instalación.`);
    });
  });

  test("Verificar ruta en DIST si existe", () => {
    const distPath = path.join(ROOT, "neutralino", "dist", "WebServDev", "neutralino", "bin", "php");
    if (fs.existsSync(distPath)) {
        const versions = getAvailableVersions(path.join(ROOT, "neutralino", "dist", "WebServDev"), "php");
        assert.ok(versions.length > 0, "No se detectaron versiones de PHP en DIST");
    }
  });
});
