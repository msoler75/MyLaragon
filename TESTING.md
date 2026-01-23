# Arquitectura de Tests

WebServDev utiliza una arquitectura de tests de 3 categorías para validar diferentes aspectos de la aplicación.

## 📁 Estructura de Tests

```
tests/
├── *.spec.js              # Categoría 1: Tests de funciones locales (Node.js puro)
├── api-endpoints.spec.js  # Categoría 2: Suite unificada de tests de API HTTP
└── ui/                    # Categoría 3: Tests de UI/Browser (futuro)
    └── *.spec.js
```

## 🔬 Categoría 1: Tests de Funciones Locales

**Entorno**: Node.js puro (sin browser, sin servidor)  
**Objetivo**: Validar lógica de negocio y funciones utilitarias

### Características
- Importan funciones directamente desde `src/lib/`
- No requieren jsdom ni servidor HTTP
- Rápidos (<100ms por test)
- Usan filesystem, child_process directamente

### Ejemplo
```javascript
import { describe, it } from 'vitest';
import { getAvailableVersions } from '../src/lib/services-detector.js';

describe('Detección de servicios', () => {
  it('Debe detectar versiones de PHP', () => {
    const versions = getAvailableVersions('/path', 'php');
    assert.ok(versions.length > 0);
  });
});
```

### Tests Actuales
- `services.spec.js` - Detección de servicios instalados
- `php-detection.spec.js` - Detección de versiones PHP
- `php-apache-config.spec.js` - Actualización de httpd.conf
- `php-apache-filter.spec.js` - Filtrado de PHP por módulo Apache
- `api-services.spec.js` - Validación de services.json
- `debug-neutralino.spec.js` - Integración con Neutralino
- `log-parity.spec.js` - Sistema de logs
- `slow.spec.js` - Tests lentos con binarios reales
- `slow.install.spec.js` - Instalación real de servicios
- `apache-lifecycle.spec.js` - Ciclo de vida Apache


## 🌐 Categoría 2: Tests de API HTTP

**Entorno**: Node.js con servidor dedicado por test  
**Objetivo**: Validar todos los endpoints del dev-server.js

### Características
- Inicia su propio servidor HTTP en puerto 5174 (o alternativo si ocupado)
- Hace requests HTTP reales con `fetch()`
- Valida responses, status codes, headers, CORS
- Tests de integración completa (flujos end-to-end)
- Requiere Node.js 18+ con `fetch()` nativo

### Ejemplo
```javascript
describe('API REST - Dev Server Endpoints', () => {
  before(async () => {
    // Inicia servidor automáticamente
    serverProcess = spawn('node', ['src/api/dev-server.js'], {...});
  });
  
  it('GET /health debe responder ok', async () => {
    const response = await fetch('http://localhost:5174/health');
    assert.strictEqual(response.status, 200);
  });
});
```

### Endpoints Testeados
- `GET /health` - Health check básico
- `HEAD /health` - Health check sin body
- `POST /api/read-dir` - Listar directorios
- `POST /api/file-exists` - Verificar existencia de archivos
- `POST /api/read-file` - Leer contenido de archivos
- `POST /api/write-log` - Escribir en logs
- `GET /api/get-services` - Lista de servicios detectados
- `POST /api/exec-command` - Ejecutar comandos del sistema
- `404` - Endpoints inexistentes
- `CORS` - Headers y preflight requests
- **Integración completa** - Flujos end-to-end

### Test Actual
- `api-endpoints.spec.js` - Suite unificada con 20 tests que cubre todos los endpoints

### Setup
```bash
# Ejecutar suite completa (inicia servidor automáticamente)
npm run test:api

# O ejecutar todos los tests
npm run test
```

## 🔄 Tests de Ciclo de Vida (Lentos)

**Entorno**: Node.js con servicios reales instalados  
**Objetivo**: Validar arranque, funcionamiento y detención de servicios (Apache, MySQL, MailPit, PostgreSQL)

### Características
- Requieren `RUN_SLOW=1` para ejecutarse
- Usan binarios reales instalados en el sistema
- Validan procesos del sistema operativo
- Tests de integración con servicios externos
- **Inteligentes**: Saltan automáticamente si un servicio no está instalado
- Pueden tardar varios segundos por test

### Servicios Soportados
- **Apache** - Ciclo completo (detección → inicio → verificación → parada)
- **Nginx** - Ciclo completo (detección → inicio → verificación → parada)
- **MySQL** - Ciclo completo con inicialización de datos
- **MailPit** - Ciclo completo (servicio simple)
- **PostgreSQL** - Detección básica y verificación de binarios
- **Composer** - Herramienta de gestión de dependencias PHP

### Comportamiento Inteligente
Los tests detectan automáticamente si un servicio está instalado:
- ✅ **Si instalado**: Ejecuta tests completos de ciclo de vida
- ⏭️ **Si no instalado**: Salta los tests sin fallar, mostrando mensaje informativo

## 🎨 Categoría 3: Tests de UI/Browser (Futuro)

**Entorno**: jsdom, Playwright o Testing Library  
**Objetivo**: Validar componentes React e interacción DOM

### Características
- Requieren jsdom o browser real
- Testean componentes React aislados
- Validan interacción con DOM
- Simulan clicks, inputs, navegación

### Ejemplo (futuro)
```javascript
import { render, screen } from '@testing-library/react';
import ServicesView from '../src/Views/ServicesView';

test('Debe mostrar lista de servicios', () => {
  render(<ServicesView services={mockServices} />);
  expect(screen.getByText('Apache')).toBeInTheDocument();
});
```

### Setup (cuando se implemente)
```javascript
// vitest.config.js
export default defineConfig({
  test: {
    environment: 'jsdom', // Solo para tests de UI
    include: ['tests/ui/**/*.spec.js']
  }
});
```

## 🚀 Comandos de Ejecución

```bash
# Todos los tests (Categoría 1 + API unificada)
npm run test

# Tests de funciones locales (Categoría 1)
npm run test:unit

# Suite de API completa (Categoría 2)
npm run test:api

# Test específico
npx vitest run tests/php-detection.spec.js

# Tests lentos (instalación real)
npm run test:slow

# Tests de instalación
npm run test:install

# Tests de ciclo de vida (arranque/detención)
npm run test:lifecycle

# Tests de ciclo de vida específicos
npm run test:lifecycle:mysql
npm run test:lifecycle:mailpit
npm run test:lifecycle:postgresql
npm run test:lifecycle:nginx

# Todos los tests de ciclo de vida
npm run test:lifecycle:all
```

## 📊 Resumen

| Categoría | Archivo | Entorno | Velocidad | Cobertura |
|-----------|---------|---------|-----------|-----------|
| 1. Funciones Locales | `*.spec.js` | Node.js puro | Rápido (<100ms) | Lógica de negocio, filesystem |
| 2. API HTTP | `api-endpoints.spec.js` | Node.js + servidor | Medio (2-10s) | Todos los endpoints REST |
| 3. UI/Browser | `ui/*.spec.js` | jsdom/Playwright | Lento (>1s) | Componentes React |

## ⚙️ Configuración

**Entorno**: Node.js 18+ con Vitest  
**Framework**: Vitest (para mejor experiencia de desarrollo y características avanzadas)

**Nota**: Vitest está instalado como dependencia local del proyecto. Usa `npm run test` para ejecutar los tests, o `npx vitest` para comandos directos.

**package.json** (scripts disponibles):
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:api": "vitest run tests/api-endpoints.spec.js",
    "test:unit": "vitest run --exclude tests/api-endpoints.spec.js",
    "test:slow": "cross-env RUN_SLOW=1 vitest run tests/slow.spec.js",
    "test:install": "cross-env RUN_SLOW=1 vitest run tests/slow.install.spec.js",
    "test:lifecycle": "cross-env RUN_SLOW=1 vitest run tests/apache-lifecycle.spec.js",
    "test:lifecycle:mysql": "cross-env RUN_SLOW=1 vitest run tests/mysql-lifecycle.spec.js",
    "test:lifecycle:mailpit": "cross-env RUN_SLOW=1 vitest run tests/mailpit-lifecycle.spec.js",
    "test:lifecycle:postgresql": "cross-env RUN_SLOW=1 vitest run tests/postgresql-lifecycle.spec.js",
    "test:lifecycle:nginx": "cross-env RUN_SLOW=1 vitest run tests/nginx-lifecycle.spec.js",
    "test:lifecycle:all": "cross-env RUN_SLOW=1 vitest run tests/apache-lifecycle.spec.js tests/mysql-lifecycle.spec.js tests/mailpit-lifecycle.spec.js tests/postgresql-lifecycle.spec.js tests/nginx-lifecycle.spec.js"
  }
}
```

## 🎯 Principios

1. **Realismo**: Tests usan código real de la app, no mocks innecesarios
2. **Velocidad**: Categoría 1 debe ser rápida para feedback inmediato
3. **Consolidación**: Suite unificada para API reduce redundancia
4. **Claridad**: Separación clara entre categorías y responsabilidades
5. **Mantenibilidad**: Tests simples, directos y auto-contenidos
6. **Cobertura**: Validar flujos críticos en producción

---

**Nota**: La suite de API (`api-endpoints.spec.js`) inicia su propio servidor, eliminando dependencias externas.

**Nota**: Los tests de ciclo de vida requieren servicios reales instalados y usan `RUN_SLOW=1` para ejecutarse, validando el arranque y detención completa de servicios como Apache, Nginx, MySQL, MailPit y PostgreSQL. Son inteligentes y saltan automáticamente si un servicio no está instalado.

