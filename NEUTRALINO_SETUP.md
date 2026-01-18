# Guía: Ejecutar WebServDev con Neutralino

Este proyecto ahora está completamente configurado para funcionar con **Neutralino**, un framework ligero para aplicaciones de escritorio.

## ✅ Cambios Realizados

1. **Configuración de Vite actualizada** - Ahora compila directamente a `neutralino/www/`
2. **neutralino.conf.json creado** - Configuración lista para producción
3. **Scripts de desarrollo mejorados** - Desarrollo simultáneo con hot-reload
4. **Archivos estáticos preparados** - index.html, neutralino-shim.js y services.json en la carpeta www

## 🚀 Ejecución en Desarrollo

### Opción 1: Modo Concurrente (Recomendado)
Ejecuta Vite y Neutralino simultáneamente:
```bash
npm run dev
```
Esto usa un script interno (`neutralino/dev.js`) que configura temporalmente Neutralino para conectar con Vite y restaura la configuración al cerrar.

### Opción 2: Solo Vite (para desarrollo rápido)
```bash
npm run vite
```
Abre tu navegador en `http://localhost:5173`

### Opción 3: Solo Neutralino (manual)
```bash
npm run build
cd neutralino && npx @neutralinojs/neu run
```

## 📦 Compilación para Producción

### Paso 1: Compilar la aplicación
```bash
npm run build
```
Esto compila React/Vite a `neutralino/www/` (los archivos compilados).

### Paso 2: Compilar el ejecutable (.exe)
```bash
npm run dist
```
Esto genera el instalador Windows en `dist_electron/` usando Neutralino.

> **Nota**: Asegúrate de que tienes instaladas las herramientas de compilación necesarias:
> - Node.js v18+
> - Las dependencias npm instaladas (`npm install`)

## 🔧 Estructura de Carpetas

```
WebServDev/
├── src/                      # Código fuente React (componentes, estilos)
├── public/                   # Archivos públicos estáticos
│   └── neutralino-shim.js   # Puente entre React y Neutralino
├── neutralino/
│   ├── www/                 # ← Aquí va el build compilado (IMPORTANTE)
│   │   ├── index.html
│   │   ├── neutralino-shim.js
│   │   ├── services.json
│   │   └── [archivos compilados de Vite]
│   ├── neutralino.conf.json # Configuración de la aplicación
│   └── bin/                 # Binarios de Neutralino por SO
├── index.html               # Template principal
├── vite.config.js          # Configuración de Vite (apunta a neutralino/www/)
└── package.json
```

## 🌐 Cómo Funciona

1. **Vite compila** React y los assets a `neutralino/www/`
2. **Neutralino ejecuta** la aplicación desde esa carpeta como una app de escritorio nativa
3. **electronAPI** (shim) proporciona acceso a funciones del sistema (ejecutar comandos, acceder a archivos, etc.)
4. La aplicación se comunica con **Laragon** para controlar servicios

## 💡 Consejos de Desarrollo

- **Hot-reload**: Durante `npm run dev`, los cambios en `src/` se reflejan automáticamente
- **Logs**: Revisa la consola del navegador (F12) para errores de JavaScript
- **Comandos Windows**: Los comandos de inicio/parada de servicios se ejecutan via `Neutralino.os.execCommand()`
- **Configuración**: Se guarda en `localStorage` con la clave `WebServDev-config`

## 🐛 Solución de Problemas

### El app no abre después de `npm run dev`
- Verifica que el puerto 5173 esté libre: `npx kill-port 5173`
- Revisa que Neutralino esté instalado: `npm install`

### Los servicios no inician
- Confirma que Laragon está instalado y la ruta es correcta en Ajustes
- Verifica que los binarios existen en `C:\laragon\bin\` (o tu ruta configurada)

### Los cambios no se reflejan
- Asegúrate de estar usando `npm run dev` (con Vite en modo desarrollo)
- Recarga la ventana de Neutralino (Ctrl+R o desde el menú)

## 📝 Próximos Pasos

- [ ] Instalar dependencias: `npm install`
- [ ] Probar en desarrollo: `npm run dev`
- [ ] Configurar la ruta de Laragon en la app
- [ ] Compilar para distribución: `npm run dist`
