import { describe, it, beforeEach, afterEach } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { detectServices, getAvailableVersions, getServiceBinPath } from '../src/neutralino/lib/services-detector.js';
import { createNodeFilesystemAdapter } from '../src/neutralino/lib/fs-adapter.js';

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

describe('Detección de servicios instalados físicamente', () => {
  let tmpDir;

  beforeEach(() => {
    // Crear directorio temporal para cada test
    tmpDir = path.join(os.tmpdir(), 'webservdev-test-' + Math.random().toString(36).substr(2, 9));
    ensureDir(tmpDir);
  });

  afterEach(() => {
    // Limpiar directorio temporal después de cada test
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('debe detectar versiones de PHP instaladas cuando existen ejecutables', async () => {
    const fsAdapter = createNodeFilesystemAdapter();

    // Crear estructura simulada de PHP instalado
    const phpDir = path.join(tmpDir, 'neutralino', 'bin', 'php');
    ensureDir(path.join(phpDir, '8.3.29 (TS)'));
    ensureDir(path.join(phpDir, '8.2.30 (TS)'));
    ensureDir(path.join(phpDir, '8.1.34 (TS)'));

    // Crear ejecutables ficticios
    fs.writeFileSync(path.join(phpDir, '8.3.29 (TS)', 'php.exe'), '');
    fs.writeFileSync(path.join(phpDir, '8.2.30 (TS)', 'php.exe'), '');
    fs.writeFileSync(path.join(phpDir, '8.1.34 (TS)', 'php.exe'), '');

    const phpVersions = await getAvailableVersions(fsAdapter, tmpDir, 'php');
    console.log('PHP versions detected:', phpVersions);

    // Debería encontrar las versiones que tienen ejecutables
    assert.ok(phpVersions.length === 3, `Debería encontrar 3 versiones de PHP, encontró ${phpVersions.length}`);
    assert.ok(phpVersions.includes('8.3.29 (TS)'), 'Debería detectar PHP 8.3.29 (TS)');
    assert.ok(phpVersions.includes('8.2.30 (TS)'), 'Debería detectar PHP 8.2.30 (TS)');
    assert.ok(phpVersions.includes('8.1.34 (TS)'), 'Debería detectar PHP 8.1.34 (TS)');
  });

  it('debe detectar versiones de Apache instaladas cuando existen ejecutables en estructura anidada', async () => {
    const fsAdapter = createNodeFilesystemAdapter();

    // Crear estructura simulada de Apache (como el ZIP real que crea Apache24/bin/)
    const apacheDir = path.join(tmpDir, 'neutralino', 'bin', 'apache');
    const apache24Dir = path.join(apacheDir, '2.4.66', 'Apache24', 'bin');
    ensureDir(apache24Dir);

    // Crear ejecutable en la estructura anidada
    fs.writeFileSync(path.join(apache24Dir, 'httpd.exe'), '');

    const apacheVersions = await getAvailableVersions(fsAdapter, tmpDir, 'apache');
    console.log('Apache versions detected:', apacheVersions);

    assert.ok(apacheVersions.length === 1, `Debería encontrar 1 versión de Apache, encontró ${apacheVersions.length}`);
    assert.ok(apacheVersions.includes('2.4.66'), 'Debería detectar Apache 2.4.66');
  });

  it('debe detectar versiones de MySQL instaladas cuando existen ejecutables en estructura anidada', async () => {
    const fsAdapter = createNodeFilesystemAdapter();

    // Crear estructura simulada de MySQL (como el ZIP real que crea mysql-X.X.X-winx64/bin/)
    const mysqlDir = path.join(tmpDir, 'neutralino', 'bin', 'mysql');
    const mysqlBinDir = path.join(mysqlDir, '8.0.44', 'mysql-8.0.44-winx64', 'bin');
    ensureDir(mysqlBinDir);

    // Crear ejecutable en la estructura anidada
    fs.writeFileSync(path.join(mysqlBinDir, 'mysqld.exe'), '');

    const mysqlVersions = await getAvailableVersions(fsAdapter, tmpDir, 'mysql');
    console.log('MySQL versions detected:', mysqlVersions);

    assert.ok(mysqlVersions.length === 1, `Debería encontrar 1 versión de MySQL, encontró ${mysqlVersions.length}`);
    assert.ok(mysqlVersions.includes('8.0.44'), 'Debería detectar MySQL 8.0.44');
  });

  it('debe detectar que PHP está instalado cuando se especifica la versión', async () => {
    const fsAdapter = createNodeFilesystemAdapter();

    // Crear estructura simulada de PHP instalado
    const phpDir = path.join(tmpDir, 'neutralino', 'bin', 'php');
    ensureDir(path.join(phpDir, '8.3.29 (TS)'));
    fs.writeFileSync(path.join(phpDir, '8.3.29 (TS)', 'php.exe'), '');

    const binPath = await getServiceBinPath(fsAdapter, tmpDir, 'php', '8.3.29 (TS)', console.log);
    console.log('PHP 8.3.29 (TS) binPath:', binPath);

    assert.ok(binPath, 'Debería encontrar el binPath para PHP 8.3.29 (TS)');
    assert.ok(typeof binPath === 'string', 'binPath debería ser un string');
    assert.ok(binPath.includes('8.3.29 (TS)'), 'binPath debería contener la versión');
  });

  it('debe detectar que Apache está instalado cuando el ejecutable está en estructura anidada', async () => {
    const fsAdapter = createNodeFilesystemAdapter();

    console.log('Apache test tmpDir:', tmpDir);

    // Crear estructura simulada de Apache con ejecutable anidado
    const apacheDir = path.join(tmpDir, 'neutralino', 'bin', 'apache');
    const apache24Dir = path.join(apacheDir, '2.4.66', 'Apache24', 'bin');
    ensureDir(apache24Dir);
    fs.writeFileSync(path.join(apache24Dir, 'httpd.exe'), '');

    console.log('Created Apache structure at:', apache24Dir);

    const binPath = await getServiceBinPath(fsAdapter, tmpDir, 'apache', '2.4.66', console.log);
    console.log('Apache 2.4.66 binPath:', binPath);

    assert.ok(binPath, 'Debería encontrar el binPath para Apache 2.4.66');
    assert.ok(typeof binPath === 'string', 'binPath debería ser un string');
    assert.ok(binPath.includes('2.4.66'), 'binPath debería contener la versión');
  });

  it('debe detectar servicios instalados a través de detectServices', async () => {
    const fsAdapter = createNodeFilesystemAdapter();

    // Crear estructuras simuladas para múltiples servicios
    const phpDir = path.join(tmpDir, 'neutralino', 'bin', 'php');
    ensureDir(path.join(phpDir, '8.3.29 (TS)'));
    fs.writeFileSync(path.join(phpDir, '8.3.29 (TS)', 'php.exe'), '');

    const apacheDir = path.join(tmpDir, 'neutralino', 'bin', 'apache');
    const apache24Dir = path.join(apacheDir, '2.4.66', 'Apache24', 'bin');
    ensureDir(apache24Dir);
    fs.writeFileSync(path.join(apache24Dir, 'httpd.exe'), '');

    const mysqlDir = path.join(tmpDir, 'neutralino', 'bin', 'mysql');
    const mysqlBinDir = path.join(mysqlDir, '8.0.44', 'mysql-8.0.44-winx64', 'bin');
    ensureDir(mysqlBinDir);
    fs.writeFileSync(path.join(mysqlBinDir, 'mysqld.exe'), '');

    const services = await detectServices({
      fsAdapter,
      appPath: tmpDir,
      userConfig: {},
      appConfig: {},
      log: console.log
    });

    console.log('Services detected:', services.map(s => `${s.name}: ${s.installedVersion || 'not installed'}`));

    // Verificar que al menos algunos servicios estén marcados como instalados
    const installedServices = services.filter(s => s.installedVersion);
    assert.ok(installedServices.length >= 2, `Debería haber al menos 2 servicios marcados como instalados, encontró ${installedServices.length}`);

    // Verificar servicios específicos
    const phpService = services.find(s => s.type === 'php');
    assert.ok(phpService, 'Debería existir el servicio PHP');
    assert.ok(phpService.installedVersion, 'PHP debería estar marcado como instalado');

    const apacheService = services.find(s => s.type === 'apache');
    assert.ok(apacheService, 'Debería existir el servicio Apache');
    assert.ok(apacheService.installedVersion, 'Apache debería estar marcado como instalado');

    const mysqlService = services.find(s => s.type === 'mysql');
    assert.ok(mysqlService, 'Debería existir el servicio MySQL');
    assert.ok(mysqlService.installedVersion, 'MySQL debería estar marcado como instalado');
  });
});