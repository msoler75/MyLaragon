# Guía de Desarrollo - MyLaragon

## Configuración del Entorno

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Laragon instalado en C:\laragon (o configurable)

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run electron-dev
```

Esto inicia:
- Vite dev server en http://localhost:5173
- Electron app cargando desde el dev server

### Build
```bash
npm run build
npm run electron
```

## Estructura del Código

### React Components
- `App.jsx`: Layout principal con navegación
- Componentes funcionales con hooks
- Props para pasar datos entre componentes

### Electron
- `electron/main.js`: Proceso principal, ventana, IPC handlers
- `electron/preload.js`: APIs expuestas al renderer

### Estilos
- Tailwind CSS 4 con configuración en `src/index.css`
- Clases utility-first

## Añadir Nuevos Servicios

1. Actualizar `serviceList` en `Services` component
2. Añadir handler en `main.js` para el servicio específico
3. Implementar lógica de start/stop usando child_process

## Añadir Nuevos Comandos

1. Extender `electronAPI` en `preload.js`
2. Añadir handler IPC en `main.js`
3. Llamar desde React components

## Debugging

- **React**: DevTools del navegador (F12 en Electron)
- **Electron**: mainWindow.webContents.openDevTools()
- **Consola**: Logs en terminal donde corre `npm run electron-dev`

## Buenas Prácticas

- Mantener separación entre UI y lógica del sistema
- Usar async/await para operaciones IPC
- Validar existencia de rutas antes de operaciones
- Manejar errores gracefully

## Testing

- Probar en Windows 11
- Verificar compatibilidad con diferentes versiones de Laragon
- Testear operaciones de archivos y procesos

## Deployment

Usar electron-builder para generar instalador:

```bash
npm install -g electron-builder
electron-builder --win
```</content>
<parameter name="filePath">d:\projects\MyLaragon\DEVELOPMENT.md