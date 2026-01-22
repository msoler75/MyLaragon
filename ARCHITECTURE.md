# Arquitectura de WebServDev

## Principios Fundamentales

### 1. DRY Extremo (Don't Repeat Yourself)
**PROHIBICIÓN ABSOLUTA** de duplicar código funcional:
- NO debe haber funcionalidades duplicadas en toda la app.
- Si encuentras código similar en dos lugares, refactoriza inmediatamente.
- Crear función/utilidad/componente/servicio compartido.

### 2. Fuente Única de Verdad (Single Source of Truth)
Todo el código de negocio reside en **[src/neutralino/lib/](src/neutralino/lib/)**:
- `services-detector.js`: Detección de servicios, versiones, rutas.
- `fs-adapter.js`: Abstracción de filesystem (dev vs prod).
- Cualquier otra lógica futura DEBE ir aquí.

### 3. Separación de Concerns
- **lib/**: Lógica de negocio (browser-compatible, sin módulos Node.js).
- **Adapters**: Traducen APIs específicas de cada entorno.
- **Transport**: Solo mueven datos, NO implementan lógica.

---

## Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                       │
│              src/Views/*.jsx, App.jsx                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│             NEUTRALINO SHIM (Unificador)                 │
│          src/neutralino/neutralino-shim.js               │
│  Expone: window.electronAPI (compatible Electron)        │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌──────────────────┐     ┌──────────────────────┐
│  PRODUCCIÓN      │     │   DESARROLLO         │
│  (Neutralino)    │     │   (Browser + Vite)   │
└────────┬─────────┘     └──────────┬───────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐     ┌──────────────────────┐
│  fs-adapter.js   │     │  fs-adapter.js       │
│  (Neutralino     │     │  (fetch() a /api/*)  │
│   APIs nativas)  │     │                      │
└────────┬─────────┘     └──────────┬───────────┘
         │                          │
         │                          ▼
         │              ┌──────────────────────┐
         │              │   Vite Proxy         │
         │              │   (vite.config.js)   │
         │              │   /api/* → :5174     │
         │              └──────────┬───────────┘
         │                         │
         │                         ▼
         │              ┌──────────────────────┐
         │              │  dev-server.js       │
         │              │  (Express :5174)     │
         │              └──────────┬───────────┘
         │                         │
         └─────────────┬───────────┘
                       ▼
         ┌──────────────────────────┐
         │  lib/services-detector.js │
         │  (LÓGICA DE NEGOCIO)      │
         │  - detectServices()       │
         │  - getAvailableVersions() │
         │  - getServiceBinPath()    │
         └───────────────────────────┘
```

## DEV. Flujo de Datos Completo

Usuario abre app
    ↓
Neutralino muestra: http://localhost:5173
    ↓
Vite sirve: React + Shim
    ↓
React llama: window.electronAPI.getServices()
    ↓
Shim llama: detectServices() de lib/
    ↓
lib/ necesita leer filesystem
    ↓
fsAdapter.readDir() hace: fetch('/api/read-dir')
    ↓
Vite proxy redirige a: http://localhost:5174/api/read-dir
    ↓
dev-server.js ejecuta: fs.readdir() real
    ↓
Respuesta sube por toda la cadena


---

## Flujo de Datos en DEV

1. **Usuario interactúa** con React UI
2. **UI llama** a `window.electronAPI.getServices()`
3. **Shim intercepta** y llama a `detectServices({ fsAdapter, ... })`
4. **services-detector.js** necesita leer filesystem
5. **fsAdapter.readDir('/bin/php')** detecta modo DEV
6. **Hace fetch()** a `/api/read-dir` (puerto 5173)
7. **Vite proxy** redirige a `http://localhost:5174/api/read-dir`
8. **dev-server.js** recibe request HTTP
9. **Express handler** llama a `nodeAdapter.readDir()`
10. **nodeAdapter** ejecuta `fs.readdir()` (Node.js)
11. **Respuesta** JSON sube por toda la cadena
12. **services-detector.js** procesa los datos
13. **UI recibe** lista de servicios y renderiza

### Clave: CERO Duplicación
- `services-detector.js` es el MISMO código en dev y prod.
- Solo cambia el `fsAdapter` que se le pasa.
- En dev: adapter hace fetch()
- En prod: adapter usa Neutralino.filesystem

---

## Flujo de Datos en PROD

1. **Usuario interactúa** con React UI
2. **UI llama** a `window.electronAPI.getServices()`
3. **Shim intercepta** y llama a `detectServices({ fsAdapter, ... })`
4. **services-detector.js** necesita leer filesystem
5. **fsAdapter.readDir('/bin/php')** detecta modo PROD
6. **Llama directamente** a `Neutralino.filesystem.readDirectory()`
7. **Neutralino runtime** ejecuta syscall nativa
8. **Respuesta** JSON retorna
9. **services-detector.js** procesa los datos
10. **UI recibe** lista de servicios y renderiza

---

## Componentes Clave

### src/neutralino/lib/ (Lógica de Negocio)

#### services-detector.js
**Propósito**: Detección de servicios instalados en `/bin`.

**Características**:
- Browser-compatible (NO usa `require('path')` ni módulos Node.js)
- Recibe `fsAdapter` como parámetro (inyección de dependencias)
- Funciones puras: mismo input → mismo output

**Funciones principales**:
```javascript
export async function detectServices({ fsAdapter, appPath, userConfig, appConfig, log })
export async function getAvailableVersions(fsAdapter, appPath, serviceType)
export async function getServiceBinPath(fsAdapter, appPath, type, version, log)
```

**Búsqueda de binarios**:
- Busca en `/bin/<tipo>/<versión>/`
- Soporta búsqueda recursiva (hasta 3 niveles) para manejar carpetas anidadas
- Valida existencia de ejecutable real (.exe)
- Filtra "carpetas fantasma" (carpetas sin binario válido)

#### fs-adapter.js
**Propósito**: Abstracción de filesystem independiente del entorno.

**Clase**: `FilesystemAdapter`
```javascript
constructor(isDev, neutralino = null)
async readFile(path)
async writeFile(path, content)
async readDir(path)
async fileExists(path)
async execCommand(command)
```

**Detección de modo**:
- isDev = `!window.NL_TOKEN`
- En DEV: usa `fetch('/api/...')`
- En PROD: usa `Neutralino.filesystem.*`

### src/api/dev-server.js (Servidor API para DEV)

**Propósito**: Exponer funciones de lib/ vía HTTP durante desarrollo.

**Arquitectura**:
- Express.js en puerto 5174
- CORS habilitado
- Body parser JSON

**Endpoints básicos** (transport de Node.js APIs):
- `POST /api/read-file`: Lee archivo
- `POST /api/write-file`: Escribe archivo
- `POST /api/file-exists`: Verifica existencia
- `POST /api/read-dir`: Lista directorio
- `POST /api/exec`: Ejecuta comando
- `POST /api/write-log`: Escribe en app-debug.log
- `POST /api/clear-logs`: Limpia logs

**Endpoints de alto nivel** (usan lib/ directamente):
- `POST /api/detect-services`: Llama a `detectServices()` de lib/
- `POST /api/get-available-versions`: Llama a `getAvailableVersions()` de lib/

**Adapter Node.js**:
```javascript
const nodeAdapter = {
  async readFile(filePath) { return await fs.readFile(filePath, 'utf-8'); },
  async writeFile(filePath, content) { /* ... */ },
  async readDir(dirPath) { /* ... */ },
  async fileExists(filePath) { /* ... */ }
}
```

**Principio**: Solo TRANSPORTA funciones, NO implementa lógica.

### vite.config.js (Simplificado)

**Antes** (~300 líneas):
- Implementaba NodeFilesystemAdapter
- Definía handlers para cada endpoint /api/*
- ~200 líneas de middleware con lógica

**Ahora** (~180 líneas):
- Plugin `api-server-launcher`: Inicia dev-server.js
- Proxy simple: `/api/* → http://localhost:5174`
- Plugin `copy-neutralino-files`: Build automation
- CERO lógica de API

**Configuración proxy**:
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5174',
      changeOrigin: true,
      secure: false
    }
  }
}
```

### src/neutralino/neutralino-shim.js (Unificador)

**Propósito**: Exponer API unificada como `window.electronAPI` compatible con Electron.

**Responsabilidades**:
1. Detectar modo (dev vs prod) via `NL_TOKEN`
2. Crear `FilesystemAdapter` apropiado
3. Importar funciones de lib/
4. Exponer métodos en `window.electronAPI`:
   - `getServices()`: Llama a `detectServices()`
   - `startService()`: Ejecuta comando de inicio
   - `stopService()`: Ejecuta comando de parada
   - Y más...

**Logging integrado**:
- Intercepta `console.log/warn/error`
- Escribe en `app-debug.log`
- Emite eventos a UI via `window.__neutralino_push_log`

---

## Scripts y Sincronización

### scripts/sync-resources.js
**Propósito**: Copiar archivos master desde `src/` a `neutralino/www/`.

**Archivos sincronizados**:
```javascript
[
  { source: "src/neutralino/neutralino-shim.js", 
    target: "neutralino/www/neutralino-shim.js" },
  { source: "src/neutralino/services.json", 
    target: "neutralino/www/services.json" },
  { source: "src/neutralino/lib/fs-adapter.js", 
    target: "neutralino/www/lib/fs-adapter.js" },
  { source: "src/neutralino/lib/services-detector.js", 
    target: "neutralino/www/lib/services-detector.js" }
]
```

**Nota**: Se usan copias físicas (no symlinks) para compatibilidad con `resources.neu` en Windows.

### package.json scripts

```json
{
  "dev": "concurrently \"node src/api/dev-server.js\" \"wait-on http://localhost:5174 && vite\" \"wait-on http://localhost:5173 && npm run neutralino-dev\"",
  "build": "vite build",
  "dist": "npm run build && cd neutralino && npx @neutralinojs/neu build",
  "prebuild": "node scripts/sync-resources.js check"
}
```

**Flujo npm run dev**:
1. Inicia `dev-server.js` (puerto 5174)
2. Espera que 5174 esté listo
3. Inicia Vite (puerto 5173)
4. Espera que 5173 esté listo
5. Inicia Neutralino en modo dev

---

## Convenciones de Código

### Imports
**Browser-compatible**:
```javascript
// ✅ BIEN
export async function detectServices({ fsAdapter, appPath }) { ... }

// ❌ MAL (no browser-compatible)
import path from 'path';
import fs from 'fs';
```

**Node.js code** (solo en dev-server.js o tests):
```javascript
// ✅ BIEN (solo en servidor Node.js)
import fs from 'fs/promises';
import path from 'path';
```

### Inyección de Dependencias
**lib/ NO debe depender de globals**:
```javascript
// ✅ BIEN
export async function detectServices({ fsAdapter, appPath, log }) {
  const entries = await fsAdapter.readDir(appPath);
  log(`Found ${entries.length} entries`);
}

// ❌ MAL
export async function detectServices(appPath) {
  const fs = require('fs'); // ¡NO browser-compatible!
  console.log(...); // ¡Dependencia global!
}
```

### Manejo de Rutas
**Browser-compatible path utilities**:
```javascript
// En services-detector.js
const pathJoin = (...parts) => 
  parts.join('/').replace(/\/+/g, '/').replace(/\\/g, '/');

const pathDirname = (filePath) => {
  const normalized = filePath.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash > 0 ? normalized.substring(0, lastSlash) : normalized;
};
```

---

## Testing

### Filosofía
**Tests REALES, NO mocks maquillados**:
- Si los tests pasan, la app debe comportarse igual en producción
- NUNCA hacer "trampas" (mockear existencia de binarios, respuestas falsas)
- Tests deben cubrir flujos críticos con datos reales

### Estructura
```
tests/
  ├── services.spec.js           # Tests de detección (fast)
  ├── php-detection.spec.js      # Tests específicos PHP
  ├── apache-lifecycle.spec.js   # Tests Apache start/stop
  ├── slow.spec.js               # Tests lentos (binarios reales)
  └── slow.install.spec.js       # Tests de instalación
```

### Variables de entorno
```bash
# Tests rápidos (sin binarios)
npm test

# Tests lentos (con binarios reales)
RUN_SLOW=1 npm test
```

---

## Resolución de Problemas

### Dev-server no arranca
1. Verificar puerto 5174 libre: `netstat -ano | findstr 5174`
2. Matar procesos node: `taskkill /F /IM node.exe`
3. Verificar imports: `node --check src/api/dev-server.js`

### Servicios no detectados
1. Revisar logs: `Get-Content app-debug.log | Select-Object -Last 50`
2. Buscar líneas `[DETECTOR]`
3. Verificar que binarios .exe existen en `/bin/<tipo>/<version>/`

### Cambios no reflejados
1. Ejecutar sync: `node scripts/sync-resources.js`
2. Verificar que `neutralino/www/lib/` está actualizado
3. Limpiar cache de navegador (Ctrl+Shift+R)

---

## Próximos Pasos

### Pendientes Inmediatos
- [ ] Integrar dev-server.js en flujo npm run dev (problema con wait-on)
- [ ] Resolver detección vacía de servicios (getAvailableVersions retorna [])
- [ ] Implementar visor de logs en tiempo real
- [ ] Añadir soporte Nginx y PostgreSQL

### Mejoras Arquitectónicas
- [ ] Crear más adapters (cache, network, etc.)
- [ ] Implementar sistema de plugins para servicios
- [ ] Separar UI en microfrontends por vista
- [ ] Agregar métricas y telemetría

---

## Referencias

- [DEVELOPMENT.md](DEVELOPMENT.md): Guía de desarrollo
- [PLAN.md](PLAN.md): Roadmap y estado actual
- [HISTORY.md](HISTORY.md): Historial de cambios
- [README.md](README.md): Descripción general del proyecto
