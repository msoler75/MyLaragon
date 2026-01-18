# Guía de Desarrollo - WebServDev

## Configuración del Entorno

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Laragon instalado en C:\laragon (o configurable)

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run electron-dev
```

Esto inicia:
- Vite dev server en http://localhost:5173
- Electron app cargando desde el dev server

### Build
```bash
npm run build
npm run electron
```

### Build Neutralino (Desktop Independiente)
```bash
npm run dist
```

Genera ejecutable en `neutralino/dist/WebServDev/WebServDev-win_x64.exe`

## Configuración de Neutralino - Guía Definitiva (Actualizado 2026-01-14)

### El Gran Desafío: El Bundle de Recursos (`resources.neu`)
Neutralino empaqueta los archivos de la app en un binario. El acceso a estos archivos varía drásticamente si se usa el servidor interno o el protocolo `file:`.

### Solución Implementada: MODO BUNDLED + SERVER

Después de realizar pruebas exhaustivas con un script de fuerza bruta, la configuración más estable para esta aplicación React es:

#### Configuración Correcta (PRODUCCIÓN)

Durante el proceso de `npm run dist`, el script `scripts/build-config.js` inyecta automáticamente esta configuración:

```json
{
  "enableServer": true,
  "documentRoot": "/www/",
  "url": "/index.html",
  "port": 0,
  "cli": {
    "resourcesPath": "./www/",
    "clientLibrary": "./www/neutralino.js"
  }
}
```

#### Racional de la Solución:

| Parámetro | Valor | Razón |
|-----------|-------|-------|
| `enableServer` | `true` | Necesario para que React y las rutas funcionen como una Web App normal. |
| `documentRoot` | `"/www/"` | **CRÍTICO:** Le dice al servidor interno que busque archivos dentro de la carpeta `www` del bundle binario. |
| `url` | `"/index.html"` | Al tener el `documentRoot` en `/www/`, la raíz del servidor es ahora nuestro index. |
| `port` | `0` | Usa un puerto aleatorio disponible para evitar conflictos con otros servicios de Laragon. |

### Carga Resiliente de Datos (JSON)

#### El Problema:
- Con el servidor interno, las llamadas `fetch('/services.json')` a veces fallan por latencia en el inicio del servidor o por el puerto dinámico.
- El filesystem API de Neutralino suele ser más rápido y fiable para datos locales.

#### La Solución:
Hemos implementado una estrategia de carga "Cascada" en `public/neutralino-shim.js`:
1. **Intento 1:** Usar `Neutralino.filesystem.readFile('./www/services.json')`.
2. **Intento 2:** Realizar `fetch` a rutas relativas (`services.json`, `/services.json`).
3. **Fallback:** Carga de datos mínimos hardcodeados si todo lo anterior falla.

---

### Estructura del Bundle Finalizada

```
resources.neu (empaquetado)
├── www/
│   ├── index.html          (compilado por Vite)
│   ├── services.json       (copiado desde public/)
│   ├── neutralino.js       (SDK de Neutralino)
│   ├── neutralino-shim.js  (bridge entre app y Neutralino)
│   └── assets/
│       ├── index-[hash].js   (React bundle)
│       └── index-[hash].css  (Tailwind compiled)
```

### Scripts de Build Relevantes

- `scripts/build-config.js`: Prepara el `neutralino.config.json` para producción.
- `scripts/init_folders.js`: Crea la estructura de carpetas necesaria.

## Filosofía de Desarrollo y UX

Para asegurar que la aplicación mantenga un estándar de calidad alto (XP de excelencia), consulta la **[Guía de Excelencia en UX](EXCELENCIA_UX.md)**. Todos los nuevos módulos de servicios o integraciones deben cumplir con los principios de sincronización en tiempo real y resiliencia de rutas allí descritos.

## Estructura del Código

### React Components
- `App.jsx`: Layout principal con navegación
- Componentes funcionales con hooks
- Props para pasar datos entre componentes

### Electron
- `electron/main.js`: Proceso principal, ventana, IPC handlers
- `electron/preload.js`: APIs expuestas al renderer

### Estilos
- Tailwind CSS 4 con configuración en `src/index.css`
- Clases utility-first

## Añadir Nuevos Servicios

1. Actualizar `serviceList` en `Services` component
2. Añadir handler en `main.js` para el servicio específico
3. Implementar lógica de start/stop usando child_process

## Añadir Nuevos Comandos

1. Extender `electronAPI` en `preload.js`
2. Añadir handler IPC en `main.js`
3. Llamar desde React components

## Debugging

- **React**: DevTools del navegador (F12 en Electron)
- **Electron**: mainWindow.webContents.openDevTools()
- **Consola**: Logs en terminal donde corre `npm run electron-dev`

## Buenas Prácticas

- Mantener separación entre UI y lógica del sistema
- Usar async/await para operaciones IPC
- Validar existencia de rutas antes de operaciones
- Manejar errores gracefully

## Testing

- Probar en Windows 11
- Verificar compatibilidad con diferentes versiones de Laragon
- Testear operaciones de archivos y procesos

## Deployment

Usar electron-builder para generar instalador:

```bash
npm install -g electron-builder
electron-builder --win
```

## Pruebas fallidas (registro de lo **NO** hacer) — 2026-01-11 ✅

A continuación se documentan las pruebas que llevamos a cabo y **por qué fallaron**, para no volver a repetirlas tal cual:

- **Eliminar `resources.neu` y esperar que todo siga funcionando**
  - Qué hicimos: borramos `resources.neu` para forzar carga desde disco (unpacked).
  - Resultado: `NE_RS_TREEGER: Resource file tree generation error` y fallos al iniciar; en otras ejecuciones el app quedaba en blanco o el empaquetador no podía parchear el exe.
  - Por qué NO repetirlo: borrar `resources.neu` sin ajustar consistentemente `neutralino.config.json` y la estructura de `dist/` produce rutas inconsistentes y errores en runtime.

- **`enableServer: true` con URLs básicas (p. ej. `/` o `/index.html`)**
  - Qué hicimos: activamos el servidor interno esperando que sirviera los assets empaquetados.
  - Resultado: multiples 404 en `neutralinojs.log` (ej. `/neutralino.js`, `/assets/*.js`, `/assets/*.css`) y pantalla en blanco.
  - Por qué NO repetirlo: el servidor interno demostró ser poco fiable para nuestra estructura; evita usarlo salvo que sepas que todas las rutas del paquete coinciden exactamente.

- **Usar `url` y `documentRoot` con rutas relativas incorrectas**
  - Qué hicimos: pusimos `url: "www/index.html"` o `url: "index.html"` sin corregir `documentRoot`.
  - Resultado: app vacía (body vacío) y `NE_RS_UNBLDRE` por archivo no encontrado.
  - Por qué NO repetirlo: `url` se interpreta desde la raíz del bundle / servidor; debe coincidir exactamente con la estructura dentro del paquete o con `www/` en disco.

- **Confiar en `fetch('/services.json')` dentro de `resources.neu`**
  - Qué hicimos: dejamos llamadas a `fetch('/services.json')` para producción.
  - Resultado: fallaban en producción (no encontraban el recurso dentro del paquete).
  - Por qué NO repetirlo: en producción empaquetada, usar `fetch` a rutas absolutas suele fallar; preferir fallback en JS, o incluir datos como módulo en `www/assets/`.

- **Sobrescribir el `bootstrap.html` post-build con un placeholder**
  - Qué hicimos: generamos un placeholder que a veces sobreescribía nuestro probe con lógica.
  - Resultado: probe perdido/duplicaciones y confusión sobre qué archivo era el real.
  - Por qué NO repetirlo: mantener un único `bootstrap.html` autorizado (copiar desde `neutralino/bootstrap.html` a `neutralino/www/bootstrap.html`) evita inconsistencias.

- **Inyectar HTML con `document.write()` en vez de navegar**
  - Qué hicimos: reemplazábamos el documento con el HTML descubierto por el probe.
  - Resultado: los assets relativos (p. ej. `./neutralino.js`) no se resolvían correctamente y fallaban.
  - Lección: usar `window.location.replace(foundPath)` para que el motor resuelva assets relativos correctamente.

- **Intentar reempaquetar mientras una instancia del exe está corriendo**
  - Qué pasó: `EBUSY` y errores al parchear ejecutables durante `neu build`.
  - Por qué NO repetirlo: cerrar la app antes de volver a ejecutar el empaquetado.

- **Usar APIs nativas sin asegurar que `neutralino.js` fue cargado**
  - Qué hicimos: llamamos a `Neutralino.*` en el bootstrap inmediatamente.
  - Resultado: llamadas silenciosas o excepciones porque `neutralino.js` aún no estaba disponible.
  - Lección: comprobar `typeof Neutralino !== 'undefined'` y preferir un pequeño loader/retry.

---

Si quieres, puedo añadir también un checklist automatizable (script) que ejecute estas pruebas y deje un archivo `PRUEBAS_FALLIDAS.md` con timestamps cada vez que una prueba falle, para mantener el historial en el repo. ¿Lo añado? 