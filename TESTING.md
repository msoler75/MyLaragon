# Arquitectura de Tests

WebServDev utiliza una arquitectura de tests de 3 categorías para validar diferentes aspectos de la aplicación.

## 📁 Estructura de Tests

```
tests/
├── *.spec.js              # Categoría 1: Tests de funciones locales (Node.js puro)
├── api/                   # Categoría 2: Tests de API HTTP
│   └── *.spec.js
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
import { getAvailableVersions } from '../src/lib/services-detector.js';

test('Debe detectar versiones de PHP', () => {
  const versions = getAvailableVersions('/path', 'php');
  assert.ok(versions.length > 0);
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

**Entorno**: Node.js con `fetch()` contra servidor local  
**Objetivo**: Validar endpoints del shim en modo desarrollo

### Características
- Hacen requests HTTP reales a `localhost:5173/api/*`
- Validan que el shim responde correctamente
- Requieren que el servidor esté corriendo (`npm run dev`)
- Usan `fetch()` nativo de Node.js 18+

### Ejemplo
```javascript
test('GET /api/get-services debe devolver servicios', async () => {
  const response = await fetch('http://localhost:5173/api/get-services');
  const services = await response.json();
  assert.ok(Array.isArray(services));
});
```

### Endpoints Testeables
- `GET /api/get-services` - Lista de servicios
- `POST /api/write-log` - Escritura de logs
- `POST /api/exec-command` - Ejecución de comandos
- `POST /api/read-file` - Lectura de archivos
- `POST /api/write-file` - Escritura de archivos

### Setup
```bash
# Terminal 1: Levantar servidor
npm run dev

# Terminal 2: Ejecutar tests de API
npm test -- tests/api/
```

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
# Todos los tests (solo Categoría 1)
npm test

# Test específico
npm test -- tests/php-detection.spec.js

# Tests de API (requiere servidor corriendo)
npm test -- tests/api/

# Tests lentos (instalación real)
RUN_SLOW=1 npm test -- tests/slow.spec.js

# Watch mode para desarrollo
npx vitest
```

## 📊 Resumen

| Categoría | Entorno | Velocidad | Uso |
|-----------|---------|-----------|-----|
| 1. Funciones Locales | Node.js puro | Rápido (<100ms) | Lógica de negocio |
| 2. API HTTP | Node.js + fetch | Medio (200-500ms) | Endpoints del shim |
| 3. UI/Browser | jsdom/Playwright | Lento (>1s) | Componentes React |

## ⚙️ Configuración

**vitest.config.js** (Categoría 1 y 2):
```javascript
export default defineConfig({
  test: {
    environment: 'node', // Sin jsdom
    include: ['tests/**/*.spec.js'],
    exclude: ['tests/ui/**'] // UI tests separados
  }
});
```

**package.json**:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:api": "vitest run tests/api/",
    "test:ui": "vitest run tests/ui/ --environment jsdom"
  }
}
```

## 🎯 Principios

1. **Realismo**: Tests usan código real de la app, no mocks
2. **Velocidad**: Categoría 1 debe ser rápida para feedback inmediato
3. **Claridad**: Separación clara entre categorías
4. **Mantenibilidad**: Tests simples y directos
5. **Cobertura**: Validar flujos críticos en producción

---

**Nota**: jsdom solo se usa para Categoría 3 (UI), NO para Categorías 1 y 2.
