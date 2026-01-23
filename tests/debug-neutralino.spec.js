import { describe, it, beforeEach, afterEach } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getAvailableVersions, getServiceBinPath, detectServices, loadAppConfig } from '../src/neutralino/lib/services-detector.js';
import { createNodeFilesystemAdapter } from '../src/neutralino/lib/fs-adapter.js';

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

describe('Integridad del motor de detección REAL', () => {
  let tmpDir;
  let fsAdapter;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webservdev-debug-'));
    fsAdapter = createNodeFilesystemAdapter();
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch(e) {}
    }
  });

  it('detecta PHP en estructura anidada usando la LÓGICA REAL', async () => {
    // Escenario real: ZIP extraído crea carpeta intermedia
    const phpRoot = path.join(tmpDir, 'bin', 'php', '8.2.12');
    const nestedDir = path.join(phpRoot, 'php-8.2.12-Win32-vs16-x64');
    ensureDir(nestedDir);
    fs.writeFileSync(path.join(nestedDir, 'php.exe'), 'dummy');
    
    // El motor real debe encontrarlo
    const versions = await getAvailableVersions(fsAdapter, tmpDir, 'php');
    assert.ok(versions.includes('8.2.12'), 'El motor real no detectó la carpeta de versión');

    const binPath = await getServiceBinPath(fsAdapter, tmpDir, 'php', '8.2.12');
    assert.ok(binPath, 'El motor real no encontró el binario en la estructura anidada');
    assert.ok(binPath.includes('php-8.2.12-Win32-vs16-x64'), 'La ruta del binario no es correcta');
  });

  it('detecta Apache con estructura compleja', async () => {
    const apacheRoot = path.join(tmpDir, 'bin', 'apache', '2.4.58');
    const nestedDir = path.join(apacheRoot, 'Apache24', 'bin');
    ensureDir(nestedDir);
    fs.writeFileSync(path.join(nestedDir, 'httpd.exe'), 'dummy');
    ensureDir(path.join(apacheRoot, 'Apache24', 'conf'));
    fs.writeFileSync(path.join(apacheRoot, 'Apache24', 'conf', 'httpd.conf'), '# config');

    const versions = await getAvailableVersions(fsAdapter, tmpDir, 'apache');
    assert.ok(versions.includes('2.4.58'));

    const binPath = await getServiceBinPath(fsAdapter, tmpDir, 'apache', '2.4.58');
    assert.ok(binPath && binPath.includes('Apache24/bin'), 'No detectó la subcarpeta /bin de Apache');
  });

  it('reproduce el flujo completo: instalar PHP, Apache y verificar dependencias', async () => {
    // PHP
    const phpRoot = path.join(tmpDir, 'bin', 'php', '8.2.12');
    const phpNested = path.join(phpRoot, 'php-8.2.12');
    ensureDir(phpNested);
    fs.writeFileSync(path.join(phpNested, 'php.exe'), 'dummy');

    // Apache
    const apacheRoot = path.join(tmpDir, 'bin', 'apache', '2.4.58');
    const apacheNestedBin = path.join(apacheRoot, 'Apache24', 'bin');
    ensureDir(apacheNestedBin);
    fs.writeFileSync(path.join(apacheNestedBin, 'httpd.exe'), 'dummy');
    ensureDir(path.join(apacheRoot, 'Apache24', 'conf'));
    fs.writeFileSync(path.join(apacheRoot, 'Apache24', 'conf', 'httpd.conf'), '# config');

    // app.ini
    fs.writeFileSync(path.join(tmpDir, 'app.ini'), '[apache]\nversion=2.4.58\n[php]\nversion=8.2.12');

    const appConfig = await loadAppConfig(fsAdapter, tmpDir, () => {});
    const services = await detectServices({
      fsAdapter,
      appPath: tmpDir,
      userConfig: { projectsPath: path.join(tmpDir, 'www') },
      appConfig,
      log: () => {}
    });

    const apache = services.find(s => s.type === 'apache');
    assert.ok(apache, 'Apache no detectado');
    assert.equal(apache.isInstalled, true, 'Apache no marcado como instalado');
    assert.equal(apache.dependenciesReady, true, 'dependenciesReady debería ser true con PHP presente');
  });
});
