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
- **Ultima actualización**: 20 de enero de 2026.
- **Flujo de Desarrollo**: Estable con Neutralino como runtime principal por su ligereza.
- **Detección de Apache**: Refinada para manejar binarios estándar de Windows (VC18+) dentro de la propia arquitectura independiente del proyecto.

---

##  Lista de Tareas (Checklist)
- [x] Migración robusta a Neutralino.
- [x] Implementación de política de "No Duplicación".
- [x] Corrección de detección de PHP en entornos TS/NTS.
- [ ] Implementar visor de logs en tiempo real (app-log.txt).
- [ ] Añadir soporte para Nginx y PostgreSQL.
