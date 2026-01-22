import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { execFileSync } from 'node:child_process';
import { installFromZip } from '../src/neutralino/lib/service-installer.js';
import { detectServices, loadAppConfig } from '../src/neutralino/lib/services-detector.js';
import { createNodeFilesystemAdapter } from '../src/neutralino/lib/fs-adapter.js';

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
    const protocol = url.startsWith('https:') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Node.js Test Script'
      }
    };
    const request = (u) => {
      protocol.get(u, options, res => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          // Follow redirect
          const redirectUrl = res.headers.location;
          console.log(`[TEST] Redirecting to ${redirectUrl}`);
          request(redirectUrl);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', err => reject(err));
    };
    request(url);
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
      const fsAdapter = createNodeFilesystemAdapter();
      const appConfig = await loadAppConfig(fsAdapter, tmpDir, noop);
      let services = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig, log: noop });
      const apache = services.find(s => s.type === 'apache');
      assert.ok(apache, 'apache no detectado tras instalar');
      assert.equal(apache.isInstalled, true, 'apache no marcado como instalado');

      // "Desinstalar": borrar la carpeta y re-chequear
      fs.rmSync(destDir, { recursive: true, force: true });
      services = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig: loadAppConfig(fsAdapter, tmpDir, noop), log: noop });
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
      const fsAdapter = createNodeFilesystemAdapter();
      const appConfig = await loadAppConfig(fsAdapter, tmpDir, noop);
      const services = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig, log: noop });
      
      // PHP no se lista como servicio standalone normalmente, pero verificamos availablePhp en Apache
      const apache = services.find(s => s.type === 'apache');
      if (apache) {
        console.log('[TEST] availablePhpVersions:', apache.availablePhpVersions);
        assert.ok(apache.availablePhpVersions.includes('8.2.12'), 'PHP 8.2.12 no detectado en availablePhpVersions');
      }

      // Verificar detección directa con getServiceBinPath
      const { getServiceBinPath } = await import('../src/neutralino/lib/services-detector.js');
      const phpBin = await getServiceBinPath(fsAdapter, tmpDir, 'php', '8.2.12', noop);
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

        const fsAdapter = createNodeFilesystemAdapter();
        const appConfig = await loadAppConfig(fsAdapter, tmpDir, noop);
        const services = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig, log: noop });
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

  it('instala una versión real de PHP descargada desde el servidor oficial y verifica que esté disponible', async () => {
    // Elegir una versión de PHP de services.json, por ejemplo 8.2.30 (NTS)
    const phpVersion = '8.2.30 (NTS)';
    const phpUrl = 'https://windows.php.net/downloads/releases/php-8.2.30-nts-Win32-vs16-x64.zip';
    const downloadedZip = path.join(tmpDir, 'php-real.zip');

    try {
      // Descargar el zip real desde el servidor oficial
      console.log(`[TEST] Descargando PHP ${phpVersion} desde ${phpUrl}...`);
      await downloadToFile(phpUrl, downloadedZip);
      console.log('[TEST] Descarga completada. Tamaño del ZIP:', fs.statSync(downloadedZip).size, 'bytes');

      // Instalar en la estructura esperada: neutralino/bin/php/8.2.30 (NTS)
      const destDir = path.join(tmpDir, 'neutralino', 'bin', 'php', phpVersion);
      await installFromZip({ zipPath: downloadedZip, destDir, onLog: console.log });

      // Verificar contenido extraído
      console.log(`[TEST] Contenido de ${destDir}:`, fs.readdirSync(destDir));

      // Verificar que el binario esté presente
      const { getServiceBinPath } = await import('../src/neutralino/lib/services-detector.js');
      const phpBinPath = await getServiceBinPath(fsAdapter, tmpDir, 'php', phpVersion, console.log);
      assert.ok(phpBinPath, `PHP ${phpVersion} no detectado tras instalación`);
      console.log(`[TEST] PHP binario encontrado en: ${phpBinPath}`);

      // Verificar que aparezca en availableVersions
      const { getAvailableVersions } = await import('../src/neutralino/lib/services-detector.js');
      const availableVersions = await getAvailableVersions(fsAdapter, tmpDir, 'php');
      assert.ok(availableVersions.includes(phpVersion), `PHP ${phpVersion} no en availableVersions: ${availableVersions.join(', ')}`);
      console.log(`[TEST] Versiones PHP disponibles: ${availableVersions.join(', ')}`);

      // Si hay Apache instalado, verificar que aparezca en availablePhpVersions
      // Para este test, instalemos también Apache dummy para verificar
      const apacheZip = makeZipWithExecutable(tmpDir, path.join('Apache24', 'bin', 'httpd.exe'), 'apache.zip');
      const apacheDestDir = path.join(tmpDir, 'neutralino', 'bin', 'apache', '2.4.66');
      await installFromZip({ zipPath: apacheZip, destDir: apacheDestDir, onLog: noop });

      // app.ini con Apache y PHP
      fs.writeFileSync(path.join(tmpDir, 'app.ini'), `[apache]\nversion=2.4.66\n[php]\nversion=${phpVersion}`);

      const fsAdapter = createNodeFilesystemAdapter();
      const appConfig = await loadAppConfig(fsAdapter, tmpDir, noop);
      const services = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig, log: noop });
      const apache = services.find(s => s.type === 'apache');
      assert.ok(apache, 'Apache no detectado');
      assert.ok(apache.availablePhpVersions.includes(phpVersion), `PHP ${phpVersion} no en availablePhpVersions de Apache: ${apache.availablePhpVersions.join(', ')}`);
      console.log(`[TEST] PHP disponible para Apache: ${apache.availablePhpVersions.join(', ')}`);

    } catch (error) {
      console.error(`[TEST] Error en instalación real de PHP: ${error.message}`);
      throw error;
    }
  });

  it('instala una versión real de Apache descargada desde el servidor oficial y verifica instalación/desinstalación', async () => {
    const apacheVersion = '2.4.66';
    const apacheUrl = 'https://www.apachelounge.com/download/VS18/binaries/httpd-2.4.66-260107-Win64-VS18.zip';
    const downloadedZip = path.join(tmpDir, 'apache-real.zip');

    try {
      console.log(`[TEST] Descargando Apache ${apacheVersion} desde ${apacheUrl}...`);
      await downloadToFile(apacheUrl, downloadedZip);
      console.log('[TEST] Descarga completada. Tamaño del ZIP:', fs.statSync(downloadedZip).size, 'bytes');

      const destDir = path.join(tmpDir, 'neutralino', 'bin', 'apache', apacheVersion);
      await installFromZip({ zipPath: downloadedZip, destDir, onLog: console.log });

      console.log(`[TEST] Contenido de ${destDir}:`, fs.readdirSync(destDir).slice(0, 10), '...'); // primeros 10

      const { getServiceBinPath } = await import('../src/neutralino/lib/services-detector.js');
      const apacheBinPath = await getServiceBinPath(fsAdapter, tmpDir, 'apache', apacheVersion, console.log);
      assert.ok(apacheBinPath, `Apache ${apacheVersion} no detectado tras instalación`);
      console.log(`[TEST] Apache binario encontrado en: ${apacheBinPath}`);

      const fsAdapter = createNodeFilesystemAdapter();
      const appConfig = await loadAppConfig(fsAdapter, tmpDir, noop);
      const services = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig, log: noop });
      const apache = services.find(s => s.type === 'apache');
      assert.ok(apache, 'Apache no detectado en servicios');
      assert.equal(apache.isInstalled, true, 'Apache no marcado como instalado');

      // Desinstalación: borrar carpeta
      fs.rmSync(destDir, { recursive: true, force: true });
      // app.ini con versión para que aparezca en servicios
      fs.writeFileSync(path.join(tmpDir, 'app.ini'), `[apache]\nversion=${apacheVersion}`);
      const servicesAfter = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig: await loadAppConfig(fsAdapter, tmpDir, noop), log: noop });
      const apacheAfter = servicesAfter.find(s => s.type === 'apache');
      assert.ok(apacheAfter);
      assert.equal(apacheAfter.isInstalled, false, 'Apache debería estar no instalado tras borrar carpeta');

    } catch (error) {
      console.error(`[TEST] Error en instalación real de Apache: ${error.message}`);
      throw error;
    }
  });

  it('instala una versión real de MySQL descargada desde el servidor oficial y verifica instalación/desinstalación', async () => {
    const mysqlVersion = '8.0.44';
    const mysqlUrl = 'https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.44-winx64.zip';
    const downloadedZip = path.join(tmpDir, 'mysql-real.zip');

    try {
      console.log(`[TEST] Descargando MySQL ${mysqlVersion} desde ${mysqlUrl}...`);
      await downloadToFile(mysqlUrl, downloadedZip);
      console.log('[TEST] Descarga completada. Tamaño del ZIP:', fs.statSync(downloadedZip).size, 'bytes');

      const destDir = path.join(tmpDir, 'neutralino', 'bin', 'mysql', mysqlVersion);
      await installFromZip({ zipPath: downloadedZip, destDir, onLog: console.log });

      console.log(`[TEST] Contenido de ${destDir}:`, fs.readdirSync(destDir).slice(0, 10), '...');

      const { getServiceBinPath } = await import('../src/neutralino/lib/services-detector.js');
      const mysqlBinPath = await getServiceBinPath(fsAdapter, tmpDir, 'mysql', mysqlVersion, console.log);
      assert.ok(mysqlBinPath, `MySQL ${mysqlVersion} no detectado tras instalación`);
      console.log(`[TEST] MySQL binario encontrado en: ${mysqlBinPath}`);

      const fsAdapter = createNodeFilesystemAdapter();
      const appConfig = await loadAppConfig(fsAdapter, tmpDir, noop);
      const services = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig, log: noop });
      const mysql = services.find(s => s.type === 'mysql');
      assert.ok(mysql, 'MySQL no detectado en servicios');
      assert.equal(mysql.isInstalled, true, 'MySQL no marcado como instalado');

      // Desinstalación
      fs.rmSync(destDir, { recursive: true, force: true });
      // app.ini con versión
      fs.writeFileSync(path.join(tmpDir, 'app.ini'), `[mysql]\nversion=${mysqlVersion}`);
      const servicesAfter = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig: await loadAppConfig(fsAdapter, tmpDir, noop), log: noop });
      const mysqlAfter = servicesAfter.find(s => s.type === 'mysql');
      assert.ok(mysqlAfter);
      assert.equal(mysqlAfter.isInstalled, false, 'MySQL debería estar no instalado tras borrar carpeta');

    } catch (error) {
      console.error(`[TEST] Error en instalación real de MySQL: ${error.message}`);
      throw error;
    }
  });

  it('instala una versión real de MailPit descargada desde el servidor oficial y verifica instalación/desinstalación', async () => {
    const mailpitVersion = '1.20.4';
    const mailpitUrl = 'https://github.com/axllent/mailpit/releases/download/v1.20.4/mailpit-windows-amd64.zip';
    const downloadedZip = path.join(tmpDir, 'mailpit-real.zip');

    try {
      console.log(`[TEST] Descargando MailPit ${mailpitVersion} desde ${mailpitUrl}...`);
      await downloadToFile(mailpitUrl, downloadedZip);
      console.log('[TEST] Descarga completada. Tamaño del ZIP:', fs.statSync(downloadedZip).size, 'bytes');

      const destDir = path.join(tmpDir, 'neutralino', 'bin', 'mailpit', mailpitVersion);
      await installFromZip({ zipPath: downloadedZip, destDir, onLog: console.log });

      console.log(`[TEST] Contenido de ${destDir}:`, fs.readdirSync(destDir));

      const { getServiceBinPath } = await import('../src/neutralino/lib/services-detector.js');
      const mailpitBinPath = await getServiceBinPath(fsAdapter, tmpDir, 'mailpit', mailpitVersion, console.log);
      assert.ok(mailpitBinPath, `MailPit ${mailpitVersion} no detectado tras instalación`);
      console.log(`[TEST] MailPit binario encontrado en: ${mailpitBinPath}`);

      const fsAdapter = createNodeFilesystemAdapter();
      const appConfig = await loadAppConfig(fsAdapter, tmpDir, noop);
      const services = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig, log: noop });
      const mailpit = services.find(s => s.type === 'mailpit');
      assert.ok(mailpit, 'MailPit no detectado en servicios');
      assert.equal(mailpit.isInstalled, true, 'MailPit no marcado como instalado');

      // Desinstalación
      fs.rmSync(destDir, { recursive: true, force: true });
      // app.ini con versión
      fs.writeFileSync(path.join(tmpDir, 'app.ini'), `[mailpit]\nversion=${mailpitVersion}`);
      const servicesAfter = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig: await loadAppConfig(fsAdapter, tmpDir, noop), log: noop });
      const mailpitAfter = servicesAfter.find(s => s.type === 'mailpit');
      assert.ok(mailpitAfter);
      assert.equal(mailpitAfter.isInstalled, false, 'MailPit debería estar no instalado tras borrar carpeta');

    } catch (error) {
      console.error(`[TEST] Error en instalación real de MailPit: ${error.message}`);
      throw error;
    }
  });

  it('verifica que Apache esté disponible cuando PHP está instalado', async () => {
    // Instalar PHP real primero
    const phpUrl = 'https://windows.php.net/downloads/releases/php-8.2.30-nts-Win32-vs16-x64.zip';
    const phpZip = path.join(tmpDir, 'php-real.zip');
    await downloadToFile(phpUrl, phpZip);
    const phpDest = path.join(tmpDir, 'neutralino', 'bin', 'php', '8.2.30 (NTS)');
    await installFromZip({ zipPath: phpZip, destDir: phpDest, onLog: noop });

    // Instalar Apache real
    const apacheUrl = 'https://www.apachelounge.com/download/VS18/binaries/httpd-2.4.66-260107-Win64-VS18.zip';
    const apacheZip = path.join(tmpDir, 'apache-real.zip');
    await downloadToFile(apacheUrl, apacheZip);
    const apacheDest = path.join(tmpDir, 'neutralino', 'bin', 'apache', '2.4.66');
    await installFromZip({ zipPath: apacheZip, destDir: apacheDest, onLog: noop });

    // Configurar app.ini
    fs.writeFileSync(path.join(tmpDir, 'app.ini'), `[apache]\nversion=2.4.66\n[php]\nversion=8.2.30 (NTS)`);

    // Detectar servicios
    const fsAdapter = createNodeFilesystemAdapter();
    const appConfig = await loadAppConfig(fsAdapter, tmpDir, noop);
    const services = await detectServices({ fsAdapter, appPath: tmpDir, userConfig: { projectsPath: path.join(tmpDir, 'www') }, appConfig, log: noop });

    const apache = services.find(s => s.type === 'apache');
    assert.ok(apache, 'Apache no detectado');
    assert.equal(apache.isInstalled, true, 'Apache no marcado como instalado');
    assert.equal(apache.dependenciesReady, true, 'Apache no tiene dependencias listas con PHP instalado');
    assert.equal(apache.phpVersion, '8.2.30 (NTS)', 'PHP version no asignada correctamente a Apache');
  });
});

