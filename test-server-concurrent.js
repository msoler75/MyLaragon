// Test script para probar el servidor con concurrently
import { setTimeout } from 'timers/promises';

console.log('[TEST] Esperando a que el servidor esté listo...');
await setTimeout(3000);

console.log('[TEST] Probando /health...');
try {
  const healthRes = await fetch('http://localhost:5174/health');
  const healthData = await healthRes.json();
  console.log('[TEST] ✅ /health response:', healthData);
} catch (err) {
  console.error('[TEST] ❌ /health error:', err.message);
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
  process.exit(1);
}

console.log('[TEST] 🎉 Todas las pruebas pasaron!');
process.exit(0);
