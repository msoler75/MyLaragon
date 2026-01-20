#  Guía de Desarrollo - WebServDev

##  Arquitectura del Sistema

La plataforma **WebServDev** utiliza un modelo híbrido que permite ejecutarse sobre **Electron** o **Neutralino**, compartiendo la misma base de código React para la interfaz. El sistema es 100% independiente y gestiona sus propios binarios y carpetas (`/bin`, `/www`, `/etc`, etc.) de forma autónoma.

### Componentes Principales
- **Frontend**: React + Vite + Tailwind CSS 4.
- **Backend (Runtime)**: 
  - **Electron**: Proceso principal ([electron/main.js](electron/main.js)) y bridge ([electron/preload.js](electron/preload.js)).
  - **Neutralino**: Configuración ([neutralino/neutralino.config.json](neutralino/neutralino.config.json)) y shim de compatibilidad ([neutralino/neutralino-shim.js](neutralino/neutralino-shim.js)).
- **Servicios**: Detección y control de binarios de forma independiente ([electron/services-detector.js](electron/services-detector.js)).

### Política de "No Duplicación" (CRÍTICO)
**ESTÁ TERMINANTEMENTE PROHIBIDO** mantener archivos duplicados en el repositorio. La duplicación de código o configuración es la principal fuente de errores y discrepancias.

1. **PROCESO DE BUILD**: Las carpetas como [neutralino/www/](neutralino/www/) son volátiles y se consideran "salida de compilación". Cualquier archivo presente en ellas debe ser un **Enlace Simbólico (Symlink)** o ser generado dinámicamente durante el build de Vite.
2. **EDICIÓN**: Nunca edites archivos dentro de [neutralino/www/](neutralino/www/). Edita siempre el origen (en la raíz, en [src/](src/) o en [neutralino/](neutralino/)).
3. **AUTOMATIZACIÓN**: Se deben usar los scripts `npm run setup:links` para preparar el entorno. La build de Vite no debe crear copias físicas; si no puede crear enlaces simbólicos (por permisos de Windows), los archivos copiados deben ser ignorados por Git y nunca editados manualmente.
4. **ARCHIVO ÚNICO**: Archivos como [services.json](services.json) o [neutralino-shim.js](neutralino/neutralino-shim.js) tienen un **único origen**. Si los ves en otro lugar sin ser un enlace simbólico, es un error que debe ser corregido.

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

##  Pruebas y Calidad
- **Vitest** es el framework de pruebas.
- Se recomienda ejecutar 'RUN_SLOW=1 npm test' periódicamente para verificar la integración con binarios reales del sistema.
