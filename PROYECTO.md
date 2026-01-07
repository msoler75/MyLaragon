Quiero diseñar y desarrollar una aplicación de escritorio para **Windows 11** que actúe como un “panel de control avanzado” para Laragon, combinando lo mejor de la UI de Laragon y de XAMPP, pero hecha con tecnologías modernas.

### Objetivo general

- Crear una **aplicación React.js** (SPA) con **Tailwind CSS 4** y alguna **librería de componentes React** (puede ser por ejemplo shadcn/ui, Radix + Tailwind, Mantine, Chakra, etc.; ayúdame a elegir una adecuada para un panel tipo admin).  
- Esta SPA debe integrarse y empaquetarse con **Electron** para generar un ejecutable de escritorio en Windows 11.  
- La app debe funcionar como un **launcher / control center** que interactúe con el stack de **Laragon** ya instalado en `C:\laragon`.  
- Debe ser posible seguir usando la UI original de Laragon al mismo tiempo que esta nueva UI; ambas deben trabajar sobre los **mismos binarios, configuraciones y proyectos**.

### Requisitos funcionales

1. **Gestión de servicios del stack (Laragon):**
   - Detectar y permitir iniciar/detener/reiniciar servicios como: Apache/Nginx, MySQL/MariaDB, PHP-FPM, Redis, Mailpit u otros que Laragon tenga instalados.
   - Mostrar estado de cada servicio (corriendo / detenido).
   - Permitir “Iniciar todo” y “Detener todo”.

2. **Gestión de proyectos:**
   - Leer las carpetas de proyectos (por defecto `C:\laragon\www`, pero que sea configurable).
   - Para cada proyecto:
     - Mostrar nombre de carpeta y, si existe, URL amigable que use Laragon (por ejemplo `http://proyecto.test`).
     - Botones para:
       - Abrir en el navegador por defecto.
       - Abrir en VSCode (o en otro IDE configurable).
       - Abrir una terminal en la carpeta del proyecto.
       - Ejecutar comandos típicos: `php artisan`, `symfony console`, `composer`, `npm`, `yarn`, etc. (que se puedan configurar por proyecto/tecnología).

3. **Configuraciones compartidas con Laragon:**
   - Leer y, en algunos casos, editar (de forma segura) archivos de configuración relevantes dentro de `C:\laragon`, por ejemplo:
     - `php.ini`
     - `my.ini`
     - `httpd.conf` / configuración de vhosts
   - La aplicación **no debe romper** el funcionamiento original de Laragon: cualquier cambio debe ser opcional y, de ser posible, revertible.
   - Poder configurar desde la UI:
     - Rutas de instalación de Laragon.
     - Ruta principal de proyectos.
     - Editor preferido, navegador, etc.

4. **UI avanzada y extensible:**
   - Quiero una interfaz tipo **panel de administración** con:
     - Barra lateral (sidebar) con secciones: “Dashboard”, “Servicios”, “Proyectos”, “Herramientas”, “Configuración”.
     - Barra superior con acciones rápidas (por ejemplo: iniciar todo, detener todo, limpiar logs, etc.).
     - Vistas para:
       - Resumen general (estado de servicios + proyectos recientes).
       - Listado y detalle de proyectos.
       - Panel de herramientas (scripts personalizados, backups, migraciones, etc.).
       - Configuración global.
   - Debe ser fácil añadir **botones y acciones personalizadas** en el futuro (por ejemplo, scripts propios de backup, deploy, limpieza de cachés, etc.).

5. **Convivencia con la UI original de Laragon:**
   - La app **no reemplaza** Laragon; solo se apoya en:
     - Su estructura de carpetas (`C:\laragon\bin`, `C:\laragon\etc`, `C:\laragon\www`, etc.).
     - Sus binarios ya existentes (Apache, MySQL, PHP, etc.).
   - Debe ser posible abrir Laragon normalmente y seguir usando su bandeja/menús mientras esta nueva app está abierta.
   - La comunicación con los servicios se hará vía procesos (lanzar/terminar ejecutables, leer archivos), no modificando el `.exe` de Laragon.

### Requisitos técnicos

1. **Stack frontend:**
   - **React.js** (JavaScript preferible).
   - **Tailwind CSS 4**.
   - Una **librería de componentes React** adecuada para un dashboard moderno (sugerencias y justificación de elección).
   - Estructura limpia de componentes (layout, navegación, vistas, componentes de tabla, cards, modales, etc.).

2. **Electron:**
   - Configurar un proyecto donde:
     - El frontend (React) se sirva como contenido principal de una ventana de Electron.
     - Haya un proceso **main** en Electron que maneje:
       - Gestión de procesos (iniciar/detener binarios de Laragon).
       - Acceso al sistema de archivos (leer/escribir configs en `C:\laragon`).
     - Se utilice **IPC** (ipcMain/ipcRenderer o equivalente con contextBridge) para que el frontend pida acciones al backend (Electron) de forma segura.
   - Empaquetado para Windows 11 en un `.exe` instalable o portable.

3. **Arquitectura y seguridad:**
   - Separación clara entre:
     - Capa UI (React).
     - Capa de lógica de sistema / procesos (Electron main).
   - No exponer directamente funciones peligrosas del `fs` o `child_process` al frontend; todo debe pasar por un canal controlado.
   - Proponer una estructura de carpetas para el proyecto (por ejemplo `app/renderer`, `app/main`, `app/shared`, etc.).

4. **Configurabilidad y extensibilidad:**
   - Sistema de configuración (por ejemplo, un archivo JSON en la carpeta de la app o en `%APPDATA%`) para:
     - Ruta de Laragon (por defecto `C:\laragon`, pero editable).
     - Rutas de proyectos adicionales.
     - Comandos personalizados por tipo de proyecto.
   - Diseñar el código de forma que luego sea fácil:
     - Añadir nuevos servicios (por ejemplo, Redis, Mailpit, workers).
     - Añadir nuevos botones/acciones sobre proyectos.

## Cosas que no hace Laragon y quiero en esta app

- Si en Laragon inicias MySQL, y este falla por algun motivo, Laragon no lo detecta, y lo marca como "arrancado". Quiero que mi app pueda detectar si el servicio está levantado, consultando puertos con netstat o revisando lista de procesos activos.

### Lo que necesito que me proporciones

1. **Arquitectura del proyecto:**
   - Diagrama o descripción de módulos/capas.
   - Propuesta de estructura de carpetas y archivos.

2. **Stack detallado y herramientas:**
   - Herramientas recomendadas (por ejemplo: Vite + React + Tailwind + Electron, o CRA + Electron, etc.).
   - Sugerencia de librería de componentes y por qué encaja.

3. **Pasos para iniciar el proyecto:**
   - Comandos iniciales para crear la base (React + Tailwind + Electron).
   - Configuración mínima de Electron (main process) para abrir la ventana cargando el bundle de React.

4. **Ejemplos de código clave:**
   - Ejemplo de `main.js`/`main.ts` de Electron con:
     - Creación de ventana.
     - Configuración de IPC.
   - Ejemplo de uso de `child_process` para arrancar/detener un binario (simulando Apache de Laragon).
   - Ejemplo de lectura de un archivo de configuración dentro de `C:\laragon` usando el proceso main y devolviendo datos a React.
   - Un par de componentes React representativos:
     - Panel de servicios con botones Start/Stop.
     - Lista de proyectos con botones “Abrir en navegador” y “Abrir en VSCode”.

5. **Buenas prácticas y advertencias:**
   - Cómo evitar conflictos con la ejecución normal de Laragon.
   - Cómo manejar errores si los binarios no existen o la ruta de Laragon es distinta.
   - Sugerencias para logueo de acciones (logs de la app).

Quiero que el resultado sea una base sólida, pero extensible, para seguir construyendo un “super Launcher” sobre Laragon, mezclando la comodidad visual de XAMPP con la modernidad y flexibilidad de Laragon.

---