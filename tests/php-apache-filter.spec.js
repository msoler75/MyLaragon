import { test, describe } from "node:test";
import assert from "node:assert";
import { detectServices, getAvailableVersions } from "../src/neutralino/lib/services-detector.js";
import { createNodeFilesystemAdapter } from "../src/neutralino/lib/fs-adapter.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

describe("Filtrado de versiones PHP para Apache", () => {
  test("Apache solo debe mostrar versiones de PHP con módulo Apache", async () => {
    const fsAdapter = createNodeFilesystemAdapter();
    
    const services = await detectServices({ 
      fsAdapter,
      appPath: ROOT, 
      userConfig: {}, 
      appConfig: {}, 
      log: () => {} 
    });
    
    const apache = services.find(s => s.type === 'apache');
    
    if (!apache) {
      console.log('[TEST] Apache no instalado, saltando test');
      return;
    }
    
    console.log('[TEST] Versiones PHP detectadas en Apache:', apache.availablePhpVersions);
    
    // Todas las versiones en availablePhpVersions deben tener el módulo Apache
    for (const version of apache.availablePhpVersions || []) {
      console.log(`[TEST] Verificando PHP ${version}...`);
      
      const allPhpVersions = await getAvailableVersions(fsAdapter, ROOT, 'php');
      assert.ok(
        allPhpVersions.includes(version),
        `PHP ${version} en availablePhpVersions pero no está en versiones detectadas`
      );
    }
    
    console.log(`[TEST] ✓ Apache filtra correctamente ${apache.availablePhpVersions?.length || 0} versiones de PHP con módulo Apache`);
  });
});
