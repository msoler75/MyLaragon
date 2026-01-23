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

### 6. Obtener Servicios Disponibles



GET /api/get-services 

Obtiene los servicios de la aplicación.

-la vista "instalar" ha de mostrar todos los servicios existentes y sus versiones existentes. y para cada version indicar si ya está instalada o no. con botones de instalar o desinstalar cada version.
-Y la vista "servicios" ha de mostrar servicios con botones de "iniciar" (si ese servicio tiene instalada alguna version) o "detener" si el servicio está iniciado. Pero no se muestan servicios de tipo lenguage (como php o python) porque no se pueden "iniciar" o "detener" como tales, son lenguages

Por tanto este endpoint ha de devolver toda la informacion necesaria para que la vista "instalar" y la vista "servicios" puedan mostrar la informacion correcta.

Este endpoint permite permite filtros, como por ejemplo "/api/get-services/{nombre_servicio}" para saber si el {nombre_servicio}está instalado y/o iniciado apache, y sus versiones disponibles, instaladas y las no instaladas.