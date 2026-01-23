import { test, describe } from 'vitest';
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "url";
import { createNodeFilesystemAdapter } from "../src/neutralino/lib/fs-adapter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Filesystem Adapter (Node.js)", () => {
  let fsAdapter;
  let tmpDir;

  test("before - crear adaptador y directorio temporal", async () => {
    fsAdapter = createNodeFilesystemAdapter();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "fs-adapter-test-"));
  });

  test("readFile debe leer contenido de archivos", async () => {
    const testFile = path.join(tmpDir, "test.txt");
    fs.writeFileSync(testFile, "contenido de prueba", "utf-8");
    
    const content = await fsAdapter.readFile(testFile);
    assert.strictEqual(content, "contenido de prueba");
  });

  test("writeFile debe escribir contenido en archivos", async () => {
    const testFile = path.join(tmpDir, "write-test.txt");
    
    await fsAdapter.writeFile(testFile, "nuevo contenido");
    
    const written = fs.readFileSync(testFile, "utf-8");
    assert.strictEqual(written, "nuevo contenido");
  });

  test("readDir debe listar archivos de un directorio", async () => {
    // Crear estructura
    fs.writeFileSync(path.join(tmpDir, "file1.txt"), "a");
    fs.writeFileSync(path.join(tmpDir, "file2.txt"), "b");
    fs.mkdirSync(path.join(tmpDir, "subdir"));
    
    const result = await fsAdapter.readDir(tmpDir);
    const entries = result.entries || result;
    const names = entries.map(entry => typeof entry === 'string' ? entry : entry.entry);
    
    assert.ok(Array.isArray(entries));
    assert.ok(names.includes("file1.txt"));
    assert.ok(names.includes("file2.txt"));
    assert.ok(names.includes("subdir"));
  });

  test("fileExists debe detectar archivos existentes", async () => {
    const existing = path.join(tmpDir, "exists.txt");
    const nonExisting = path.join(tmpDir, "no-exists.txt");
    
    fs.writeFileSync(existing, "hola");
    
    assert.strictEqual(await fsAdapter.fileExists(existing), true);
    assert.strictEqual(await fsAdapter.fileExists(nonExisting), false);
  });

  test("execCommand debe ejecutar comandos y devolver salida", async () => {
    const result = await fsAdapter.execCommand("echo hola");
    
    assert.ok(result.stdOut.includes("hola"));
    assert.strictEqual(result.exitCode, 0);
  });

  test("execCommand debe capturar errores de comandos", async () => {
    const result = await fsAdapter.execCommand("comando-inexistente-xyz");
    
    assert.notStrictEqual(result.exitCode, 0);
  });

  test("after - limpiar directorio temporal", () => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
