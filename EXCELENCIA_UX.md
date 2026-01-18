# Guía de Excelencia en Experiencia de Usuario (XP) - WebServDev

Este documento define los estándares y requerimientos técnicos necesarios para que la aplicación ofrezca una experiencia de usuario fluida, ágil y fiable en la gestión de servicios de desarrollo.

## 1. Fidelidad del Estado del Sistema (Real-Time Sync)

La UI no debe ser una representación estática de una configuración; debe ser un **espejo del estado real del sistema operativo**.

*   **Detección de Binarios**: Antes de ofrecer cualquier acción (Iniciar/Detener), el sistema debe verificar si el ejecutable (`.exe`) existe físicamente en el disco.
*   **Sincronización de Desinstalaciones**: Si se elimina un servicio o todas sus versiones (ya sea manual o automáticamente), la UI debe degradar el estado a **"NO INSTALADO"** de inmediato, inhabilitando las acciones de ejecución y ofreciendo el flujo de instalación.
*   **Re-validación al Recuperar Foco**: La aplicación debe re-escanear los binarios y estados de puertos cada vez que el usuario vuelve a poner el foco en la ventana de la App (`window focus`), asegurando que cualquier cambio manual externo sea detectado.
*   **Estado de Red**: Validar si el puerto configurado está realmente abierto o si existe un conflicto con otro software (ej: Skype usando el puerto 80).
*   **Identificación de Procesos**: No basta con ver si un proceso con el nombre `httpd.exe` está corriendo; el sistema debe verificar si la ruta de ese proceso coincide con la versión seleccionada en la App para evitar falsos positivos de instalaciones externas (XAMPP, IIS, etc.).

## 2. Acciones Contextuales e Inteligentes

La interfaz debe anticiparse a los errores del usuario ofreciendo la acción correcta en el momento adecuado.

*   **Botones Dinámicos**:
    *   Si el servicio **no está instalado**: Mostrar un botón de **"INSTALAR"** que redirija automáticamente al Marketplace/Instalador.
    *   Si el servicio **está instalado pero detenido**: Mostrar botón de **"INICIAR"**.
    *   Si el servicio **está corriendo**: Mostrar botones de **"DETENER"** y accesos rápidos (Abrir Web, Abrir DB).
*   **Redirección de Flujo**: Nunca permitir que un usuario ejecute una acción condenada al fracaso (ej: iniciar un servicio sin binarios). En su lugar, guiar al usuario hacia la solución.
*   **Coherencia Inmediata entre Vistas**: Si se completa la instalación de un servicio en la pestaña de Instalador, la pestaña de Servicios debe reflejar el cambio (de "Instalar" a "Iniciar") instantáneamente sin requerir reinicio ni navegación manual.
*   **Gestión de Instalaciones Corruptas**: Si existen binarios pero faltan archivos críticos de configuración (ej: `httpd.conf`), el sistema debe marcar el servicio como "Requiere Atención" en lugar de intentar iniciarlo y fallar.

## 3. Resiliencia ante Estructuras de Archivos

La app debe ser "inteligente" al tratar con binarios de terceros, que a menudo tienen estructuras inconsistentes tras su descarga.

*   **Buscador de Binarios (Smart Path)**: Al detectar o ejecutar un servicio, el sistema debe ser capaz de encontrar el binario aunque esté dentro de carpetas anidadas (ej: `bin/apache/2.4.6/Apache24/bin/httpd.exe`).
*   **Normalización de Rutas**: Todas las rutas deben ser normalizadas internamente para evitar problemas con barras invertidas (`\`) de Windows o espacios en los nombres de carpeta.

## 4. Feedback Visual y Monitorización

El usuario nunca debe preguntarse "¿está pasando algo?".

*   **Estados de Transición (Processing)**: Durante el arranque o detención, el componente debe mostrar un estado de "Cargando/Sincronizando" bloqueando acciones concurrentes pero manteniendo la UI viva.
*   **Monitorización en Segundo Plano**: Implementar un "Heartbeat" (latido) que refresque el estado de los servicios periódicamente (ej: cada 5-10 segundos) sin necesidad de que el usuario pulse F5 o recargue manualmente.
*   **Manejo de Errores Descriptivos**: Si un servicio falla al iniciar, capturar el `stderr` y mostrar la causa raíz (ej: "Error de sintaxis en la línea 45 de httpd.conf") en lugar de un "Error al iniciar".

## 5. Rendimiento y Optimización

La agilidad es parte crítica de la XP.

*   **Caché de Procesos**: Al escanear estados, realizar una sola llamada al sistema para obtener todos los procesos y puertos (`tasklist` / `netstat`), y luego cruzar esos datos en memoria. Evitar llamadas repetitivas al sistema operativo por cada tarjeta de servicio.
*   **Carga Perezosa (Lazy Loading)**: Los logs y configuraciones pesadas solo deben leerse cuando el usuario lo solicita explícitamente.

## 6. Autoconfiguración y Resolución de Conflictos

El sistema debe ser proactivo en la resolución de problemas técnicos comunes.

*   **Detección de Conflictos de Puerto**: Antes de intentar iniciar un servicio, validar si el puerto está ocupado por otra aplicación. Ofrecer al usuario un cambio rápido de puerto o sugerir qué proceso detener.
*   **Gestión del Archivo Hosts**: Automatizar la creación de Virtual Hosts locales (ej: `proyecto.test`) pidiendo permisos de administrador solo cuando sea estrictamente necesario.

## 7. Productividad y Atajos

Un desarrollador valora la velocidad de operación.

*   **Terminal Contextual**: Cada servicio debe tener un botón para abrir una terminal (PowerShell/CMD) ya posicionada en su directorio de binarios y con el PATH configurado temporalmente.
*   **Atajos de Teclado Globales/Locales**: Implementar combinaciones (ej: `Ctrl+Shift+S`) para iniciar/detener todos los servicios sin necesidad de poner el foco en la ventana.
*   **Integración con el Área de Notificación (System Tray)**: Permitir que la app corra en segundo plano y ofrecer un menú rápido desde el icono de la bandeja del sistema para controlar servicios.

## 8. Notificaciones y Comunicación No Intrusiva

Mantener al usuario informado sin interrumpir su flujo de trabajo.

*   **Sistema de Toasts**: Utilizar notificaciones efímeras para confirmar acciones exitosas (ej: "MySQL iniciado en puerto 3306") y reservar los diálogos modales solo para errores críticos que requieran decisión del usuario.
*   **Feedback de Descarga/Instalación**: Mostrar progreso porcentual, velocidad y tiempo estimado durante la descarga de nuevos binarios en lugar de un indicador de carga genérico.

## 9. Seguridad y Gestión de Datos

La integridad de los datos de desarrollo es prioritaria.

*   **Copias de Seguridad Rápidas (One-Click Backup)**: Ofrecer una función para exportar bases de datos o carpetas de configuración antes de realizar actualizaciones de versión del binario.
*   **Apagado Seguro**: Garantizar que al cerrar la aplicación, todos los servicios se detengan de forma ordenada (`Graceful Shutdown`) para evitar la corrupción de tablas MySQL o archivos de log.

## 10. Personalización y Estética (DX)

La herramienta debe ser agradable de usar durante jornadas largas.

*   **Temas Visuales Adaptativos**: Soporte completo para modo oscuro/claro que respete la configuración del sistema operativo.
*   **Iconografía Clara**: Identificar cada servicio con su logo oficial y usar códigos de color consistentes (Verde: Corriendo, Rojo: Detenido, Amarillo: Procesando, Gris: No disponible).

## 11. Portabilidad y Flexibilidad de Rutas

La aplicación no debe romperse si el usuario mueve la carpeta del proyecto a otra ubicación o unidad de disco.

*   **Rutas Relativas**: Almacenar internamente las configuraciones de servicios usando rutas relativas siempre que sea posible.
*   **Reparación Automática de Rutas**: Si se detecta que la carpeta raíz ha cambiado, la app debe ofrecer actualizar dinámicamente las rutas en los archivos de configuración (ej: `httpd.conf`) para que los servicios sigan funcionando sin intervención manual.

---
*Este documento es una guía viva y debe actualizarse ante nuevos desafíos técnicos que afecten la percepción de fluidez de la app.*
