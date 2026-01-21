/**
 * Script de Sincronización de Recursos (Source -> Copy)
 * Mantiene la Fuente Única de Verdad en src/neutralino y genera las copias para www.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

// Configuración de sincronización
const syncConfig = [
  {
    source: "src/neutralino/neutralino.js",
    target: "neutralino/www/neutralino.js",
    header: "//  NO EDITAR ESTE ARCHIVO DIRECTAMENTE\n// Editable en: src/neutralino/neutralino.js\n\n"
  },
  {
    source: "src/neutralino/neutralino-shim.js",
    target: "neutralino/www/neutralino-shim.js",
    header: "//  NO EDITAR ESTE ARCHIVO DIRECTAMENTE\n// Editable en: src/neutralino/neutralino-shim.js\n\n"
  },
  {
    source: "src/neutralino/services.json",
    target: "neutralino/www/services.json",
  },
  {
    source: "src/neutralino/bootstrap.html",
    target: "neutralino/www/bootstrap.html",
    header: "<!--  NO EDITAR ESTE ARCHIVO DIRECTAMENTE - EDITAR src/neutralino/bootstrap.html -->\n"
  }
];

function syncFile(source, target, header = "") {
  const sourcePath = path.resolve(rootDir, source);
  const targetPath = path.resolve(rootDir, target);
  
  if (!fs.existsSync(sourcePath)) {
    console.warn(` Fuente maestra no encontrada: \${source}`);
    return false;
  }

  try {
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    let content = fs.readFileSync(sourcePath, "utf8");
    
    if (header && !target.endsWith(".json")) {
      content = header + content;
    }

    fs.writeFileSync(targetPath, content);
    console.log(` Sincronizado: \${source} -> \${target}`);
    return true;
  } catch (error) {
    console.error(` Error sincronizando \${source}: \${error.message}`);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "create";

  console.log("\n Sincronizador de Recursos (Source -> www)\n");
  console.log("".repeat(50));

  if (command === "remove" || command === "clean") {
    syncConfig.forEach(({ target }) => {
      const targetPath = path.resolve(rootDir, target);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        console.log(` Eliminado: \${target}`);
      }
    });
    return;
  }

  let successCount = 0;
  syncConfig.forEach(({ source, target, header }) => {
    if (syncFile(source, target, header)) successCount++;
  });

  console.log("".repeat(50));
  console.log(`\n Sincronización completada: \${successCount} archivos preparados.\n`);
}

main();
