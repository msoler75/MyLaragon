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
3. Ejecuta en modo desarrollo (Vite): `npm run dev`

Opciones de ejecución en desarrollo:

- Ejecutar sólo la UI (Vite):

```bash
npm run dev
```

- Ejecutar la UI y Neutralino (ventana nativa ligera):

```bash
npm run dev
# en otra terminal (si prefieres correr neu manualmente):
cd neutralino && npx @neutralinojs/neu run
```

La aplicación soporta Neutralino como runtime más ligero que Electron. El proyecto incluye un subdirectorio `neutralino/` con `neutralino.config.json` y un shim que expone `window.electronAPI` para mantener la compatibilidad con la UI existente.
4. Para compilar el instalador (.exe): `npm run dist`

### Configurar la ruta de Laragon

La aplicación espera que introduzcas la ruta de instalación de Laragon en la interfaz de Ajustes la primera vez que la abras. También puedes preconfigurarla en `localStorage` usando la clave `mylaragon-config`. Ejemplo de contenido JSON:

```json
{
	"laragonPath": "C:\\laragon",
	"projectsPath": "C:\\laragon\\www",
	"editor": "code",
	"autoStart": false,
	"language": "es",
	"theme": "system"
}
```

## 🌍 Añadir Idiomas

Para añadir un nuevo idioma:
1. Crea un archivo `tu-idioma.json` en `src/i18n/`.
2. Define `"languageName": "Nombre del Idioma"`.
3. Traduce las claves. La app lo detectará automáticamente.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
