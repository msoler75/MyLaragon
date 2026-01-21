import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';

const configPath = path.join(process.cwd(), 'neutralino.config.json');
const originalConfig = fs.readFileSync(configPath, 'utf8');

try {
    const config = JSON.parse(originalConfig);
    const originalUrl = config.url;
    const originalDocRoot = config.documentRoot;
    
    // Función de sincronización para desarrollo
    const syncToWww = (src, destName) => {
        const srcPath = path.resolve(src);
        const destPath = path.resolve('www', destName);
        try {
            if (fs.existsSync(srcPath)) {
                // Solo copiar si el destino no es un enlace simbólico
                if (fs.existsSync(destPath) && fs.lstatSync(destPath).isSymbolicLink()) {
                    return;
                }
                fs.copyFileSync(srcPath, destPath);
                console.log(`✓ ${destName} sincronizado a www/`);
            }
        } catch (e) {
            console.warn(`⚠️ Error sincronizando ${destName}:`, e.message);
        }
    };

    // Sincronizar archivos necesarios desde src/neutralino para que estén disponibles en el "documentRoot" de Neutralino
    syncToWww('../src/neutralino/services.json', 'services.json');
    syncToWww('../src/neutralino/neutralino-shim.js', 'neutralino-shim.js');
    syncToWww('../src/neutralino/neutralino.js', 'neutralino.js');
    syncToWww('../src/neutralino/bootstrap.html', 'bootstrap.html');
    
    // Configuración para desarrollo con Vite
    config.url = 'http://localhost:5173/';
    config.documentRoot = './www/';
    config.enableServer = false; // Desactivar servidor para que ignore resources.neu
    config.basePath = path.join(process.cwd(), '..').replace(/\\/g, '/');
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`\n🚀 Iniciando Neutralino...`);
    console.log(`   URL: ${config.url}`);
    console.log(`   Asegúrate de que Vite esté corriendo en http://localhost:5173\n`);
    
    // Determinar binario
    const binaryName = process.platform === 'win32' ? 'neutralino-win_x64.exe' : 
                      process.platform === 'darwin' ? 'neutralino-mac_x64' : 'neutralino-linux_x64';
    const binaryPath = path.join(process.cwd(), binaryName);

    // Ejecutar binario directamente
    const neu = spawn(binaryPath, [], { 
        stdio: 'inherit',
        cwd: process.cwd(),
        shell: true
    });

    neu.on('close', () => {
        // Restaurar configuración original
        console.log('♻️ Restaurando configuración original...');
        fs.writeFileSync(configPath, originalConfig);
        process.exit();
    });

} catch (err) {
    console.error('Error:', err);
    fs.writeFileSync(configPath, originalConfig);
    process.exit(1);
}

// Asegurar restauración en caso de cierre forzado
process.on('SIGINT', () => {
    fs.writeFileSync(configPath, originalConfig);
    process.exit();
});