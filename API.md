# API REST - Dev Server

Documentación de la API REST expuesta por `src/api/dev-server.js` durante el modo desarrollo.

## Información General

- **URL Base**: `http://localhost:5174`
- **Puerto**: 5174
- **Protocolo**: HTTP
- **Formato**: JSON (excepto `/api/read-file` que devuelve texto plano)
- **CORS**: Habilitado para `*`

## Arquitectura

El dev-server es un servidor HTTP (Node.js) que expone funcionalidades del sistema de archivos y otras operaciones necesarias para la aplicación en modo desarrollo. Actúa como puente entre el navegador (que no tiene acceso directo al filesystem) y el sistema operativo.

### Flujo de Datos

```
Browser → fetch('/api/read-dir') → Vite Proxy (5173) → Dev Server (5174) → Node.js fs.readdir() → Response
```

En producción, estas mismas operaciones se realizan usando la API nativa de Neutralino.js.

## Endpoints

### 1. Health Check

**`HEAD /health`** o **`GET /health`**

Verifica que el servidor está activo y funcionando.

#### Request
```http
GET /health HTTP/1.1
Host: localhost:5174
```

#### Response
```json
{
  "status": "ok",
  "timestamp": 1737579845272
}
```

**Códigos de Estado:**
- `200 OK`: Servidor funcionando correctamente

---

### 2. Leer Directorio

**`POST /api/read-dir`**

Lista el contenido de un directorio especificado.

#### Request
```http
POST /api/read-dir HTTP/1.1
Host: localhost:5174
Content-Type: application/json

{
  "path": "./neutralino/bin/php"
}
```

#### Response
```json
{
  "entries": [
    { "entry": "8.1.34 (NTS)", "type": "DIRECTORY" },
    { "entry": "8.1.34 (TS)", "type": "DIRECTORY" },
    { "entry": "8.2.30 (TS)", "type": "DIRECTORY" },
    { "entry": "8.3.29 (NTS)", "type": "DIRECTORY" },
    { "entry": "8.3.29 (TS)", "type": "DIRECTORY" }
  ]
}
```

**Parámetros:**
- `path` (string, requerido): Ruta relativa o absoluta del directorio a listar

**Respuesta:**
- `entries` (array): Array de objetos con información de cada entrada
  - `entry` (string): Nombre del archivo o directorio
  - `type` (string): Tipo de entrada (`"FILE"` o `"DIRECTORY"`)

**Códigos de Estado:**
- `200 OK`: Directorio leído exitosamente
- `500 Internal Server Error`: Error al leer el directorio

---

### 3. Verificar Existencia de Archivo/Directorio

**`POST /api/file-exists`**

Verifica si un archivo o directorio existe en el sistema de archivos.

#### Request
```http
POST /api/file-exists HTTP/1.1
Host: localhost:5174
Content-Type: application/json

{
  "path": "./neutralino/bin/php/8.3.29 (NTS)/php.exe"
}
```

#### Response
```json
{
  "exists": true
}
```

**Parámetros:**
- `path` (string, requerido): Ruta del archivo o directorio a verificar

**Respuesta:**
- `exists` (boolean): `true` si existe, `false` si no existe

**Códigos de Estado:**
- `200 OK`: Verificación completada (independientemente del resultado)
- `500 Internal Server Error`: Error durante la verificación

---

### 4. Leer Archivo

**`POST /api/read-file`**

Lee el contenido completo de un archivo de texto.

#### Request
```http
POST /api/read-file HTTP/1.1
Host: localhost:5174
Content-Type: application/json

{
  "path": "./app.ini"
}
```

#### Response
```
[app]
version=1.0.0
port=8000
```

**Parámetros:**
- `path` (string, requerido): Ruta del archivo a leer

**Respuesta:**
- Contenido del archivo como texto plano (Content-Type: `text/plain`)

**Códigos de Estado:**
- `200 OK`: Archivo leído exitosamente
- `500 Internal Server Error`: Error al leer el archivo (no existe, sin permisos, etc.)

---

### 5. Escribir Log

**`POST /api/write-log`**

Escribe un mensaje en el archivo de log de la aplicación (`app-debug.log`). El mensaje se añade al final del archivo (append mode) con timestamp automático.

#### Request
```http
POST /api/write-log HTTP/1.1
Host: localhost:5174
Content-Type: application/json

{
  "message": "[DETECTOR] PHP: availableVersions=[], selected=undefined\n"
}
```

#### Response
```json
{
  "success": true
}
```

**Parámetros:**
- `message` (string, requerido): Mensaje a escribir en el log. Puede incluir el timestamp si se desea un formato específico.

**Comportamiento:**
- El mensaje se añade automáticamente un timestamp en formato ISO: `[2026-01-22T20:24:05.272Z]`
- Se escribe en modo append (no sobrescribe logs anteriores)
- Ruta del log: `./app-debug.log` (relativo a la raíz del proyecto)

**Respuesta:**
- `success` (boolean): `true` si se escribió correctamente

**Códigos de Estado:**
- `200 OK`: Log escrito exitosamente
- `500 Internal Server Error`: Error al escribir en el archivo de log

---

## Manejo de Errores

Todos los endpoints pueden devolver errores en el siguiente formato:

```json
{
  "error": "Error message description"
}
```

**Errores Comunes:**
- `404 Not Found`: Endpoint no existe
- `500 Internal Server Error`: Error en el servidor (con `error` describiendo el problema)

## Ejemplos de Uso

### Ejemplo 1: Listar versiones de PHP disponibles

```javascript
const response = await fetch('http://localhost:5174/api/read-dir', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ path: './neutralino/bin/php' })
});

const data = await response.json();
console.log('Versiones de PHP:', data.entries.map(e => e.entry));
// Output: ['8.1.34 (NTS)', '8.1.34 (TS)', '8.2.30 (TS)', '8.3.29 (NTS)', '8.3.29 (TS)']
```

### Ejemplo 2: Verificar si existe un ejecutable

```javascript
const response = await fetch('http://localhost:5174/api/file-exists', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ path: './neutralino/bin/apache/2.4.66/bin/httpd.exe' })
});

const data = await response.json();
if (data.exists) {
  console.log('✅ Apache encontrado');
} else {
  console.log('❌ Apache no encontrado');
}
```

### Ejemplo 3: Leer archivo de configuración

```javascript
const response = await fetch('http://localhost:5174/api/read-file', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ path: './app.ini' })
});

const content = await response.text();
console.log('Configuración:', content);
```

### Ejemplo 4: Escribir en el log

```javascript
await fetch('http://localhost:5174/api/write-log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: '[CUSTOM] Usuario hizo clic en botón de instalación'
  })
});
```

## Integración con fs-adapter

El módulo `fs-adapter.js` abstrae las diferencias entre desarrollo y producción:

```javascript
// En DEV mode, fs-adapter hace fetch a la API
const result = await fsAdapter.readDir('./neutralino/bin/php');
// Internamente ejecuta: fetch('/api/read-dir', { ... })

// En PROD mode, fs-adapter usa Neutralino.js
const result = await Neutralino.filesystem.readDirectory('./neutralino/bin/php');
```

Ambos devuelven el mismo formato: `{ entries: [...] }`

## Proxy de Vite

Durante desarrollo, Vite actúa como proxy para redirigir las peticiones `/api/*` al dev-server:

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true
      }
    }
  }
}
```

Esto permite que el frontend en `http://localhost:5173` pueda hacer peticiones a `/api/read-dir` sin problemas de CORS.

## Logging y Debugging

El dev-server incluye logging detallado en consola:

```
[DEBUG] Starting server...
[SERVER] 🚀 Debug API Server running on http://localhost:5174
[SERVER] Ready to accept requests
[REQUEST] POST /api/read-dir
[ADAPTER] readDir called: ./neutralino/bin/php
[ADAPTER] readdir returned 5 entries
[REQUEST] /api/read-dir response sent
```

Estos logs ayudan a diagnosticar problemas durante el desarrollo.

## Comandos Útiles

### Iniciar solo el dev-server
```bash
node src/api/dev-server.js
```

### Iniciar aplicación completa (dev-server + vite + neutralino)
```bash
npm run dev
```

### Probar endpoint manualmente
```bash
# PowerShell
$body = @{ path = "./neutralino/bin/php" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5174/api/read-dir" -Method POST -Body $body -ContentType "application/json"
```

## Notas de Implementación

1. **Rutas Relativas**: Todas las rutas se resuelven desde el directorio raíz del proyecto
2. **Modo Append**: El endpoint `/api/write-log` siempre añade al archivo existente, nunca sobrescribe
3. **Encoding**: Los archivos de texto se leen con encoding UTF-8
4. **Error Handling**: Todos los endpoints capturan excepciones y devuelven respuestas JSON con el error
5. **Concurrencia**: El servidor usa `concurrently` para ejecutarse en paralelo con Vite y Neutralino

## Solución de Problemas

### El servidor no arranca
- Verificar que el puerto 5174 no esté en uso
- Comprobar logs de consola para errores de sintaxis
- Ejecutar: `node --check src/api/dev-server.js`

### 404 Not Found en endpoints
- Verificar que el servidor está corriendo
- Comprobar la URL del endpoint (sensible a mayúsculas)
- Revisar que el método HTTP sea correcto (todos excepto `/health` son POST)

### Timeout en wait-on
- El servidor debe responder a `HEAD /health` correctamente
- Verificar firewall no está bloqueando el puerto 5174
- Aumentar timeout en `package.json` si el inicio es lento

## Referencias

- Implementación: [src/api/dev-server.js](src/api/dev-server.js)
- Adapter: [src/neutralino/lib/fs-adapter.js](src/neutralino/lib/fs-adapter.js)
- Arquitectura: [ARCHITECTURE.md](ARCHITECTURE.md)
- Desarrollo: [DEVELOPMENT.md](DEVELOPMENT.md)
