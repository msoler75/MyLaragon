import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
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
        ['neutralino-shim.js', 'services.json', 'neutralino.js', 'bootstrap.html'].forEach(checkMasterFile);

        const files = fs.readdirSync(wwwDir);
        // Archivos a preservar (generados por scripts/sync-resources.js)
        const preserve = ['neutralino.js', 'neutralino-shim.js', 'services.json', 'vite.svg', 'bootstrap.html', 'test-services.html'];
        
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
    },
    {
      name: 'exec-api',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Forzar no-cache para el shim y archivos críticos en DEV
          if (req.url.includes('neutralino-shim.js') || req.url.includes('services.json')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Surrogate-Control', 'no-store');
          }

          // Bloquear o simular recursos de Neutralino que dan 404 en DEV
          if (req.url.includes('/neutralino/app.log') || req.url.includes('.well-known')) {
            console.log(`[ViteAPI] Simulando recurso para evitar 404: ${req.url}`);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('');
            return;
          }

          if (req.url.startsWith('/api/')) {
            console.log(`[ViteAPI] REQUEST: ${req.method} ${req.url}`);
          }

          // Proxy para /www/services.json -> services.json en desarrollo
          if (req.url === '/www/services.json') {
            const servicesPath = path.resolve('src/neutralino/services.json');
            if (fs.existsSync(servicesPath)) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(fs.readFileSync(servicesPath, 'utf-8'));
              return;
            } else {
              res.writeHead(404);
              res.end('Services config not found');
              return;
            }
          }
          // Endpoint: /api/exec
          if (req.url === '/api/exec' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
              try {
                const { command } = JSON.parse(body);
                if (!command) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'No command provided' }));
                  return;
                }
                
                console.log('[EXEC API] Ejecutando:', command);
                // Aumentamos el timeout a 15 minutos para permitir descargas largas de servicios
                const startTime = Date.now();
                const { stdout, stderr } = await execAsync(command, { timeout: 900000 });
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`[EXEC API] Finalizado en ${duration}s. Stdout:`, stdout.slice(0, 200));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  stdout, 
                  stderr, 
                  exitCode: 0, 
                  success: true,
                  duration 
                }));
              } catch (err) {
                console.error('[EXEC API] Error despues de', ((Date.now() - startTime) / 1000).toFixed(1), 's:', err.message);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  stdout: err.stdout || '', 
                  stderr: err.stderr || err.message, 
                  exitCode: err.code || 1, 
                  success: false 
                }));
              }
            });
          }
          // Endpoint: /api/read-file
          else if (req.url === '/api/read-file' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const { path: filePath } = JSON.parse(body);
                const normalized = filePath.replace(/[\\\/]+/g, path.sep);
                if (fs.existsSync(normalized)) {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ content: fs.readFileSync(normalized, 'utf-8') }));
                } else {
                  res.writeHead(404, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'File not found' }));
                }
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          }
          // Endpoint: /api/write-file
          else if (req.url === '/api/write-file' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const { path: filePath, content } = JSON.parse(body);
                const normalized = filePath.replace(/[\\\/]+/g, path.sep);
                fs.mkdirSync(path.dirname(normalized), { recursive: true });
                fs.writeFileSync(normalized, content, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          }
          // Endpoint: /api/file-exists
          else if (req.url === '/api/file-exists' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const { path: filePath } = JSON.parse(body);
                // Normalizar slashes para Windows/Unist compat
                const normalized = filePath.replace(/[\\\/]+/g, path.sep);
                const exists = fs.existsSync(normalized);
                
                // Loguear siempre los chequeos de ejecutables para debug
                if (filePath.endsWith('.exe') || filePath.includes('bin/')) {
                   console.log(`[ViteAPI] fileExists: ${normalized} -> ${exists ? '✅' : '❌'}`);
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ exists }));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ exists: false, error: err.message }));
              }
            });
          }
          // Endpoint: /api/read-dir
          else if (req.url === '/api/read-dir' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const { path: dirPath } = JSON.parse(body);
                const normalized = dirPath.replace(/[\\\/]+/g, path.sep);
                
                if (!fs.existsSync(normalized)) {
                  console.log(`[ViteAPI] readDir: ${normalized} -> ❌ (No existe)`);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ entries: null }));
                  return;
                }
                const entries = fs.readdirSync(normalized).map(name => {
                  const full = path.join(normalized, name);
                  const isDir = fs.statSync(full).isDirectory();
                  return { entry: name, type: isDir ? 'DIRECTORY' : 'FILE' };
                });
                
                console.log(`[ViteAPI] readDir: ${normalized} -> ✅ (${entries.length} items)`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ entries }));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ entries: null, error: err.message }));
              }
            });
          }
          // Endpoint: /api/write-log (NUEVO para paridad de logs en DEV)
          else if (req.url === '/api/write-log' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                if (!body) {
                  res.writeHead(200);
                  res.end(JSON.stringify({ success: true, empty: true }));
                  return;
                }
                const { message } = JSON.parse(body);
                const logPath = path.resolve(__dirname, 'app-debug.log');
                
                // Asegurar que el mensaje termine en newline si no lo tiene
                const finalizedMsg = message.endsWith('\n') ? message : message + '\n';
                
                fs.appendFileSync(logPath, finalizedMsg, 'utf8');
                
                // Eco en consola de Vite para depuración proactiva
                const firstLine = finalizedMsg.split('\n')[0];
                process.stdout.write(`\x1b[34m[PROXY-LOG]\x1b[0m ${firstLine.substring(0, 100)}${firstLine.length > 100 ? '...' : ''}\n`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                console.error('❌ [PROXY-LOG] Error processing log:', err.message);
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          }
          // Endpoint: /api/clear-logs
          else if (req.url === '/api/clear-logs' && req.method === 'POST') {
            try {
              const logPath = path.resolve(__dirname, 'app-debug.log');
              fs.writeFileSync(logPath, '', 'utf8');
              console.log('[ViteAPI] Logs del servidor limpiados');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.writeHead(500);
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          }
          else {
            next();
          }
        });
      }
    }
  ],
  root: '.', // Cambiar root a la raíz del proyecto para que Tailwind encuentre los archivos
  base: './',
  build: {
    rollupOptions: {
      input: './neutralino/index.html'
    },
    outDir: 'neutralino/www',
    emptyOutDir: false  // No limpiar, lo hacemos manualmente en buildStart
  },
  server: {
    port: 5173
  }
});
