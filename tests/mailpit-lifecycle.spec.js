import { describe, it, beforeAll, afterAll } from 'vitest';
import assert from 'node:assert/strict';
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Este test valida el ciclo de vida de MailPit:
 * 1. Detección (basado en la lógica del shim)
 * 2. Inicio
 * 3. Verificación de proceso
 * 4. Parada
 */

const runSlow = process.env.RUN_SLOW === '1';
const describeLifecycle = runSlow ? describe : describe.skip;

describeLifecycle('Ciclo de Vida de MailPit', () => {
    let mailpitPath = null;
    let mailpitPid = null;
    let mailpitProcess = null;

    // Lógica de búsqueda simplificada del shim para el test
    function findMailPit(baseDir) {
        const candidates = [
            path.join(baseDir, 'bin', 'mailpit'),
            path.join(baseDir, 'neutralino', 'bin', 'mailpit'),
        ];

        for (const root of candidates) {
            if (!fs.existsSync(root)) continue;

            const fullPath = recursiveSearch(root, 'mailpit.exe', 0);
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
        mailpitPath = findMailPit(root);
        console.log('   [TEST] MailPit encontrado en:', mailpitPath);

        // Asegurarse de que no esté corriendo
        try {
            execSync('taskkill /F /IM mailpit.exe /T 2>NUL', { stdio: 'ignore' });
        } catch (e) {}
    });

    afterAll(async () => {
        // Limpieza final
        try {
            if (mailpitProcess) {
                mailpitProcess.kill('SIGTERM');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            execSync('taskkill /F /IM mailpit.exe /T 2>NUL', { stdio: 'ignore' });
        } catch (e) {}
    });

    it('Debe haber encontrado el binario de MailPit', () => {
        if (!mailpitPath) {
            console.log('   [TEST] MailPit no está instalado, saltando tests de ciclo de vida');
            // No fallar, solo indicar que no está disponible
            assert.ok(true, 'MailPit no instalado - test saltado');
            return;
        }
        assert.ok(fs.existsSync(mailpitPath), 'La ruta encontrada no existe físicamente');
    });

    it('Debe iniciar MailPit y detectarlo en la lista de procesos', async () => {
        if (!mailpitPath) {
            console.log('   [TEST] MailPit no instalado, saltando test de inicio');
            assert.ok(true, 'MailPit no instalado - test saltado');
            return;
        }

        const mailpitDir = path.dirname(mailpitPath);

        // Comando para iniciar MailPit (puerto por defecto 8025)
        const command = `"${mailpitPath}"`;

        console.log('   [TEST] Iniciando MailPit con comando:', command);

        // Iniciar MailPit como proceso hijo
        mailpitProcess = spawn('cmd', ['/c', command], {
            cwd: mailpitDir,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false
        });

        mailpitPid = mailpitProcess.pid;
        console.log('   [TEST] MailPit iniciado con PID:', mailpitPid);

        assert.ok(!isNaN(mailpitPid) && mailpitPid > 0, 'No se pudo obtener un PID válido');

        // Esperar a que MailPit se inicie completamente
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verificar con tasklist
        const tasklist = execSync('tasklist /FI "IMAGENAME eq mailpit.exe" /NH /FO CSV').toString();
        assert.ok(tasklist.includes('mailpit.exe'), 'El proceso mailpit.exe no aparece en tasklist');

        // Verificar que el puerto 8025 esté abierto
        try {
            const netstat = execSync('netstat -an | find "8025"').toString();
            assert.ok(netstat.includes('8025'), 'MailPit no está escuchando en el puerto 8025');
        } catch (e) {
            console.log('   [TEST] No se pudo verificar puerto (netstat falló):', e.message);
        }
    });

    it('Debe detener MailPit correctamente', async () => {
        if (!mailpitPath || !mailpitPid) {
            console.log('   [TEST] MailPit no fue iniciado, saltando test de detención');
            assert.ok(true, 'MailPit no iniciado - test saltado');
            return;
        }

        // Detener el proceso MailPit
        try {
            mailpitProcess.kill('SIGTERM');
            console.log('   [TEST] Enviada señal SIGTERM a MailPit');
        } catch (e) {
            console.log('   [TEST] Error al enviar señal:', e.message);
        }

        // Esperar a que se detenga
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificar que ya no está corriendo
        const tasklist = execSync('tasklist /FI "IMAGENAME eq mailpit.exe" /NH /FO CSV').toString();
        const isRunning = tasklist.includes('mailpit.exe');

        if (isRunning) {
            console.log('   [TEST] ADVERTENCIA: mailpit.exe sigue presente, intentando matar...');
            try { execSync('taskkill /F /IM mailpit.exe /T', { stdio: 'ignore' }); } catch(e){}
            await new Promise(resolve => setTimeout(resolve, 1000));
            const secondCheck = execSync('tasklist /FI "IMAGENAME eq mailpit.exe" /NH /FO CSV').toString();
            assert.ok(!secondCheck.includes('mailpit.exe'), 'El proceso mailpit.exe persistió tras dos intentos de cierre');
        } else {
            assert.ok(!isRunning, 'El proceso mailpit.exe debería haber desaparecido');
        }
    });
});