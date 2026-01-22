#  Historial de Cambios y Diagnósticos

##  Cambios Recientes (Enero 2026)

### Refactorización Arquitectónica (22/01/2026) 
**Principio DRY Estricto - Eliminación Total de Duplicación**

#### Problema Identificado
- El archivo `vite.config.js` contenía ~200 líneas implementando lógica de API (filesystem, detección de servicios).
- Esta lógica duplicaba o simulaba las funciones ya existentes en `lib/`.
- Violación crítica del principio DRY: mantenimiento doble, posibles inconsistencias.

#### Solución Implementada
1. **Centralización en lib/**: Toda la lógica de negocio movida a [src/neutralino/lib/](src/neutralino/lib/):
   - `services-detector.js`: Detección de servicios (browser-compatible, sin módulos Node.js).
   - `fs-adapter.js`: Abstracción de filesystem (dev vs prod).

2. **Servidor API Real**: Creado [src/api/dev-server.js](src/api/dev-server.js):
   - Express server en puerto 5174.
   - Importa y expone las funciones REALES de lib/ vía HTTP.
   - CERO duplicación: solo transporte (no lógica).

3. **Simplificación de Vite**: [vite.config.js](vite.config.js) reducido drásticamente:
   - Eliminadas ~140 líneas de middleware de API.
   - Ahora solo hace PROXY: `/api/*` → `http://localhost:5174`.
   - Plugin `api-server-launcher` inicia dev-server.js automáticamente.

4. **Browser Compatibility**: services-detector.js refactorizado:
   - Eliminado `import path from 'path'` (incompatible con browser).
   - Creadas funciones propias: `pathJoin()`, `pathDirname()`.
   - Ahora puede ejecutarse tanto en browser como en Node.js.

#### Resultado
- **Fuente única de verdad**: lib/ contiene TODA la lógica, sin excepciones.
- **Modo DEV real**: En desarrollo se usan servicios reales (no simulados).
- **Mantenibilidad**: Un solo lugar para cambiar lógica de detección/filesystem.
- **Tests más robustos**: Tests usan las mismas funciones que producción.

### Migración Eficiente a Neutralino
- Se resolvió el problema de la carpeta 'www/' vacía compilando automáticamente vía Vite.
- Creado 'neutralino/dev.js' para manejar Hot-Reload sin fallos de conexión.
- El shim ahora usa rutas relativas para 'services.json', garantizando portabilidad.

### Detección de Sistema y Binarios
- **Solución Apache VC18**: Se corrigió el error de detección que impedía leer versiones modernas de Apache (2.4.66 Win64 VS18) en el sistema.
- **PHP Multi-versión**: Implementada lógica para detectar PHP tanto en versiones TS (Thread Safe) como NTS (Non-Thread Safe) de forma independiente.

---

##  Diagnóstico de Problemas (Troubleshooting)

### Error NE_RS_UNBLDRE (Recursos de Neutralino)
- **Problema**: Neutralino no cargaba el archivo de recursos si la estructura 'www/' no se sincronizaba antes del empaquetado.
- **Solución**: Se integró 'scripts/build-config.js' para asegurar que los metadatos y el shim estén presentes antes de cualquier ejecución de 'neu build'.

### Ley de No Duplicación
Establecida el 18/01/2026 tras detectar discrepancias en el código del shim. Ahora el proceso de construcción es el único encargado de copiar el shim a 'www/'.

---

##  Bitácora de Pruebas
- **Pruebas de Empaquetado**: Exitosas tras configurar correctamente 'url: /' en 'neutralino.config.json'.
- **Pruebas de binarios reales**: La suite lenta ('npm test' con 'RUN_SLOW=1') confirma la detección correcta de PHP 8.2 y 8.3 en entornos locales con arquitectura independiente inspirada en sistemas modulares.
