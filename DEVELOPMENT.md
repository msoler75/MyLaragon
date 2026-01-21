#  Guía de Desarrollo - WebServDev

##  Arquitectura del Sistema

La plataforma **WebServDev** utiliza un modelo híbrido que permite ejecutarse sobre **Electron** o **Neutralino**, compartiendo la misma base de código React para la interfaz. El sistema es 100% independiente y gestiona sus propios binarios y carpetas (`/bin`, `/www`, `/etc`, etc.) de forma autónoma.

### Componentes Principales
- **Frontend**: React + Vite + Tailwind CSS 4.
- **Backend (Runtime)**: 
  - **Electron**: Proceso principal ([electron/main.js](electron/main.js)) and bridge ([electron/preload.js](electron/preload.js)).
  - **Neutralino**: Configuración ([neutralino/neutralino.config.json](neutralino/neutralino.config.json)) y shim de compatibilidad ([src/neutralino/neutralino-shim.js](src/neutralino/neutralino-shim.js)).
- **Servicios**: Detección y control de binarios de forma independiente ([electron/services-detector.js](electron/services-detector.js)).

### Política de "Fuente Única de Verdad" (CRÍTICO)
**ESTÁ TERMINANTEMENTE PROHIBIDO** editar archivos generados. El sistema utiliza una estructura centralizada en `src/neutralino/`.

1. **ARCHIVOS FUENTE**: La fuente de verdad reside en [src/neutralino/](src/neutralino/) (ej. [neutralino-shim.js](src/neutralino/neutralino-shim.js), [services.json](src/neutralino/services.json)).
2. **COPIAS GENERADAS**: Las carpetas como [neutralino/www/](neutralino/www/) son volátiles. El script `scripts/create-symlinks.js` sincroniza los archivos desde `src/neutralino/` hacia `www/` inyectando una cabecera de advertencia.
3. **EDICIÓN**: NUNCA edites archivos dentro de [neutralino/www/](neutralino/www/). Si lo haces, tus cambios se perderán en el próximo build. Edita siempre el archivo correspondiente en `src/neutralino/`.
4. **PROCESO DE BUILD**: Durante `npm run build`, el sistema asegura que las copias físicas estén actualizadas. Se usan copias físicas en lugar de enlaces simbólicos para evitar fallos en el empaquetador `resources.neu` de Neutralino en Windows.
5. **DO NOT EDIT**: Los archivos generados contienen una advertencia al inicio del archivo. Respétala.

---

##  Configuración del Entorno

### Requisitos
- Node.js (v18+)
- Binarios en la carpeta '/bin' (el sistema es 100% independiente y autónomo; no requiere instalaciones externas).

### Scripts de Desarrollo
- 'npm run dev': Inicia Vite y lanza la aplicación (usa 'neutralino/dev.js' para robustez).
- 'npm run build': Compila el frontend hacia 'neutralino/www/'.
- 'npm run dist': Genera el instalador ejecutable.
- 'npm test': Ejecuta la suite de pruebas unitarias y de integración.

---

##  Estándares de UX y Diseño (Excelencia UX)

Buscamos una experiencia premium definida por:
- **Resiliencia de Rutas**: La app debe funcionar incluso si las rutas de los binarios cambian, informando al usuario claramente.
- **Feedback Visual**: Uso de indicadores de carga y Toasts configurables (activables/desactivables en Ajustes).
- **Sincronización Real**: El estado de los servicios se verifica periódicamente (optimizando recursos al chequear solo servicios visibles).
- **Tematización**: Soporte para temas Light, Dark y Sepia definidos en 'src/themes/'.

---

##  Neutralino Setup

Para trabajar específicamente con el runtime ligero:
- La configuración reside en 'neutralino/neutralino.config.json'.
- El **shim** permite que la API de Neutralino imite el comportamiento del Bridge de Electron, permitiendo que el mismo código React funcione en ambos entornos sin cambios.
- Los recursos se empaquetan en 'resources.neu' durante el proceso de build.

---

## Flujo de Datos y APIs
El proyecto utiliza un sistema de "Shim" (`neutralino-shim.js`) para unificar las APIs de Neutralino y Electron, permitiendo que el mismo código frontend funcione en ambos entornos y en el navegador durante el desarrollo.

### Sistema de Logs y Telemetría
WebServDev implementa un mecanismo de logging persistente y en tiempo real con tres niveles de salida:

1.  **Persistencia Local**: En producción, todos los logs se guardan en `app-debug.log` en el directorio raíz. Se utiliza el modo "append" para conservar el historial entre sesiones.
2.  **Depuración Nativa**: Los mensajes se envían al canal de depuración del sistema operativo mediante `Neutralino.debug.log`.
3.  **Visualización en UI**: Se interceptan los métodos globales `console.log/warn/error` para redirigir el flujo a `LogsView.jsx` mediante un puente de eventos (`onLog`).
4.  **Telemetría de Instalación**: Durante la descarga e instalación de servicios desde el Marketplace (remoto), el sistema genera logs detallados del progreso (descarga, extracción, configuración) que se emiten en tiempo real a la interfaz.

### Modo Desarrollo vs. Producción
*   **Producción**: Utiliza binarios nativos y las APIs directas de Neutralino (`filesystem`, `os.execCommand`).
*   **Desarrollo (Vite)**: Dado que el navegador no tiene acceso al sistema de archivos, el Shim detecta la ausencia de `NL_TOKEN` y redirige las llamadas (como ejecución de comandos o chequeo de archivos) a un **Proxy API** integrado en `vite.config.js`. Esto emula el comportamiento nativo usando Node.js en el backend.

---

##  Detección de Servicios y Resiliencia

El sistema de detección de servicios es el corazón de WebServDev y opera bajo un principio de "Verificación Real".

### El Factor de "Carpeta vs. Ejecutable" (CRÍTICO)
Una versión de un servicio (ej. PHP 8.1) **NO** se considera instalada simplemente porque exista su carpeta en `/bin/php/8.1`. El sistema realiza una validación estricta:
1.  **Validación de Binario**: Se busca el ejecutable específico definido para ese tipo de servicio (`php.exe` para PHP, `httpd.exe` para Apache, etc.).
2.  **Búsqueda Recursiva**: Para manejar extracciones de archivos ZIP que a veces crean carpetas anidadas (ej. `bin/apache/2.4/Apache24/bin/httpd.exe`), el motor de detección realiza una búsqueda de hasta 3 niveles de profundidad.
3.  **Filtrado de "Fantasmas"**: Si una carpeta existe pero no contiene el binario válido, el sistema la excluirá automáticamente de la lista de versiones disponibles para evitar fallos de ejecución. 
    *   *Nota*: Si ves una versión en la carpeta `dist` pero no en tu entorno de desarrollo, asegúrate de que el archivo `.exe` se ha copiado correctamente y no ha sido bloqueado por el antivirus o Git.

### Sincronización Main vs. Shim
Dado que la app es híbrida, la lógica de detección debe ser idéntica en dos lugares:
-   **Electron (Node.js)**: Implementado en [electron/services-detector.js](electron/services-detector.js). Usa el módulo `fs` nativo.
-   **Neutralino/Dev (Shim)**: Implementado en [src/neutralino/neutralino-shim.js](src/neutralino/neutralino-shim.js). Usa la API de `Neutralino.filesystem` o el proxy `/api/read-dir` en modo desarrollo.

**Cualquier cambio en el algoritmo de búsqueda o en las rutas de detección debe replicarse en ambos archivos para evitar que la app se comporte de forma inconsistente entre runtimes.**

### Resolución de Rutas (BasePath)
El sistema resuelve las rutas relativas a un `basePath` dinámico:
-   **Modo Dev**: La raíz del proyecto.
-   **Neutralino Portable**: El directorio donde reside el binario de Neutralino.
-   **Electron Dist**: El directorio de la aplicación empaquetada.
-   **Estructura Proyectada**: El sistema también busca en las carpetas `/usr/bin/` y `/neutralino/bin/` para máxima compatibilidad con instalaciones globales o portables.

---

##  Pruebas de Integridad y Tests (CRÍTICO)

En este proyecto, los tests no son solo una formalidad; son la garantía de que el sistema de gestión de servidores es fiable.

### Prohibición de "Trampas" o Mock-ups Maquillados
**LOS TESTS NUNCA DEBEN TRAMPEAR**. Se prohíbe terminantemente:
1.  **Simular Lógica en el Test**: No copies y pegues el código del shim o del detector dentro de un test para validarlo. Importa el módulo real. Si el módulo no es importable (ej. código de navegador), busca una forma de testear sus efectos reales o refactoriza para que sea testable.
2.  **Mockear fakes exitosos**: No mockees la existencia de archivos si el detector debería encontrarlos físicamente. En su lugar, crea archivos reales (aunque sean de 0 bytes) en una carpeta temporal con la estructura exacta que esperas que el sistema maneje.
3.  **Simular Logs Manualmente**: Si testeas el sistema de logs, NO escribas tú mismo en el archivo `app-debug.log`. El test debe ejecutar un `console.log()` real y luego verificar si el sistema lo persistió.
4.  **Tests que siempre pasan**: Un test que "valida" la lógica duplicándola dentro del propio test solo valida tu capacidad de copiar código, no el comportamiento de la aplicación en producción.

**UNA PRUEBA QUE TRAMPEA ES PEOR QUE NO TENER PRUEBA, PORQUE DA UNA FALSA SENSACIÓN DE SEGURIDAD.**

### Estándares de Tests
-   **Uso de Carpetas Temporales**: Usa `os.tmpdir()` para crear entornos de prueba aislados.
-   **Importaciones Reales**: Usa `import { detectServices } from '../electron/services-detector.js'` para asegurar que testeas el código productivo.
-   **Validación de Salida Real**: Verifica el archivo de log real, la existencia de procesos reales o los códigos de salida de comandos reales.
-   **Slow Tests**: Los tests que descargan binarios reales o ejecutan comandos pesados deben estar marcados o activarse solo con `RUN_SLOW=1`.


##  Pruebas y Calidad
- **Vitest** es el framework de pruebas.
- Se recomienda ejecutar 'RUN_SLOW=1 npm test' periódicamente para verificar la integración con binarios reales del sistema.
