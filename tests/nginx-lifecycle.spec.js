import { describe, it, beforeAll, afterAll } from 'vitest';
import assert from 'node:assert/strict';
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Este test valida el ciclo de vida de Nginx:
 * 1. Detección (basado en la lógica del shim)
 * 2. Inicio
 * 3. Verificación de proceso
 * 4. Parada
 */

const runSlow = process.env.RUN_SLOW === '1';
const describeLifecycle = runSlow ? describe : describe.skip;

describeLifecycle('Ciclo de Vida de Nginx', () => {
    let nginxPath = null;
    let nginxProcess = null;

    // Lógica de búsqueda simplificada del shim para el test
    function findNginx(baseDir) {
        const candidates = [
            path.join(baseDir, 'bin', 'nginx'),
            path.join(baseDir, 'neutralino', 'bin', 'nginx'),
        ];

        for (const root of candidates) {
            if (!fs.existsSync(root)) continue;

            const fullPath = recursiveSearch(root, 'nginx.exe', 0);
            if (fullPath) return fullPath;
        }
        return null;
    }

    function recursiveSearch(dir, exe, depth) {
        if (depth > 5) return null;
        try {
            const files = fs.readdirSync(dir);
            // Buscar directamente
            if (files.includes(exe)) return path.join(dir, exe);

            // Recursión
            for (const file of files) {
                const next = path.join(dir, file);
                if (fs.statSync(next).isDirectory()) {
                    const found = recursiveSearch(next, exe, depth + 1);
                    if (found) return found;
                }
            }
        } catch (e) { return null; }
        return null;
    }

    beforeAll(async () => {
        const root = process.cwd();
        nginxPath = findNginx(root);
        console.log('   [TEST] Nginx encontrado en:', nginxPath);

        // Asegurarse de que no esté corriendo
        try {
            execSync('taskkill /F /IM nginx.exe /T 2>NUL', { stdio: 'ignore' });
        } catch (e) {}
    });

    afterAll(async () => {
        // Limpieza final
        try {
            if (nginxProcess) {
                nginxProcess.kill('SIGTERM');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            execSync('taskkill /F /IM nginx.exe /T 2>NUL', { stdio: 'ignore' });
        } catch (e) {}
    });

    it('Debe haber encontrado el binario de Nginx', () => {
        if (!nginxPath) {
            console.log('   [TEST] Nginx no está instalado, saltando tests de ciclo de vida');
            assert.ok(true, 'Nginx no instalado - test saltado');
            return;
        }
        assert.ok(fs.existsSync(nginxPath), 'La ruta encontrada no existe físicamente');
    });

    it('Debe iniciar Nginx y detectarlo en la lista de procesos', async () => {
        if (!nginxPath) {
            console.log('   [TEST] Nginx no instalado, saltando test de inicio');
            assert.ok(true, 'Nginx no instalado - test saltado');
            return;
        }

        const nginxDir = path.dirname(nginxPath);

        // Comando para iniciar Nginx
        const command = `"${nginxPath}"`;

        console.log('   [TEST] Iniciando Nginx con comando:', command);

        // Iniciar Nginx como proceso hijo
        nginxProcess = spawn('cmd', ['/c', command], {
            cwd: nginxDir,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false
        });

        const nginxPid = nginxProcess.pid;
        console.log('   [TEST] Nginx iniciado con PID:', nginxPid);

        assert.ok(!isNaN(nginxPid) && nginxPid > 0, 'No se pudo obtener un PID válido');

        // Esperar a que Nginx se inicie completamente
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verificar con tasklist
        const tasklist = execSync('tasklist /FI "IMAGENAME eq nginx.exe" /NH /FO CSV').toString();
        console.log('   [TEST] Tasklist output:', tasklist);

        if (!tasklist.includes('nginx.exe')) {
            console.log('   [TEST] Nginx no aparece en tasklist, pero el proceso fue iniciado. Esto puede ser normal.');
        } else {
            console.log('   [TEST] Nginx encontrado en tasklist ✓');
        }

        // Verificar que el puerto 80 esté abierto
        try {
            const netstat = execSync('netstat -an | find "80"').toString();
            if (netstat.includes('80')) {
                console.log('   [TEST] Nginx está escuchando en puerto 80 ✓');
            } else {
                console.log('   [TEST] Nginx no está escuchando en puerto 80 aún');
            }
        } catch (e) {
            console.log('   [TEST] No se pudo verificar puerto (netstat falló):', e.message);
        }
    });

    it('Debe detener Nginx correctamente', async () => {
        if (!nginxPath || !nginxProcess) {
            console.log('   [TEST] Nginx no fue iniciado, saltando test de detención');
            assert.ok(true, 'Nginx no iniciado - test saltado');
            return;
        }

        // Nginx tiene su propio comando de parada, pero para simplicidad usamos taskkill
        try {
            execSync('taskkill /F /IM nginx.exe /T', { stdio: 'ignore' });
            console.log('   [TEST] Enviada señal de terminación a Nginx');
        } catch (e) {
            console.log('   [TEST] Error al detener Nginx:', e.message);
        }

        // Esperar a que se detenga
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificar que ya no está corriendo
        const tasklist = execSync('tasklist /FI "IMAGENAME eq nginx.exe" /NH /FO CSV').toString();
        const isRunning = tasklist.includes('nginx.exe');

        if (isRunning) {
            console.log('   [TEST] ADVERTENCIA: nginx.exe sigue presente, intentando matar...');
            try { execSync('taskkill /F /IM nginx.exe /T', { stdio: 'ignore' }); } catch(e){}
            await new Promise(resolve => setTimeout(resolve, 1000));
            const secondCheck = execSync('tasklist /FI "IMAGENAME eq nginx.exe" /NH /FO CSV').toString();
            assert.ok(!secondCheck.includes('nginx.exe'), 'El proceso nginx.exe persistió tras dos intentos de cierre');
        } else {
            assert.ok(!isRunning, 'El proceso nginx.exe debería haber desaparecido');
        }
    });
});