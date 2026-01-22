/**
 * Test rápido del servidor API
 */
import fs from 'fs/promises';

console.log('Testing nodeAdapter...');

const nodeAdapter = {
  async readFile(filePath) {
    return await fs.readFile(filePath, 'utf-8');
  },
  async readDir(dirPath) {
    console.log('readDir called with:', dirPath);
    const entries = await fs.readdir(dirPath);
    console.log('fs.readdir returned:', entries.length, 'items');
    const result = [];
    for (const name of entries) {
      const fullPath = dirPath + '\\' + name;
      const stats = await fs.stat(fullPath);
      result.push({ entry: name, type: stats.isDirectory() ? 'DIRECTORY' : 'FILE' });
    }
    console.log('Final result:', result.length, 'items');
    return { entries: result };
  },
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return { exists: true };
    } catch {
      return { exists: false };
    }
  }
};

// Test readDir
const testPath = 'C:\\Users\\msole\\Documents\\Proyectos\\MyLaragon\\neutralino\\bin\\php';
console.log('\nTesting readDir with:', testPath);

try {
  const result = await nodeAdapter.readDir(testPath);
  console.log('SUCCESS! Result:', JSON.stringify(result, null, 2));
} catch (err) {
  console.error('ERROR:', err.message);
  console.error('Stack:', err.stack);
}

// Test fileExists
console.log('\nTesting fileExists...');
try {
  const exists = await nodeAdapter.fileExists(testPath);
  console.log('EXISTS result:', exists);
} catch (err) {
  console.error('ERROR:', err.message);
}
