import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = path.join(__dirname, '..');
const MYSQL_BIN = path.join(BASE_DIR, 'neutralino', 'bin', 'mysql', '8.0.44', 'mysql-8.0.44-winx64', 'bin', 'mysqld.exe');
const DATA_DIR = path.join(BASE_DIR, 'data', 'mysql');

console.log('=== MySQL Startup Testing Script with Progressive Repairs ===\n');

// Función para ejecutar comandos de forma síncrona
function execSync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// Función para probar una configuración
async function testConfig(config) {
  return new Promise((resolve) => {
    console.log(`  Probando: ${config.name}`);
    const command = `cmd /c "${MYSQL_BIN}" ${config.args.join(' ')} 2>&1`;

    const child = exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error && error.code === 'ETIMEDOUT') {
        resolve({ success: false, error: 'Timeout', output: '' });
      } else if (error) {
        resolve({ success: false, error: `Exit code: ${error.code}`, output: stderr || stdout });
      } else {
        const isReady = stderr.includes('ready for connections');
        resolve({ success: isReady, error: null, output: stderr || stdout });
      }
    });
  });
}

// Función para hacer backup de archivos
async function backupFile(filePath) {
  const backupPath = filePath + '.backup';
  if (fs.existsSync(filePath)) {
    console.log(`    Creando backup: ${path.basename(filePath)} -> ${path.basename(backupPath)}`);
    fs.copyFileSync(filePath, backupPath);
  }
}

// Reparaciones progresivas
const repairs = [
  {
    name: 'Sin reparación (estado original)',
    description: 'Probar configuraciones sin modificar archivos',
    action: async () => {
      console.log('  No se realiza ninguna reparación');
    }
  },
  {
    name: 'Eliminar archivos de log corruptos',
    description: 'Borrar ib_logfile0 e ib_logfile1 (logs redo corruptos)',
    action: async () => {
      console.log('  Eliminando archivos de log corruptos...');
      const logfile0 = path.join(DATA_DIR, 'ib_logfile0');
      const logfile1 = path.join(DATA_DIR, 'ib_logfile1');

      await backupFile(logfile0);
      await backupFile(logfile1);

      if (fs.existsSync(logfile0)) fs.unlinkSync(logfile0);
      if (fs.existsSync(logfile1)) fs.unlinkSync(logfile1);

      console.log('  Archivos de log eliminados');
    }
  },
  {
    name: 'Eliminar tablespace InnoDB',
    description: 'Borrar ibdata1 (pierde TODOS los datos InnoDB)',
    action: async () => {
      console.log('  ⚠️  Eliminando tablespace InnoDB (se perderán todos los datos)...');
      const ibdata1 = path.join(DATA_DIR, 'ibdata1');

      await backupFile(ibdata1);

      if (fs.existsSync(ibdata1)) fs.unlinkSync(ibdata1);

      console.log('  Tablespace eliminado');
    }
  },
  {
    name: 'Eliminar archivos InnoDB restantes',
    description: 'Borrar archivos ib_* restantes',
    action: async () => {
      console.log('  Eliminando archivos InnoDB restantes...');
      const files = fs.readdirSync(DATA_DIR);
      const ibFiles = files.filter(f => f.startsWith('ib_'));

      for (const file of ibFiles) {
        const filePath = path.join(DATA_DIR, file);
        await backupFile(filePath);
        fs.unlinkSync(filePath);
        console.log(`    Eliminado: ${file}`);
      }
    }
  },
  {
    name: 'Limpiar directorio de datos',
    description: 'Eliminar TODO el contenido del datadir (reinicialización completa)',
    action: async () => {
      console.log('  ⚠️  ⚠️  ⚠️  Eliminando TODO el datadir (reinicialización completa)...');

      // Backup del directorio completo
      const backupDir = DATA_DIR + '_backup_' + Date.now();
      console.log(`  Creando backup completo en: ${backupDir}`);
      fs.mkdirSync(backupDir);

      const files = fs.readdirSync(DATA_DIR);
      for (const file of files) {
        const src = path.join(DATA_DIR, file);
        const dest = path.join(backupDir, file);
        if (fs.statSync(src).isFile()) {
          fs.copyFileSync(src, dest);
        }
      }

      // Limpiar datadir
      for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }

      console.log('  Datadir limpiado completamente');
    }
  }
];

// Configuraciones a probar
const configs = [
  {
    name: 'Named Pipes',
    args: ['--datadir=' + DATA_DIR, '--enable-named-pipe', '--socket=mysql.sock']
  },
  {
    name: 'TCP/IP Localhost',
    args: ['--datadir=' + DATA_DIR, '--port=3306', '--bind-address=127.0.0.1']
  },
  {
    name: 'Shared Memory',
    args: ['--datadir=' + DATA_DIR, '--shared-memory', '--shared-memory-base-name=mysql']
  }
];

let results = [];

async function runProgressiveTests() {
  for (let i = 0; i < repairs.length; i++) {
    const repair = repairs[i];
    console.log(`\n=== NIVEL ${i + 1}: ${repair.name} ===`);
    console.log(repair.description);

    try {
      await repair.action();
    } catch (error) {
      console.log(`  Error en reparación: ${error.message}`);
      continue;
    }

    console.log('\n  Probando configuraciones de inicio...');

    let levelSuccess = false;
    for (const config of configs) {
      const result = await testConfig(config);
      results.push({
        repair: repair.name,
        config: config.name,
        success: result.success,
        error: result.error,
        output: result.output
      });

      if (result.success) {
        console.log(`  ✅ ¡ÉXITO! Configuración "${config.name}" funcionó con reparación "${repair.name}"`);
        levelSuccess = true;
        break; // Si una config funciona, no probar las demás en este nivel
      } else {
        console.log(`  ❌ Falló: ${result.error}`);
      }
    }

    if (levelSuccess) {
      console.log(`\n🎉 ¡REPARACIÓN EXITOSA! Nivel ${i + 1} funcionó.`);
      break; // No continuar con reparaciones más drásticas
    } else {
      console.log(`\n❌ Nivel ${i + 1} falló. Continuando con siguiente nivel de reparación...`);
    }
  }

  generateReport();
}

function generateReport() {
  console.log('\n=== REPORTE FINAL ===');

  let report = '# MySQL Progressive Repair Testing Report\n\n';
  report += `Fecha: ${new Date().toISOString()}\n\n`;
  report += '## Resumen\n\n';

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  report += `- Niveles de reparación probados: ${repairs.length}\n`;
  report += `- Configuraciones probadas por nivel: ${configs.length}\n`;
  report += `- Total de pruebas: ${results.length}\n`;
  report += `- Pruebas exitosas: ${successful.length}\n`;
  report += `- Pruebas fallidas: ${failed.length}\n\n`;

  if (successful.length > 0) {
    const firstSuccess = successful[0];
    report += `## ✅ SOLUCIÓN ENCONTRADA\n\n`;
    report += `**Reparación**: ${firstSuccess.repair}\n`;
    report += `**Configuración**: ${firstSuccess.config}\n\n`;
    report += 'Esta combinación permitió que MySQL iniciara correctamente.\n\n';
  } else {
    report += `## ❌ NINGUNA SOLUCIÓN FUNCIONÓ\n\n`;
    report += 'Todas las reparaciones progresivas fallaron. Puede ser necesario:\n\n';
    report += '- Reinstalar MySQL completamente\n';
    report += '- Verificar permisos del directorio de datos\n';
    report += '- Verificar que no hay otros procesos MySQL ejecutándose\n\n';
  }

  report += '## Detalle de Pruebas\n\n';

  let currentRepair = '';
  results.forEach(r => {
    if (r.repair !== currentRepair) {
      report += `### ${r.repair}\n\n`;
      currentRepair = r.repair;
    }

    report += `#### ${r.config}\n`;
    report += `- Estado: ${r.success ? '✅ Éxito' : '❌ Falló'}\n`;
    if (!r.success) {
      report += `- Error: ${r.error}\n`;
    }
    if (r.output) {
      report += `- Output: ${r.output.substring(0, 200)}\n`;
    }
    report += '\n';
  });

  report += '## Recomendaciones\n\n';
  if (successful.length > 0) {
    report += '1. **Usa la reparación exitosa** encontrada arriba\n';
    report += '2. **Verifica que MySQL funciona** con tus aplicaciones\n';
    report += '3. **Restaura datos** desde los backups creados si es necesario\n';
  } else {
    report += '1. **Reinstala MySQL** con un directorio de datos limpio\n';
    report += '2. **Verifica permisos** del directorio de datos\n';
    report += '3. **Busca logs detallados** en el directorio de datos\n';
  }

  // Escribir a archivo
  fs.writeFileSync(path.join(BASE_DIR, 'ERROR_SERVICES.md'), report);
  console.log('Reporte generado en ERROR_SERVICES.md');
}

runProgressiveTests().catch(console.error);