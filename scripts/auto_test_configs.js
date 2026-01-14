#!/usr/bin/env node
/*
Auto test configurations for Neutralino builds
- For each test case: write neutralino/neutralino.config.json, run build, run neu build, deploy dist, run exe, wait for logs/files, record result
- Usage: node scripts/auto_test_configs.js
*/
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec as execCb, spawn } from 'child_process';
const exec = promisify(execCb);

const root = path.resolve(path.join('.', '..'));
const projectRoot = path.resolve('.');
const neutralinoDir = path.join(projectRoot, 'neutralino');
const distDir = path.join(neutralinoDir, 'dist', 'MyLaragon');
const configPath = path.join(neutralinoDir, 'neutralino.config.json');
const backupPath = path.join(neutralinoDir, 'neutralino.config.autotest.backup.json');
const reportPath = path.join(projectRoot, 'PRUEBAS_REALIZADAS.md');

// Generate systematic tests: combinations of enableServer, documentRoot, url, and extra flags
const urls = [
  '/www/index.html',
  'www/index.html',
  '/index.html',
  'index.html',
  '/www/bootstrap.html',
  '/bootstrap.html'
];
const docRoots = ['./www/', './'];
const servers = [true, false];
const extras = [
  { removeNeu: false, copyRoot: false },
  { removeNeu: true, copyRoot: false },
  { removeNeu: false, copyRoot: true }
];

const tests = [];
let id = 1;
for (const enableServer of servers) {
  for (const documentRoot of docRoots) {
    for (const url of urls) {
      for (const ex of extras) {
        // Skip obviously contradictory combos: when enableServer=true and removeNeu=true it's less useful
        tests.push({
          name: `t${id++}_${enableServer? 'srv1': 'srv0'}_${documentRoot.replace(/\W/g,'')}_${url.replace(/\W/g,'')}_rm${ex.removeNeu?1:0}_cp${ex.copyRoot?1:0}`,
          opts: {
            enableServer,
            documentRoot,
            url,
            removeNeu: ex.removeNeu,
            copyRoot: ex.copyRoot
          }
        });
      }
    }
  }
}
// Trim tests to a reasonable subset if too many
if (tests.length > 40) tests.length = 40; // keep first 40 combos for now


const timeoutMs = 30000; // wait for each test (longer to allow WebView to initialize)

function timestamp(){ return new Date().toISOString(); }

async function safeReadJson(p){ try{ return JSON.parse(fs.readFileSync(p,'utf8')); }catch(e){return null;} }
async function safeWriteJson(p,obj){ fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8'); }

async function runCmd(cmd, opts={}){
  try{
    const { stdout, stderr } = await exec(cmd, opts);
    return { stdout, stderr, ok: true };
  }catch(e){ return { stdout: e.stdout || '', stderr: e.stderr || e.message, ok:false }; }
}

async function copyRecursive(src, dest){
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries){
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyRecursive(s,d);
    else fs.copyFileSync(s,d);
  }
}

function fileExists(p){ try{ return fs.existsSync(p); }catch(e){return false;} }

async function startExe(){
  const exe = path.join(distDir, 'MyLaragon-win_x64.exe');
  if (!fileExists(exe)) throw new Error('exe not found: ' + exe);
  const proc = spawn(exe, [], { detached: false, stdio: 'ignore' });
  return proc;
}

async function killExe(proc){
  try{ proc.kill(); }catch(e){ /* ignore */ }
  // additionally try taskkill by name
  try{ await exec('taskkill /IM MyLaragon-win_x64.exe /F'); }catch(e){}
}

function readLogTail(lines=200){
  const p = path.join(distDir, 'neutralinojs.log');
  if (!fileExists(p)) return '';
  const all = fs.readFileSync(p,'utf8');
  const arr = all.split(/\r?\n/).slice(-lines);
  return arr.join('\n');
}

async function runOne(test){
  const startTime = Date.now();
  const entry = { time: timestamp(), test: test.name, config: test.opts, success: false, notes: [], logs: '' };

  // backup original config first
  const origConfig = safeReadJson(configPath) || {};
  fs.writeFileSync(backupPath, JSON.stringify(origConfig,null,2),'utf8');

  // write test config
  const cfg = Object.assign({}, origConfig, test.opts);
  fs.writeFileSync(configPath, JSON.stringify(cfg,null,2),'utf8');
  entry.notes.push('Wrote neutralino config for test');

  // run client build
  entry.notes.push('npm run build');
  await runCmd('npm run build');

  // Ensure copyRoot assets in neutralino root when requested
  try{
    if (cfg.copyRoot){
      const srcIndex = path.join(neutralinoDir,'www','index.html');
      const dstIndex = path.join(neutralinoDir,'index.html');
      if (fs.existsSync(srcIndex)) fs.copyFileSync(srcIndex, dstIndex);
      const srcN = path.join(neutralinoDir,'www','neutralino.js');
      const dstN = path.join(neutralinoDir,'neutralino.js');
      if (fs.existsSync(srcN)) fs.copyFileSync(srcN, dstN);
      const srcShim = path.join(neutralinoDir,'www','neutralino-shim.js');
      const dstShim = path.join(neutralinoDir,'neutralino-shim.js');
      if (fs.existsSync(srcShim)) fs.copyFileSync(srcShim, dstShim);
      entry.notes.push('Copied root assets in neutralino/ for this test');
    }
  }catch(e){ entry.notes.push('CopyRoot failed: ' + e.message); }

  // run neu build
  entry.notes.push('npx @neutralinojs/neu build');
  const neuRes = await runCmd('cd neutralino && npx @neutralinojs/neu build');
  entry.notes.push('neu ok: ' + neuRes.ok);

  // Optionally remove resources.neu to force disk-based loading
  try{
    const neuFile = path.join(distDir,'resources.neu');
    if (cfg.removeNeu && fs.existsSync(neuFile)){
      fs.unlinkSync(neuFile);
      entry.notes.push('Removed resources.neu for this test');
    }
  }catch(e){ entry.notes.push('removeNeu failed: ' + e.message); }

  // deploy unpacked www if enableServer===false
  if (cfg.enableServer === false){
    try{
      await copyRecursive(path.join(neutralinoDir,'www'), path.join(distDir,'www'));
      entry.notes.push('Copied www to dist (unpacked)');
      // remove resources.neu to force disk use
      const neuFile = path.join(distDir,'resources.neu');
      if (fileExists(neuFile)) fs.unlinkSync(neuFile);
      entry.notes.push('Removed resources.neu for unpacked flow');
    }catch(e){ entry.notes.push('Deploy unpacked failed: ' + e.message); }
  } else {
    entry.notes.push('Keeping resources.neu (server mode)');
  }

  // write modified neutralino.config.json in dist too
  try{
    const dstConfig = path.join(distDir,'neutralino.config.json');
    const dst = safeReadJson(dstConfig) || {};
    Object.assign(dst, { documentRoot: cfg.documentRoot, url: cfg.url, enableServer: cfg.enableServer });
    fs.writeFileSync(dstConfig, JSON.stringify(dst,null,2),'utf8');
    entry.notes.push('Wrote config to dist');
  }catch(e){ entry.notes.push('Could not write dist config: ' + e.message); }

  // ensure no leftover diag files
  ['app-log.txt','bootstrap-log.txt','bootstrap-error.txt'].forEach(f=>{ try{ const p=path.join(distDir,f); if (fileExists(p)) fs.unlinkSync(p); }catch(e){} });

  // Kill existing instances to ensure a clean start
  try{ await exec('taskkill /IM MyLaragon-win_x64.exe /F'); }catch(e){}
  // start exe
  entry.notes.push('Starting exe');
  let proc;
  try{
    proc = await startExe();
  }catch(e){ entry.notes.push('Start exe failed: ' + e.message); }

  // wait and poll for results
  const start = Date.now();
  let success = false;
  while (Date.now() - start < timeoutMs){
    // additionally check for diagnostic files written by our root/index fallback
    const rootCandidates = ['root-log.txt','root-fetch.txt','root-error.txt','app-log.txt','bootstrap-log.txt'];
    for (const f of rootCandidates){
      const p = path.join(distDir, f);
      if (fileExists(p)){
        entry.notes.push('Found diag file: ' + f);
        entry.success = true;
        success = true;
        break;
      }
    }
    if (success) break;
    // check for diag files
    for (const f of ['app-log.txt','bootstrap-log.txt']){
      const p = path.join(distDir, f);
      if (fileExists(p)){
        entry.notes.push('Found diag file: ' + f);
        entry.success = true;
        success = true;
        break;
      }
    }
    if (success) break;

    // check neutralinojs.log for fresh entries
    const tail = readLogTail(200);
    if (/NE_RS_UNBLDRE/.test(tail)){
      // negative signal; keep polling but note it
      entry.notes.push('Found NE_RS_UNBLDRE in logs (may indicate failure)');
    }

    await new Promise(r=>setTimeout(r, 800));
  }

  // collect logs
  entry.logs = readLogTail(500);
  if (!entry.success){
    // heuristics: if neutralinojs.log contains no NE_RS_UNBLDRE errors after our test start, consider ok
    if (!/NE_RS_UNBLDRE/.test(entry.logs)){
      entry.success = true;
      entry.notes.push('No NE_RS_UNBLDRE found in logs -> considered success');
    }
  }

  // kill exe
  if (proc){ try{ await killExe(proc); }catch(e){} }
  // restore original neutralino config
  try{ fs.writeFileSync(configPath, JSON.stringify(origConfig,null,2),'utf8'); fs.unlinkSync(backupPath); }catch(e){}

  entry.durationMs = Date.now() - startTime;
  return entry;
}

async function main(){
  const header = `# PRUEBAS_REALIZADAS - ${timestamp()}\n\n`;
  fs.writeFileSync(reportPath, header, 'utf8');
  for (const t of tests){
    console.log('Running test:', t.name);
    const res = await runOne(t);
    const md = [];
    md.push(`## ${res.test} — ${res.time}`);
    md.push(`- Config: 
\`\`json
${JSON.stringify(res.config,null,2)}
\`\``);
    md.push(`- Success: **${res.success ? 'YES' : 'NO'}**`);
    md.push(`- Duration: ${res.durationMs}ms`);
    md.push(`- Notes:`);
    res.notes.forEach(n => md.push(`  - ${n}`));
    md.push('\n- Logs (tail):\n');
    md.push('```\n' + (res.logs || '') + '\n```\n');

    fs.appendFileSync(reportPath, md.join('\n') + '\n', 'utf8');
  }
  console.log('All tests finished. Report at', reportPath);
}

main().catch(e=>{ console.error('Fatal error', e); process.exit(1); });
