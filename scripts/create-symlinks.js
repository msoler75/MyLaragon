/**
 * Script para crear enlaces simbólicos en lugar de duplicar archivos.
 * Esto mantiene archivos únicos en el proyecto pero accesibles desde múltiples ubicaciones.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuración de enlaces simbólicos
const symlinks = [
  {
    source: 'neutralino/neutralino.js',
    target: 'neutralino/www/neutralino.js',
    description: 'SDK de Neutralino'
  },
  {
    source: 'neutralino/neutralino-shim.js',
    target: 'neutralino/www/neutralino-shim.js',
    description: 'Shim de compatibilidad'
  },
  {
    source: 'neutralino/vite.svg',
    target: 'neutralino/www/vite.svg',
    description: 'Favicon'
  },
  {
    source: 'services.json',
    target: 'neutralino/www/services.json',
    description: 'Configuración de servicios'
  },
  {
    source: 'neutralino/bootstrap.html',
    target: 'neutralino/www/bootstrap.html',
    description: 'Bootstrap HTML'
  }
];

/**
 * Verifica si todos los archivos de destino ya existen
 */
function allTargetsExist() {
  return symlinks.every(({ target }) => {
    const targetPath = path.resolve(rootDir, target);
    return fs.existsSync(targetPath);
  });
}

/**
 * Verifica si un archivo/directorio es un enlace simbólico
 */
function isSymlink(filepath) {
  try {
    const stats = fs.lstatSync(filepath);
    return stats.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Crea un enlace simbólico
 */
function createSymlink(source, target, description) {
  const sourcePath = path.resolve(rootDir, source);
  const targetPath = path.resolve(rootDir, target);
  
  // Verificar que el archivo fuente existe
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️  Fuente no existe: ${source}`);
    return false;
  }
  
  // Crear directorio de destino si no existe
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`✓ Directorio creado: ${path.relative(rootDir, targetDir)}`);
  }
  
  // Si el destino ya existe
  if (fs.existsSync(targetPath)) {
    if (isSymlink(targetPath)) {
      // Ya es un enlace simbólico, verificar que apunta al lugar correcto
      const currentTarget = fs.readlinkSync(targetPath);
      const expectedTarget = path.relative(targetDir, sourcePath);
      
      if (currentTarget === expectedTarget || path.resolve(targetDir, currentTarget) === sourcePath) {
        console.log(`✓ ${description}: Enlace ya existe y es correcto`);
        return true;
      } else {
        console.log(`⚠️  ${description}: Enlace existe pero apunta a lugar incorrecto, recreando...`);
        fs.unlinkSync(targetPath);
      }
    } else {
      // Es un archivo regular, eliminarlo para crear el enlace
      console.log(`⚠️  ${description}: Archivo regular existe, reemplazando con enlace...`);
      fs.unlinkSync(targetPath);
    }
  }
  
  try {
    // En Windows, usar mklink del sistema
    // Calcular ruta relativa desde el directorio del target al source
    const relativeSource = path.relative(targetDir, sourcePath);
    
    if (process.platform === 'win32') {
      // En Windows, usar PowerShell para crear el enlace
      const cmd = `New-Item -ItemType SymbolicLink -Path "${targetPath}" -Target "${sourcePath}" -Force`;
      execSync(`powershell -Command "${cmd}"`, { stdio: 'pipe', encoding: 'utf8' });
    } else {
      // En Unix/Linux/Mac
      fs.symlinkSync(relativeSource, targetPath);
    }
    
    console.log(`✓ ${description}: Enlace creado → ${target}`);
    return true;
  } catch (error) {
    // Simplificar mensaje de error (sin stack trace completo)
    const errorMsg = error.message.includes('privilegios de administrador') 
      ? 'Requiere permisos de administrador'
      : 'Error al crear enlace';
    
    console.log(`⚠️  ${description}: ${errorMsg}`);
    
    // Fallback: copiar el archivo
    console.log(`  → Copiando archivo...`);
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`  ✓ Copiado correctamente`);
      return true;
    } catch (copyError) {
      console.error(`  ✗ Error copiando:`, copyError.message);
      return false;
    }
  }
}

/**
 * Elimina enlaces simbólicos (útil para limpieza)
 */
function removeSymlinks() {
  console.log('\n🧹 Limpiando enlaces simbólicos...\n');
  
  let removed = 0;
  symlinks.forEach(({ target, description }) => {
    const targetPath = path.resolve(rootDir, target);
    
    if (fs.existsSync(targetPath)) {
      if (isSymlink(targetPath)) {
        fs.unlinkSync(targetPath);
        console.log(`✓ ${description}: Enlace eliminado`);
        removed++;
      } else {
        console.log(`⚠️  ${description}: Existe pero no es un enlace simbólico`);
      }
    }
  });
  
  console.log(`\n✓ ${removed} enlace(s) eliminado(s)\n`);
}

/**
 * Función principal
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  
  // Si el comando es 'check', verificar si ya existen los archivos
  if (command === 'check') {
    if (allTargetsExist()) {
      // Todos los archivos ya existen, no hacer nada (modo silencioso)
      process.exit(0);
    }
    // Si faltan archivos, mostrar mensaje y salir con error
    console.log('\n⚠️  Archivos necesarios no encontrados en neutralino/www/');
    console.log('   Ejecuta: npm run setup:links\n');
    process.exit(1);
  }
  
  console.log('\n🔗 Gestor de Enlaces Simbólicos\n');
  console.log('═'.repeat(50));
  
  if (command === 'remove' || command === 'clean') {
    removeSymlinks();
    return;
  }
  
  console.log('\n📝 Creando enlaces simbólicos...\n');
  
  let created = 0;
  let failed = 0;
  
  symlinks.forEach(({ source, target, description }) => {
    if (createSymlink(source, target, description)) {
      created++;
    } else {
      failed++;
    }
  });
  
  console.log('\n' + '═'.repeat(50));
  
  if (failed === 0) {
    console.log(`\n✓ Completado: ${created} archivo(s) preparado(s)\n`);
  } else {
    console.log(`\n✓ Completado: ${created} enlace(s) creado(s), ${failed} fallido(s)\n`);
    console.warn('⚠️  Algunos enlaces no se pudieron crear.');
    console.warn('   Ejecuta este script como Administrador en Windows para crear enlaces simbólicos.\n');
  }
}

// Ejecutar
main();
