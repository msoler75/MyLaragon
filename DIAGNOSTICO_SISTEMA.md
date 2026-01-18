# Informe de Diagnóstico de Acceso a Disco

Este informe analiza por qué la aplicación WebServDev no encontraba los ejecutables de Laragon y verifica la estructura real del disco.

## Análisis del Error
El log del usuario mostró el siguiente error crítico:
`[SHIM] readDir error: Native method execution error occurred. Required parameter is missing:`

Este error se debió a una inconsistencia en la implementación del Shim de compatibilidad:
- La función `readDirectory` de Neutralinojs espera una **cadena de texto (string)** con la ruta.
- El código anterior estaba pasando un **objeto** `{ path: path }`.
- Al fallar esta lectura, la lista de `availableVersions` quedaba vacía (0 elementos).
- Como consecuencia, la app usaba el valor por defecto "2.4" del archivo `services.json`.
- La búsqueda fallaba porque la carpeta real se llama `httpd-2.4.62-240904-win64-VS17`, no `2.4`.

## Verificación de Estructura de Laragon (C:\laragon)

Mediante pruebas directas en terminal, se han confirmado las siguientes rutas:

### 1. Directorio de Binarios (Apache)
- **Ruta Base**: `C:\laragon\bin\apache`
- **Versiones detectadas**: 
  - `httpd-2.4.62-240904-win64-VS17`
  - `httpd-2.4.65-250724-Win64-VS17`

### 2. Ubicación del Ejecutable
- **Ruta Confirmada**: `C:\laragon\bin\apache\httpd-2.4.62-240904-win64-VS17\bin\httpd.exe`
- **Nota**: El ejecutable está dentro de una subcarpeta `bin/` bajo la carpeta de la versión.

### 3. Configuración de Laragon (laragon.ini)
- **Ruta**: `C:\laragon\usr\laragon.ini`
- **Sección Apache**: `Version=httpd-2.4.62-240904-win64-VS17`
- **Sección MySQL**: `Version=mysql-8.4.3-winx64`

## Pruebas de Permisos Realizadas
1. **Lectura de Directorios**: `SUCCESS` (vía terminal).
2. **Lectura de Archivos (INI)**: `SUCCESS` (vía terminal y verificado en logs de la app).
3. **Existencia de Binarios**: `SUCCESS` (vía terminal).

## Acciones Tomadas en el Código
1. **Corrección de la API Nativa**: Se han actualizado las llamadas a `Neutralino.filesystem.readDirectory(path)` y `Neutralino.filesystem.exists(path)` para pasar strings directos.
2. **Robustez en la Detección**: Se ha mejorado `getEnrichedServices` para que, una vez que `readDir` funcione, priorice los nombr2es reales de las carpetas encontrados en el disco sobre los valores estáticos del JSON.

---
*Diagnóstico gene2rado el 14 de enero de 2026*
