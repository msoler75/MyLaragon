import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Este test valida el ciclo de vida de Apache:
 * 1. Detección (basado en la lógica del shim)
 * 2. Inicio
 * 3. Verificación de proceso
 * 4. Parada
 */

const runSlow = process.env.RUN_SLOW === '1';
const describeLifecycle = runSlow ? describe : describe.skip;

describeLifecycle('Ciclo de Vida de Apache', () => {
    let apachePath = null;
    let apachePid = null;

    // Lógica de búsqueda simplificada del shim para el test
    function findApache(baseDir) {
        const candidates = [
            path.join(baseDir, 'bin', 'apache'),
            path.join(baseDir, 'neutralino', 'bin', 'apache'),
        ];

        for (const root of candidates) {
            if (!fs.existsSync(root)) continue;

            const fullPath = recursiveSearch(root, 'httpd.exe', 0);
            if (fullPath) return fullPath;
        }
        return null;
    }

    function recursiveSearch(dir, exe, depth) {
        if (depth > 5) return null;
        try {
            const files = fs.readdirSync(dir);
            // Primero buscar en bin/ si existe
            if (files.includes('bin')) {
                const binDir = path.join(dir, 'bin');
                if (fs.existsSync(path.join(binDir, exe))) {
                    return path.join(binDir, exe);
                }
            }

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

    before(async () => {
        const root = process.cwd();
        apachePath = findApache(root);
        console.log('   [TEST] Apache encontrado en:', apachePath);
        
        if (apachePath) {
            // Parchear httpd.conf para que use rutas locales en lugar de C:/Apache24
            const apacheBinDir = path.dirname(apachePath);
            const apacheRoot = path.dirname(apacheBinDir).replace(/\\/g, '/');
            const confPath = path.join(apacheRoot, 'conf', 'httpd.conf');
            
            if (fs.existsSync(confPath)) {
                let content = fs.readFileSync(confPath, 'utf8');
                // Reemplazar C:/Apache24 por la ruta real (escapando para regex si fuera necesario, pero aquí es simple)
                const newContent = content.replace(/C:\/Apache24/g, apacheRoot);
                if (content !== newContent) {
                    console.log('   [TEST] Parcheando httpd.conf: C:/Apache24 ->', apacheRoot);
                    fs.writeFileSync(confPath, newContent);
                }
            }
        }

        // Asegurarse de que no esté corriendo
        try {
            execSync('taskkill /F /IM httpd.exe /T 2>NUL', { stdio: 'ignore' });
        } catch (e) {}
    });

    after(() => {
        // Limpieza final
        try {
            execSync('taskkill /F /IM httpd.exe /T 2>NUL', { stdio: 'ignore' });
        } catch (e) {}
    });

    it('Debe haber encontrado el binario de Apache', () => {
        assert.ok(apachePath, 'No se encontró el ejecutable de Apache en las rutas estándar');
        assert.ok(fs.existsSync(apachePath), 'La ruta encontrada no existe físicamente');
    });

    it('Debe iniciar Apache y detectarlo en la lista de procesos', async () => {
        if (!apachePath) return;

        const apacheDir = path.dirname(apachePath); // .../bin
        const apacheRoot = path.dirname(apacheDir); // .../Apache24
        const confPath = path.join(apacheRoot, 'conf', 'httpd.conf');

        // Comando exacto que usa el shim (usando powershell para obtener el PID)
        const command = `powershell -Command "Start-Process -FilePath '${apachePath}' -ArgumentList '-f','${confPath}','-d','${apacheRoot}' -WindowStyle Hidden -PassThru | Select-Object -ExpandProperty Id"`;
        
        const pidStr = execSync(command).toString().trim();
        apachePid = parseInt(pidStr);

        console.log('   [TEST] Apache iniciado con PID:', apachePid);
        assert.ok(!isNaN(apachePid) && apachePid > 0, 'No se pudo obtener un PID válido');

        // Esperar a que el proceso se asiente
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Verificar con tasklist
        const tasklist = execSync('tasklist /FI "IMAGENAME eq httpd.exe" /NH /FO CSV').toString();
        assert.ok(tasklist.includes('httpd.exe'), 'El proceso httpd.exe no aparece en tasklist');
    });

    it('Debe detener Apache correctamente', async () => {
        if (!apachePid) return;

        // El shim usa taskkill para detener (envolvemos en try para que no falle el test si ya murió)
        try {
            execSync('taskkill /F /IM httpd.exe /T', { stdio: 'ignore' });
        } catch (e) {
            console.log('   [TEST] taskkill falló (probablemente ya cerrado):', e.message);
        }
        
        // Esperar un poco a que se libere
        await new Promise(resolve => setTimeout(resolve, 1500));

        const tasklist = execSync('tasklist /FI "IMAGENAME eq httpd.exe" /NH /FO CSV').toString();
        const isRunning = tasklist.includes('httpd.exe');
        
        if (isRunning) {
            console.log('   [TEST] ADVERTENCIA: httpd.exe sigue presente, intentando matar de nuevo...');
            try { execSync('taskkill /F /IM httpd.exe /T', { stdio: 'ignore' }); } catch(e){}
            await new Promise(resolve => setTimeout(resolve, 1000));
            const secondCheck = execSync('tasklist /FI "IMAGENAME eq httpd.exe" /NH /FO CSV').toString();
            assert.ok(!secondCheck.includes('httpd.exe'), 'El proceso httpd.exe persistió tras dos intentos de cierre');
        } else {
            assert.ok(!isRunning, 'El proceso httpd.exe debería haber desaparecido');
        }
    });
});
