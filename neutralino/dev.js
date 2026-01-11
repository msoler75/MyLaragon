import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';

const configPath = path.join(process.cwd(), 'neutralino.config.json');
const originalConfig = fs.readFileSync(configPath, 'utf8');

try {
    const config = JSON.parse(originalConfig);
    const originalUrl = config.url;
    const originalDocRoot = config.documentRoot;
    
    // Copiar services.json a www/ para que esté disponible en desarrollo
    const servicesSource = path.join('..', 'public', 'services.json');
    const servicesTarget = path.join('www', 'services.json');
    try {
        if (fs.existsSync(servicesSource)) {
            fs.copyFileSync(servicesSource, servicesTarget);
            console.log(`📋 services.json copiado a www/`);
        }
    } catch (e) {
        console.warn(`⚠️ No se pudo copiar services.json:`, e.message);
    }
    
    // Configuración para desarrollo con Vite
    config.url = 'http://localhost:5173/';
    config.documentRoot = './www/';
    config.enableServer = false; // Desactivar servidor para que ignore resources.neu
    
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