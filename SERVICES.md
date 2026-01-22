# Compatibilidad y Gestión de Servicios

Este documento detalla las compatibilidades entre servicios, requisitos técnicos y procedimientos para actualizaciones de versiones.

## Tabla de Contenidos

1. [Apache + PHP](#apache--php)
2. [NGINX + PHP](#nginx--php)
3. [Actualizaciones de Apache](#actualizaciones-de-apache)
4. [Actualizaciones de NGINX](#actualizaciones-de-nginx)
5. [Actualizaciones de PHP](#actualizaciones-de-php)
6. [Arquitectura de Detección](#arquitectura-de-detección)

---

## Apache + PHP

### Requisitos de Compatibilidad

**Módulo Requerido:** `php*apache2_4.dll`

Apache requiere un módulo PHP específico para su versión. El módulo debe coincidir con:
- **Versión de Apache:** 2.4.x → `php*apache2_4.dll`
- **Thread-Safety:** Apache en Windows requiere versiones **TS (Thread-Safe)** de PHP
- **Arquitectura:** 64-bit (VS16/VS17/VS18)

### Versiones PHP Compatibles

| Versión PHP | Módulo Apache | Thread-Safe | Compatible |
|-------------|---------------|-------------|------------|
| 8.3.x (TS)  | php8apache2_4.dll | ✅ Sí | ✅ Sí |
| 8.2.x (TS)  | php8apache2_4.dll | ✅ Sí | ✅ Sí |
| 8.1.x (TS)  | php8apache2_4.dll | ✅ Sí | ✅ Sí |
| 8.x (NTS)   | - | ❌ No | ❌ No |
| 7.4.x (TS)  | php7apache2_4.dll | ✅ Sí | ✅ Sí |

### Detección Automática

El sistema filtra automáticamente las versiones de PHP compatibles:

**Archivo:** `src/src/lib/services-detector.js` (función de detección compartida)
```javascript
const phpVersionsWithApacheModule = availablePhp.filter(v => {
  const bin = getServiceBinPath(appPath, 'php', v, log);
  // Busca php*apache2_4.dll en el directorio de PHP
  const files = fs.readdirSync(dir);
  return files.some(f => /^php\d+apache2_4\.dll$/i.test(f));
});
```

**Archivo:** `src/neutralino/neutralino-shim.js` (líneas 1044-1062)
```javascript
const phpVersionsWithApacheModule = [];
for (const v of phpVersions) {
  const files = await readDirShim(phpDir);
  const hasApacheModule = files.some(f => /^php\d+apache2_4\.dll$/i.test(f));
  if (hasApacheModule) {
    phpVersionsWithApacheModule.push(v);
  }
}
svc.availablePhpVersions = phpVersionsWithApacheModule;
```

### Configuración httpd.conf

Al cambiar la versión de PHP, se actualizan automáticamente:

```apache
LoadModule php_module "C:/path/to/php/php8apache2_4.dll"
PHPIniDir "C:/path/to/php"
```

**Ver:** `src/neutralino/neutralino-shim.js` (líneas 1718-1852)

---

## NGINX + PHP

### Requisitos de Compatibilidad

**Protocolo:** FastCGI (php-cgi.exe)

NGINX se comunica con PHP a través del protocolo FastCGI, **no requiere módulos .dll específicos**.

### Versiones PHP Compatibles

| Versión PHP | Thread-Safe | Compatible |
|-------------|-------------|------------|
| 8.3.x (TS)  | ✅ Sí | ✅ Sí |
| 8.3.x (NTS) | ❌ No | ✅ Sí* |
| 8.2.x (TS)  | ✅ Sí | ✅ Sí |
| 8.2.x (NTS) | ❌ No | ✅ Sí* |
| 8.1.x (TS)  | ✅ Sí | ✅ Sí |
| 8.1.x (NTS) | ❌ No | ✅ Sí* |

**Nota:*** Las versiones NTS (Non Thread-Safe) son **preferibles para NGINX** por mejor rendimiento.

### Configuración nginx.conf

NGINX requiere configuración FastCGI para conectarse con PHP:

```nginx
location ~ \.php$ {
    fastcgi_pass   127.0.0.1:9000;  # Puerto PHP-CGI
    fastcgi_index  index.php;
    fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include        fastcgi_params;
}
```

### Ejecutable PHP-CGI

NGINX requiere iniciar PHP en modo FastCGI:

```bash
php-cgi.exe -b 127.0.0.1:9000
```

**Archivo requerido:** `php-cgi.exe` (incluido en todas las versiones de PHP)

### Sin Filtrado de Versiones

A diferencia de Apache, **NGINX puede usar cualquier versión de PHP** (TS o NTS) porque no depende de módulos compilados.

**TODO:** Implementar selección de versiones PHP para NGINX en la UI.

---

## Actualizaciones de Apache

### Escenario: Apache 2.5.x

Si Apache lanza una versión 2.5.x, los pasos son:

#### 1. Verificar Módulo PHP Requerido

Apache 2.5 podría requerir `php*apache2_5.dll`. Verificar en:
- [Documentación oficial de Apache](https://httpd.apache.org/)
- [PHP para Windows](https://windows.php.net/)

#### 2. Actualizar Expresión Regular de Detección

**Archivo:** `electron/services-detector.js`

```javascript
// ANTES (solo Apache 2.4)
return files.some(f => /^php\d+apache2_4\.dll$/i.test(f));

// DESPUÉS (Apache 2.4 y 2.5)
const apacheMajorMinor = apacheVersion.match(/^(\d+\.\d+)/)[1].replace('.', '_');
const moduleRegex = new RegExp(`^php\\d+apache${apacheMajorMinor}\\.dll$`, 'i');
return files.some(f => moduleRegex.test(f));
```

**Archivo:** `src/neutralino/neutralino-shim.js` (mismo cambio)

#### 3. Actualizar services.json

**Archivo:** `src/neutralino/services.json`

Añadir nueva versión:

```json
{
  "name": "Apache",
  "type": "apache",
  "versions": [
    {
      "version": "2.5.0",
      "url": "https://www.apachelounge.com/download/VS17/binaries/httpd-2.5.0-win64-VS17.zip",
      "filename": "httpd-2.5.0-win64-VS17.zip"
    }
  ]
}
```

#### 4. Actualizar Configuración httpd.conf

Verificar cambios en directivas de configuración entre 2.4 y 2.5.

**Archivo:** `src/neutralino/neutralino-shim.js` (función `updateServiceVersion`)

```javascript
// Detectar versión de Apache para ajustar configuración
const apacheVersion = apache.version;
if (apacheVersion.startsWith('2.5')) {
  // Posibles ajustes específicos para 2.5
}
```

#### 5. Tests de Compatibilidad

Actualizar tests para verificar ambas versiones:

**Archivo:** `tests/php-apache-config.spec.js`

```javascript
test("Debe soportar Apache 2.4 y 2.5", () => {
  // Test con ambas versiones
});
```

---

## Actualizaciones de NGINX

### Escenario: NGINX 1.26.x o 2.0.x

NGINX tiene retrocompatibilidad estable. Los cambios requeridos son mínimos:

#### 1. Actualizar services.json

**Archivo:** `src/neutralino/services.json`

```json
{
  "name": "NGINX",
  "type": "nginx",
  "versions": [
    {
      "version": "1.26.0",
      "url": "https://nginx.org/download/nginx-1.26.0.zip",
      "filename": "nginx-1.26.0.zip"
    }
  ]
}
```

#### 2. Verificar Compatibilidad FastCGI

NGINX mantiene compatibilidad con FastCGI en todas las versiones modernas. **No requiere cambios de código**.

#### 3. Configuración nginx.conf

Revisar documentación oficial de NGINX para posibles nuevas directivas:
- [NGINX Documentation](https://nginx.org/en/docs/)

#### 4. Implementar Gestión de PHP-CGI

**TODO:** Crear gestor de procesos PHP-CGI para NGINX.

**Archivo propuesto:** `src/services/php-cgi-manager.js`

```javascript
export class PhpCgiManager {
  constructor(phpPath, port = 9000) {
    this.phpPath = phpPath;
    this.port = port;
    this.process = null;
  }

  start() {
    const phpCgi = path.join(this.phpPath, 'php-cgi.exe');
    this.process = spawn(phpCgi, ['-b', `127.0.0.1:${this.port}`]);
  }

  stop() {
    if (this.process) {
      this.process.kill();
    }
  }
}
```

---

## Actualizaciones de PHP

### Nuevas Versiones PHP (8.4, 9.0)

#### 1. Verificar Módulo Apache

Descargar versión TS de PHP y verificar:
- ✅ Existe `php*apache2_4.dll` (o `php*apache2_5.dll`)
- ✅ Versión de Visual C++ compatible con Apache

#### 2. Actualizar services.json

**Archivo:** `src/neutralino/services.json`

```json
{
  "name": "PHP",
  "type": "php",
  "versions": [
    {
      "version": "8.4.0 (TS)",
      "url": "https://windows.php.net/downloads/releases/php-8.4.0-Win32-vs16-x64.zip",
      "filename": "php-8.4.0-Win32-vs16-x64.zip"
    },
    {
      "version": "8.4.0 (NTS)",
      "url": "https://windows.php.net/downloads/releases/php-8.4.0-nts-Win32-vs16-x64.zip",
      "filename": "php-8.4.0-nts-Win32-vs16-x64.zip"
    }
  ]
}
```

#### 3. Tests de Regresión

Ejecutar suite completa de tests:

```bash
npm test
```

Específicamente:
- `tests/php-apache-config.spec.js` - Compatibilidad Apache
- `tests/php-detection.spec.js` - Detección de versiones

---

## Arquitectura de Detección

### Flujo de Detección de Servicios

```
1. Escaneo de directorios
   ├── bin/[servicio]/[versión]
   ├── neutralino/bin/[servicio]/[versión]
   └── usr/bin/[servicio]/[versión]

2. Detección de ejecutables
   ├── httpd.exe (Apache)
   ├── nginx.exe (NGINX)
   ├── php.exe (PHP)
   └── php-cgi.exe (PHP para NGINX)

3. Filtrado de compatibilidades
   ├── Apache: Solo PHP con php*apache2_4.dll
   ├── NGINX: Todas las versiones PHP
   └── PHP standalone: Todas las versiones

4. Generación de configuraciones
   ├── Apache: httpd.conf, php.ini
   ├── NGINX: nginx.conf, php.ini
   └── MySQL: my.ini
```

### Archivos Clave

| Archivo | Responsabilidad |
|---------|----------------|
| `src/lib/services-detector.js` | Detección de servicios (Node.js compartido) |
| `src/neutralino/neutralino-shim.js` | Integración con Neutralino |
| `src/neutralino/services.json` | Definición de servicios instalables |
| `src/Views/ServicesView.jsx` | UI de selección de versiones |
| `tests/php-apache-config.spec.js` | Tests de compatibilidad |

### Expresiones Regulares Críticas

```javascript
// Detección módulo Apache
/^php\d+apache2_4\.dll$/i

// Detección ejecutables
/httpd\.exe$/i
/nginx\.exe$/i
/php\.exe$/i
/php-cgi\.exe$/i

// Detección versión PHP
/^(\d+\.\d+\.\d+)\s*\((TS|NTS)\)$/
```

---

## Mejoras Futuras

### Alta Prioridad

- [ ] **NGINX + PHP-CGI Manager**: Implementar inicio/parada automática de php-cgi.exe
- [ ] **Detección de Visual C++ Runtime**: Verificar dependencias antes de instalar
- [ ] **Validación de compatibilidad pre-instalación**: Advertir incompatibilidades

### Media Prioridad

- [ ] **Soporte Apache 2.5**: Preparar código para futuras versiones
- [ ] **PHP 8.4/9.0**: Monitorear releases y actualizar services.json
- [ ] **Logs de compatibilidad**: Mejorar mensajes de error cuando faltan módulos

### Baja Prioridad

- [ ] **Configuración automática NGINX+PHP**: Generar nginx.conf con FastCGI
- [ ] **Migración de versiones**: Copiar configuraciones al cambiar versiones
- [ ] **Snapshot de configuraciones**: Backup antes de modificar httpd.conf/nginx.conf

---

## Recursos Externos

### Documentación Oficial

- [Apache HTTP Server](https://httpd.apache.org/)
- [Apache Lounge (Windows Builds)](https://www.apachelounge.com/download/)
- [PHP for Windows](https://windows.php.net/)
- [NGINX Documentation](https://nginx.org/en/docs/)
- [FastCGI Specification](https://fastcgi-archives.github.io/)

### Comunidad

- [Apache Friends Forum](https://community.apachefriends.org/)
- [PHP Windows Builds](https://github.com/php/php-src)
- [NGINX Forum](https://forum.nginx.org/)

---

## Contacto y Contribuciones

Para reportar problemas de compatibilidad o sugerir mejoras:
- **Issues:** [GitHub Issues](https://github.com/msoler75/MyLaragon/issues)
- **Pull Requests:** Bienvenidos para mejorar la detección de compatibilidades

---

**Última actualización:** 22 de enero de 2026  
**Versión del documento:** 1.0.0
