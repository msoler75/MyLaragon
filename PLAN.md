#  Plan de Proyecto y Estado Actual

##  Roadmap (Hoja de Ruta)

### Fase 1-4: Cimientos y Core (Completado )
- Stack base: React + Vite + Tailwind 4 + Electron/Neutralino.
- Gestión de servicios: Inicio/Parada de procesos reales (Apache, MySQL, etc.).
- UI Moderna: Switches, Toasts configurables y Layout interactivo.
- Detección de binarios y estado de puertos de forma autónoma.

### Fase 5: Gestión de Proyectos (En Progreso )
- [x] Lectura de carpetas de proyectos locales.
- [x] Apertura en Navegador y VS Code.
- [ ] Ejecución de comandos (Composer, NPM, Artisan).

### Fase 6: Configuraciones Avanzadas (Próximamente )
- [ ] Editor integrado de archivos de configuración (php.ini, my.ini, etc.).
- [ ] Personalización total de rutas desde la UI.

### Fase 7-8: Herramientas y Distribución (Planificado )
- [ ] Sistema de logs integrado.
- [ ] Marketplace de servicios remoto (descarga de versiones).
- [ ] Generación automática de instaladores certificados.

---

##  Estado Actual del Sistema
- **Última actualización**: 22 de enero de 2026.
- **Arquitectura Refactorizada**: Implementado principio DRY estricto:
  - **lib/ como fuente única**: Toda la lógica de negocio centralizada en [src/neutralino/lib/](src/neutralino/lib/).
  - **dev-server.js**: Servidor API separado (Express en puerto 5174) que expone funciones reales de lib/ vía HTTP.
  - **vite.config.js simplificado**: Solo hace proxy `/api/*` → `localhost:5174`, CERO implementación de lógica.
  - **Eliminada duplicación**: ~200 líneas de código duplicado eliminadas de vite.config.js.
- **Flujo de Desarrollo**: Neutralino como runtime principal, desarrollo con doble servidor (API + Vite).

---

##  Lista de Tareas (Checklist)
- [x] Migración robusta a Neutralino.
- [x] Implementación de política de "No Duplicación".
- [x] Corrección de detección de PHP en entornos TS/NTS.
- [x] Refactorización arquitectónica: lib/ como fuente única de verdad.
- [x] Creación de dev-server.js (servidor API real para desarrollo).
- [x] Simplificación de vite.config.js (eliminadas ~200 líneas de duplicación).
- [x] Browser-compatibility en services-detector.js (sin módulos Node.js).
- [ ] Integrar dev-server.js en flujo npm run dev (actualmente en testing).
- [ ] Implementar visor de logs en tiempo real (app-debug.log).
- [ ] Añadir soporte para Nginx y PostgreSQL.
