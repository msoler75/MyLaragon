/**
 * Test debug para entender por qué getAvailableVersions devuelve []
 */

import { getAvailableVersions } from './src/neutralino/lib/services-detector.js';
import { createNodeFilesystemAdapter } from './src/neutralino/lib/fs-adapter.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname);

console.log('[DEBUG] ROOT:', ROOT);
console.log('[DEBUG] Expected PHP path:', path.join(ROOT, 'neutralino', 'bin', 'php'));

const fsAdapter = createNodeFilesystemAdapter();

// Test 1: usando ROOT completo
console.log('\n=== Test 1: usando ROOT ===');
let versions = await getAvailableVersions(fsAdapter, ROOT, 'php');
console.log('Versiones encontradas:', versions);

// Test 2: usando '.' (relativo)
console.log('\n=== Test 2: usando "." ===');
versions = await getAvailableVersions(fsAdapter, '.', 'php');
console.log('Versiones encontradas:', versions);

// Test 3: usando 'neutralino'
console.log('\n=== Test 3: usando "neutralino" ===');
versions = await getAvailableVersions(fsAdapter, 'neutralino', 'php');
console.log('Versiones encontradas:', versions);

// Test 4: verificar readDir directamente
console.log('\n=== Test 4: readDir directo ===');
const phpPath = path.join(ROOT, 'neutralino', 'bin', 'php');
console.log('Leyendo:', phpPath);
const result = await fsAdapter.readDir(phpPath);
console.log('Resultado tipo:', typeof result);
console.log('Tiene entries?:', result.hasOwnProperty('entries'));
console.log('Es array?:', Array.isArray(result));
if (result.entries) {
  console.log('result.entries.length:', result.entries.length);
  console.log('Primeras 3 entradas:', result.entries.slice(0, 3));
} else {
  console.log('result.length:', result.length);
  console.log('Primeras 3 entradas:', result.slice(0, 3));
}
