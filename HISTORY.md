#  Historial de Cambios y Diagnósticos

##  Cambios Recientes (Enero 2026)

### Migración Eficiente a Neutralino
- Se resolvió el problema de la carpeta 'www/' vacía compilando automáticamente vía Vite.
- Creado 'neutralino/dev.js' para manejar Hot-Reload sin fallos de conexión.
- El shim ahora usa rutas relativas para 'services.json', garantizando portabilidad.

### Detección de Sistema y Binarios
- **Solución Apache VC18**: Se corrigió el error de detección que impedía leer versiones modernas de Apache (2.4.66 Win64 VS18) en el sistema.
- **PHP Multi-versión**: Implementada lógica para detectar PHP tanto en versiones TS (Thread Safe) como NTS (Non-Thread Safe) de forma independiente.

---

##  Diagnóstico de Problemas (Troubleshooting)

### Error NE_RS_UNBLDRE (Recursos de Neutralino)
- **Problema**: Neutralino no cargaba el archivo de recursos si la estructura 'www/' no se sincronizaba antes del empaquetado.
- **Solución**: Se integró 'scripts/build-config.js' para asegurar que los metadatos y el shim estén presentes antes de cualquier ejecución de 'neu build'.

### Ley de No Duplicación
Establecida el 18/01/2026 tras detectar discrepancias en el código del shim. Ahora el proceso de construcción es el único encargado de copiar el shim a 'www/'.

---

##  Bitácora de Pruebas
- **Pruebas de Empaquetado**: Exitosas tras configurar correctamente 'url: /' en 'neutralino.config.json'.
- **Pruebas de binarios reales**: La suite lenta ('npm test' con 'RUN_SLOW=1') confirma la detección correcta de PHP 8.2 y 8.3 en entornos locales con arquitectura independiente inspirada en sistemas modulares.
