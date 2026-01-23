// Test script para probar el servidor con concurrently
import { setTimeout } from 'timers/promises';
import { spawn } from 'child_process';

console.log('[TEST] Iniciando servidor...');
const server = spawn('node', ['src/api/dev-server.js'], { stdio: 'inherit' });

console.log('[TEST] Esperando a que el servidor esté listo...');
const maxWait = 10000; // 10 segundos
const interval = 500; // 0.5 segundos
let waited = 0;
let serverReady = false;

while (waited < maxWait && !serverReady) {
  try {
    const res = await fetch('http://localhost:5174/health');
    if (res.ok) {
      serverReady = true;
      console.log('[TEST] ✅ Servidor listo después de', waited, 'ms');
    }
  } catch (err) {
    // Ignorar errores, seguir intentando
  }
  if (!serverReady) {
    await setTimeout(interval);
    waited += interval;
  }
}

if (!serverReady) {
  console.error('[TEST] ❌ Servidor no respondió en', maxWait, 'ms');
  server.kill();
  process.exit(1);
}

console.log('[TEST] Probando /health...');
try {
  const healthRes = await fetch('http://localhost:5174/health');
  const healthData = await healthRes.json();
  console.log('[TEST] ✅ /health response:', healthData);
} catch (err) {
  console.error('[TEST] ❌ /health error:', err.message);
  server.kill();
  process.exit(1);
}

console.log('[TEST] Probando /api/read-dir...');
try {
  const readDirRes = await fetch('http://localhost:5174/api/read-dir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: 'C:/Users/msole/Documents/Proyectos/MyLaragon/neutralino/bin/php' })
  });
  const readDirData = await readDirRes.json();
  console.log('[TEST] ✅ /api/read-dir response:', readDirData);
  console.log('[TEST] Encontradas', readDirData.entries?.length || 0, 'versiones de PHP');
} catch (err) {
  console.error('[TEST] ❌ /api/read-dir error:', err.message);
  server.kill();
  process.exit(1);
}

console.log('[TEST] Probando /api/file-exists...');
try {
  const existsRes = await fetch('http://localhost:5174/api/file-exists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: 'C:/Users/msole/Documents/Proyectos/MyLaragon/neutralino/bin/php/8.3.29 (NTS)/php.exe' })
  });
  const existsData = await existsRes.json();
  console.log('[TEST] ✅ /api/file-exists response:', existsData);
} catch (err) {
  console.error('[TEST] ❌ /api/file-exists error:', err.message);
  server.kill();
  process.exit(1);
}

console.log('[TEST] 🎉 Todas las pruebas pasaron!');
server.kill();
process.exit(0);
