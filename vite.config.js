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
      name: 'copy-services-json',
      apply: 'build',
      writeBundle() {
        // Copiar services.json desde LA RAÍZ a neutralino/www después del build
        // El de la raíz es el que tiene el formato correcto { "services": [...] }
        const source = path.resolve('services.json');
        const target = path.resolve('neutralino/www/services.json');
        try {
          if (fs.existsSync(source)) {
            fs.copyFileSync(source, target);
            console.log('✓ services.json (ROOT) copiado a neutralino/www/');
          } else {
            // Fallback al de public si el de raíz no existe
            const publicSource = path.resolve('public/services.json');
            if (fs.existsSync(publicSource)) {
              fs.copyFileSync(publicSource, target);
              console.log('✓ services.json (PUBLIC) copiado a neutralino/www/');
            }
          }
        } catch (e) {
          console.warn('⚠️ Error copiando services.json:', e.message);
        }

        // Copiar index.html personalizado para Neutralino
        const builtIndex = path.resolve('neutralino/www/index.html');
        try {
          if (fs.existsSync(builtIndex)) {
            // Leer el index.html compilado para extraer los assets
            const compiledIndex = fs.readFileSync(builtIndex, 'utf-8');
            const jsMatch = compiledIndex.match(/<script[^>]*src="([^"]*\.js)"[^>]*><\/script>/);
            const cssMatch = compiledIndex.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/);
            
            const jsSrc = jsMatch ? jsMatch[1] : './assets/index.js';
            const cssHref = cssMatch ? cssMatch[1] : './assets/index.css';
            
            // Crear index.html con React assets y Neutralino shim
            const customIndex = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebServDev</title>
    <!-- Neutralino SDK and Shim - MUST load FIRST -->
    <script src="/neutralino.js"><\/script>
    <script>
      // Loader with explicit logging in case neutralino.js fails to load
      (function(){
        try{
          console.log('Attempting to detect Neutralino...');
          if (typeof Neutralino === 'undefined') {
            console.log('Neutralino not present yet — ensuring script tag present');
            var s = document.createElement('script');
            s.src = '/neutralino.js';
            s.onload = function(){ console.log('neutralino.js loaded via loader'); };
            s.onerror = function(e){ console.warn('neutralino.js failed to load (loader)', e); };
            document.head.appendChild(s);
          } else {
            console.log('Neutralino global already present');
          }
        }catch(e){ console.warn('Loader error', e); }
      })();
    <\/script>
    <script src="/neutralino-shim.js"><\/script>
    <script>
      // Dynamic base: use ./ when loaded from file://, otherwise use / when served by neutralino server
      (function(){
        try{
          var b = document.createElement('base');
          if (location.protocol === 'file:') b.href = './';
          else b.href = '/';
          document.head.appendChild(b);
          console.log('Base href set to', b.href);
        }catch(e){ console.warn('Could not set base href', e); }
      })();
    <\/script>
    <link rel="stylesheet" crossorigin href="${cssHref.startsWith('http') ? cssHref : (cssHref.startsWith('/') ? cssHref : './' + cssHref.replace(/^\.\//, ''))}">
  </head>
  <body>
    <script>
      // Ensure base works in both file:// and server modes (fallback in body)
      (function(){
        try{
          if (!document.querySelector('base')){
            var b = document.createElement('base');
            if (location.protocol === 'file:') b.href = './';
            else b.href = '/';
            document.head.appendChild(b);
            console.log('Body-inserted base href set to', b.href);
          }
        }catch(e){console.warn('Could not insert base in body', e);}
      })();
    <\/script>
    <div id="root"></div>
    <div id="status" style="padding:12px;color:#666;font-family:sans-serif">Cargando app…</div>
    <script>
      console.log('HTML loaded, starting React...');
      document.getElementById('status').innerText = 'HTML loaded — iniciando...';
      console.log('Assets: ${jsSrc}');
      (async function(){
        try {
          if (typeof Neutralino !== 'undefined') {
            Neutralino.init();
            console.log('Neutralino global found and initialized');
            document.getElementById('status').innerText = 'Neutralino inicializado — cargando app';
            try {
              await Neutralino.filesystem.writeFile('app-log.txt', 'Loaded at ' + new Date().toISOString());
              console.log('Wrote app-log.txt to app working dir');
            } catch(e) {
              console.warn('Could not write app-log.txt:', e && e.message ? e.message : e);
            }
          } else {
            console.warn('Neutralino global not present at HTML startup');
            document.getElementById('status').innerText = 'Neutralino no disponible — cargando UI (sin APIs nativas)';
          }
        } catch(e) { console.error('Startup script error', e); document.getElementById('status').innerText='Startup error'; }
      })();
    </script>
    <!-- React App - loads after Neutralino is ready -->
    <script type="module" crossorigin src="${jsSrc}"><\/script>
  </body>
</html>`;
            fs.writeFileSync(builtIndex, customIndex);
            console.log('✓ index.html personalizado aplicado con assets compilados');

            // Ensure bootstrap.html remains in neutralino/www after Vite cleans outDir
            try {
              const srcBoot = path.resolve('neutralino/bootstrap.html');
              const dstBoot = path.resolve('neutralino/www/bootstrap.html');
              if (fs.existsSync(srcBoot)) {
                fs.copyFileSync(srcBoot, dstBoot);
                console.log('✓ Copiado neutralino/bootstrap.html -> neutralino/www/bootstrap.html (post-build)');
              } else {
                const bootstrapContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bootstrap</title></head><body><h1>Bootstrap loader</h1><script>/* bootstrap will probe candidates */</script></body></html>`;
                fs.writeFileSync(dstBoot, bootstrapContent, 'utf-8');
                console.log('✓ bootstrap.html (post-build) creado en neutralino/www/ (fallback)');
              }
              // Also copy to neutralino root so neu includes it when using cli.copyItems or when packaging root files
              try {
                const bootstrapRoot = path.resolve('neutralino/bootstrap.html');
                if (!fs.existsSync(bootstrapRoot)) {
                  // if root doesn't exist yet, create from dst
                  fs.copyFileSync(dstBoot, bootstrapRoot);
                }
                console.log('✓ bootstrap.html (post-build) exists in neutralino root');
              } catch (e) {
                console.warn('⚠️ No se pudo asegurar bootstrap en la raíz:', e && e.message ? e.message : e);
              }
            } catch (err) {
              console.warn('⚠️ Error creando/asegurando bootstrap.html post-build:', err && err.message ? err.message : err);
            }
          }
        } catch (e) {
          console.warn('⚠️ Error aplicando index.html personalizado:', e.message);
        }
      }
    },
    {
      name: 'exec-api',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
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
                const { stdout, stderr } = await execAsync(command, { timeout: 900000 });
                console.log('[EXEC API] Stdout:', stdout.slice(0, 200));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ stdout, stderr, success: true }));
              } catch (err) {
                console.error('[EXEC API] Error:', err.message);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ stdout: '', stderr: err.message, success: false }));
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
                const exists = fs.existsSync(filePath);
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
                if (!fs.existsSync(dirPath)) {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ entries: null }));
                  return;
                }
                const entries = fs.readdirSync(dirPath);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ entries }));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ entries: null, error: err.message }));
              }
            });
          }
          else {
            next();
          }
        });
      }
    }
  ],
  base: './',
  build: {
    outDir: 'neutralino/www',
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});
