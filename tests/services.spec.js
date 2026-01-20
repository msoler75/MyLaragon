import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { detectServices, loadAppConfig, clearLogsFile, getServiceBinPath } from '../electron/services-detector.js';
import { installFromZip } from '../electron/service-installer.js';
import { execFileSync } from 'node:child_process';

const noop = () => {};

function writeIni(appPath, content) {
  fs.writeFileSync(path.join(appPath, 'app.ini'), content, 'utf-8');
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

describe('Service detection (filesystem-based)', () => {
  let tmpDir;
  let userConfig;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webservdev-test-'));
    userConfig = {
      appPath: tmpDir,
      projectsPath: path.join(tmpDir, 'www'),
      editor: 'notepad',
      autoStart: false,
      language: 'es',
      theme: 'system',
      isPortable: true
    };
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('marca Apache como no instalado cuando falta el ejecutable', () => {
    writeIni(tmpDir, `[apache]\nversion=2.4.0`);
    const appConfig = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig, log: noop });
    const apache = services.find(s => s.type === 'apache');
  assert.ok(apache);
  assert.equal(apache.isInstalled, false);
  });

  it('detecta Apache instalado cuando existe httpd.exe', () => {
    writeIni(tmpDir, `[apache]\nversion=2.4.0`);
    const apacheBin = path.join(tmpDir, 'bin', 'apache', '2.4.0');
    ensureDir(apacheBin);
    fs.writeFileSync(path.join(apacheBin, 'httpd.exe'), '');

    const appConfig = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig, log: noop });
    const apache = services.find(s => s.type === 'apache');
  assert.ok(apache);
  assert.equal(apache.isInstalled, true);
  assert.ok(apache.availableVersions.includes('2.4.0'));
  });

  it('detecta Apache en neutralino/bin con carpetas anidadas', () => {
    writeIni(tmpDir, `[apache]\nversion=2.4.0\n[php]\nversion=8.2.0`);
    const apacheDeepBin = path.join(tmpDir, 'neutralino', 'bin', 'apache', '2.4.0', 'deep', 'Apache24', 'bin');
    ensureDir(apacheDeepBin);
    fs.writeFileSync(path.join(apacheDeepBin, 'httpd.exe'), '');
    const phpDeepBin = path.join(tmpDir, 'neutralino', 'bin', 'php', '8.2.0', 'php-8.2.0', 'bin');
    ensureDir(phpDeepBin);
    fs.writeFileSync(path.join(phpDeepBin, 'php.exe'), '');

    const appConfig = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig, log: noop });
    const apache = services.find(s => s.type === 'apache');

    assert.ok(apache);
    assert.equal(apache.isInstalled, true);
    assert.equal(apache.dependenciesReady, true);
    assert.ok(apache.availableVersions.includes('2.4.0'));
  });

  it('pasa de instalado a no instalado tras eliminar la carpeta (simula desinstalación)', () => {
    writeIni(tmpDir, `[apache]\nversion=2.4.0`);
    const apacheBin = path.join(tmpDir, 'bin', 'apache', '2.4.0');
    ensureDir(apacheBin);
    fs.writeFileSync(path.join(apacheBin, 'httpd.exe'), '');

    let cfg = loadAppConfig(tmpDir, noop);
    let services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    let apache = services.find(s => s.type === 'apache');
    assert.ok(apache.isInstalled);

    // "Desinstalar": borrar la carpeta
    fs.rmSync(apacheBin, { recursive: true, force: true });

    cfg = loadAppConfig(tmpDir, noop);
    services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    apache = services.find(s => s.type === 'apache');
    assert.equal(apache.isInstalled, false);
  });

  it('clearLogsFile vacía el log', () => {
    const logPath = path.join(tmpDir, 'webservdev.log');
    fs.writeFileSync(logPath, 'linea1\nlinea2');
    const ok = clearLogsFile(logPath);
  assert.equal(ok, true);
  const content = fs.readFileSync(logPath, 'utf-8');
  assert.equal(content, '');
  });

  it('loadAppConfig lee secciones y valores', () => {
    writeIni(tmpDir, ` [apache]\nversion=2.4.54\nport=8080\n\n[mysql]\nversion=10.6\n`);
    const cfg = loadAppConfig(tmpDir, noop);
  assert.equal(cfg.apache.version, '2.4.54');
  assert.equal(cfg.apache.port, '8080');
  assert.equal(cfg.mysql.version, '10.6');
  });

  it('getServiceBinPath detecta ejecutable directo y en subcarpeta bin', () => {
    const base = path.join(tmpDir, 'bin', 'redis', '7.2');
    ensureDir(path.join(base, 'nested', 'bin'));
    fs.writeFileSync(path.join(base, 'redis-server.exe'), '');
    fs.writeFileSync(path.join(base, 'nested', 'bin', 'redis-server.exe'), '');
  assert.equal(getServiceBinPath(tmpDir, 'redis', '7.2'), base);
    // Si quitamos el directo, debe encontrar el anidado
    fs.rmSync(path.join(base, 'redis-server.exe'));
  assert.equal(getServiceBinPath(tmpDir, 'redis', '7.2'), path.join(base, 'nested', 'bin'));
  });

  it('usa alias mariadb cuando mysql no existe', () => {
    writeIni(tmpDir, `[mysql]\nversion=10.6`);
    const mariadbBin = path.join(tmpDir, 'bin', 'mariadb', '10.6');
    ensureDir(mariadbBin);
    fs.writeFileSync(path.join(mariadbBin, 'mysqld.exe'), '');
    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const mysql = services.find(s => s.type === 'mysql');
  assert.ok(mysql);
  assert.equal(mysql.isInstalled, true);
  assert.ok(mysql.availableVersions.includes('10.6'));
  });

  it('ordena versiones de forma descendente', () => {
    writeIni(tmpDir, `[apache]\nversion=2.4.48`);
    const base = path.join(tmpDir, 'bin', 'apache');
    ['2.4.48', '2.4.59', '2.4.54'].forEach(v => {
      ensureDir(path.join(base, v));
      fs.writeFileSync(path.join(base, v, 'httpd.exe'), '');
    });
    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const apache = services.find(s => s.type === 'apache');
  assert.deepEqual(apache.availableVersions, ['2.4.59', '2.4.54', '2.4.48']);
  });

  it('documentRoot usa projectsPath cuando no hay override', () => {
    writeIni(tmpDir, `[apache]\nversion=2.4.0`);
    const apacheBin = path.join(tmpDir, 'bin', 'apache', '2.4.0');
    ensureDir(apacheBin);
    fs.writeFileSync(path.join(apacheBin, 'httpd.exe'), '');
    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const apache = services.find(s => s.type === 'apache');
    const docRootConfig = apache.configs.find(c => c.label === 'OPEN_DOCROOT');
  assert.equal(docRootConfig.path, userConfig.projectsPath);
  });

  it('apache requiere php: instalado pero sin php -> dependenciesReady false', () => {
    writeIni(tmpDir, `[apache]\nversion=2.4.0`);
    const apacheBin = path.join(tmpDir, 'bin', 'apache', '2.4.0');
    ensureDir(apacheBin);
    fs.writeFileSync(path.join(apacheBin, 'httpd.exe'), '');
    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const apache = services.find(s => s.type === 'apache');
    assert.ok(apache.isInstalled);
    assert.equal(apache.dependenciesReady, false);
  });

  it('apache con php instalado -> dependenciesReady true', () => {
    writeIni(tmpDir, `[apache]\nversion=2.4.0\n[php]\nversion=8.2.0`);
    const apacheBin = path.join(tmpDir, 'bin', 'apache', '2.4.0');
    ensureDir(apacheBin);
    fs.writeFileSync(path.join(apacheBin, 'httpd.exe'), '');
    const phpBin = path.join(tmpDir, 'bin', 'php', '8.2.0');
    ensureDir(phpBin);
    fs.writeFileSync(path.join(phpBin, 'php.exe'), '');
    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const apache = services.find(s => s.type === 'apache');
    assert.ok(apache.isInstalled);
    assert.equal(apache.dependenciesReady, true);
  });

  it('apache con php en neutralino/bin detecta dependencia y marca dependenciesReady', () => {
    writeIni(tmpDir, `[apache]\nversion=2.4.0\n[php]\nversion=8.2.0`);
    const apacheBin = path.join(tmpDir, 'neutralino', 'bin', 'apache', '2.4.0', 'Apache24', 'bin');
    ensureDir(apacheBin);
    fs.writeFileSync(path.join(apacheBin, 'httpd.exe'), '');
    const phpBin = path.join(tmpDir, 'neutralino', 'bin', 'php', '8.2.0', 'php-8.2.0', 'bin');
    ensureDir(phpBin);
    fs.writeFileSync(path.join(phpBin, 'php.exe'), '');

    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const apache = services.find(s => s.type === 'apache');
    assert.ok(apache.isInstalled, 'apache no detectado');
    assert.equal(apache.dependenciesReady, true, 'apache no marcó dependenciesReady con php en neutralino/bin');
  });

  it('detecta versiones de PHP en app, usr y neutralino y selecciona la más reciente', () => {
    writeIni(tmpDir, `[apache]\nversion=2.4.0`);

    // Apache para que el servicio exista
    const apacheBin = path.join(tmpDir, 'bin', 'apache', '2.4.0');
    ensureDir(apacheBin);
    fs.writeFileSync(path.join(apacheBin, 'httpd.exe'), '');

    // PHP en tres ubicaciones
    const phpApp = path.join(tmpDir, 'bin', 'php', '8.1.0');
    const phpUsr = path.join(tmpDir, 'usr', 'bin', 'php', '8.2.1');
    const phpNeu = path.join(tmpDir, 'neutralino', 'bin', 'php', '7.4.33');
    [phpApp, phpUsr, phpNeu].forEach(dir => {
      ensureDir(path.join(dir, 'bin'));
      fs.writeFileSync(path.join(dir, 'bin', 'php.exe'), '');
    });

    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const apache = services.find(s => s.type === 'apache');

    assert.ok(apache, 'apache no detectado');
    assert.deepEqual(apache.availablePhpVersions, ['8.2.1', '8.1.0', '7.4.33']);
    assert.equal(apache.phpVersion, '8.2.1', 'no seleccionó la versión más reciente de PHP');
    assert.equal(apache.dependenciesReady, true, 'no marcó dependenciesReady con php detectado');
  });

  it('detecta Apache instalado en usr/bin y asigna versión', () => {
    writeIni(tmpDir, `[apache]\nversion=2.4.57`);
    const apacheUsrBin = path.join(tmpDir, 'usr', 'bin', 'apache', '2.4.57');
    ensureDir(apacheUsrBin);
    fs.writeFileSync(path.join(apacheUsrBin, 'httpd.exe'), '');

    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const apache = services.find(s => s.type === 'apache');

    assert.ok(apache, 'apache no detectado');
    assert.equal(apache.version, '2.4.57');
    assert.ok(apache.isInstalled, 'apache no marcado como instalado desde usr/bin');
  });

  it('nginx detecta instalación y puerto por defecto', () => {
    writeIni(tmpDir, `[nginx]\nversion=1.25.0`);
    const nginxBin = path.join(tmpDir, 'bin', 'nginx', '1.25.0');
    ensureDir(nginxBin);
    fs.writeFileSync(path.join(nginxBin, 'nginx.exe'), '');
    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const nginx = services.find(s => s.type === 'nginx');
    assert.ok(nginx);
    assert.ok(nginx.isInstalled);
    assert.equal(nginx.port, 80);
  });

  it('redis/memcached/mailpit/mongodb/postgresql se detectan con sus binarios', () => {
    const specs = [
      { type: 'redis', exe: 'redis-server.exe', port: 6379 },
      { type: 'memcached', exe: 'memcached.exe', port: 11211 },
      { type: 'mailpit', exe: 'mailpit.exe', port: 8025 },
      { type: 'mongodb', exe: 'mongod.exe', port: 27017 },
      { type: 'postgresql', exe: 'postgres.exe', port: 5432 }
    ];

    let iniContent = '';
    specs.forEach(s => {
      iniContent += `[${s.type}]\nversion=1.0\n`;
      const binDir = path.join(tmpDir, 'bin', s.type, '1.0');
      ensureDir(binDir);
      fs.writeFileSync(path.join(binDir, s.exe), '');
    });
    writeIni(tmpDir, iniContent.trim());

    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    specs.forEach(s => {
      const found = services.find(x => x.type === s.type);
      assert.ok(found, `${s.type} missing`);
      assert.ok(found.isInstalled, `${s.type} not installed`);
      assert.equal(found.port, s.port);
    });
  });

  it('incluye logs de mysql en data/ y en la versión', () => {
    writeIni(tmpDir, `[mysql]\nversion=8.0.30`);
    const mysqlBin = path.join(tmpDir, 'bin', 'mysql', '8.0.30');
    ensureDir(mysqlBin);
    fs.writeFileSync(path.join(mysqlBin, 'mysqld.exe'), '');
    fs.writeFileSync(path.join(mysqlBin, 'error.log'), '');
    const dataPath = path.join(tmpDir, 'data', 'mysql');
    ensureDir(dataPath);
    fs.writeFileSync(path.join(dataPath, 'custom.log'), '');
    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const mysql = services.find(s => s.type === 'mysql');
    const labels = new Set(mysql.configs.map(c => c.label));
    assert.ok(labels.has('error.log'));
    assert.ok(labels.has('mysql/custom.log'));
  });

  it('detecta servicios DB extra (redis) si existen binarios', () => {
    writeIni(tmpDir, `[redis]\nversion=7.0`);
    const redisBin = path.join(tmpDir, 'bin', 'redis', '7.0');
    ensureDir(redisBin);
    fs.writeFileSync(path.join(redisBin, 'redis-server.exe'), '');
    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const redis = services.find(s => s.type === 'redis');
    assert.ok(redis);
    assert.equal(redis.isInstalled, true);
    assert.equal(redis.port, 6379);
  });

  it('instala un zip real con Apache usando PowerShell', async () => {
    if (process.platform !== 'win32') return; // Solo válido en Windows

    // Preparar estructura fuente
    const srcRoot = path.join(tmpDir, 'zip-src');
    const apacheBin = path.join(srcRoot, 'Apache24', 'bin');
    ensureDir(apacheBin);
    fs.writeFileSync(path.join(apacheBin, 'httpd.exe'), '');

    const zipPath = path.join(tmpDir, 'apache.zip');
    // Comprimir con PowerShell
    execFileSync('powershell.exe', ['-Command', `Compress-Archive -Path "${srcRoot}/*" -DestinationPath "${zipPath}" -Force`]);

    const destDir = path.join(tmpDir, 'neutralino', 'bin', 'apache', '2.4.0');
    await installFromZip({ zipPath, destDir, onLog: noop });

    // Añadir php manualmente para dependenciesReady
    const phpBin = path.join(tmpDir, 'neutralino', 'bin', 'php', '8.2.0', 'bin');
    ensureDir(phpBin);
    fs.writeFileSync(path.join(phpBin, 'php.exe'), '');

    writeIni(tmpDir, `[apache]\nversion=2.4.0\n[php]\nversion=8.2.0`);
    const cfg = loadAppConfig(tmpDir, noop);
    const services = detectServices({ appPath: tmpDir, userConfig, appConfig: cfg, log: noop });
    const apache = services.find(s => s.type === 'apache');
    assert.ok(apache, 'apache no detectado');
    assert.equal(apache.isInstalled, true);
    assert.equal(apache.dependenciesReady, true);
  });
});
