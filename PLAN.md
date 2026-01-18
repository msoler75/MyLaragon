# Plan de Acción: WebServDev -> Evolución Independiente 🚀

Este plan detalla los pasos para transformar WebServDev en una aplicación totalmente independiente y de marca propia.

## 🏗️ Fase 1: Nueva Arquitectura e Infraestructura (Independencia Total)
- [x] Definir la estructura de carpetas raíz.
- [x] Implementar un gestor de configuración interno (`app.ini` en lugar de `laragon.ini`).
- [x] Eliminar toda dependencia de la instalación externa de Laragon.
- [x] Cambiar marca blanca de la app (Purga de referencias a Laragon).

## 📥 Fase 2: Sistema de Gestión de Servicios (Remote Setup & Auto-update)
- [x] Crear repositorio de metadatos (`services.json`).
- [x] Implementar motor de descarga y descompresión.
- [x] Implementar comprobación diaria de actualizaciones en segundo plano (cada 24h).
- [ ] Sistema de "activación" de versiones (Symlinks/Config).

## 🖥️ Fase 3: UI/UX Premium (Dashboard)
- [x] Rediseñar el panel principal.
- [x] Pestaña de Marketplace para instalación de servicios.
- [ ] Elegir nuevo nombre oficial y aplicar rebranding global.

## 🖥️ Fase 3: UI/UX Premium (Dashboard)
- [ ] Rediseñar el panel principal:
  - Vista de "Servidores" con estados detallados.
  - Botón de "Instalar nuevos servicios" que abra un "Marketplace" de versiones.
  - Feedback visual de descargas en curso.
- [ ] Mejorar la gestión de proyectos (`www`):
  - Autodetección de frameworks (Laravel, WordPress, etc.).
  - Acciones rápidas por proyecto.

## ⚙️ Fase 4: Automatización de Configuraciones
- [ ] Generador de archivos de configuración dinámicos:
  - `httpd.conf`, `php.ini`, `my.ini` basados en la ubicación de la app.
  - Gestión automática de Virtual Hosts.
- [ ] Editor de archivos de configuración integrado en la UI.

## 🛠️ Fase 5: Portabilidad y Herramientas
- [ ] Script de "Añadir al PATH" para que los servicios sean accesibles desde cualquier terminal.
- [ ] Terminal integrada preconfigurada con el entorno cargado.
- [ ] Sistema de logs unificado.

## 🚀 Próximos Pasos Inmediatos
1. Crear el archivo `creative-ai-news.json` (o similar) como fuente de servicios.
2. Implementar la estructura de carpetas base.
3. Crear el componente de UI para la descarga de servicios.
