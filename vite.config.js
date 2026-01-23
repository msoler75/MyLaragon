import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

let apiServer = null;

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'api-server-launcher',
      apply: 'serve',
      configureServer() {
        // Iniciar el servidor API real en un proceso separado
        apiServer = spawn('node', ['src/api/dev-server.js'], {
          stdio: 'inherit',
          env: { ...process.env, API_PORT: '5174' }
        });
        
        console.log('🚀 API Server iniciado en puerto 5174');
      },
      closeBundle() {
        if (apiServer) {
          apiServer.kill();
          console.log('⏹ API Server detenido');
        }
      }
    },
    {
      name: 'copy-neutralino-files',
      apply: 'build',
      buildStart() {
        const wwwDir = path.resolve('neutralino/www');
        
        // Verificación de archivos maestros (Single Source of Truth)
        const checkMasterFile = (fileName) => {
          const destPath = path.join(wwwDir, fileName);
          
          if (!fs.existsSync(destPath)) {
            console.warn(`[CHECK] ⚠️ Falta recurso generado: ${fileName}. Ejecuta 'npm run setup:links'.`);
          }
        };

        if (!fs.existsSync(wwwDir)) {
          fs.mkdirSync(wwwDir, { recursive: true });
        }

        // Verificar que los archivos críticos existan en www/
        ['neutralino-shim.js', 'neutralino.js', 'bootstrap.html'].forEach(checkMasterFile);

        const files = fs.readdirSync(wwwDir);
        // Archivos a preservar (generados por scripts/sync-resources.js)
        const preserve = ['neutralino.js', 'neutralino-shim.js', 'vite.svg', 'bootstrap.html', 'test-services.html'];
        
        files.forEach(file => {
          if (!preserve.includes(file)) {
            const filePath = path.join(wwwDir, file);
            try {
              const stats = fs.lstatSync(filePath);
              if (stats.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
              } else {
                // Eliminar archivos que no son parte de los recursos maestros sincronizados
                fs.unlinkSync(filePath);
              }
            } catch (e) {
              console.warn(`⚠️ No se pudo eliminar ${file}:`, e.message);
            }
          }
        });
        console.log('✓ www/ preparado y sincronizado');
      },
      writeBundle() {
        // Mover el index.html de la subcarpeta neutralino/ a la raíz de www/
        const wrongPath = path.resolve('neutralino/www/neutralino/index.html');
        const correctPath = path.resolve('neutralino/www/index.html');
        
        if (fs.existsSync(wrongPath)) {
          fs.renameSync(wrongPath, correctPath);
          // Eliminar el directorio vacío
          try {
            fs.rmdirSync(path.resolve('neutralino/www/neutralino'));
            console.log('[BUILD] ✓ index.html movido a la raíz de www/');
          } catch (e) {
            // Ignorar si no se puede eliminar
          }
        }
        
        // Parchear el index.html generado por Vite en lugar de reemplazarlo
        const builtIndex = correctPath;
        
        try {
          if (fs.existsSync(builtIndex)) {
            // Leer el index.html compilado
            let htmlContent = fs.readFileSync(builtIndex, 'utf-8');
            
            console.log('[BUILD] Parcheando index.html generado por Vite...');
            
            // 1. Limpiar rutas /www/ a /
            htmlContent = htmlContent.replace(/href="\/www\//g, 'href="/');
            htmlContent = htmlContent.replace(/src="\/www\//g, 'src="/');
            
            // 2. Asegurar que neutralino.js y neutralino-shim.js estén cargados ANTES del script de React
            // Buscar el <head> y agregar los scripts de Neutralino si no existen
            // Usar rutas relativas porque documentRoot="/www/" en neutralino.config.json
            if (!htmlContent.includes('neutralino.js')) {
              htmlContent = htmlContent.replace(
                '</title>',
                `</title>
    <!-- Neutralino SDK and Shim - MUST load FIRST -->
    <script src="./neutralino.js"></script>
    <script src="./neutralino-shim.js"></script>`
              );
              console.log('[BUILD] Scripts de Neutralino agregados al <head>');
            } else {
              console.log('[BUILD] Scripts de Neutralino ya presentes');
            }
            
            // Escribir el HTML parcheado
            fs.writeFileSync(builtIndex, htmlContent);
            console.log('[BUILD] ✓ index.html parcheado correctamente');
          }
        } catch (e) {
          console.error('[BUILD] ✗ Error parcheando index.html:', e.message);
        }
        
        // Asegurar bootstrap.html
        try {
          const srcBoot = path.resolve('neutralino/bootstrap.html');
          const dstBoot = path.resolve('neutralino/www/bootstrap.html');
          if (fs.existsSync(srcBoot) && !fs.existsSync(dstBoot)) {
            fs.copyFileSync(srcBoot, dstBoot);
            console.log('[BUILD] ✓ bootstrap.html copiado');
          }
        } catch (e) {
          console.warn('[BUILD] ⚠️ Error con bootstrap.html:', e.message);
        }
      }
    }
  ],
  root: '.',
  base: './',
  build: {
    rollupOptions: {
      input: './neutralino/index.html'
    },
    outDir: 'neutralino/www',
    emptyOutDir: false
  },
  server: {
    port: 5173,
    // Proxy simple - delega todas las llamadas API al servidor real
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
