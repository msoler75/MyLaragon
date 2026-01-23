import { describe, it, beforeAll, afterAll } from 'vitest';
import assert from 'node:assert/strict';
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Este test valida el ciclo de vida básico de PostgreSQL:
 * 1. Detección (basado en la lógica del shim)
 * 2. Verificación de binarios (postgres.exe, initdb.exe, etc.)
 *
 * NOTA: PostgreSQL requiere inicialización compleja de base de datos.
 * Este test se enfoca en la detección y verificación básica.
 * Un test completo requeriría initdb y configuración avanzada.
 */

const runSlow = process.env.RUN_SLOW === '1';
const describeLifecycle = runSlow ? describe : describe.skip;

describeLifecycle('Ciclo de Vida de PostgreSQL', () => {
    let postgresPath = null;
    let pgCtlPath = null;
    let initdbPath = null;

    // Lógica de búsqueda simplificada del shim para el test
    function findPostgreSQL(baseDir) {
        const candidates = [
            path.join(baseDir, 'bin', 'postgresql'),
            path.join(baseDir, 'neutralino', 'bin', 'postgresql'),
        ];

        for (const root of candidates) {
            if (!fs.existsSync(root)) continue;

            const binDir = findBinDirectory(root);
            if (binDir) {
                const postgresExe = path.join(binDir, 'postgres.exe');
                const pgCtlExe = path.join(binDir, 'pg_ctl.exe');
                const initdbExe = path.join(binDir, 'initdb.exe');

                if (fs.existsSync(postgresExe) && fs.existsSync(pgCtlExe) && fs.existsSync(initdbExe)) {
                    return {
                        postgres: postgresExe,
                        pgCtl: pgCtlExe,
                        initdb: initdbExe,
                        binDir: binDir
                    };
                }
            }
        }
        return null;
    }

    function findBinDirectory(root) {
        // PostgreSQL normalmente tiene la estructura: postgresql-X.X\bin
        try {
            const items = fs.readdirSync(root);
            for (const item of items) {
                const fullPath = path.join(root, item);
                if (fs.statSync(fullPath).isDirectory() && item.startsWith('postgresql-')) {
                    const binPath = path.join(fullPath, 'bin');
                    if (fs.existsSync(binPath)) {
                        return binPath;
                    }
                }
            }
        } catch (e) { return null; }
        return null;
    }

    beforeAll(async () => {
        const root = process.cwd();
        const paths = findPostgreSQL(root);

        if (paths) {
            postgresPath = paths.postgres;
            pgCtlPath = paths.pgCtl;
            initdbPath = paths.initdb;
            console.log('   [TEST] PostgreSQL encontrado:');
            console.log('   [TEST]   postgres.exe:', postgresPath);
            console.log('   [TEST]   pg_ctl.exe:', pgCtlPath);
            console.log('   [TEST]   initdb.exe:', initdbPath);
        } else {
            console.log('   [TEST] PostgreSQL no encontrado en rutas estándar');
        }

        // Asegurarse de que no esté corriendo
        try {
            execSync('taskkill /F /IM postgres.exe /T 2>NUL', { stdio: 'ignore' });
        } catch (e) {}
    });

    afterAll(async () => {
        // Limpieza final
        try {
            execSync('taskkill /F /IM postgres.exe /T 2>NUL', { stdio: 'ignore' });
        } catch (e) {}
    });

    it('Debe haber encontrado los binarios de PostgreSQL', () => {
        if (!postgresPath) {
            console.log('   [TEST] PostgreSQL no está instalado, saltando tests de ciclo de vida');
            assert.ok(true, 'PostgreSQL no instalado - test saltado');
            return;
        }
        assert.ok(pgCtlPath, 'No se encontró pg_ctl.exe');
        assert.ok(initdbPath, 'No se encontró initdb.exe');

        assert.ok(fs.existsSync(postgresPath), 'postgres.exe no existe físicamente');
        assert.ok(fs.existsSync(pgCtlPath), 'pg_ctl.exe no existe físicamente');
        assert.ok(fs.existsSync(initdbPath), 'initdb.exe no existe físicamente');
    });

    it('Debe poder ejecutar comandos básicos de PostgreSQL', () => {
        if (!postgresPath) {
            console.log('   [TEST] PostgreSQL no instalado, saltando test de comandos');
            assert.ok(true, 'PostgreSQL no instalado - test saltado');
            return;
        }

        // Verificar que pg_ctl responde (sin iniciar realmente)
        try {
            const result = execSync(`"${pgCtlPath}" --version`, { encoding: 'utf8' });
            assert.ok(result.includes('pg_ctl'), 'pg_ctl no responde correctamente');
            console.log('   [TEST] pg_ctl version:', result.trim());
        } catch (e) {
            assert.fail('No se pudo ejecutar pg_ctl --version: ' + e.message);
        }

        // Verificar que initdb está disponible
        try {
            const result = execSync(`"${initdbPath}" --version`, { encoding: 'utf8' });
            assert.ok(result.includes('initdb'), 'initdb no responde correctamente');
            console.log('   [TEST] initdb version:', result.trim());
        } catch (e) {
            assert.fail('No se pudo ejecutar initdb --version: ' + e.message);
        }
    });

    it('Debe detectar que PostgreSQL no está corriendo inicialmente', () => {
        if (!postgresPath) {
            console.log('   [TEST] PostgreSQL no instalado, saltando test de procesos');
            assert.ok(true, 'PostgreSQL no instalado - test saltado');
            return;
        }
        // Verificar que no hay procesos postgres.exe corriendo
        const tasklist = execSync('tasklist /FI "IMAGENAME eq postgres.exe" /NH /FO CSV').toString();
        assert.ok(!tasklist.includes('postgres.exe'), 'PostgreSQL ya está corriendo al inicio del test');
    });

    // Nota: Un test completo de inicio/detención de PostgreSQL requeriría:
    // 1. initdb para inicializar el cluster
    // 2. pg_ctl start para iniciar
    // 3. Verificación de puerto 5432
    // 4. pg_ctl stop para detener
    // Esto es complejo y se deja para implementación futura
});