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

// Colores ANSI
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const GRAY = "\x1b[90m";
const RESET = "\x1b[0m";

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
    source: "src/neutralino/bootstrap.html",
    target: "neutralino/www/bootstrap.html",
    header: "<!--  NO EDITAR ESTE ARCHIVO DIRECTAMENTE - EDITAR src/neutralino/bootstrap.html -->\n"
  },
  // Copiar lib/ completa
  {
    source: "src/neutralino/lib/fs-adapter.js",
    target: "neutralino/www/lib/fs-adapter.js",
    header: "//  NO EDITAR ESTE ARCHIVO DIRECTAMENTE\n// Editable en: src/neutralino/lib/fs-adapter.js\n\n"
  },
  {
    source: "src/neutralino/lib/services-detector.js",
    target: "neutralino/www/lib/services-detector.js",
    header: "//  NO EDITAR ESTE ARCHIVO DIRECTAMENTE\n// Editable en: src/neutralino/lib/services-detector.js\n\n"
  },
  {
    source: "src/neutralino/services.json",
    target: "neutralino/www/services.json",
    header: "//  NO EDITAR ESTE ARCHIVO DIRECTAMENTE\n// Editable en: src/neutralino/services.json\n\n"
  }
];

function syncFile(source, target, header = "") {
  const sourcePath = path.resolve(rootDir, source);
  const targetPath = path.resolve(rootDir, target);
  
  if (!fs.existsSync(sourcePath)) {
    console.warn(`${YELLOW}⚠ Fuente maestra no encontrada: ${source}${RESET}`);
    return false;
  }

  try {
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    let content = fs.readFileSync(sourcePath, "utf8");
    fs.writeFileSync(targetPath, header + content);
    
    // Formato solicitado: √ nombre-archivo.js          →  ruta/destino.js
    const fileName = path.basename(source);
    console.log(`${GREEN}√${RESET} ${fileName.padEnd(25)} ${GRAY}→${RESET} ${target}`);
    return true;
  } catch (err) {
    console.error(`${YELLOW}✘ Error sincronizando ${source}:${RESET}`, err.message);
    return false;
  }
}

console.log(`${GRAY}\nSincronizando recursos...${RESET}`);

let successCount = 0;
syncConfig.forEach(file => {
  if (syncFile(file.source, file.target, file.header)) {
    successCount++;
  }
});

if (successCount === syncConfig.length) {
  console.log(`${GREEN}Sincronización completada correctamente.${RESET}\n`);
} else {
  console.log(`${YELLOW}Sincronización terminada con algunos errores.${RESET}\n`);
}
