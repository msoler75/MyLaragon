import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

describe("Detecci�n de Binarios PHP", () => {
  const phpPath = path.join(ROOT, "neutralino", "bin", "php");

  test("La carpeta neutralino/bin/php debe existir", () => {
    const exists = fs.existsSync(phpPath);
    console.log(`[TEST] Buscando PHP en: ${phpPath} -> ${exists ? "ENCONTRADO" : "NO EXISTE"}`);
    assert.strictEqual(exists, true, `La ruta ${phpPath} no existe`);
  });

  test("Debe listar las versiones de PHP instaladas", () => {
    if (!fs.existsSync(phpPath)) return;
    
    const entries = fs.readdirSync(phpPath, { withFileTypes: true });
    const versions = entries
      .filter(e => e.isDirectory())
      .map(e => e.name);
    
    console.log("[TEST] Versiones encontradas:", versions);
    assert.ok(versions.length > 0, "No se encontraron carpetas de versiones de PHP");
    
    versions.forEach(v => {
      const exePath = path.join(phpPath, v, "php.exe");
      const exists = fs.existsSync(exePath);
      console.log(`[TEST] Checking ${v}: ${exists ? "OK" : "MISSING"}`);
      assert.strictEqual(exists, true, `Falta php.exe en ${v}`);
    });
  });

  test("Verificar ruta en DIST si existe", () => {
    const distPath = path.join(ROOT, "neutralino", "dist", "WebServDev", "neutralino", "bin", "php");
    if (fs.existsSync(distPath)) {
        console.log(`[TEST] Carpeta PHP en DIST: ${distPath}`);
        const entries = fs.readdirSync(distPath, { withFileTypes: true });
        const versions = entries.filter(e => e.isDirectory()).map(e => e.name);
        console.log(`[TEST] Versiones DIST encontradas: ${versions.join(", ")}`);
        
        versions.forEach(v => {
            const exePath = path.join(distPath, v, "php.exe");
            const exists = fs.existsSync(exePath);
            assert.strictEqual(exists, true, `Falta php.exe en DIST/${v}`);
        });
    } else {
        console.log("[TEST] Carpeta DIST no disponible");
    }
  });
});
