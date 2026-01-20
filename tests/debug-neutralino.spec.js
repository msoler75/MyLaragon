import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const runDebug = process.env.RUN_DEBUG === '1';
const debugDescribe = runDebug ? describe : describe.skip;

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

debugDescribe('Debug Neutralino runtime completo', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webservdev-debug-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('simula instalación PHP y detecta con lógica del shim', async () => {
    // Simular instalación de PHP típica con nombre de carpeta no estándar
    const phpDir = path.join(tmpDir, 'neutralino', 'bin', 'php', '8.2.12', 'php-8.2.12');
    ensureDir(phpDir);
    fs.writeFileSync(path.join(phpDir, 'php.exe'), 'dummy');
    
    console.log('\n=== ESTRUCTURA CREADA ===');
    console.log('PHP instalado en:', phpDir);
    console.log('Archivo php.exe existe:', fs.existsSync(path.join(phpDir, 'php.exe')));

    // Simular lógica de getAvailableVersions del shim
    const baseRoots = [tmpDir, path.join(tmpDir, 'usr'), path.join(tmpDir, 'neutralino')];
    let allVersions = [];

    for (const root of baseRoots) {
      const binPath = path.join(root, 'bin', 'php');
      console.log('\n[SCAN] Buscando en:', binPath);
      if (fs.existsSync(binPath)) {
        const dirs = fs.readdirSync(binPath).filter(f => {
          const stat = fs.statSync(path.join(binPath, f));
          return stat.isDirectory();
        });
        console.log('[SCAN] Carpetas encontradas:', dirs);
        allVersions = [...allVersions, ...dirs];
      } else {
        console.log('[SCAN] No existe');
      }
    }

    console.log('\n=== VERSIONES DETECTADAS ===');
    console.log('allVersions:', allVersions);
    assert.ok(allVersions.includes('8.2.12'), 'No detectó carpeta 8.2.12');

    // Simular findExecutable del shim con búsqueda recursiva
    const findExe = (baseDir, exeName, maxDepth = 4) => {
      const dfs = (dir, depth) => {
        if (depth > maxDepth || !fs.existsSync(dir)) return null;
        
        const direct = path.join(dir, exeName);
        if (fs.existsSync(direct)) {
          console.log('[FIND] Encontrado directo:', direct);
          return direct;
        }
        
        const binCandidate = path.join(dir, 'bin', exeName);
        if (fs.existsSync(binCandidate)) {
          console.log('[FIND] Encontrado en bin:', binCandidate);
          return binCandidate;
        }
        
        try {
          const entries = fs.readdirSync(dir);
          for (const entry of entries) {
            const subPath = path.join(dir, entry);
            if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
              const found = dfs(subPath, depth + 1);
              if (found) return found;
            }
          }
        } catch (e) {
          console.log('[FIND] Error leyendo', dir, ':', e.message);
        }
        return null;
      };

      return dfs(baseDir, 0);
    };

    console.log('\n=== BÚSQUEDA DE php.exe ===');
    const phpBin = findExe(path.join(tmpDir, 'neutralino', 'bin', 'php', '8.2.12'), 'php.exe');
    console.log('Resultado:', phpBin);
    assert.ok(phpBin, 'No encontró php.exe con búsqueda recursiva');
  });

  it('simula instalación Apache y verifica comando de inicio', async () => {
    const apacheDir = path.join(tmpDir, 'neutralino', 'bin', 'apache', '2.4.58', 'Apache24');
    ensureDir(path.join(apacheDir, 'bin'));
    ensureDir(path.join(apacheDir, 'conf'));
    fs.writeFileSync(path.join(apacheDir, 'bin', 'httpd.exe'), 'dummy');
    fs.writeFileSync(path.join(apacheDir, 'conf', 'httpd.conf'), '# dummy config');

    console.log('\n=== ESTRUCTURA APACHE ===');
    console.log('Apache instalado en:', apacheDir);
    console.log('httpd.exe:', path.join(apacheDir, 'bin', 'httpd.exe'));
    console.log('httpd.conf:', path.join(apacheDir, 'conf', 'httpd.conf'));

    // Simular búsqueda
    const findExe = (baseDir, exeName, maxDepth = 4) => {
      const dfs = (dir, depth) => {
        if (depth > maxDepth || !fs.existsSync(dir)) return null;
        const direct = path.join(dir, exeName);
        if (fs.existsSync(direct)) return direct;
        const binCandidate = path.join(dir, 'bin', exeName);
        if (fs.existsSync(binCandidate)) return binCandidate;
        try {
          const entries = fs.readdirSync(dir);
          for (const entry of entries) {
            const subPath = path.join(dir, entry);
            if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
              const found = dfs(subPath, depth + 1);
              if (found) return found;
            }
          }
        } catch (e) {}
        return null;
      };
      return dfs(baseDir, 0);
    };

    const fullExe = findExe(path.join(tmpDir, 'neutralino', 'bin', 'apache', '2.4.58'), 'httpd.exe');
    console.log('\n=== httpd.exe ENCONTRADO ===');
    console.log('Ruta completa:', fullExe);
    assert.ok(fullExe, 'No encontró httpd.exe');

    // Calcular apacheRoot como lo hace el shim
    const exeDir = fullExe.replace(/\\[^\\]+$/, ''); // quitar httpd.exe
    const apacheRoot = exeDir.toLowerCase().endsWith('\\bin') ? exeDir.replace(/\\bin$/i, '') : exeDir;
    const conf = path.join(apacheRoot, 'conf', 'httpd.conf');

    console.log('\n=== COMANDO DE INICIO ===');
    console.log('exeDir:', exeDir);
    console.log('apacheRoot:', apacheRoot);
    console.log('conf:', conf);
    console.log('conf existe:', fs.existsSync(conf));

    const startCmd = `"${fullExe}" -f "${conf}" -d "${apacheRoot}"`;
    console.log('\nComando final:', startCmd);

    assert.ok(fs.existsSync(conf), 'httpd.conf no existe en la ruta calculada');
  });

  it('reproduce el flujo completo: instalar PHP, Apache y verificar dependencias', async () => {
    // PHP
    const phpDir = path.join(tmpDir, 'neutralino', 'bin', 'php', '8.2.12', 'php-8.2.12');
    ensureDir(phpDir);
    fs.writeFileSync(path.join(phpDir, 'php.exe'), 'dummy');

    // Apache
    const apacheDir = path.join(tmpDir, 'neutralino', 'bin', 'apache', '2.4.58', 'Apache24');
    ensureDir(path.join(apacheDir, 'bin'));
    ensureDir(path.join(apacheDir, 'conf'));
    fs.writeFileSync(path.join(apacheDir, 'bin', 'httpd.exe'), 'dummy');
    fs.writeFileSync(path.join(apacheDir, 'conf', 'httpd.conf'), '# config');

    // app.ini
    fs.writeFileSync(path.join(tmpDir, 'app.ini'), '[apache]\nversion=2.4.58\n[php]\nversion=8.2.12');

    console.log('\n=== ESTRUCTURA COMPLETA ===');
    console.log('tmpDir:', tmpDir);
    console.log('PHP:', path.join(phpDir, 'php.exe'), '→', fs.existsSync(path.join(phpDir, 'php.exe')));
    console.log('Apache:', path.join(apacheDir, 'bin', 'httpd.exe'), '→', fs.existsSync(path.join(apacheDir, 'bin', 'httpd.exe')));

    // Importar detector del backend
    const { detectServices, loadAppConfig } = await import('../electron/services-detector.js');
    const appConfig = loadAppConfig(tmpDir, () => {});
    const services = detectServices({
      appPath: tmpDir,
      userConfig: { projectsPath: path.join(tmpDir, 'www') },
      appConfig,
      log: console.log
    });

    const apache = services.find(s => s.type === 'apache');
    console.log('\n=== RESULTADO DETECTOR ===');
    console.log('Apache encontrado:', !!apache);
    if (apache) {
      console.log('- isInstalled:', apache.isInstalled);
      console.log('- version:', apache.version);
      console.log('- phpVersion:', apache.phpVersion);
      console.log('- dependenciesReady:', apache.dependenciesReady);
      console.log('- availableVersions:', apache.availableVersions);
      console.log('- availablePhpVersions:', apache.availablePhpVersions);
    }

    assert.ok(apache, 'Apache no detectado');
    assert.equal(apache.isInstalled, true, 'Apache no marcado como instalado');
    assert.equal(apache.dependenciesReady, true, 'dependenciesReady debería ser true con PHP presente');
  });
});
