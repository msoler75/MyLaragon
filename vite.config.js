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
        // Copiar services.json a neutralino/www después del build
        const source = path.resolve('public/services.json');
        const target = path.resolve('neutralino/www/services.json');
        try {
          if (fs.existsSync(source)) {
            fs.copyFileSync(source, target);
            console.log('✓ services.json copiado a neutralino/www/');
          }
        } catch (e) {
          console.warn('⚠️ Error copiando services.json:', e.message);
        }
      }
    },
    {
      name: 'exec-api',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
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
                const { stdout, stderr } = await execAsync(command, { timeout: 5000 });
                console.log('[EXEC API] Stdout:', stdout.slice(0, 200));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ stdout, stderr, success: true }));
              } catch (err) {
                console.error('[EXEC API] Error:', err.message);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ stdout: '', stderr: err.message, success: false }));
              }
            });
          } else {
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
