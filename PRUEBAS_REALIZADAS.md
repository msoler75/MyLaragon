# PRUEBAS_REALIZADAS - 2026-01-14 (SESIÓN FINAL)

## RESUMEN DE LA INVESTIGACIÓN Y CONFIGURACIÓN GANADORA

### Conclusión Final
Tras realizar múltiples pruebas automáticas y manuales con el empaquetado `resources.neu` de Neutralinojs, se ha determinado la configuración óptima para evitar pantallas en blanco, errores 404 y fallos de carga de servicios en Windows.

### Configuración Ganadora (neutralino.config.json durante Build)
```json
{
  "enableServer": true,
  "documentRoot": "/www/",
  "url": "/index.html",
  "port": 0,
  "cli": {
    "resourcesPath": "./www/"
  }
}
```
**Por qué funciona:** 
- Al usar `resourcesPath: "./www/"`, todos los archivos se empaquetan dentro de `resources.neu` con el prefijo `www/`.
- Al configurar `documentRoot: "/www/"`, el servidor interno de Neutralino mapea la raíz `/` a esa carpeta interna.
- Esto permite que `url: "/index.html"` sea resuelta correctamente como `resources.neu/www/index.html`.

### Hallazgos en Carga de Servicios
- **El Problema:** El uso de `fetch('/services.json')` en producción es inestable dependiendo de cómo el navegador interpreta el puerto dinámico y el acceso al bundle.
- **La Solución:** Se implementó una carga resiliente en `neutralino-shim.js` que prioriza `Neutralino.filesystem.readFile` (acceso directo al bundle) y usa varios intentos de `fetch` como fallback.

---

# ARCHIVO HISTÓRICO DE PRUEBAS AUTOMATIZADAS (2026-01-12)

## t1_srv1_www_wwwindexhtml_rm0_cp0 — 2026-01-12T01:33:46.943Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/www/index.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 38899ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t2_srv1_www_wwwindexhtml_rm1_cp0 — 2026-01-12T01:34:25.843Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/www/index.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37434ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t3_srv1_www_wwwindexhtml_rm0_cp1 — 2026-01-12T01:35:03.278Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/www/index.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 37485ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t4_srv1_www_wwwindexhtml_rm0_cp0 — 2026-01-12T01:35:40.764Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "www/index.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37227ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t5_srv1_www_wwwindexhtml_rm1_cp0 — 2026-01-12T01:36:17.992Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "www/index.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37426ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t6_srv1_www_wwwindexhtml_rm0_cp1 — 2026-01-12T01:36:55.419Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "www/index.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 37270ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t7_srv1_www_indexhtml_rm0_cp0 — 2026-01-12T01:37:32.690Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/index.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37370ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t8_srv1_www_indexhtml_rm1_cp0 — 2026-01-12T01:38:10.061Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/index.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37366ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t9_srv1_www_indexhtml_rm0_cp1 — 2026-01-12T01:38:47.429Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/index.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 37636ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t10_srv1_www_indexhtml_rm0_cp0 — 2026-01-12T01:39:25.066Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "index.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 38288ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t11_srv1_www_indexhtml_rm1_cp0 — 2026-01-12T01:40:03.355Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "index.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37330ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t12_srv1_www_indexhtml_rm0_cp1 — 2026-01-12T01:40:40.686Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "index.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 37369ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t13_srv1_www_wwwbootstraphtml_rm0_cp0 — 2026-01-12T01:41:18.057Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/www/bootstrap.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37432ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t14_srv1_www_wwwbootstraphtml_rm1_cp0 — 2026-01-12T01:41:55.489Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/www/bootstrap.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37306ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t15_srv1_www_wwwbootstraphtml_rm0_cp1 — 2026-01-12T01:42:32.796Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/www/bootstrap.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 37488ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t16_srv1_www_bootstraphtml_rm0_cp0 — 2026-01-12T01:43:10.285Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/bootstrap.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37301ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t17_srv1_www_bootstraphtml_rm1_cp0 — 2026-01-12T01:43:47.587Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/bootstrap.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37840ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t18_srv1_www_bootstraphtml_rm0_cp1 — 2026-01-12T01:44:25.428Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./www/",
  "url": "/bootstrap.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 37418ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t19_srv1__wwwindexhtml_rm0_cp0 — 2026-01-12T01:45:02.847Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/www/index.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37608ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t20_srv1__wwwindexhtml_rm1_cp0 — 2026-01-12T01:45:40.456Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/www/index.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37251ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t21_srv1__wwwindexhtml_rm0_cp1 — 2026-01-12T01:46:17.708Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/www/index.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 37376ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t22_srv1__wwwindexhtml_rm0_cp0 — 2026-01-12T01:46:55.085Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "www/index.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37301ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t23_srv1__wwwindexhtml_rm1_cp0 — 2026-01-12T01:47:32.387Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "www/index.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 40175ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t24_srv1__wwwindexhtml_rm0_cp1 — 2026-01-12T01:48:12.563Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "www/index.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 36780ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t25_srv1__indexhtml_rm0_cp0 — 2026-01-12T01:48:49.344Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/index.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 36912ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t26_srv1__indexhtml_rm1_cp0 — 2026-01-12T01:49:26.257Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/index.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 36641ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t27_srv1__indexhtml_rm0_cp1 — 2026-01-12T01:50:02.899Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/index.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 36871ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t28_srv1__indexhtml_rm0_cp0 — 2026-01-12T01:50:39.771Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "index.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37387ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t29_srv1__indexhtml_rm1_cp0 — 2026-01-12T01:51:17.160Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "index.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 38433ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t30_srv1__indexhtml_rm0_cp1 — 2026-01-12T01:51:55.594Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "index.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 38330ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t31_srv1__wwwbootstraphtml_rm0_cp0 — 2026-01-12T01:52:33.925Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/www/bootstrap.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 38318ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:52:42,199 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t32_srv1__wwwbootstraphtml_rm1_cp0 — 2026-01-12T01:53:12.244Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/www/bootstrap.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 38828ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:52:42,199 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:17,438 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:21,044 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t33_srv1__wwwbootstraphtml_rm0_cp1 — 2026-01-12T01:53:51.074Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/www/bootstrap.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 39415ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:52:42,199 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:17,438 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:21,044 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:01,542 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t34_srv1__bootstraphtml_rm0_cp0 — 2026-01-12T01:54:30.490Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/bootstrap.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 38526ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:52:42,199 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:17,438 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:21,044 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:01,542 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:38,993 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t35_srv1__bootstraphtml_rm1_cp0 — 2026-01-12T01:55:09.017Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/bootstrap.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37471ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:52:42,199 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:17,438 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:21,044 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:01,542 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:38,993 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:55:16,467 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t36_srv1__bootstraphtml_rm0_cp1 — 2026-01-12T01:55:46.489Z
- Config: 
``json
{
  "enableServer": true,
  "documentRoot": "./",
  "url": "/bootstrap.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 37265ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Keeping resources.neu (server mode)
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:52:42,199 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:17,438 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:21,044 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:01,542 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:38,993 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:55:16,467 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:55:53,681 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t37_srv0_www_wwwindexhtml_rm0_cp0 — 2026-01-12T01:56:23.755Z
- Config: 
``json
{
  "enableServer": false,
  "documentRoot": "./www/",
  "url": "/www/index.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 36603ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Copied www to dist (unpacked)
  - Removed resources.neu for unpacked flow
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:52:42,199 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:17,438 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:21,044 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:01,542 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:38,993 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:55:16,467 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:55:53,681 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t38_srv0_www_wwwindexhtml_rm1_cp0 — 2026-01-12T01:57:00.358Z
- Config: 
``json
{
  "enableServer": false,
  "documentRoot": "./www/",
  "url": "/www/index.html",
  "removeNeu": true,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37209ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Copied www to dist (unpacked)
  - Removed resources.neu for unpacked flow
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:52:42,199 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:17,438 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:21,044 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:01,542 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:38,993 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:55:16,467 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:55:53,681 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t39_srv0_www_wwwindexhtml_rm0_cp1 — 2026-01-12T01:57:37.568Z
- Config: 
``json
{
  "enableServer": false,
  "documentRoot": "./www/",
  "url": "/www/index.html",
  "removeNeu": false,
  "copyRoot": true
}
``
- Success: **NO**
- Duration: 37433ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - Copied root assets in neutralino/ for this test
  - npx @neutralinojs/neu build
  - neu ok: false
  - Copied www to dist (unpacked)
  - Removed resources.neu for unpacked flow
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:52:42,199 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:17,438 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:21,044 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:01,542 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:38,993 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:55:16,467 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:55:53,681 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

## t40_srv0_www_wwwindexhtml_rm0_cp0 — 2026-01-12T01:58:15.002Z
- Config: 
``json
{
  "enableServer": false,
  "documentRoot": "./www/",
  "url": "www/index.html",
  "removeNeu": false,
  "copyRoot": false
}
``
- Success: **NO**
- Duration: 37277ms
- Notes:
  - Wrote neutralino config for test
  - npm run build
  - npx @neutralinojs/neu build
  - neu ok: false
  - Copied www to dist (unpacked)
  - Removed resources.neu for unpacked flow
  - Wrote config to dist
  - Starting exe
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)
  - Found NE_RS_UNBLDRE in logs (may indicate failure)

- Logs (tail):

```
ERROR 2026-01-11 12:12:38,782 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 12:50:36,639 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 15:00:01,492 NE_RS_UNBLDRE: Unable to load application resource file /bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,068 NE_RS_UNBLDRE: Unable to load application resource file /index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,117 NE_RS_UNBLDRE: Unable to load application resource file /favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,137 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,141 NE_RS_UNBLDRE: Unable to load application resource file /neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,142 NE_RS_UNBLDRE: Unable to load application resource file /neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,144 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-DN4-zllN.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,747 NE_RS_UNBLDRE: Unable to load application resource file /assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:40:55,902 NE_RS_UNBLDRE: Unable to load application resource file /.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:27,900 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/hello.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:53,336 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:49:54,292 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,198 NE_RS_UNBLDRE: Unable to load application resource file ./www/favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 16:50:59,877 NE_RS_UNBLDRE: Unable to load application resource file ./www/.well-known/appspecific/com.chrome.devtools.json api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:03,486 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 17:28:40,703 NE_RS_UNBLDRE: Unable to load application resource file ./index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:33:55,587 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:34:33,014 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:35:10,502 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/index.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,935 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,938 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,939 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:37:39,968 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,248 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,250 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:17,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,862 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,865 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,866 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:38:54,901 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:41:25,196 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:02,455 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:42:39,963 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/bootstrap.html api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,485 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,489 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,490 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:17,499 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,281 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,282 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,284 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:43:55,298 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,802 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,804 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/assets/index-CilVCTn-.css api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,805 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino-shim.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:44:32,828 NE_RS_UNBLDRE: Unable to load application resource file ./www/www/neutralino.js api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:48:56,325 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:49:32,877 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:50:09,786 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:52:42,199 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:17,438 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:53:21,044 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:01,542 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:54:38,993 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:55:16,467 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK
ERROR 2026-01-11 22:55:53,681 NE_RS_UNBLDRE: Unable to load application resource file ./favicon.ico api\debug\debug.cpp:20 Marcel@DESKTOP-2VE24BK

```

