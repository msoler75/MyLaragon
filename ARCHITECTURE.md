# Arquitectura del Proyecto WebServDev

## Visión General

WebServDev es una aplicación de escritorio para Windows 11 que proporciona un panel de control avanzado para Laragon, utilizando tecnologías modernas como React, Tailwind CSS 4 y Electron.

## Arquitectura de Capas

### 1. Capa de Presentación (React)
- **Framework**: React con JavaScript
- **Estilos**: Tailwind CSS 4
- **Componentes**: UI modular con navegación por pestañas
- **Estado**: useState y useEffect para gestión local

### 2. Capa de Comunicación (Electron IPC)
- **Main Process**: Maneja operaciones del sistema (procesos, archivos)
- **Renderer Process**: UI de React
- **Preload Script**: Puente seguro entre procesos
- **IPC**: Comunicación asíncrona con contextBridge

### 3. Capa de Sistema
- **Gestión de Procesos**: child_process para iniciar/detener servicios
- **Sistema de Archivos**: fs para leer configuraciones y proyectos
- **Configuración**: JSON para settings personalizables

## Estructura de Carpetas

```
WebServDev/
├── electron/
│   ├── main.js          # Proceso principal de Electron
│   └── preload.js       # Puente IPC seguro
├── src/
│   ├── App.jsx          # Componente principal
│   ├── index.css        # Estilos con Tailwind
│   └── main.jsx         # Punto de entrada React
├── public/              # Assets estáticos
└── package.json         # Configuración del proyecto
```

## Flujo de Datos

1. **Usuario interactúa con UI** → Evento en React
2. **React llama a electronAPI** → IPC invoke
3. **Main process recibe** → Ejecuta operación del sistema
4. **Respuesta via IPC** → Actualiza estado en React

## Seguridad

- **Context Isolation**: Activado para prevenir acceso directo a Node.js
- **Preload Script**: Solo expone APIs necesarias
- **No Node Integration**: Renderer no tiene acceso a APIs peligrosas

## Extensibilidad

- **Módulos de Servicios**: Fácil añadir nuevos servicios
- **Comandos Personalizados**: Configurables por proyecto
- **Plugins**: Arquitectura preparada para extensiones</content>
<parameter name="filePath">d:\projects\WebServDev\ARCHITECTURE.md
