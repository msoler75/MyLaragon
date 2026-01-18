import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../neutralino/neutralino.config.json');
const backupPath = path.join(__dirname, '../neutralino/neutralino.config.backup.json');

const args = process.argv.slice(2);
const mode = args[0]; // 'build' o 'restore'

if (!fs.existsSync(configPath)) {
  console.error('Config file not found at:', configPath);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

if (mode === 'build') {
  // Guardar backup
  fs.writeFileSync(backupPath, JSON.stringify(config, null, 2));
  
  // Modificar para producción - MODO BUNDLED (Recomendado para evitar 404s)
  config.port = 0; 
  config.enableServer = true; 
  config.documentRoot = "/www/"; 
  config.url = "/index.html"; 
  
  config.modes = config.modes || {};
  config.modes.window = config.modes.window || {};
  config.modes.window.enableInspector = true; 
  config.logging = config.logging || {};
  config.logging.enabled = true;
  config.logging.writeToLogFile = true;

  // Garantizar que resourcesPath sea ./www/ para que neu cree el bundle correctamente
  config.cli = config.cli || {};
  config.cli.resourcesPath = "./www/";
  config.cli.clientLibrary = "./www/neutralino.js";

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✓ Config de build escrita (MODO BUNDLED: url="${config.url}", docRoot="${config.documentRoot}")`);
  } catch (err) {
    console.warn('⚠️ No se pudo escribir la config de build:', err.message);
  }
} else if (mode === 'restore') {
  console.log('✓ Restaurando configuración original...');
  const distFolder = path.join(__dirname, '../neutralino/dist/WebServDev');
  const rootDir = path.join(__dirname, '..');
  
  // Copiar archivos esenciales al dist para que sea portable y funcional
  if (fs.existsSync(distFolder)) {
    console.log('✓ Copiando archivos esenciales al dist...');
    const filesToCopy = ['services.json', 'app.ini'];
    
    // Crear carpetas necesarias
    ['bin', 'usr', 'www'].forEach(dir => {
      const dirPath = path.join(distFolder, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  - Carpeta ${dir} creada.`);
      }
    });

    filesToCopy.forEach(file => {
      const src = path.join(rootDir, file);
      const dest = path.join(distFolder, file);
      if (fs.existsSync(src)) {
        try {
          fs.copyFileSync(src, dest);
          console.log(`  - ${file} copiado a la raíz.`);
          
          // Si es app.ini, copiar también a usr/
          if (file === 'app.ini') {
            fs.copyFileSync(src, path.join(distFolder, 'usr', 'app.ini'));
            console.log('  - app.ini copiado a usr/.');
          }
        } catch (e) {
          console.warn(`  - Error al copiar ${file}: ${e.message}`);
        }
      }
    });
  }

  if (fs.existsSync(backupPath)) {
    try {
      const backup = fs.readFileSync(backupPath, 'utf-8');
      fs.writeFileSync(configPath, backup);
      fs.unlinkSync(backupPath);
      console.log('✓ Config restaurada desde backup.');
    } catch (err) {
      console.warn('⚠️ Error al restaurar backup:', err.message);
    }
  }

  if (fs.existsSync(distFolder)) {
    console.log('✓ Verificando integridad del dist...');
    const neuFile = path.join(distFolder, 'resources.neu');
    if (!fs.existsSync(neuFile)) {
      console.warn('⚠️ resources.neu no encontrado.');
    } else {
      console.log('✓ resources.neu presente.');
    }
  }
}
