#  WebServDev

**WebServDev** es un entorno de desarrollo moderno, visual y ampliable, diseñado como una plataforma premium y ligera para la gestión de servidores locales en Windows.

![Dashboard Preview](./sample.png)

##  Propósito

Este proyecto ofrece una plataforma completa de desarrollo con los siguientes objetivos:

- **Independencia Total**: Gestión propia de binarios y servicios sin dependencias externas.
- **Gestión Remota y Auto-actualizable**: Instalación de servicios (Apache, MySQL, PHP, etc.) desde la nube.
- **Estructura Organizada**: Distribución de carpetas lógica y profesional (`/bin`, `/www`, `/etc`, etc.).
- **Interfaz Moderna**: Un dashboard visual interactivo basado en React y Tailwind CSS 4.
- **Runtime Híbrido**: Soporte para **Electron** (robusto) y **Neutralino** (ligero ~50MB).

##  Características Principales

-  **Control Total**: Instala, desinstala, inicia y detén servicios con un solo clic.
-  **Marketplace de Versiones**: Descarga versiones específicas de PHP, MySQL, Nginx, etc.
-  **Actualizaciones en Background**: Detección automática de nuevos paquetes cada 24 horas.
-  **Estructura Profesional**: `/bin`, `/www`, `/etc`, `/data`, `/logs` perfectamente organizados.
-  **Multi-idioma**: Soporte para Español, Inglés, Alemán y más.
-  **Monitoreo**: Estado de puertos y procesos en tiempo real.
-  **Herramientas**: Terminal, Editor de Hosts, y gestión de proyectos integrados.
-  **Notificaciones**: Sistema de toasts configurable para feedback no intrusivo.

##  Guía Rápida de Uso

1. **Autónomo**: El sistema es 100% independiente y gestiona sus propios binarios en la carpeta `/bin`. No requiere instalaciones externas.
2. **Configuración**: Al abrir por primera vez, define la ruta de trabajo en **Ajustes**.
3. **Servicios**: Inicia tus servicios desde la pantalla principal y gestiona tus proyectos locales.

##  Desarrollo

Si eres desarrollador y quieres contribuir:

\\\ash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (Hot-reload)
npm run dev

# Compilar para producción (Instalador .exe)
npm run dist
\\\

Para más detalles técnicos, consulta [DEVELOPMENT.md](DEVELOPMENT.md).

##  Licencia

Este proyecto está bajo la Licencia MIT.
