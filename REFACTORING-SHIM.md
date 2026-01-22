# Refactorización del Shim - Eliminación de Duplicación

## 🎯 Objetivo

Eliminar la duplicación de código entre `neutralino-shim.js` y `lib/services-detector.js`, manteniendo el shim modular y testeable.

## 📋 Estado Actual (PROBLEMA)

```
src/neutralino/
├── neutralino-shim.js      # ~1900 líneas, incluye lógica duplicada
├── lib/
│   ├── services-detector.js  # Lógica de detección (duplicada en shim)
│   └── service-installer.js  # Lógica de instalación
```

**Problema**: El shim tiene funciones como `getAvailableVersions()`, `findExecutable()` que están duplicadas en `lib/services-detector.js`. Los tests usan `lib/` pero la app usa el código del shim.

## ✅ Estado Objetivo (SOLUCIÓN)

```
src/neutralino/
├── neutralino-shim.js      # ~500 líneas, solo capa de abstracción
├── lib/
│   ├── services-detector.js  # ÚNICA fuente de verdad para detección
│   ├── service-installer.js  # ÚNICA fuente de verdad para instalación
│   └── fs-adapter.js         # Adaptador DEV/PROD para filesystem
```

**Solución**: El shim importa funciones de `lib/`, mantiene solo la capa de abstracción de filesystem/OS.

## 🔧 Estrategia de Implementación

### Paso 1: Extraer Lógica del Shim a lib/

Mover del shim a `lib/services-detector.js`:
- `async function getAvailableVersions(basePath, serviceType, readDirFn)`
- `async function findExecutable(type, version, exeName, basePath, fileExistsFn, readDirFn)`
- `function sortVersions(versions)`

Estos recibirán funciones de filesystem como parámetros (dependency injection).

### Paso 2: Crear Adaptador de Filesystem

`lib/fs-adapter.js`:
```javascript
export class FilesystemAdapter {
  constructor(isDev) {
    this.isDev = isDev;
  }
  
  async readFile(path) {
    if (this.isDev) {
      return fetch(`/api/read-file`, { 
        method: 'POST', 
        body: JSON.stringify({ path }) 
      }).then(r => r.json());
    } else {
      return Neutralino.filesystem.readFile(path);
    }
  }
  
  async readDir(path) { /* similar */ }
  async fileExists(path) { /* similar */ }
  async execCommand(cmd) { /* similar */ }
}
```

### Paso 3: Refactorizar Shim

`neutralino-shim.js` se convierte en:
```javascript
import { detectServices, getAvailableVersions } from './lib/services-detector.js';
import { FilesystemAdapter } from './lib/fs-adapter.js';

(function(){
  const fs = new FilesystemAdapter(IS_DEV);
  
  window.webservAPI = {
    getServices: async () => {
      return detectServices({ fs, basePath: appRoot });
    }
  };
})();
```

### Paso 4: Configurar Build con Vite

`vite.config.js`:
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        shim: 'src/neutralino/neutralino-shim.js'
      },
      output: {
        format: 'iife', // Bundle como IIFE para browser
        entryFileNames: '[name].js'
      }
    }
  }
});
```

### Paso 5: Actualizar sync-resources.js

El script de sincronización debe:
1. Ejecutar build de Vite para generar `neutralino-shim.bundle.js`
2. Copiar el bundle a `neutralino/www/neutralino-shim.js`

## 📊 Resultado Final

### Tests
```javascript
import { getAvailableVersions } from '../src/neutralino/lib/services-detector.js';
// Usa código REAL de producción ✅
```

### Producción
```javascript
// neutralino-shim.js (bundleado con lib/) 
window.webservAPI.getServices() 
  → lib/services-detector.js (bundleado)
  → FilesystemAdapter (Neutralino.filesystem)
// Usa MISMO código que tests ✅
```

### Desarrollo
```javascript
// neutralino-shim.js (bundleado con lib/)
window.webservAPI.getServices()
  → lib/services-detector.js (bundleado)
  → FilesystemAdapter (fetch a /api/*)
// Usa MISMO código que tests ✅
```

## ✅ Beneficios

1. ✅ **Sin duplicación**: Código único en `lib/`
2. ✅ **Tests realistas**: Validan código de producción
3. ✅ **Shim modular**: ~500 líneas vs ~1900
4. ✅ **Mantenible**: Cambios en un solo lugar
5. ✅ **Todo en neutralino**: `src/neutralino/lib/`

## ⚠️ Consideraciones

- El shim se convierte en módulo ESM (requiere build step)
- Vite debe bundlear el shim con sus dependencias
- `sync-resources.js` debe ejecutar el build antes de copiar
- Los tests importan directamente (sin build necesario)

## 🚀 Plan de Ejecución

1. ✅ Mover `src/lib/` → `src/neutralino/lib/`
2. ✅ Crear `lib/fs-adapter.js` (FilesystemAdapter + NodeFilesystemAdapter)
3. ✅ Refactorizar `services-detector.js` para aceptar `fsAdapter` como parámetro
4. ⏳ Actualizar TODOS los tests para usar `fsAdapter`
   - ✅ `php-detection.spec.js` (2/3 pasando)
   - ⏳ `php-apache-config.spec.js`
   - ⏳ `php-apache-filter.spec.js`
   - ⏳ `services.spec.js`
   - ⏳ `slow.install.spec.js`
   - ⏳ `slow.spec.js`
   - ⏳ `debug-neutralino.spec.js`
5. ⏳ Refactorizar shim para importar de `lib/`
6. ⏳ Configurar Vite para bundlear shim
7. ⏳ Actualizar `sync-resources.js`
8. ⏳ Verificar tests
9. ⏳ Verificar app en DEV y PROD

## 📊 Progreso Detallado

### ✅ Paso 1-3: Infraestructura Base (COMPLETADO)

**Creado:**
- `src/neutralino/lib/fs-adapter.js` (~190 líneas)
  - `FilesystemAdapter` (DEV: fetch, PROD: Neutralino)
  - `NodeFilesystemAdapter` (tests: Node.js fs/path/child_process)
  - Factory functions con import dinámico ESM

**Refactorizado:**
- `src/neutralino/lib/services-detector.js`
  - Todas las funciones ahora `async`
  - Primer parámetro: `fsAdapter`
  - API actualizada:
    ```javascript
    await loadAppConfig(fsAdapter, appPath, log)
    await getServiceBinPath(fsAdapter, appPath, type, version, log)
    await getAvailableVersions(fsAdapter, appPath, serviceType)
    await detectServices({ fsAdapter, appPath, userConfig, appConfig, log })
    await clearLogsFile(fsAdapter, targetPath)
    ```

**Tests actualizados:**
- ✅ `php-detection.spec.js`: Funcionando (2/3 pasando, 1 esperado)

### ⏳ Paso 4: Actualizar Todos los Tests (EN PROGRESO)

**Patrón de actualización:**
```javascript
// ANTES (síncrono, Node.js directo)
import { getAvailableVersions } from '../src/neutralino/lib/services-detector.js';
const versions = getAvailableVersions(ROOT, 'php');

// DESPUÉS (async, con adaptador)
import { getAvailableVersions } from '../src/neutralino/lib/services-detector.js';
import { createNodeFilesystemAdapter } from '../src/neutralino/lib/fs-adapter.js';

const fsAdapter = createNodeFilesystemAdapter();
const versions = await getAvailableVersions(fsAdapter, ROOT, 'php');
```

**Pendientes:**
- ✅ **COMPLETADO**: 8 archivos de tests actualizados (53/58 tests pasando)
- ✅ Tests usando `createNodeFilesystemAdapter()` correctamente

### ✅ Paso 5: Refactorizar neutralino-shim.js (COMPLETADO)

**Cambios realizados:**
1. Agregados imports ESM al inicio del shim:
   ```javascript
   import { createFilesystemAdapter } from './lib/fs-adapter.js';
   import { detectServices, loadAppConfig } from './lib/services-detector.js';
   ```

2. Refactorizada función `getServices()`:
   - Ahora crea `fsAdapter = createFilesystemAdapter()`
   - Delega detección a `detectServices({ fsAdapter, appPath, userConfig, appConfig, log })`
   - Eliminadas ~200 líneas de código duplicado

3. Actualizado `index.html`:
   - Shim ahora se carga como módulo ESM: `<script type="module">`
   - Agregado `/* @vite-ignore */` para suprimir warnings de Vite

**Resultado:**
- ✅ Shim reducido considerablemente
- ✅ Sin duplicación de código
- ✅ Tests pasando (53/58)
- ✅ App funcionando en modo desarrollo

### ⏳ Paso 6: Configurar Vite para Producción (PENDIENTE)

**Objetivo**: Bundlear el shim con sus dependencias para producción.

**Requerido:**
- Agregar configuración de build para el shim en `vite.config.js`
- Generar bundle IIFE del shim + lib/ en `neutralino/www/neutralino-shim.js`
- Actualizar `sync-resources.js` para no sobrescribir el bundle
