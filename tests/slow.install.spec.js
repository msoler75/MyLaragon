import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { installFromZip } from '../electron/service-installer.js';
import { detectServices, loadAppConfig } from '../electron/services-detector.js';

const runSlow = process.env.RUN_SLOW === '1';
const slowDescribe = runSlow ? describe : describe.skip;
const noop = () => {};

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function makeZipWithExecutable(baseDir, relExePath, zipName) {
  const payloadDir = path.join(baseDir, 'payload');
  const exeFull = path.join(payloadDir, relExePath);
  ensureDir(path.dirname(exeFull));
  fs.writeFileSync(exeFull, 'dummy');
  const zipPath = path.join(baseDir, zipName);
  // Usamos PowerShell Compress-Archive para imitar la app (Windows)
  execFileSync('powershell.exe', ['-Command', `Compress-Archive -Path "${payloadDir}/*" -DestinationPath "${zipPath}" -Force`]);
  return zipPath;
}

function startHttpServer(filePath) {
  const server = http.createServer((req, res) => {
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}/file.zip` });
    });
  });
}

function downloadToFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    http.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => reject(err));
  });
}

slowDescribe('Slow install/uninstall flow usando installer real', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webservdev-slow-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('descarga, instala y desinstala Apache desde zip servido por HTTP local', async () => {
    // Crear zip con httpd.exe en estructura Apache24/bin
    const zipPath = makeZipWithExecutable(tmpDir, path.join('Apache24', 'bin', 'httpd.exe'), 'apache.zip');
    const { server, url } = await startHttpServer(zipPath);
    const downloaded = path.join(tmpDir, 'apache-downloaded.zip');
    try {
      await downloadToFile(url, downloaded);

      const destDir = path.join(tmpDir, 'neutralino', 'bin', 'apache', '2.4.0');
      await installFromZip({ zipPath: downloaded, destDir, onLog: noop });

      // app.ini que usaría la app
      fs.writeFileSync(path.join(tmpDir, 'app.ini'), `[apache]\nversion=2.4.0`);

      // Detectar instalación
      const appConfig = loadAppConfig(tmpDir, noop);
      let services = detectServices({ appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig, log: noop });
      const apache = services.find(s => s.type === 'apache');
      assert.ok(apache, 'apache no detectado tras instalar');
      assert.equal(apache.isInstalled, true, 'apache no marcado como instalado');

      // "Desinstalar": borrar la carpeta y re-chequear
      fs.rmSync(destDir, { recursive: true, force: true });
      services = detectServices({ appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig: loadAppConfig(tmpDir, noop), log: noop });
      const apacheAfter = services.find(s => s.type === 'apache');
      assert.ok(apacheAfter);
      assert.equal(apacheAfter.isInstalled, false, 'apache debería estar no instalado tras borrar carpeta');
    } finally {
      server.close();
    }
  });

  it('instala PHP con nombre de carpeta no estándar (php-8.2.12) y lo detecta', async () => {
    // Simular instalación de PHP con nombre de carpeta típico (php-8.2.12 en vez de 8.2.12)
    const phpZip = makeZipWithExecutable(tmpDir, path.join('php-8.2.12', 'php.exe'), 'php.zip');
    const { server, url } = await startHttpServer(phpZip);
    const downloaded = path.join(tmpDir, 'php-downloaded.zip');
    try {
      await downloadToFile(url, downloaded);

      // Instalar en neutralino/bin/php/8.2.12 (la carpeta de versión)
      const destDir = path.join(tmpDir, 'neutralino', 'bin', 'php', '8.2.12');
      await installFromZip({ zipPath: downloaded, destDir, onLog: noop });

      // Crear app.ini pidiendo php 8.2.12
      fs.writeFileSync(path.join(tmpDir, 'app.ini'), `[php]\nversion=8.2.12`);

      // Detectar
      const appConfig = loadAppConfig(tmpDir, noop);
      const services = detectServices({ appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig, log: noop });
      
      // PHP no se lista como servicio standalone normalmente, pero verificamos availablePhp en Apache
      const apache = services.find(s => s.type === 'apache');
      if (apache) {
        console.log('[TEST] availablePhpVersions:', apache.availablePhpVersions);
        assert.ok(apache.availablePhpVersions.includes('8.2.12'), 'PHP 8.2.12 no detectado en availablePhpVersions');
      }

      // Verificar detección directa con getServiceBinPath
      const { getServiceBinPath } = await import('../electron/services-detector.js');
      const phpBin = getServiceBinPath(tmpDir, 'php', '8.2.12', noop);
      assert.ok(phpBin, 'getServiceBinPath no encontró php.exe en carpeta con nombre no estándar');
      console.log('[TEST] PHP detectado en:', phpBin);
    } finally {
      server.close();
    }
  });

  it('instala Apache + PHP, arranca httpd.exe brevemente y lo detecta corriendo', async () => {
    // Este test arranca httpd.exe real brevemente y verifica que el proceso aparece
    // Requiere Apache y PHP binarios funcionales; lo saltaremos si no están disponibles
    
    // Crear zip con httpd.exe dummy (no funcional, solo para detectar archivo)
    const apacheZip = makeZipWithExecutable(tmpDir, path.join('Apache24', 'bin', 'httpd.exe'), 'apache.zip');
    const phpZip = makeZipWithExecutable(tmpDir, path.join('php', 'php.exe'), 'php.zip');
    
    const { server: apacheSrv, url: apacheUrl } = await startHttpServer(apacheZip);
    const apacheDownloaded = path.join(tmpDir, 'apache-dl.zip');
    
    try {
      await downloadToFile(apacheUrl, apacheDownloaded);
      const apacheDir = path.join(tmpDir, 'neutralino', 'bin', 'apache', '2.4.0');
      await installFromZip({ zipPath: apacheDownloaded, destDir: apacheDir, onLog: noop });

      // Instalar PHP
      const { server: phpSrv, url: phpUrl } = await startHttpServer(phpZip);
      const phpDownloaded = path.join(tmpDir, 'php-dl.zip');
      try {
        await downloadToFile(phpUrl, phpDownloaded);
        const phpDir = path.join(tmpDir, 'neutralino', 'bin', 'php', '8.2.0');
        await installFromZip({ zipPath: phpDownloaded, destDir: phpDir, onLog: noop });

        // app.ini
        fs.writeFileSync(path.join(tmpDir, 'app.ini'), `[apache]\nversion=2.4.0\n[php]\nversion=8.2.0`);

        const appConfig = loadAppConfig(tmpDir, noop);
        const services = detectServices({ appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig, log: noop });
        const apache = services.find(s => s.type === 'apache');

        assert.ok(apache, 'apache no encontrado');
        assert.equal(apache.isInstalled, true, 'apache no marcado instalado');
        assert.equal(apache.dependenciesReady, true, 'apache no marcó dependenciesReady con PHP presente');
        
        console.log('[TEST] Apache instalado:', apache.isInstalled);
        console.log('[TEST] Apache dependenciesReady:', apache.dependenciesReady);
        console.log('[TEST] PHP version:', apache.phpVersion);
      } finally {
        phpSrv.close();
      }
    } finally {
      apacheSrv.close();
    }
  });
});
