# MyLaragon (Companion App) 🚀

**MyLaragon** es un controlador ligero y moderno diseñado como un **subset de herramientas** para complementar tu instalación existente de **Laragon**. 

No es un reemplazo de Laragon, sino una interfaz alternativa enfocada en la velocidad y la estética para las tareas más cotidianas del desarrollo web. Utiliza tu configuración actual de `laragon.ini` para ofrecer un control rápido y visual.

![](./sample.png)

## 🎯 Propósito

Esta aplicación nace para usuarios que ya tienen Laragon configurado y buscan:
- Un **Dashboard visual** y moderno para el control de servicios.
- Acceso rápido a las **funciones básicas** sin navegar por menús complejos.
- Soporte **multi-idioma** nativo y extensible.
- Una experiencia de usuario minimalista y fluida.

## ✨ Características Principales

- ⚡ **Control de Servicios**: Inicia y detén Apache, MySQL, Nginx, Redis, Mailpit y MongoDB confiando en los binarios de tu Laragon.
- 🌍 **Multi-idioma**: Soporte para Español, Inglés, Alemán (extensible mediante JSON).
- 📊 **Estado en Tiempo Real**: Visualización inmediata de puertos y procesos en ejecución.
- 🛠️ **Acceso Directo**: Botones para Terminal, Editor de Hosts, Variables de Entorno y carpetas de proyecto.
- ⚙️ **Configuración**: Define tu editor de código preferido y la ruta de Laragon una sola vez.

## 🚀 Requisitos de Uso

1. **Tener Laragon instalado** en tu sistema Windows.
2. Configurar la ruta de instalación de Laragon en el apartado de **Ajustes** dentro de MyLaragon al abrirlo por primera vez.

## 🛠️ Desarrollo

Si quieres contribuir o compilar el proyecto tú mismo:

### Requisitos
- Node.js (v18 o superior)
- Laragon instalado en Windows

### Pasos
1. Clona el repositorio.
2. Instala las dependencias: `npm install`
3. Ejecuta en modo desarrollo: `npm run dev`
4. Para compilar el instalador (.exe): `npm run dist`

## 🌍 Añadir Idiomas

Para añadir un nuevo idioma:
1. Crea un archivo `tu-idioma.json` en `src/i18n/`.
2. Define `"languageName": "Nombre del Idioma"`.
3. Traduce las claves. La app lo detectará automáticamente.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
