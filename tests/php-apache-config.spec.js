import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import { getAvailableVersions, getServiceBinPath } from "../src/neutralino/lib/services-detector.js";
import { createNodeFilesystemAdapter } from "../src/neutralino/lib/fs-adapter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

describe("Actualización de configuración de Apache al cambiar PHP", () => {
  const apachePath = path.join(ROOT, "neutralino", "bin", "apache");
  const phpPath = path.join(ROOT, "neutralino", "bin", "php");
  let httpdConfPath = null;
  let originalContent = null;
  let phpVersions = [];
  let fsAdapter;
  
  before(async () => {
    fsAdapter = createNodeFilesystemAdapter();
    // Verificar que Apache existe
    const apacheExists = fs.existsSync(apachePath);
    if (!apacheExists) {
      throw new Error("Apache no está instalado en neutralino/bin/apache");
    }
    
    // Obtener versiones de Apache y PHP disponibles
    const apacheVersions = await getAvailableVersions(fsAdapter, ROOT, "apache");
    if (apacheVersions.length === 0) {
      throw new Error("No se detectaron versiones de Apache");
    }
    
    const allPhpVersions = await getAvailableVersions(fsAdapter, ROOT, "php");
    
    // Filtrar solo versiones con módulo Apache (php*apache2_4.dll)
    const phpVersionsFlags = await Promise.all(allPhpVersions.map(async version => {
      const phpBin = await getServiceBinPath(fsAdapter, ROOT, "php", version);
      const files = fs.readdirSync(phpBin);
      return files.some(f => f.match(/^php\d+apache2_4\.dll$/i));
    }));
    phpVersions = allPhpVersions.filter((_, i) => phpVersionsFlags[i]);
    
    if (phpVersions.length < 2) {
      throw new Error(`Se necesitan al menos 2 versiones de PHP con módulo Apache (php*apache2_4.dll). Encontradas: ${phpVersions.length}`);
    }
    
    // Localizar httpd.conf
    const apacheVersion = apacheVersions[0];
    const apacheBin = await getServiceBinPath(fsAdapter, ROOT, "apache", apacheVersion);
    const apacheBase = apacheBin.replace(/[\\/]bin$/, "");
    httpdConfPath = path.join(apacheBase, "conf", "httpd.conf");
    
    if (!fs.existsSync(httpdConfPath)) {
      throw new Error(`httpd.conf no encontrado en: ${httpdConfPath}`);
    }
    
    // Guardar contenido original
    originalContent = fs.readFileSync(httpdConfPath, "utf-8");
    console.log(`[TEST] httpd.conf localizado en: ${httpdConfPath}`);
    console.log(`[TEST] Versiones de PHP disponibles: ${phpVersions.join(", ")}`);
  });
  
  after(() => {
    // Restaurar contenido original de httpd.conf
    if (httpdConfPath && originalContent) {
      fs.writeFileSync(httpdConfPath, originalContent, "utf-8");
      console.log("[TEST] httpd.conf restaurado al estado original");
    }
  });

  test("Debe actualizar httpd.conf con la configuración de PHP cuando se cambia la versión", async () => {
    // Seleccionar dos versiones diferentes de PHP
    const phpVersion1 = phpVersions[0];
    const phpVersion2 = phpVersions[1];
    
    console.log(`[TEST] Probando cambio de PHP ${phpVersion1} → ${phpVersion2}`);
    
    // Paso 1: Configurar con la primera versión de PHP
    await updateApachePhpConfig(phpVersion1);
    
    // Verificar que httpd.conf se actualizó correctamente para phpVersion1
    let httpdConf = fs.readFileSync(httpdConfPath, "utf-8");
    const phpBin1 = await getServiceBinPath(fsAdapter, ROOT, "php", phpVersion1);
    const phpDir1 = phpBin1.replace(/\\/g, "/");
    
    // Buscar módulo PHP
    const phpDirFiles1 = fs.readdirSync(phpBin1);
    const phpDll1 = phpDirFiles1.find(f => f.match(/^php\d+apache2_4\.dll$/i));
    
    if (!phpDll1) {
      throw new Error(`No se encontró módulo PHP (php*apache2_4.dll) en ${phpBin1}`);
    }
    
    const expectedModulePath1 = path.join(phpDir1, phpDll1).replace(/\\/g, "/");
    
    assert.ok(
      httpdConf.includes(`LoadModule php_module "${expectedModulePath1}"`),
      `httpd.conf no contiene la directiva LoadModule para PHP ${phpVersion1}`
    );
    
    assert.ok(
      httpdConf.includes(`PHPIniDir "${phpDir1}"`),
      `httpd.conf no contiene PHPIniDir para PHP ${phpVersion1}`
    );
    
    console.log(`[TEST] ✓ httpd.conf actualizado correctamente para PHP ${phpVersion1}`);
    
    // Paso 2: Cambiar a la segunda versión de PHP
    await updateApachePhpConfig(phpVersion2);
    
    // Verificar que httpd.conf se actualizó correctamente para phpVersion2
    httpdConf = fs.readFileSync(httpdConfPath, "utf-8");
    const phpBin2 = await getServiceBinPath(fsAdapter, ROOT, "php", phpVersion2);
    const phpDir2 = phpBin2.replace(/\\/g, "/");
    
    const phpDirFiles2 = fs.readdirSync(phpBin2);
    const phpDll2 = phpDirFiles2.find(f => f.match(/^php\d+apache2_4\.dll$/i));
    
    if (!phpDll2) {
      throw new Error(`No se encontró módulo PHP (php*apache2_4.dll) en ${phpBin2}`);
    }
    
    const expectedModulePath2 = path.join(phpDir2, phpDll2).replace(/\\/g, "/");
    
    assert.ok(
      httpdConf.includes(`LoadModule php_module "${expectedModulePath2}"`),
      `httpd.conf no se actualizó correctamente al cambiar a PHP ${phpVersion2}`
    );
    
    assert.ok(
      httpdConf.includes(`PHPIniDir "${phpDir2}"`),
      `httpd.conf no contiene PHPIniDir actualizado para PHP ${phpVersion2}`
    );
    
    // Verificar que NO contiene referencias a la versión anterior
    assert.ok(
      !httpdConf.includes(expectedModulePath1),
      `httpd.conf aún contiene referencias a PHP ${phpVersion1} después del cambio`
    );
    
    console.log(`[TEST] ✓ httpd.conf actualizado correctamente para PHP ${phpVersion2}`);
    console.log(`[TEST] ✓ No hay referencias residuales a PHP ${phpVersion1}`);
  });

  test("No debe crear directivas duplicadas al cambiar PHP múltiples veces", async () => {
    // Cambiar PHP varias veces seguidas
    const version1 = phpVersions[0];
    const version2 = phpVersions[1];
    
    await updateApachePhpConfig(version1);
    await updateApachePhpConfig(version2);
    await updateApachePhpConfig(version1);
    
    const httpdConf = fs.readFileSync(httpdConfPath, "utf-8");
    
    // Contar cuántas veces aparece LoadModule php_module
    const loadModuleMatches = httpdConf.match(/LoadModule\s+php_module\s+/g);
    const phpIniDirMatches = httpdConf.match(/PHPIniDir\s+/g);
    
    assert.strictEqual(
      loadModuleMatches ? loadModuleMatches.length : 0,
      1,
      "Debe haber exactamente una directiva LoadModule php_module en httpd.conf"
    );
    
    assert.strictEqual(
      phpIniDirMatches ? phpIniDirMatches.length : 0,
      1,
      "Debe haber exactamente una directiva PHPIniDir en httpd.conf"
    );
    
    console.log("[TEST] ✓ No se crearon directivas duplicadas");
  });
  
  test("Debe preservar otras directivas LoadModule al actualizar PHP", async () => {
    // Contar las directivas LoadModule antes de la actualización
    const beforeContent = fs.readFileSync(httpdConfPath, "utf-8");
    const beforeCount = (beforeContent.match(/LoadModule\s+\w+\s+/g) || []).length;
    
    // Actualizar PHP
    await updateApachePhpConfig(phpVersions[0]);
    
    // Contar las directivas LoadModule después
    const afterContent = fs.readFileSync(httpdConfPath, "utf-8");
    const afterCount = (afterContent.match(/LoadModule\s+\w+\s+/g) || []).length;
    
    // Debe haber la misma cantidad o una más (si es la primera vez que se añade PHP)
    assert.ok(
      afterCount === beforeCount || afterCount === beforeCount + 1,
      `Se perdieron directivas LoadModule. Antes: ${beforeCount}, Después: ${afterCount}`
    );
    
    console.log("[TEST] ✓ Otras directivas LoadModule preservadas");
  });
  
  /**
   * Función auxiliar que simula la lógica de updateServiceVersion para PHP
   */
  async function updateApachePhpConfig(phpVersion) {
    // Obtener ruta del binario de PHP
    const phpBin = await getServiceBinPath(fsAdapter, ROOT, "php", phpVersion);
    if (!phpBin) {
      throw new Error(`No se pudo encontrar PHP ${phpVersion}`);
    }
    
    const phpDir = phpBin.replace(/\\/g, "/");
    
    // Buscar módulo PHP para Apache
    const phpDirFiles = fs.readdirSync(phpBin);
    const phpDll = phpDirFiles.find(f => f.match(/^php\d+apache2_4\.dll$/i));
    
    if (!phpDll) {
      throw new Error(`No se encontró módulo PHP (php*apache2_4.dll) en ${phpBin}`);
    }
    
    const phpModulePath = path.join(phpDir, phpDll).replace(/\\/g, "/");
    
    // Leer httpd.conf
    let httpdConf = fs.readFileSync(httpdConfPath, "utf-8");
    
    // Actualizar o agregar LoadModule y PHPIniDir
    const loadModuleRegex = /LoadModule\s+php_module\s+"[^"]*"/gi;
    const phpIniDirRegex = /PHPIniDir\s+"[^"]*"/gi;
    
    const newLoadModule = `LoadModule php_module "${phpModulePath}"`;
    const newPHPIniDir = `PHPIniDir "${phpDir}"`;
    
    if (loadModuleRegex.test(httpdConf)) {
      // Reemplazar LoadModule existente
      httpdConf = httpdConf.replace(loadModuleRegex, newLoadModule);
    } else {
      // Agregar LoadModule antes del primer LoadModule o al inicio
      const firstLoadModule = httpdConf.search(/LoadModule\s+\w+\s+"[^"]*"/i);
      if (firstLoadModule !== -1) {
        httpdConf = httpdConf.substring(0, firstLoadModule) + 
                   `${newLoadModule}\n` + 
                   httpdConf.substring(firstLoadModule);
      } else {
        httpdConf += `\n${newLoadModule}\n`;
      }
    }
    
    if (phpIniDirRegex.test(httpdConf)) {
      // Reemplazar PHPIniDir existente
      httpdConf = httpdConf.replace(phpIniDirRegex, newPHPIniDir);
    } else {
      // Agregar PHPIniDir después de LoadModule php_module
      const phpModuleIndex = httpdConf.indexOf(newLoadModule);
      if (phpModuleIndex !== -1) {
        const insertIndex = httpdConf.indexOf('\n', phpModuleIndex) + 1;
        httpdConf = httpdConf.substring(0, insertIndex) + 
                   `${newPHPIniDir}\n` + 
                   httpdConf.substring(insertIndex);
      } else {
        httpdConf += `\n${newPHPIniDir}\n`;
      }
    }
    
    // Escribir httpd.conf actualizado
    fs.writeFileSync(httpdConfPath, httpdConf, "utf-8");
  }
});
