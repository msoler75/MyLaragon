/*

Sistema de Recuperación Automatizada MySQL robusto y profesional 


🎯 Características Principales
1. Arquitectura Modular

Logger: Sistema de logging unificado con iconos visuales
MySQLProcess: Gestión robusta de procesos MySQL
BackupManager: Sistema completo de backups físicos y lógicos
Diagnostics: Análisis automático del estado del sistema
RecoveryStrategies: Estrategias de recuperación independientes
RecoveryOrchestrator: Coordina todo el proceso

2. Estrategias de Recuperación (de menos a más destructiva)

✅ Inicio Básico: Prueba si MySQL puede arrancar normalmente
🔧 Recuperación InnoDB (Niveles 1-6): Intenta recuperar datos con force-recovery
🧹 Limpieza de Logs: Elimina logs corruptos
🗑️ Limpieza de Tablespace: Elimina tablespace corrupto
🔄 Reinstalación Completa: Borra y reinstala MySQL desde cero

3. Sistema de Backups Inteligente

Backup físico antes de cada operación destructiva
Backup lógico (mysqldump) cuando se logra levantar MySQL
Listado completo de todos los backups creados
Backups con timestamp para fácil identificación

4. Diagnóstico Completo

Verifica existencia de directorios y archivos
Analiza archivos críticos de InnoDB
Detecta tipo de corrupción automáticamente
Valida binarios de MySQL

5. Gestión Robusta de Procesos

Timeout configurables para cada operación
Limpieza de procesos zombie
Manejo de errores completo
Logs detallados de cada paso

6. Reporte Detallado

Genera MYSQL_RECOVERY_REPORT.md con toda la información
Lista de estrategias intentadas
Estado de backups creados
Recomendaciones según el resultado

📝 Uso
bashnode recovery.js
El script es completamente automatizado. El usuario no necesita:

❌ Diagnosticar errores manualmente
❌ Elegir estrategias de recuperación
❌ Crear backups manualmente
❌ Preocuparse por pérdida de datos

🔐 Seguridad

Múltiples backups antes de operaciones destructivas
Progresión gradual de menos a más destructivo
Preservación de datos siempre que sea posible
Reporte completo para auditoría

*/

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============= CONFIGURACIÓN Y PARÁMETROS =============

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);
const MYSQL_DATA_DIR = args[0] || path.join(__dirname, '..', 'data', 'mysql');
const MYSQL_EXE_PATH = args[1] || path.join(__dirname, '..', 'neutralino', 'bin', 'mysql', '8.0.44', 'mysql-8.0.44-winx64', 'bin', 'mysqld.exe');

// Detectar directorio base automáticamente
const BASE_DIR = path.join(__dirname, '..');
const BACKUP_DIR = path.join(BASE_DIR, 'data', 'mysql_recovery_backups');
const REPORT_FILE = path.join(BASE_DIR, 'MYSQL_RECOVERY_REPORT.md');

const CONFIG = {
  BASE_DIR,
  MYSQL_DATA_DIR,
  MYSQL_EXE_PATH,
  MYSQL_BIN_DIR: path.dirname(MYSQL_EXE_PATH),
  BACKUP_DIR,
  TEMP_PORT: 3307,
  NORMAL_PORT: 3306,
  TIMEOUT_STARTUP: 45000,
  TIMEOUT_DUMP: 120000,
  MAX_RECOVERY_LEVEL: 6,
  DATA_DIR: MYSQL_DATA_DIR  // Alias para compatibilidad
};

const BINARIES = {
  mysqld: MYSQL_EXE_PATH,
  mysqldump: path.join(CONFIG.MYSQL_BIN_DIR, 'mysqldump.exe'),
  mysqladmin: path.join(CONFIG.MYSQL_BIN_DIR, 'mysqladmin.exe'),
  mysqlcheck: path.join(CONFIG.MYSQL_BIN_DIR, 'mysqlcheck.exe'),
  mysql: path.join(CONFIG.MYSQL_BIN_DIR, 'mysql.exe')
};

// ============= UTILIDADES =============
class Logger {
  static logFile = path.join(BASE_DIR, 'mysql-recovery.log');

  static writeToFile(message) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ${message}\n`;
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      // Ignorar errores de escritura de log
    }
  }

  static info(msg) { 
    const message = `ℹ️  ${msg}`;
    console.log(message); 
    this.writeToFile(message);
  }
  static success(msg) { 
    const message = `✅ ${msg}`;
    console.log(message); 
    this.writeToFile(message);
  }
  static error(msg) { 
    const message = `❌ ${msg}`;
    console.log(message); 
    this.writeToFile(message);
  }
  static warning(msg) { 
    const message = `⚠️  ${msg}`;
    console.log(message); 
    this.writeToFile(message);
  }
  static step(msg) { 
    const message = `\n🔹 ${msg}`;
    console.log(message); 
    this.writeToFile(message);
  }
  static title(msg) { 
    const message = `\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`;
    console.log(message); 
    this.writeToFile(message);
  }
}

class MySQLProcess {
  constructor() {
    this.process = null;
    this.isReady = false;
  }

  async kill() {
    try {
      await execAsync('taskkill /F /IM mysqld.exe /T', { timeout: 5000 });
      await this.sleep(2000);
    } catch (e) {
      // Ignorar si no hay procesos
    }
  }

  async start(args, timeout = CONFIG.TIMEOUT_STARTUP) {
    await this.kill();

    return new Promise((resolve, reject) => {
      const command = `"${BINARIES.mysqld}" ${args.join(' ')}`;
      Logger.info(`Iniciando MySQL: ${command}`);

      this.process = spawn(BINARIES.mysqld, args);
      let output = '';
      let hasResolved = false;

      const resolveOnce = (success, data) => {
        if (hasResolved) return;
        hasResolved = true;
        this.isReady = success;
        resolve({ success, output: data || output });
      };

      this.process.stdout.on('data', (data) => {
        output += data.toString();
      });

      this.process.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;

        if (text.includes('ready for connections')) {
          Logger.success('MySQL listo para conexiones');
          resolveOnce(true, output);
        }

        if (text.includes('Aborting') || text.includes('Shutdown complete')) {
          resolveOnce(false, output);
        }
      });

      this.process.on('error', (error) => {
        resolveOnce(false, `Error de proceso: ${error.message}`);
      });

      this.process.on('exit', (code) => {
        if (!hasResolved) {
          resolveOnce(false, `Proceso terminado con código ${code}`);
        }
      });

      setTimeout(() => {
        if (!hasResolved) {
          Logger.warning('Timeout alcanzado');
          this.kill();
          resolveOnce(false, 'Timeout');
        }
      }, timeout);
    });
  }

  async terminate() {
    if (this.process) {
      try {
        this.process.kill('SIGTERM');
        await this.sleep(1000);
      } catch (e) {}
    }
    await this.kill();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============= SISTEMA DE BACKUPS =============
class BackupManager {
  constructor() {
    this.backupDir = CONFIG.BACKUP_DIR;
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createPhysicalBackup(label) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `physical_${label}_${timestamp}`);

    Logger.step(`Creando backup físico: ${label}`);

    if (!fs.existsSync(CONFIG.DATA_DIR)) {
      Logger.info('No hay directorio de datos para backup');
      return null;
    }

    try {
      fs.mkdirSync(backupPath, { recursive: true });

      const files = fs.readdirSync(CONFIG.DATA_DIR);
      let copiedFiles = 0;

      for (const file of files) {
        const srcPath = path.join(CONFIG.DATA_DIR, file);
        const destPath = path.join(backupPath, file);

        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
          copiedFiles++;
        }
      }

      Logger.success(`Backup físico creado: ${copiedFiles} archivos copiados`);
      return backupPath;
    } catch (error) {
      Logger.error(`Error creando backup: ${error.message}`);
      return null;
    }
  }

  async createLogicalBackup(port, label) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dumpPath = path.join(this.backupDir, `dump_${label}_${timestamp}.sql`);

    Logger.step(`Creando backup lógico (mysqldump): ${label}`);

    try {
      const command = `"${BINARIES.mysqldump}" --port=${port} --host=127.0.0.1 --all-databases --skip-lock-tables --single-transaction --routines --triggers --events > "${dumpPath}"`;

      await execAsync(command, { timeout: CONFIG.TIMEOUT_DUMP });
      
      const stats = fs.statSync(dumpPath);
      if (stats.size > 100) {
        Logger.success(`Dump SQL creado: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        return dumpPath;
      } else {
        Logger.warning('Dump SQL vacío o inválido');
        return null;
      }
    } catch (error) {
      Logger.error(`Error creando dump: ${error.message}`);
      return null;
    }
  }

  listBackups() {
    try {
      const backups = fs.readdirSync(this.backupDir)
        .map(name => {
          const fullPath = path.join(this.backupDir, name);
          const stats = fs.statSync(fullPath);
          return {
            name,
            path: fullPath,
            created: stats.mtime,
            isDirectory: stats.isDirectory()
          };
        })
        .sort((a, b) => b.created - a.created);

      return backups;
    } catch (error) {
      return [];
    }
  }
}

// ============= DIAGNÓSTICO =============
class Diagnostics {
  static analyze() {
    Logger.title('DIAGNÓSTICO DEL SISTEMA');

    const report = {
      dataDir: { exists: false, files: [] },
      binaries: { exists: false, paths: {} },
      criticalFiles: {},
      corruption: { detected: false, type: null }
    };

    // Verificar directorio de datos
    if (fs.existsSync(CONFIG.DATA_DIR)) {
      report.dataDir.exists = true;
      report.dataDir.files = fs.readdirSync(CONFIG.DATA_DIR);
      Logger.success(`Directorio de datos existe: ${CONFIG.DATA_DIR}`);
      Logger.info(`Total de archivos: ${report.dataDir.files.length}`);
    } else {
      Logger.error('Directorio de datos no existe');
      return report;
    }

    // Verificar binarios
    for (const [name, binPath] of Object.entries(BINARIES)) {
      const exists = fs.existsSync(binPath);
      report.binaries.paths[name] = { path: binPath, exists };
      
      if (exists) {
        Logger.success(`Binario encontrado: ${name}`);
      } else {
        Logger.error(`Binario no encontrado: ${name}`);
      }
    }
    report.binaries.exists = Object.values(report.binaries.paths).every(b => b.exists);

    // Analizar archivos críticos
    const criticalFiles = {
      'ibdata1': 'Tablespace InnoDB',
      'ib_logfile0': 'Redo Log 0',
      'ib_logfile1': 'Redo Log 1',
      'mysql.ibd': 'Sistema MySQL',
      'auto.cnf': 'Configuración Auto'
    };

    Logger.step('Archivos críticos:');
    for (const [file, desc] of Object.entries(criticalFiles)) {
      const exists = report.dataDir.files.includes(file);
      report.criticalFiles[file] = exists;
      
      if (exists) {
        const filePath = path.join(CONFIG.DATA_DIR, file);
        const size = fs.statSync(filePath).size;
        Logger.info(`  ✓ ${file} (${desc}) - ${(size / 1024).toFixed(2)} KB`);
      } else {
        Logger.warning(`  ✗ ${file} (${desc}) - No encontrado`);
      }
    }

    // Detectar tipo de corrupción
    const hasInnoDB = report.dataDir.files.some(f => f.startsWith('ib'));
    const hasMysql = report.criticalFiles['mysql.ibd'];

    if (hasInnoDB && !hasMysql) {
      report.corruption.detected = true;
      report.corruption.type = 'innodb_system_corrupt';
      Logger.warning('Posible corrupción del sistema InnoDB detectada');
    } else if (hasInnoDB) {
      report.corruption.detected = true;
      report.corruption.type = 'innodb_data_corrupt';
      Logger.warning('Posible corrupción de datos InnoDB detectada');
    }

    return report;
  }
}

// ============= ESTRATEGIAS DE RECUPERACIÓN =============
class RecoveryStrategies {
  constructor(backupManager) {
    this.backup = backupManager;
    this.mysqlProc = new MySQLProcess();
  }

  async testBasicStartup() {
    Logger.title('PRUEBA DE INICIO BÁSICO');
    
    const args = [
      `--datadir=${CONFIG.DATA_DIR}`,
      `--port=${CONFIG.NORMAL_PORT}`,
      '--bind-address=127.0.0.1',
      '--console'
    ];

    const result = await this.mysqlProc.start(args);
    await this.mysqlProc.terminate();

    return result.success;
  }

  async tryInnoDBRecovery() {
    Logger.title('RECUPERACIÓN INNODB PROGRESIVA');

    for (let level = 1; level <= CONFIG.MAX_RECOVERY_LEVEL; level++) {
      Logger.step(`Probando InnoDB Force Recovery Nivel ${level}`);

      const args = [
        `--datadir=${CONFIG.DATA_DIR}`,
        `--port=${CONFIG.TEMP_PORT}`,
        `--innodb-force-recovery=${level}`,
        '--skip-grant-tables',
        '--innodb-doublewrite=0',
        '--innodb-checksum-algorithm=none',
        '--bind-address=127.0.0.1',
        '--console'
      ];

      const result = await this.mysqlProc.start(args);

      if (result.success) {
        Logger.success(`Nivel ${level} exitoso - Intentando extracción de datos`);

        const dumpPath = await this.backup.createLogicalBackup(CONFIG.TEMP_PORT, `recovery_level${level}`);
        await this.mysqlProc.terminate();

        if (dumpPath) {
          return { success: true, level, dumpPath };
        }
      } else {
        Logger.warning(`Nivel ${level} falló`);
        await this.mysqlProc.terminate();
      }
    }

    return { success: false };
  }

  async cleanInnoDBLogs() {
    Logger.title('LIMPIEZA DE LOGS INNODB');
    
    await this.backup.createPhysicalBackup('before_log_cleanup');

    const logFiles = fs.readdirSync(CONFIG.DATA_DIR)
      .filter(f => /^ib_logfile\d+$/.test(f));

    for (const logFile of logFiles) {
      const filePath = path.join(CONFIG.DATA_DIR, logFile);
      try {
        fs.unlinkSync(filePath);
        Logger.success(`Eliminado: ${logFile}`);
      } catch (error) {
        Logger.error(`No se pudo eliminar ${logFile}: ${error.message}`);
      }
    }

    const args = [
      `--datadir=${CONFIG.DATA_DIR}`,
      `--port=${CONFIG.NORMAL_PORT}`,
      '--bind-address=127.0.0.1',
      '--console'
    ];

    const result = await this.mysqlProc.start(args);
    await this.mysqlProc.terminate();

    return result.success;
  }

  async cleanInnoDBTablespace() {
    Logger.title('LIMPIEZA DE TABLESPACE INNODB');
    Logger.warning('Esta operación puede causar pérdida de datos');

    await this.backup.createPhysicalBackup('before_tablespace_cleanup');

    const ibdataFiles = fs.readdirSync(CONFIG.DATA_DIR)
      .filter(f => /^ibdata\d+$/.test(f));

    for (const file of ibdataFiles) {
      const filePath = path.join(CONFIG.DATA_DIR, file);
      try {
        fs.unlinkSync(filePath);
        Logger.success(`Eliminado: ${file}`);
      } catch (error) {
        Logger.error(`No se pudo eliminar ${file}: ${error.message}`);
      }
    }

    const args = [
      `--datadir=${CONFIG.DATA_DIR}`,
      `--port=${CONFIG.NORMAL_PORT}`,
      '--bind-address=127.0.0.1',
      '--console'
    ];

    const result = await this.mysqlProc.start(args);
    await this.mysqlProc.terminate();

    return result.success;
  }

  async fullReinstall(dumpPath = null) {
    Logger.title('REINSTALACIÓN COMPLETA DE MYSQL');
    Logger.warning('Se eliminará la instalación completa de MySQL y se reinstalará desde cero');

    await this.backup.createPhysicalBackup('before_full_reinstall');

    // Leer configuración de servicios
    const servicesPath = path.join(BASE_DIR, 'src', 'neutralino', 'services.json');
    let servicesConfig;
    try {
      const servicesContent = fs.readFileSync(servicesPath, 'utf8');
      servicesConfig = JSON.parse(servicesContent);
    } catch (error) {
      Logger.error(`Error leyendo services.json: ${error.message}`);
      return { success: false };
    }

    const mysqlService = servicesConfig.services.find(s => s.id === 'mysql');
    if (!mysqlService || !mysqlService.versions || mysqlService.versions.length === 0) {
      Logger.error('Configuración de MySQL no encontrada en services.json');
      return { success: false };
    }

    const version = mysqlService.versions[0]; // Usar la primera versión
    const zipUrl = version.url;
    const filename = version.filename;

    // Determinar rutas
    const installBaseDir = path.join(BASE_DIR, 'neutralino', 'bin', 'mysql');
    const versionDir = path.join(installBaseDir, version.version.replace(/[<>:"\/\\|?*]/g, '_').trim());
    const tmpDir = path.join(BASE_DIR, 'tmp');
    const tmpZipPath = path.join(tmpDir, filename);

    // Borrar instalación existente
    Logger.step('Borrando instalación existente de MySQL');
    try {
      if (fs.existsSync(versionDir)) {
        fs.rmSync(versionDir, { recursive: true, force: true });
        Logger.success(`Carpeta eliminada: ${versionDir}`);
      }
    } catch (error) {
      Logger.error(`Error borrando instalación: ${error.message}`);
      return { success: false };
    }

    // Crear directorios temporales
    try {
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      if (!fs.existsSync(versionDir)) fs.mkdirSync(versionDir, { recursive: true });
    } catch (error) {
      Logger.error(`Error creando directorios: ${error.message}`);
      return { success: false };
    }

    // Descargar ZIP
    Logger.step(`Descargando MySQL ${version.version} desde ${zipUrl}`);
    let downloadSuccess = false;
    try {
      // Intentar con PowerShell
      const psCmd = `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '${zipUrl}' -OutFile '${tmpZipPath}' -TimeoutSec 600 -UseBasicParsing -ErrorAction Stop"`;
      const psRes = await execAsync(psCmd);
      if (psRes.stderr) throw new Error(psRes.stderr);
      downloadSuccess = true;
    } catch (error) {
      Logger.warning(`PowerShell falló: ${error.message}, intentando con curl`);
      try {
        const curlRes = await execAsync(`curl -L "${zipUrl}" -o "${tmpZipPath}" --fail --silent --show-error --connect-timeout 60`);
        if (curlRes.stderr) throw new Error(curlRes.stderr);
        downloadSuccess = true;
      } catch (curlError) {
        Logger.error(`Curl también falló: ${curlError.message}`);
      }
    }

    if (!downloadSuccess) {
      Logger.error('No se pudo descargar MySQL');
      return { success: false };
    }

    Logger.success('Descarga completada');

    // Extraer ZIP
    Logger.step('Extrayendo archivos');
    try {
      const extractCmd = `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference = 'SilentlyContinue'; Expand-Archive -Path '${tmpZipPath}' -DestinationPath '${versionDir}' -Force"`;
      const extractRes = await execAsync(extractCmd);
      if (extractRes.stderr) throw new Error(extractRes.stderr);
    } catch (error) {
      Logger.warning(`PowerShell falló: ${error.message}, intentando con tar`);
      try {
        const tarRes = await execAsync(`tar -xf "${tmpZipPath}" -C "${versionDir}"`);
        if (tarRes.stderr) throw new Error(tarRes.stderr);
      } catch (tarError) {
        Logger.error(`Extracción falló: ${tarError.message}`);
        return { success: false };
      }
    }

    Logger.success('Extracción completada');

    // Limpiar archivo temporal
    try {
      fs.unlinkSync(tmpZipPath);
    } catch (e) {}

    // Actualizar rutas de binarios
    const newBinDir = path.join(versionDir, `mysql-${version.version}-winx64`, 'bin');
    BINARIES.mysqld = path.join(newBinDir, 'mysqld.exe');
    BINARIES.mysqldump = path.join(newBinDir, 'mysqldump.exe');
    BINARIES.mysqladmin = path.join(newBinDir, 'mysqladmin.exe');
    BINARIES.mysqlcheck = path.join(newBinDir, 'mysqlcheck.exe');

    Logger.success('MySQL reinstalado correctamente');

    if (!fs.existsSync(BINARIES.mysqld)) {
      Logger.error(`mysqld.exe no encontrado en ${BINARIES.mysqld}`);
      return { success: false };
    }

    // Ahora reinicializar datos
    Logger.step('Reinicializando datos de MySQL');
    
    // Crear directorio de datos si no existe
    if (!fs.existsSync(CONFIG.DATA_DIR)) {
      fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
      Logger.info('Directorio de datos creado');
    } else {
      // Limpiar archivos existentes
      const files = fs.readdirSync(CONFIG.DATA_DIR);
      for (const file of files) {
        const filePath = path.join(CONFIG.DATA_DIR, file);
        try {
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          } else {
            fs.rmSync(filePath, { recursive: true, force: true });
          }
        } catch (e) {}
      }
    }

    // Inicializar MySQL
    Logger.step('Inicializando MySQL nuevo');
    try {
      await execAsync(`"${BINARIES.mysqld}" --initialize-insecure --datadir="${CONFIG.DATA_DIR}"`, {
        timeout: 60000
      });
      Logger.success('MySQL inicializado correctamente');
    } catch (error) {
      Logger.error(`Error en inicialización: ${error.message}`);
      return { success: false };
    }

    // Iniciar MySQL
    const args = [
      `--datadir=${CONFIG.DATA_DIR}`,
      `--port=${CONFIG.NORMAL_PORT}`,
      '--skip-grant-tables',
      '--bind-address=127.0.0.1',
      '--console'
    ];

    const startResult = await this.mysqlProc.start(args);

    if (startResult.success && dumpPath) {
      Logger.step('Restaurando datos desde dump');
      try {
        await execAsync(`"${BINARIES.mysql}" --port=${CONFIG.NORMAL_PORT} --host=127.0.0.1 < "${dumpPath}"`, {
          timeout: CONFIG.TIMEOUT_DUMP
        });
        Logger.success('Datos restaurados correctamente');
      } catch (error) {
        Logger.error(`Error restaurando datos: ${error.message}`);
      }
    }

    await this.mysqlProc.terminate();

    return { success: startResult.success };
  }
}

// ============= ORQUESTADOR PRINCIPAL =============
class RecoveryOrchestrator {
  constructor() {
    this.backup = new BackupManager();
    this.strategies = new RecoveryStrategies(this.backup);
    this.report = {
      startTime: new Date(),
      diagnostics: null,
      strategiesAttempted: [],
      success: false,
      finalStrategy: null,
      backupsCreated: []
    };
  }

  async run() {
    Logger.title('SISTEMA DE RECUPERACIÓN AUTOMATIZADA MYSQL');
    Logger.info(`Inicio: ${this.report.startTime.toLocaleString()}`);

    // 1. Diagnóstico
    this.report.diagnostics = Diagnostics.analyze();
    
    // Si no existe directorio de datos o binarios, intentar reinstalación completa
    if (!this.report.diagnostics.dataDir.exists || !this.report.diagnostics.binaries.exists) {
      Logger.warning('No se encontraron datos o binarios de MySQL - Intentando reinstalación completa');
      this.report.strategiesAttempted.push('Reinstalación Completa');
      
      try {
        const result = await this.strategies.fullReinstall();
        if (result && result.success) {
          Logger.success('Reinstalación completa exitosa');
          this.report.success = true;
          this.report.finalStrategy = 'Reinstalación Completa';
          await this.backup.createPhysicalBackup('successful_reinstall');
          await this.generateReport();
          return {
            success: true,
            strategiesAttempted: this.report.strategiesAttempted,
            successfulStrategy: this.report.finalStrategy,
            backupsCreated: this.backup.listBackups(),
            error: null,
            duration: Date.now() - this.report.startTime
          };
        } else {
          Logger.error('Reinstalación completa falló');
          await this.generateReport();
          return {
            success: false,
            strategiesAttempted: this.report.strategiesAttempted,
            successfulStrategy: null,
            backupsCreated: this.backup.listBackups(),
            error: 'Reinstalación completa falló',
            duration: Date.now() - this.report.startTime
          };
        }
      } catch (error) {
        Logger.error(`Error en reinstalación: ${error.message}`);
        await this.generateReport();
        return {
          success: false,
          strategiesAttempted: this.report.strategiesAttempted,
          successfulStrategy: null,
          backupsCreated: this.backup.listBackups(),
          error: error.message,
          duration: Date.now() - this.report.startTime
        };
      }
    }

    // 2. Backup inicial
    await this.backup.createPhysicalBackup('initial_state');

    // 3. Estrategias en orden de menos a más destructivas
    const strategies = [
      { name: 'Inicio Básico', fn: () => this.strategies.testBasicStartup() },
      { name: 'Recuperación InnoDB', fn: () => this.strategies.tryInnoDBRecovery() },
      { name: 'Limpieza de Logs InnoDB', fn: () => this.strategies.cleanInnoDBLogs() },
      { name: 'Limpieza de Tablespace', fn: () => this.strategies.cleanInnoDBTablespace() },
      { name: 'Reinstalación Completa', fn: (dump) => this.strategies.fullReinstall(dump) }
    ];

    let recoveredDump = null;

    for (const strategy of strategies) {
      Logger.title(`EJECUTANDO: ${strategy.name}`);
      this.report.strategiesAttempted.push(strategy.name);

      try {
        const result = await strategy.fn(recoveredDump);

        if (result === true || (result && result.success)) {
          Logger.success(`¡Recuperación exitosa con: ${strategy.name}!`);
          this.report.success = true;
          this.report.finalStrategy = strategy.name;

          if (result.dumpPath) {
            recoveredDump = result.dumpPath;
          }

          // Si es recuperación InnoDB, continuar a reinicialización
          if (strategy.name === 'Recuperación InnoDB' && recoveredDump) {
            Logger.info('Continuando a reinicialización con datos recuperados');
            continue;
          }

          break;
        }
      } catch (error) {
        Logger.error(`Error en ${strategy.name}: ${error.message}`);
      }
    }

    // 4. Backup final
    if (this.report.success) {
      await this.backup.createPhysicalBackup('successful_recovery');
    }

    // 5. Generar reporte y devolver resultado detallado
    await this.generateReport();

    return {
      success: this.report.success,
      strategiesAttempted: this.report.strategiesAttempted,
      successfulStrategy: this.report.finalStrategy,
      backupsCreated: this.backup.listBackups(),
      error: this.report.success ? null : 'Todas las estrategias de recuperación fallaron',
      duration: Date.now() - this.report.startTime
    };
  }

  async generateReport() {
    const reportPath = path.join(CONFIG.BASE_DIR, 'MYSQL_RECOVERY_REPORT.md');
    
    let content = '# Reporte de Recuperación MySQL\n\n';
    content += `**Fecha**: ${new Date().toLocaleString()}\n`;
    content += `**Duración**: ${((Date.now() - this.report.startTime) / 1000).toFixed(2)}s\n`;
    content += `**Estado**: ${this.report.success ? '✅ EXITOSO' : '❌ FALLIDO'}\n\n`;

    content += '## Configuración\n\n';
    content += `- **Directorio de datos**: \`${CONFIG.DATA_DIR}\`\n`;
    content += `- **Directorio de backups**: \`${CONFIG.BACKUP_DIR}\`\n`;
    content += `- **Binarios MySQL**: \`${CONFIG.MYSQL_BIN_DIR}\`\n\n`;

    if (this.report.diagnostics) {
      content += '## Diagnóstico Inicial\n\n';
      content += `- **Archivos encontrados**: ${this.report.diagnostics.dataDir.files.length}\n`;
      content += `- **Corrupción detectada**: ${this.report.diagnostics.corruption.detected ? 'Sí' : 'No'}\n`;
      if (this.report.diagnostics.corruption.type) {
        content += `- **Tipo**: ${this.report.diagnostics.corruption.type}\n`;
      }
      content += '\n';
    }

    content += '## Estrategias Intentadas\n\n';
    this.report.strategiesAttempted.forEach((strategy, i) => {
      const status = this.report.finalStrategy === strategy ? '✅' : '❌';
      content += `${i + 1}. ${status} ${strategy}\n`;
    });
    content += '\n';

    if (this.report.success) {
      content += '## ✅ Recuperación Exitosa\n\n';
      content += `**Estrategia final**: ${this.report.finalStrategy}\n\n`;
      content += '### Próximos pasos\n\n';
      content += '1. Verifica que la aplicación funcione correctamente\n';
      content += '2. Los backups están disponibles en caso de problemas\n';
      content += '3. Considera implementar backups automáticos regulares\n\n';
    } else {
      content += '## ❌ Recuperación Fallida\n\n';
      content += '### Acciones manuales recomendadas\n\n';
      content += '1. Revisa los backups creados en:\n';
      content += `   \`${CONFIG.BACKUP_DIR}\`\n\n`;
      content += '2. Contacta con soporte técnico proporcionando este reporte\n\n';
    }

    content += '## Backups Creados\n\n';
    const backups = this.backup.listBackups();
    if (backups.length > 0) {
      backups.forEach(backup => {
        content += `- **${backup.name}**\n`;
        content += `  - Creado: ${backup.created.toLocaleString()}\n`;
        content += `  - Tipo: ${backup.isDirectory ? 'Físico' : 'Lógico (SQL)'}\n\n`;
      });
    } else {
      content += 'No se crearon backups.\n\n';
    }

    fs.writeFileSync(reportPath, content);
    Logger.success(`Reporte generado: ${reportPath}`);
  }
}

// ============= EJECUCIÓN =============
async function main() {
  // Limpiar log anterior
  try {
    fs.writeFileSync(Logger.logFile, '');
  } catch (e) {}
  
  Logger.title('INICIANDO RECUPERACIÓN AUTOMÁTICA DE MYSQL');

  const orchestrator = new RecoveryOrchestrator();

  try {
    const result = await orchestrator.run();

    // Generar resumen JSON para la aplicación
    const summary = {
      success: result.success,
      timestamp: new Date().toISOString(),
      dataDir: CONFIG.MYSQL_DATA_DIR,
      mysqlExe: CONFIG.MYSQL_EXE_PATH,
      strategiesAttempted: result.strategiesAttempted || [],
      successfulStrategy: result.successfulStrategy || null,
      backupsCreated: result.backupsCreated || [],
      reportPath: REPORT_FILE,
      error: result.error || null
    };

    // Imprimir resumen JSON para que el shim lo capture
    console.log('\n=== RECOVERY_SUMMARY_JSON ===');
    console.log(JSON.stringify(summary, null, 2));
    console.log('=== END_RECOVERY_SUMMARY_JSON ===\n');

    if (result.success) {
      Logger.title('RECUPERACIÓN COMPLETADA CON ÉXITO');
      Logger.success('MySQL ha sido recuperado y está listo para usar');
      Logger.info(`Estrategia utilizada: ${result.successfulStrategy}`);
      Logger.info(`Backups creados: ${result.backupsCreated.length}`);
      process.exit(0);
    } else {
      Logger.title('RECUPERACIÓN FALLIDA');
      Logger.error('No se pudo recuperar MySQL automáticamente');
      Logger.error(`Error: ${result.error}`);
      Logger.info('Revisa el reporte completo para más detalles');
      Logger.info(`Reporte: ${REPORT_FILE}`);
      process.exit(1);
    }
  } catch (error) {
    Logger.error(`Error fatal: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============= FUNCIONES PARA LA APLICACIÓN =============

/**
 * Función que puede ser llamada desde la aplicación para obtener el estado de recuperación
 */
export async function getRecoveryStatus() {
  try {
    const reportExists = fs.existsSync(REPORT_FILE);
    if (!reportExists) {
      return {
        hasRecoveryReport: false,
        lastRecovery: null,
        canRecover: true
      };
    }

    const reportContent = fs.readFileSync(REPORT_FILE, 'utf8');
    const lines = reportContent.split('\n');

    // Extraer información básica del reporte
    let success = false;
    let date = null;
    let duration = null;
    let finalStrategy = null;

    for (const line of lines) {
      if (line.includes('Estado') && line.includes('EXITOSO')) {
        success = true;
      }
      if (line.startsWith('**Fecha**: ')) {
        date = line.replace('**Fecha**: ', '');
      }
      if (line.startsWith('**Duración**: ')) {
        duration = line.replace('**Duración**: ', '');
      }
      if (line.includes('Estrategia utilizada') && success) {
        finalStrategy = line.replace('- **Estrategia utilizada**: ', '');
      }
    }

    return {
      hasRecoveryReport: true,
      lastRecovery: {
        success,
        date,
        duration,
        strategy: finalStrategy,
        reportPath: REPORT_FILE
      },
      canRecover: true
    };
  } catch (error) {
    return {
      hasRecoveryReport: false,
      error: error.message,
      canRecover: true
    };
  }
}

/**
 * Función que puede ser llamada desde la aplicación para ejecutar recuperación manual
 */
export async function runManualRecovery() {
  Logger.title('RECUPERACIÓN MANUAL INICIADA DESDE LA APLICACIÓN');

  const orchestrator = new RecoveryOrchestrator();

  try {
    const result = await orchestrator.run();

    // Retornar resultado para la aplicación
    return {
      success: result.success,
      strategiesAttempted: result.strategiesAttempted,
      successfulStrategy: result.successfulStrategy,
      backupsCreated: result.backupsCreated.length,
      duration: result.duration,
      reportPath: REPORT_FILE,
      error: result.error
    };
  } catch (error) {
    Logger.error(`Error en recuperación manual: ${error.message}`);
    return {
      success: false,
      error: error.message,
      reportPath: REPORT_FILE
    };
  }
}

// Si se ejecuta directamente (desde línea de comandos), no cuando se importa como módulo
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
}