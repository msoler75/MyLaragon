import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import { getAvailableVersions, getServiceBinPath } from "../electron/services-detector.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

describe("Detección de Binarios PHP", () => {
  const phpPath = path.join(ROOT, "neutralino", "bin", "php");

  test("La carpeta neutralino/bin/php debe existir", () => {
    const exists = fs.existsSync(phpPath);
    assert.strictEqual(exists, true, "La ruta " + phpPath + " no existe");
  });

  test("El motor de detección debe encontrar las versiones válidas de PHP", () => {
    // Usamos la lógica REAL de la aplicación para que el test no mienta
    const versions = getAvailableVersions(ROOT, "php");
    
    console.log("[TEST] Versiones detectadas por el motor:", versions);
    
    // Si la carpeta existe, al menos debería haber una versión válida detectada
    if (fs.existsSync(phpPath)) {
      assert.ok(versions.length > 0, "El motor de la app no detectó ninguna versión válida de PHP en " + phpPath);
    }

    // Verificar que cada versión detectada realmente tiene su ejecutable accesible
    versions.forEach(v => {
      const binPath = getServiceBinPath(ROOT, "php", v);
      assert.ok(binPath !== null, "El motor reportó la versión " + v + " como disponible pero no pudo encontrar su ejecutable");
      
      const exePath = path.join(binPath, "php.exe");
      assert.ok(fs.existsSync(exePath), "El ejecutable no existe físicamente en: " + exePath);
    });
  });

  test("Inconsistencias: No deben existir carpetas de versión sin ejecutable", () => {
    if (!fs.existsSync(phpPath)) return;

    // Este test FALLARÁ si hay carpetas vacías (como la 8.1.34 que mencionaste)
    // Forzando a que el entorno de desarrollo sea coherente y no tenga residuos
    const entries = fs.readdirSync(phpPath, { withFileTypes: true });
    const physicalFolders = entries.filter(e => e.isDirectory()).map(e => e.name);
    
    const detectedVersions = getAvailableVersions(ROOT, "php");
    
    physicalFolders.forEach(folder => {
        const isValid = detectedVersions.includes(folder);
        assert.ok(isValid, "ERROR DE INTEGRIDAD: La carpeta '" + folder + "' existe en /bin/php pero está vacía o corrupta. El motor de la app la ignora, por lo tanto el test falla para que limpies o arregles esa instalación.");
    });
  });

  test("Verificar ruta en DIST si existe", () => {
    const distPath = path.join(ROOT, "neutralino", "dist", "WebServDev", "neutralino", "bin", "php");
    if (fs.existsSync(distPath)) {
        // En DIST también usamos el motor real para validar
        const versions = getAvailableVersions(path.join(ROOT, "neutralino", "dist", "WebServDev"), "php");
        assert.ok(versions.length > 0, "No se detectaron versiones de PHP en la carpeta DIST");
    }
  });
});
