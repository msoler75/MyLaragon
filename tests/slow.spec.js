import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const runSlow = process.env.RUN_SLOW === '1';
const slowDescribe = runSlow ? describe : describe.skip;

const basePath = process.env.APP_PATH || process.env.APP_PATH;

function findInBin(serviceFolder, exeName, maxDepth = 4) {
  if (!basePath) return null;
  const bases = [
    path.join(basePath, 'bin', serviceFolder),
    path.join(basePath, 'usr', 'bin', serviceFolder),
    path.join(basePath, 'neutralino', 'bin', serviceFolder)
  ];

  const dfs = (dir, depth) => {
    if (depth > maxDepth) return null;
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return null;
    const direct = path.join(dir, exeName);
    if (fs.existsSync(direct)) return direct;
    const binCandidate = path.join(dir, 'bin', exeName);
    if (fs.existsSync(binCandidate)) return binCandidate;
    for (const entry of fs.readdirSync(dir)) {
      const next = path.join(dir, entry);
      if (fs.statSync(next).isDirectory()) {
        const found = dfs(next, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };

  for (const base of bases) {
    const found = dfs(base, 0);
    if (found) return found;
  }
  return null;
}

function findExe(name) {
  try {
    const out = execFileSync('where', [name], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const line = out.split(/\r?\n/).find(Boolean);
    return line ? line.trim() : null;
  } catch {
    return null;
  }
}

const httpdPath = findInBin('apache', 'httpd.exe') || findExe('httpd');
const phpPath = findInBin('php', 'php.exe') || findExe('php');

slowDescribe('Slow integration (binarios reales si están instalados)', () => {
  if (!phpPath && !httpdPath) {
    // Nada disponible; marcar suite como omitida
    it.skip('No hay php/httpd en PATH; omitiendo suite lenta');
    return;
  }

  if (phpPath) {
    it('ejecuta php -v y obtiene versión', () => {
      const out = execFileSync(phpPath, ['-v'], { encoding: 'utf-8' });
      assert.ok(/php\s+\d+\.\d+/.test(out.toLowerCase()), 'php -v no devolvió versión');
    });
  }

  if (httpdPath) {
    it('ejecuta httpd -v y obtiene versión', () => {
      const out = execFileSync(httpdPath, ['-v'], { encoding: 'utf-8' });
      assert.ok(/apache\/\d+/i.test(out), 'httpd -v no devolvió versión');
    });
  }
});
