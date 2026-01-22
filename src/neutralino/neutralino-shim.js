// WebServDev API Shim - Unified API for Neutralino
import { createFilesystemAdapter } from './lib/fs-adapter.js';
import { detectServices, loadAppConfig, getAvailableVersions } from './lib/services-detector.js';

(function(){
  // --- SISTEMA DE LOGS PERSISTENTES (CAPA TEMPRANA) ---
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  let logBuffer = [];
  let neutralinoReady = false;
  
  // Detección robusta del entorno
  const checkIsDev = () => {
    // 1. Detectar por puerto (Vite)
    const port = String(globalThis.location.port);
    const isVitePort = port === '5173' || port === '3000' || port === '5174';
    
    // 2. Detectar por hostname
    const isLocal = globalThis.location.hostname === 'localhost' || 
                    globalThis.location.hostname === '127.0.0.1' || 
                    globalThis.location.hostname === '0.0.0.0';
    
    // 3. Evaluar (En dev de Neutralino, NL_TOKEN existe pero el puerto es de Vite)
    // Primamos el puerto de Vite sobre la existencia del token.
    const isDev = isVitePort || (isLocal && !globalThis.NL_TOKEN);
    
    // Solo logueamos una vez para no saturar si checkIsDev se llama seguido
    if (!globalThis.__SHIM_DEV_LOGGED) {
      originalConsole.log(`[SHIM] Detección Entorno -> Port: ${port}, isVitePort: ${isVitePort}, NL_TOKEN: ${!!globalThis.NL_TOKEN} -> IS_DEV: ${isDev}`);
      globalThis.__SHIM_DEV_LOGGED = true;
    }
    
    return isDev;
  };

  let IS_DEV = checkIsDev();
  
  const SHIM_VERSION = '1.4.3';
  originalConsole.log('[SHIM] Cargado. IS_DEV:', IS_DEV, 'Version:', SHIM_VERSION);
  
  // Si la versión guardada es distinta, limpiar cachés
  const savedVersion = localStorage.getItem('WebServDev-shim-version');
  if (savedVersion !== SHIM_VERSION) {
    console.warn(`[SHIM] Nueva versión detectada (${SHIM_VERSION}). Limpiando cachés...`);
    localStorage.removeItem('WebServDev-exe-cache');
    localStorage.setItem('WebServDev-shim-version', SHIM_VERSION);
  }
  setTimeout(() => {
    console.log(`[SHIM] Sistema de logs inicializado en ${IS_DEV ? 'modo PROXY (DEV)' : 'modo NATIVO'}`);
  }, 100);

  const flushBuffer = async () => {
    if (logBuffer.length === 0) return;
    
    // Re-chequeamos IS_DEV antes de vaciar
    IS_DEV = checkIsDev();

    const content = logBuffer.join('');
    logBuffer = [];

    if (IS_DEV) {
      try {
        originalConsole.log('[SHIM] Enviando logs al proxy...', content.length, 'bytes');
        const resp = await fetch('/api/write-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content })
        });
        if (!resp.ok) throw new Error('Proxy no disponible');
        // Si funcionó, perfecto.
      } catch (e) {
        // En caso de error, guardamos el contenido para el siguiente intento
        logBuffer.unshift(content);
        originalConsole.warn('[SHIM] Error vaciando buffer de logs (DEV):', e.message);
        // Reintentamos más tarde
        setTimeout(flushBuffer, 2000);
      }
      return;
    }

    if (!globalThis.Neutralino || !globalThis.Neutralino.filesystem) {
      logBuffer.unshift(content);
      return;
    }

    // Asegurar que usamos una ruta absoluta si NL_PATH existe
    const base = globalThis.NL_PATH || '.';
    const logPath = (base + '/app-debug.log').replace(/\\/g, '/').replace(/\/+/g, '/');

    originalConsole.log(`[SHIM] Escribiendo ${content.length} bytes de log a: ${logPath}`);

    try {
      // Nos aseguramos de que logPath no tenga barras duplicadas y sea absoluta
      const cleanPath = logPath.replace(/\/+/g, '/');
      
      // Intentar append, si falla (ej. archivo no existe), intentar writeFile
      await globalThis.Neutralino.filesystem.appendFile(cleanPath, content)
        .catch(async (err) => {
          originalConsole.log(`[SHIM] falló append (${err.code}), intentando writeFile...`);
          await globalThis.Neutralino.filesystem.writeFile(cleanPath, content);
        });
    } catch (e) {
      originalConsole.error('[SHIM] Error crítico escribiendo log a:', logPath, e);
    }
  };

  const logToFile = (level, ...args) => {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => {
      try {
        if (arg instanceof Error) return `${arg.message}\nStack: ${arg.stack}`;
        return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
      } catch(e) { return String(arg); }
    }).join(' ');
    
    const logLine = `[${timestamp}] [${level}] ${message}\n`;

    // 1. Mostrar en la consola original
    const logMethod = level.toLowerCase() === 'error' ? 'error' : (level.toLowerCase() === 'warn' ? 'warn' : 'log');
    if (originalConsole[logMethod]) originalConsole[logMethod](message);

    // 2. Guardar en archivo
    IS_DEV = checkIsDev();

    if (IS_DEV) {
      logBuffer.push(logLine);
      // Evitamos llamar a fetch 100 veces seguidas si hay muchos logs.
      // Si ya hay algo en el buffer intentando salir, esperamos.
      if (logBuffer.length === 1) {
        // En lugar de fetch directo, usamos flushBuffer para manejar reintentos y acumulación
        setTimeout(flushBuffer, 100);
      }
    } else if (globalThis.Neutralino && globalThis.Neutralino.filesystem && neutralinoReady) {
      // Si ya estamos listos, podemos intentar vaciar el buffer + la línea actual
      logBuffer.push(logLine);
      flushBuffer();
    } else {
      logBuffer.push(logLine);
    }

    // 3. Enviar a nativo (Solo si no es DEV)
    if (!IS_DEV && globalThis.Neutralino && globalThis.Neutralino.debug && (neutralinoReady || globalThis.NL_TOKEN)) {
      globalThis.Neutralino.debug.log(logLine, level === 'ERROR' ? 'ERROR' : (level === 'WARN' ? 'WARNING' : 'INFO')).catch(()=>{});
    }

    // 4. UI
    if (globalThis.__neutralino_log_cb) {
      globalThis.__neutralino_log_cb({ timestamp: Date.now(), level, message });
    }
  };

  // Interceptar consola de inmediato
  console.log = (...args) => logToFile('INFO', ...args);
  console.warn = (...args) => logToFile('WARN', ...args);
  console.error = (...args) => logToFile('ERROR', ...args);
  console.info = (...args) => logToFile('INFO', ...args);

  console.log('[SHIM] Cargado correctamente v1.4.3');

  // En modo DEV, vaciamos el buffer inicial casi de inmediato
  if (checkIsDev()) {
    setTimeout(flushBuffer, 500);
    // Y mantenemos un heartbeat de logs para asegurar que no se quedan en el buffer
    setInterval(flushBuffer, 2000);
  }

  // --- INICIALIZACIÓN DE NEUTRALINO ---
  const initNeutralino = () => {
    if(typeof Neutralino !== 'undefined') {
      try {
        Neutralino.init();
        
        const onReady = () => {
          if (neutralinoReady) return;
          neutralinoReady = true;
          const pathLog = (globalThis.NL_PATH || '.') + '/app-debug.log';
          
          // Usar originalConsole directamente para este mensaje crítico
          originalConsole.log(`[SHIM] Neutralino Runtime Ready (NL_PATH: ${globalThis.NL_PATH})`);
          originalConsole.log(`[SHIM] Logs persistentes activados en: ${pathLog}`);
          
          flushBuffer();
        };

        // Escuchar el evento oficial de Neutralino
        if (Neutralino.events) {
          Neutralino.events.on('ready', onReady);
        }

        // Fallback: si el token ya está o pasa tiempo, forzar onReady
        if (globalThis.NL_TOKEN) {
          setTimeout(onReady, 100);
        } else {
          let retries = 0;
          const checkToken = () => {
            if (globalThis.NL_TOKEN || retries > 20) onReady();
            else { retries++; setTimeout(checkToken, 100); }
          };
          checkToken();
        }
      } catch (e) {
        originalConsole.error('[SHIM] Error inicializando Neutralino:', e);
      }
    } else if (!IS_DEV) {
      // En producción, si no está Neutralino, reintentamos un poco (por si el script tarda)
      console.log('[SHIM] Esperando a que el SDK de Neutralino esté disponible...');
      setTimeout(initNeutralino, 100);
    }
  };

  initNeutralino();
  
  // Detectar raíz real en Neutralino (NL_PATH es el directorio del binary)
  // En producción (dist), appRoot DEBE ser NL_PATH para encontrar bin/ y services.json
  const neutralinoRoot = globalThis.NL_PATH || '.';
  let appRoot = neutralinoRoot;

  // Solo ajustar appRoot si estamos en desarrollo CON Neutralino y queremos ver la carpeta del proyecto
  // Pero para una distribución (dist), NL_PATH ya es el lugar correcto.
  if (!globalThis.NL_TOKEN && globalThis.NL_PATH && globalThis.NL_PATH.includes('dist')) {
    appRoot = globalThis.NL_PATH.replace(/[\\/]dist[\\/].*$/, '') || '.';
    console.log('[SHIM] Detectado modo desarrollo con binario en dist, ajustando appRoot a:', appRoot);
  } else {
    console.log('[SHIM] Usando raíz de aplicación:', appRoot);
  }

  // Flag global para evitar saturación durante instalaciones
  globalThis.__is_installing = false;

  // SI YA EXISTE webservAPI en window o globalThis, no sobreescribir
  const target = typeof window !== 'undefined' ? window : globalThis;
  if (typeof target.webservAPI !== 'undefined') {
    console.log('[SHIM] API ya existe, saltando implementación');
    return;
  }
  
  const defaultConfig = { 
    basePath: appRoot, 
    projectsPath: appRoot + '\\www', 
    editor: 'notepad', 
    autoStart: false, 
    language: 'es', 
    theme: 'system' 
  };

  // --- Utilidades de Sistema ---
  const readFileShim = async (path) => {
    if (checkIsDev()) {
      try {
        const resp = await fetch('/api/read-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
        });
        if (!resp.ok) return null;
        const data = await resp.json();
        return data.content;
      } catch (e) { return null; }
    }
    if (globalThis.Neutralino && globalThis.Neutralino.filesystem) {
      try {
        return await globalThis.Neutralino.filesystem.readFile(path);
      } catch (e) { return null; }
    }
    return null;
  };

  const writeFileShim = async (path, content) => {
    if (checkIsDev()) {
      try {
        const resp = await fetch('/api/write-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, content })
        });
        return resp.ok;
      } catch (e) { return false; }
    }
    if (globalThis.Neutralino && globalThis.Neutralino.filesystem) {
      try {
        await globalThis.Neutralino.filesystem.writeFile(path, content);
        return true;
      } catch (e) { return false; }
    }
    return false;
  };

  /**
   * Carga la configuración de servicios desde el archivo services.json
   * Soporta tanto formato Array como Objeto { services: [...] }
   */
  let cachedServices = null;
  let servicesPromise = null;

  async function loadServicesConfig() {
    if (cachedServices) return cachedServices;
    if (servicesPromise) return servicesPromise;

    servicesPromise = (async () => {
      // 1. Intentar via fetch (ideal para desarrollo y si el server de Neutralino responde)
      const fetchPaths = ['/services.json', 'services.json', './services.json', '/www/services.json'];
      for (const path of fetchPaths) {
        try {
          console.log(`[SHIM] Intentando fetch servicios desde: ${path}`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1000);
          const res = await fetch(path, { cache: 'no-store', signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data && Array.isArray(data.services) ? data.services : []);
            if (list.length > 0) {
              console.log(`[SHIM] Servicios cargados via fetch desde ${path}`);
              cachedServices = list;
              return list;
            }
          }
        } catch (e) {}
      }

      // 2. Fallback: Intentar viafilesystem (En producción)
      if (globalThis.Neutralino && globalThis.Neutralino.filesystem) {
        const fsPaths = [
          (globalThis.NL_PATH || '.') + '/services.json',
          './services.json',
          'services.json'
        ];
        for (const p of fsPaths) {
          try {
            const normalized = p.replace(/\\/g, '/');
            console.log(`[SHIM] Intentando leer servicios via FS: ${normalized}`);
            const content = await globalThis.Neutralino.filesystem.readFile(normalized);
            if (content) {
              const data = JSON.parse(content);
              const list = Array.isArray(data) ? data : (data && Array.isArray(data.services) ? data.services : []);
              if (list.length > 0) {
                console.log(`[SHIM] Servicios cargados via FS desde ${normalized}`);
                cachedServices = list;
                return list;
              }
            }
          } catch (e) {}
        }
      }

      console.warn('[SHIM] Ningún services.json encontrado');
      return [];
    })();

    return servicesPromise;
  }

  async function fileExists(path){
    try{
      // En desarrollo, usar Node.js backend. En Neutralino PROD usar filesystem
      if(checkIsDev()){
        const response = await fetch('/api/file-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
        });
        const result = await response.json();
        return result.exists === true;
      }
      
      // En producción, usar Neutralino
      if(globalThis.Neutralino && globalThis.Neutralino.filesystem){
        try {
          if (typeof globalThis.Neutralino.filesystem.exists === 'function') {
            const res = await globalThis.Neutralino.filesystem.exists(path.replace(/\\/g, '/'));
            if(typeof res === 'boolean') return res;
            if(res && typeof res.exists === 'boolean') return res.exists;
          }
          await globalThis.Neutralino.filesystem.getStats(path.replace(/\\/g, '/'));
          return true;
        } catch(e) {
          return false;
        }
      }
    }catch(e){
      console.log('[SHIM] fileExists error:', e.message);
    }
    return false;
  }

  async function readDir(path){
    try{
      if(checkIsDev()){
        const response = await fetch('/api/read-dir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
        });
        const result = await response.json();
        return result.entries || null;
      }
      
      // En producción, usar Neutralino
      if(globalThis.Neutralino && globalThis.Neutralino.filesystem && globalThis.Neutralino.filesystem.readDirectory){
        const res = await globalThis.Neutralino.filesystem.readDirectory(path.replace(/\\/g, '/'));
        if(Array.isArray(res)) return res;
        if(res && Array.isArray(res.entries)) return res.entries;
        if(res && Array.isArray(res.entries)) return res.entries;
        return [];
      }
    }catch(e){
      console.log('[SHIM] readDir error:', e.message);
    }
    return null;
  }

  // Caché persistente para rutas de ejecutables encontradas y patrones de búsqueda
  const EXE_CACHE_KEY = 'WebServDev-exe-cache';
  let exePathCache = {
    hits: {},      // Resultados directos: "tipo-version-exe" -> "ruta/relativa/exe"
    patterns: ['', 'bin', 'Apache24/bin', 'bin/mysql', 'bin/mariadb'] // Sub-rutas candidatas aprendidas
  };

  try {
    const savedCache = localStorage.getItem(EXE_CACHE_KEY);
    if (savedCache) {
      const parsed = JSON.parse(savedCache);
      // Mezclar patrones guardados con los iniciales (evitar duplicados)
      if (parsed.patterns) {
        exePathCache.patterns = [...new Set([...exePathCache.patterns, ...parsed.patterns])];
      }
      if (parsed.hits) {
        exePathCache.hits = parsed.hits;
      }
    }
  } catch (e) {
    console.warn('[SHIM] Error cargando caché de ejecutables:', e);
  }

  function saveExeCache() {
    try {
      localStorage.setItem(EXE_CACHE_KEY, JSON.stringify(exePathCache));
    } catch (e) {
      console.warn('[SHIM] Error guardando caché de ejecutables:', e);
    }
  }

  /**
   * Busca un archivo recursivamente en un directorio dado.
   * Útil para encontrar ejecutables en estructuras variables.
   */
  async function searchFileRecursive(dir, fileName, depth = 0) {
    if (depth > 5) return null; // Límite de seguridad
    try {
      const entries = await readDir(dir);
      if (!entries || !Array.isArray(entries)) return null;

      // 1. Primero buscar en el nivel actual para mayor velocidad
      for (const entry of entries) {
        const name = (typeof entry === 'object') ? (entry.entry || entry.name) : entry;
        const type = (typeof entry === 'object') ? (entry.type) : 'UNKNOWN';
        
        if (name.toLowerCase() === fileName.toLowerCase()) {
          const fullPath = (dir + '/' + name).replace(/[\/\\]+/g, '/');
          if (await fileExists(fullPath)) return fullPath;
        }
      }

      // 2. Si no está, buscar en subdirectorios
      for (const entry of entries) {
        const name = (typeof entry === 'object') ? (entry.entry || entry.name) : entry;
        const type = (typeof entry === 'object') ? (entry.type) : 'UNKNOWN';
        
        // Evitar carpetas ocultas o de sistema
        if (name.startsWith('.') || name === 'node_modules' || name === 'tmp') continue;

        // Si es directorio (o sospechamos que lo es), entrar recursivamente
        if (type === 'DIRECTORY' || type === 'UNKNOWN') {
          const subDir = (dir + '/' + name).replace(/[\/\\]+/g, '/');
          const result = await searchFileRecursive(subDir, fileName, depth + 1);
          if (result) return result;
        }
      }
    } catch (e) {
      console.warn(`[SHIM] Error en búsqueda recursiva en ${dir}:`, e.message);
    }
    return null;
  }

  async function findExecutable(type, version, exeName, basePath){
    console.warn(`[SHIM] [DEBUG-DETECTION] findExecutable: type=${type}, version=${version}, exe=${exeName}, base=${basePath}`);
    if(!exeName) return null;
    
    // Normalizar basePath para evitar problemas de terminación y slashes
    const normalizedBase = basePath.replace(/[\\\/]+/g, '/').replace(/\/$/, '');
    const cacheKey = `${type}-${version}-${exeName}`;

    // Forzar re-escaneo si es Apache para debug
    if (type === 'apache') {
       console.warn(`[SHIM] [DEBUG-DETECTION] Limpiando cache para Apache para asegurar escaneo fresco`);
       delete exePathCache.hits[cacheKey];
    }

    // 1. Intentar recuperación desde la caché de HITS (Directo)
    if (exePathCache.hits[cacheKey]) {
      let cachedPath = exePathCache.hits[cacheKey];
      // Si la ruta guardada es relativa, reconstruirla
      if (!cachedPath.includes(':') && !cachedPath.startsWith('/')) {
        cachedPath = (normalizedBase + '/' + cachedPath).replace(/\/+/g, '/');
      }
      
      console.log(`[SHIM] [${type}] Verificando hit de caché: ${cachedPath}`);
      if (await fileExists(cachedPath)) {
        console.log(`[SHIM] [${type}] Hit de caché directo: ${cachedPath}`);
        return cachedPath;
      } else {
        console.warn(`[SHIM] [${type}] Hit de caché inválido para ${cacheKey}: ${cachedPath}`);
        delete exePathCache.hits[cacheKey];
        saveExeCache();
      }
    }

    const typeOrAlias = (type === 'mysql' || type === 'mariadb') ? ['mysql', 'mariadb'] : [type];
    const rootsToSearch = [];
    
    // Fallback de raíces: Usamos la proporcionada (basePath) y las relativas estándar
    const baseCandidates = [
      normalizedBase,
      '.',
      '..',
      './neutralino',
      globalThis.NL_PATH || '.'
    ];

    for(const t of typeOrAlias) {
      for (const b of [...new Set(baseCandidates)]) {
        if (!b) continue;
        const nb = b.replace(/[\\\/]+/g, '/').replace(/\/$/, '');
        
        if (version) {
          rootsToSearch.push(`${nb}/bin/${t}/${version}`);
          rootsToSearch.push(`${nb}/neutralino/bin/${t}/${version}`);
          if (version.includes(' ')) rootsToSearch.push(`${nb}/bin/${t}/${version.replace(/\s+/g, '_')}`);
        }
        rootsToSearch.push(`${nb}/bin/${t}`);
        rootsToSearch.push(`${nb}/neutralino/bin/${t}`);
      }
    }

    // Filtrar duplicados y raíces que no existen para ahorrar tiempo
    const uniqueRoots = [...new Set(rootsToSearch)];
    console.log(`[SHIM] [${type}] Iniciando búsqueda. exeName: ${exeName}, version: ${version}`);
    console.log(`[SHIM] [${type}] Raíces a escanear:`, uniqueRoots.length);

    // 2. Intentar usar PATRONES aprendidos + PATRONES COMUNES (Búsqueda rápida)
    const patternsToTry = [...new Set([...exePathCache.patterns, '', 'bin', 'Apache24/bin', 'bin/mysql', 'bin/mariadb'])];
    
    for (const root of uniqueRoots) {
      const normalizedRoot = root.replace(/[\\\/]+/g, '/');
      console.warn(`[SHIM] [DEBUG-DETECTION] Verificando root: ${normalizedRoot}`);
      const rootExists = await fileExists(normalizedRoot);
      
      if (!rootExists) {
        // Reducir ruido: solo loguear si parece una ruta prometedora
        if (normalizedRoot.includes('bin/')) {
           console.warn(`[SHIM] [DEBUG-DETECTION] Root NO existe: ${normalizedRoot}`);
        }
        continue;
      }

      console.warn(`[SHIM] [DEBUG-DETECTION] Escaneando raíz EXISTENTE: ${normalizedRoot}`);
      for (const pattern of patternsToTry) {
        const candidate = (normalizedRoot + '/' + pattern + '/' + exeName).replace(/\/+/g, '/');
        const exists = await fileExists(candidate);
        
        if (exists) {
          console.warn(`[SHIM] [DEBUG-DETECTION] ¡ÉXITO! Encontrado mediante patrón "${pattern}": ${candidate}`);
          // Guardar hit y retornar
          let relHit = candidate.replace(normalizedBase, '').replace(/^\/+/, '');
          exePathCache.hits[cacheKey] = relHit;
          saveExeCache();
          return candidate;
        } else if (pattern === 'Apache24/bin' && type === 'apache') {
           console.warn(`[SHIM] [DEBUG-DETECTION] Falló Apache24/bin en: ${candidate}`);
        }
      }
    }

    // 3. Si nada funciona, Búsqueda Recursiva (y aprendizaje)
    for (const root of uniqueRoots) {
      const normalizedRoot = root.replace(/[\\\/]+/g, '/');
      if (await fileExists(normalizedRoot)) {
        console.warn(`[SHIM] [DEBUG-DETECTION] Iniciando búsqueda recursiva profunda en: ${normalizedRoot} para ${exeName}`);
        const result = await searchFileRecursive(normalizedRoot, exeName);
        if (result) {
          console.warn(`[SHIM] [DEBUG-DETECTION] ¡ÉXITO RECURSIVO! Encontrado: ${result}`);
          // Extraer la ruta relativa desde el root para aprender el patrón
          let relToRoot = result.replace(normalizedRoot, '').replace(/^\/+/, '');
          let pattern = relToRoot.replace(new RegExp(`${exeName}$`, 'i'), '').replace(/\/+$/, '');
          
          if (!exePathCache.patterns.includes(pattern)) {
            console.warn(`[SHIM] [DEBUG-DETECTION] Nuevo patrón aprendido: "${pattern}"`);
            exePathCache.patterns.push(pattern);
          }

          let relHit = result.replace(normalizedBase, '').replace(/^\/+/, '');
          exePathCache.hits[cacheKey] = relHit;
          saveExeCache();
          return result;
        }
      }
    }

    console.error(`[SHIM] [DEBUG-DETECTION] ERROR FINAL: No se pudo encontrar ${exeName} para ${type} v${version} en ninguna de las ${uniqueRoots.length} raíces probadas.`);
    return null;
  }

  async function getAvailableVersions(basePath, serviceType){
    // Normalizar basePath
    const normalizedBase = basePath.replace(/[\\\/]+/g, '/').replace(/\/$/, '');
    console.log(`[SHIM] getAvailableVersions para ${serviceType} en ${normalizedBase}`);
    const versions = [];
    
    // Lista de rutas base donde buscar
    const baseRoots = [
      `${normalizedBase}/bin/${serviceType}`,
      `${normalizedBase}/neutralino/bin/${serviceType}`,
      `${normalizedBase}/usr/bin/${serviceType}`,
      `./bin/${serviceType}`,
      `./neutralino/bin/${serviceType}`,
      `${neutralinoRoot}/bin/${serviceType}`
    ];

    for (const root of baseRoots) {
      const normalizedRoot = root.replace(/[\\\/]+/g, '/').replace(/\/$/, '');
      if (!(await fileExists(normalizedRoot))) {
        continue;
      }
      
      const entries = await readDir(normalizedRoot);
      console.log(`[SHIM] readDir para ${normalizedRoot}:`, entries ? entries.length : 0, 'entradas');
      if (entries) {
        for (const entry of entries) {
          const name = (entry && typeof entry === 'object') ? (entry.entry || entry.name) : entry;
          if (!name || name === '.' || name === '..' || name.startsWith('.') || name === 'tmp') continue;
          
          if (!versions.includes(name)) {
            versions.push(name);
          }
        }
      }
    }
    const sorted = versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
    console.log(`[SHIM] Resultado para ${serviceType}:`, sorted);
    return sorted;
  }
  function safeOpen(url){
    try{
      if(globalThis.Neutralino && globalThis.Neutralino.os && globalThis.Neutralino.os.open){
        globalThis.Neutralino.os.open(url);
        return;
      }
    }catch(e){}
    globalThis.open(url, '_blank');
  }

  // Cache para netstat
  let netstatCache = null;
  let netstatCacheTime = 0;
  let activeNetstatFetch = null;

  async function getNetstatData(){
    const now = Date.now();
    
    // Si el caché es válido (< 3 segundos), devolverlo
    if(netstatCache && (now - netstatCacheTime) < 3000){
      return netstatCache;
    }

    // Si ya hay una petición en curso, esperar a esa
    if(activeNetstatFetch) return activeNetstatFetch;
    
    activeNetstatFetch = (async () => {
      try {
        console.log('[SHIM] Ejecutando: netstat -ano | findstr LISTENING');
        const result = await execCommand(`cmd /c "netstat -ano | findstr LISTENING"`);
        if(!result || !result.stdout) {
          netstatCache = {};
          netstatCacheTime = now;
          return netstatCache;
        }
        
        // Parsear resultado: agrupar por puerto
        const portMap = {};
        const lines = result.stdout.split('\r\n');
        for(const line of lines){
          if(line.includes('LISTENING')){
            const match = line.match(/:(\d+)\s+.*?LISTENING\s+(\d+)/i);
            if(match){
              const port = match[1];
              const pid = match[2];
              portMap[port] = pid;
            }
          }
        }
        
        netstatCache = portMap;
        netstatCacheTime = now;
        console.log('[SHIM] Netstat caché actualizado:', Object.keys(portMap).length, 'puertos');
        return portMap;
      }catch(e){
        console.log('[SHIM] Error en getNetstatData:', e.message);
        netstatCache = {};
        netstatCacheTime = now;
        return {};
      } finally {
        activeNetstatFetch = null;
      }
    })();

    return activeNetstatFetch;
  }

  function invalidateNetstatCache(){
    console.log('[SHIM] Invalidando caché de netstat');
    netstatCache = null;
    netstatCacheTime = 0;
    processCache = null;
    processCacheTime = 0;
  }

  // Cache para lista de procesos
  let processCache = null;
  let lastTaskListUpdate = 0;
  let activeProcessFetch = null;

  async function getProcessList() {
    const now = Date.now();
    if (processCache && (now - lastTaskListUpdate < 10000)) {
      return processCache;
    }

    if (activeProcessFetch) return activeProcessFetch;

    activeProcessFetch = (async () => {
      try {
        console.log('[SHIM] Actualizando lista de procesos...');
        const result = await execCommand('tasklist /NH /FO CSV');
        if (result && result.stdout) {
          processCache = result.stdout.toLowerCase();
          lastTaskListUpdate = Date.now();
        } else {
          processCache = '';
        }
        return processCache;
      } catch (e) {
        console.warn('[SHIM] Error actualizando lista de procesos:', e.message);
        processCache = '';
        return '';
      } finally {
        activeProcessFetch = null;
      }
    })();

    return activeProcessFetch;
  }

  async function getProcessName(pid){
    try {
      const result = await execCommand(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
      if(!result || !result.stdout) return null;
      
      // El resultado es: "nombre.exe","pid",... extraer el primer campo
      const match = result.stdout.match(/"([^"]+)"/);
      return match ? match[1] : null;
    }catch(e){
      console.log('[SHIM] Error getting process name:', e.message);
    }
    return null;
  }

  async function checkServiceStatus(service) {
    try {
      if (!service) return { status: 'stopped', port: null, details: 'Servicio inválido' };
      
      const port = service.port || null;
      const statusPromise = (async () => {
        try {
          const type = (service.type || service.id || service.name || '').toLowerCase();
          let processRunning = false;
          let processName = service.processName || '';

          // Verificar si el proceso está corriendo usando la lista cacheada
          try {
            const processList = await getProcessList();
            if (processList && processName) {
              processRunning = processList.includes(processName.toLowerCase());
            }
            console.log('[SHIM]', service.name, 'running check (cache):', processRunning);
          } catch(e) {
            console.log('[SHIM] Error verificando proceso:', e.message);
          }
          
          // Obtener datos de netstat UNA SOLA VEZ (caché compartido)
          let portInUse = false;
          let portOccupiedBy = null;
          let portOccupiedByName = null;
          try {
            const netstatData = await getNetstatData();
            const portPid = netstatData[port];
            
            if(portPid){
              portInUse = true;
              console.log('[SHIM]', service.name, 'Puerto', port, 'en uso por PID:', portPid);
              
              // Si el puerto está en uso pero NO por nuestro proceso, obtener el nombre
              if(!processRunning){
                portOccupiedByName = await getProcessName(portPid);
                portOccupiedBy = portPid;
                console.log('[SHIM]', service.name, 'Puerto', port, 'ocupado por:', portOccupiedByName || `PID ${portPid}`);
              }
            }
          } catch(e) {
            console.log('[SHIM] Error verificando puerto:', e.message);
          }
          
          // Determinar estado basado en proceso Y puerto
          let status = 'stopped';
          let details = 'Servicio detenido';
          
          if(processRunning){
            status = 'running';
            details = `Servicio activo en puerto ${port}`;
          } else if(portInUse && portOccupiedByName){
            // Puerto ocupado por otro proceso
            status = 'port-occupied';
            details = `Puerto ${port} ocupado por ${portOccupiedByName}`;
          } else if(portInUse){
            // Puerto ocupado pero no sabemos por qué
            status = 'port-occupied';
            details = `Puerto ${port} en uso (PID: ${portOccupiedBy})`;
          }
          
          console.log('[SHIM]', service.name, 'status:', status, '| detalles:', details);
          
          return { 
            status, 
            port, 
            processRunning, 
            portInUse,
            portOccupiedBy,
            portOccupiedByName,
            processName,
            details
          };
        } catch (e) {
          console.log('[SHIM] No se pudo verificar estado real - retornando unknown:', e.message);
          return { status: 'unknown', port, processRunning: false, portInUse: false, details: 'Estado desconocido' };
        }
      })();
      
      // Timeout de 15s por servicio para evitar falsos negativos en máquinas lentas
      const timeoutMs = 15000;
      let checkFinished = false;
      
      return Promise.race([
        statusPromise.then(res => { checkFinished = true; return res; }),
        new Promise(resolve => {
          setTimeout(() => {
            if (!checkFinished) {
              console.log('[SHIM] Timeout verificando', service.name, '- retornando unknown');
              resolve({ status: 'unknown', port, processRunning: false, portInUse: false, details: 'Estado desconocido (Timeout)' });
            }
          }, timeoutMs);
        })
      ]);
    }catch(e){
      console.error('[SHIM] Error en checkServiceStatus:', e);
      return { status: 'unknown', port: null, processRunning: false, portInUse: false, details: 'Error al verificar' };
    }
  }

  async function execCommand(cmd){
    if(!cmd){
      console.warn('[SHIM] execCommand llamado sin comando');
      return { stdout: '', stderr: 'No command' };
    }
    try{
      // En desarrollo (puerto 5173), usar siempre /api/exec
      if (checkIsDev()) {
        const response = await fetch('/api/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd })
        });
        const result = await response.json();
        
        // Normalización crucial: Asegurar exitCode para compatibilidad con el resto del shim
        return {
          stdout: result.stdout || '',
          stderr: result.stderr || '',
          exitCode: result.exitCode !== undefined ? result.exitCode : (result.success ? 0 : 1),
          success: !!result.success
        };
      }
      
      // En producción con Neutralino runtime
      if(globalThis.Neutralino && globalThis.Neutralino.os && globalThis.Neutralino.os.execCommand){
        const result = await globalThis.Neutralino.os.execCommand(cmd);
        return {
          stdout: result.stdOut || result.stdout || '',
          stderr: result.stdErr || result.stderr || '',
          exitCode: result.exitCode
        };
      }
    }catch(e){
      console.error('[SHIM] Error executing command:', e);
      throw e;
    }
    throw new Error('No execution method available');
  }

  // Inicializar la API WebServDev
  const apiTarget = typeof window !== 'undefined' ? window : globalThis;
  const existingAPI = apiTarget.webservAPI;

  const apiImplementation = {
    getServices: async (hiddenServices)=>{
      const startTime = Date.now();
      console.log('[SHIM] >>> getServices INICIO');
      try{
        // Crear adaptador de filesystem
        const fsAdapter = createFilesystemAdapter();
        
        // Obtener configuración del usuario
        const cfgRaw = localStorage.getItem('WebServDev-config');
        const userConfig = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        
        let basePath = userConfig.basePath || defaultConfig.basePath || appRoot;
        
        // RESOLUCIÓN DE RUTAS ABSOLUTAS (Crucial para detección y ejecución)
        if (basePath === '.' || basePath === './' || !basePath.includes(':')) {
           try {
             const res = await execCommand('cd');
             if (res && res.stdout) {
               const absoluteBase = res.stdout.trim();
               console.log('[SHIM] [getServices] Resolviendo basePath relativo a absoluto:', basePath, '->', absoluteBase);
               basePath = absoluteBase;
             }
           } catch(e) {
             console.warn('[SHIM] [getServices] No se pudo resolver ruta absoluta:', e.message);
           }
        }

        console.log('[SHIM] Path Base:', basePath);
        console.log('[SHIM] appRoot:', appRoot);

        // Cargar configuración de app.ini
        console.log('[SHIM] Cargando configuración de app.ini...');
        const appConfig = await loadAppConfig(fsAdapter, basePath, console.log);
        console.log('[SHIM] Configuración cargada:', Object.keys(appConfig).length, 'secciones');
        
        // Ejecutar netstat una vez (con caché) para ports
        console.log('[SHIM] Refrescando Netstat...');
        await getNetstatData();
        
        // Delegar la detección completa a la librería
        console.log('[SHIM] Llamando a detectServices...');
        let allServices = await detectServices({
          fsAdapter,
          appPath: basePath,
          userConfig,
          appConfig,
          log: console.log
        });
        
        console.log(`[SHIM] detectServices retornó ${allServices.length} servicios`);
        
        // Filtrar servicios ocultos
        const hiddenArray = Array.isArray(hiddenServices) ? hiddenServices : [];
        const visibleServices = allServices.filter(s => !hiddenArray.includes(s.name));
        
        // Agregar servicios ocultos al final con status 'hidden'
        hiddenArray.forEach(name => {
          const s = allServices.find(x => x.name === name);
          if(s) {
            visibleServices.push({ ...s, status: 'hidden' });
          }
        });
        
        console.log(`[SHIM] <<< getServices FIN (Total: ${Date.now() - startTime}ms, Items: ${visibleServices.length})`);
        return visibleServices;
      }catch(e){
        console.error('[SHIM] !!! ERROR FATAL getServices:', e);
        return [
          { id: 'apache', name: 'Apache', type: 'apache', status: 'error', details: e.message },
          { id: 'mysql', name: 'MySQL', type: 'mysql', status: 'error', details: e.message }
        ];
      }
    },
    startService: async (serviceName)=>{
      console.log('[SHIM] ============ startService INICIO ============');
      console.log('[SHIM] Servicio solicitado:', serviceName);
      try{
        const cfgRaw = localStorage.getItem('WebServDev-config');
        console.log('[SHIM] Config raw:', cfgRaw);
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        let basePath = cfg.basePath || defaultConfig.basePath || neutralinoRoot;

        // RESOLUCIÓN DE RUTAS ABSOLUTAS (Crucial para servicios como Apache)
        if (basePath === '.' || basePath === './' || !basePath.includes(':')) {
           try {
             const res = await execCommand('cd');
             if (res && res.stdout) {
               const absoluteBase = res.stdout.trim();
               console.log('[SHIM] Resolviendo basePath relativo a absoluto:', basePath, '->', absoluteBase);
               basePath = absoluteBase;
             }
           } catch(e) {
             console.warn('[SHIM] No se pudo resolver ruta absoluta:', e.message);
           }
        }

        console.log('[SHIM] Base path determinado:', basePath);
        console.log('[SHIM] neutralinoRoot:', neutralinoRoot);
        
        // Cargar configuración de servicios
        const servicesList = await loadServicesConfig();
        
        const service = servicesList.find(s => s.name === serviceName);
        if(!service){
          const errorMsg = servicesList.length === 0 
            ? `Error interno: configuración de servicios no cargada. Reinicie la aplicación.`
            : `Servicio '${serviceName}' no encontrado en la configuración.`;
          console.error('[SHIM] ERROR:', errorMsg);
          throw new Error(errorMsg);
        }
        console.log('[SHIM] Servicio encontrado:', service);
        
        const type = (service.type || service.id || service.name || '').toLowerCase();
        const version = service.version || '';
        console.log('[SHIM] Tipo:', type, '| Versión:', version || '(default)');
        
        const exeMap = {
          'apache': 'httpd.exe',
          'nginx': 'nginx.exe',
          'mysql': 'mysqld.exe',
          'mariadb': 'mysqld.exe',
          'redis': 'redis-server.exe',
          'memcached': 'memcached.exe',
          'mailpit': 'mailpit.exe',
          'mongodb': 'mongod.exe',
          'php': 'php.exe'
        };
        
        const exe = exeMap[type];
        if(!exe){
          throw new Error(`Tipo de servicio no soportado: ${type}`);
        }
        console.log('[SHIM] Ejecutable objetivo:', exe);
        
        // Localizar el ejecutable real
        console.log('[SHIM] ============ BÚSQUEDA DE EJECUTABLE ============');
        console.log('[SHIM] Buscando:', exe, 'para tipo:', type, 'versión:', version);
        console.log('[SHIM] Raíz de búsqueda:', basePath);
        const fullExe = await findExecutable(type, version, exe, basePath);
        console.log('[SHIM] Resultado búsqueda:', fullExe);
        if(!fullExe){
          const errorMsg = `No se encontró el ejecutable para ${type} en ${basePath}\\bin\\${type}`;
          console.error('[SHIM] ERROR:', errorMsg);
          throw new Error(errorMsg);
        }
        console.log('[SHIM] ✓ Ejecutable encontrado:', fullExe);

        // Dependencias: Apache requiere PHP
        if(type === 'apache'){
          console.log('[SHIM] ============ VERIFICACIÓN PHP ============');
          const phpBin = await findExecutable('php', '', 'php.exe', basePath);
          console.log('[SHIM] PHP encontrado:', phpBin);
          if(!phpBin){
            const errorMsg = 'Apache requiere PHP instalado (php.exe no encontrado)';
            console.error('[SHIM] ERROR:', errorMsg);
            throw new Error(errorMsg);
          }
          console.log('[SHIM] ✓ PHP verificado:', phpBin);
        }
        
        console.info(`Iniciando ${serviceName}...`);
        
        // Limpiar procesos antiguos primero
        console.log('[SHIM] Limpiando procesos antiguos de', exe);
        try{
          await execCommand(`taskkill /F /IM ${exe} 2>NUL`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }catch(e){
          console.log('[SHIM] No había procesos antiguos o error al limpiar');
        }
        
        // Iniciar el servicio según su tipo
        let startCmd = '';
        let isBackground = false;
        
        // Normalizar rutas para evitar problemas con slashes mezclados
        const normalizedExe = fullExe.replace(/\//g, '\\');
        
        switch(type){
          case 'apache':{
            // Basar la ruta en la ubicación real del ejecutable
            const exeDir = normalizedExe.substring(0, normalizedExe.lastIndexOf('\\'));
            const apacheRoot = exeDir.toLowerCase().endsWith('\\bin') ? exeDir.substring(0, exeDir.lastIndexOf('\\')) : exeDir;
            const conf = `${apacheRoot}\\conf\\httpd.conf`;

            // PARCHEO DINÁMICO (Estilo Laragon)
            try {
              const apacheRootUnix = apacheRoot.replace(/\\/g, '/');
              console.log(`[SHIM] [apache] Verificando rutas en ${conf}`);
              const content = await readFileShim(conf);
              if (content && (content.includes('C:/Apache24') || content.includes('C:/laragon/bin/apache'))) {
                 console.log(`[SHIM] [apache] Parcheando httpd.conf -> ${apacheRootUnix}`);
                 const newContent = content.replace(/C:\/Apache24/g, apacheRootUnix)
                                           .replace(/C:\/laragon\/bin\/apache\//g, apacheRootUnix + '/..');
                 if (newContent !== content) {
                    await writeFileShim(conf, newContent);
                    console.log(`[SHIM] [apache] Parcheo de configuración completado.`);
                 }
              }
            } catch (e) {
              console.warn(`[SHIM] [apache] Falló el parcheo de configuración (no crítico): ${e.message}`);
            }

            // Usar PowerShell Start-Process para background
            startCmd = `powershell -Command "Start-Process -FilePath '${normalizedExe}' -ArgumentList '-f','${conf}','-d','${apacheRoot}' -WindowStyle Hidden -PassThru | Select-Object -ExpandProperty Id"`;
            isBackground = true;
            break;
          }
          case 'nginx':{
            startCmd = `start /B "" "${fullExe}"`;
            break;
          }
          case 'mysql':
          case 'mariadb':{
            startCmd = `start /B "" "${fullExe}" --standalone`;
            break;
          }
          case 'redis':{
            const redisConf = `${basePath}\\\\bin\\\\redis\\\\${version}\\\\redis.conf`;
            startCmd = `start /B "" "${fullExe}" "${redisConf}"`;
            break;
          }
          case 'mongodb':{
            const mongoData = `${basePath}\\\\data\\\\mongodb`;
            startCmd = `start /B "" "${fullExe}" --dbpath "${mongoData}"`;
            break;
          }
          default:{
            startCmd = `start /B "" "${fullExe}"`;
            break;
          }
        }
        
        // Ejecutar comando
        console.log('[SHIM] ============ EJECUCIÓN ============');
        console.log('[SHIM] Tipo servicio:', type);
        console.log('[SHIM] Comando completo:', startCmd);
        console.log('[SHIM] Es background:', isBackground);
        console.log('[SHIM] Ejecutando...');
        const result = await execCommand(startCmd);
        console.log('[SHIM] ============ RESULTADO ============');
        console.log('[SHIM] stdout:', result?.stdout || '(vacío)');
        console.log('[SHIM] stderr:', result?.stderr || '(vacío)');
        console.log('[SHIM] exitCode:', result?.exitCode);
        
        // Si hay stderr y no es background, es probable error
        if(result?.stderr && !isBackground){
          console.error('[SHIM] ERROR en ejecución:', result.stderr);
          throw new Error(`Error al iniciar ${name}: ${result.stderr}`);
        }
        
        // Si es Apache y devuelve PID, guardarlo
        if(type === 'apache' && result?.stdout){
          const pid = result.stdout.trim();
          console.log('[SHIM] Apache iniciado con PID:', pid);
        }
        
        // Invalidar caché de netstat porque el puerto puede estar en transición
        invalidateNetstatCache();
        
        console.info(`${serviceName} iniciado correctamente`);
        
        console.log('[SHIM] ✓ Servicio', serviceName, 'iniciado exitosamente');
        console.log('[SHIM] ============ startService FIN ============');
        return { success: true, message: `${serviceName} started` };
      }catch(e){
        const errorMsg = e.message || String(e);
        console.error(`Error al iniciar servicio: ${errorMsg}`);
        return { success: false, message: errorMsg };
      }
    },
    stopService: async (serviceName)=>{
      try{
        const cfgRaw = localStorage.getItem('WebServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        const basePath = cfg.basePath || defaultConfig.basePath;
        
        // Cargar configuración de servicios
        const servicesList = await loadServicesConfig();
        
        const service = servicesList.find(s => s.name === serviceName);
        if(!service){
          throw new Error(`Servicio no encontrado: ${serviceName}`);
        }
        
        const type = (service.type || service.id || service.name || '').toLowerCase();
        const version = service.version || '';
        
        const exeMap = {
          'apache': 'httpd.exe',
          'nginx': 'nginx.exe',
          'mysql': 'mysqld.exe',
          'mariadb': 'mysqld.exe',
          'redis': 'redis-server.exe',
          'memcached': 'memcached.exe',
          'mailpit': 'mailpit.exe',
          'mongodb': 'mongod.exe'
        };
        
        const exe = exeMap[type];
        if(!exe){
          throw new Error(`Tipo de servicio no soportado: ${type}`);
        }
        
        globalThis.__neutralino_push_log && globalThis.__neutralino_push_log({ 
          timestamp: Date.now(), 
          level: 'INFO', 
          message: `Deteniendo ${serviceName}...` 
        });
        
        // Intentar detener de forma elegante primero
        const fullExe = await findExecutable(type, version, exe, basePath);
        
        switch(type){
          case 'apache':{
            if(fullExe){
              const conf = `${basePath}\\\\bin\\\\apache\\\\${version}\\\\conf\\\\httpd.conf`;
              try{
                await execCommand(`cmd /C "${fullExe}" -k stop -f "${conf}"`);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }catch(e){}
            }
            // Fallback a taskkill
            await execCommand(`taskkill /IM ${exe} /F 2>NUL`);
            break;
          }
          case 'nginx':{
            if(fullExe){
              try{
                await execCommand(`cmd /C "${fullExe}" -s stop`);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }catch(e){}
            }
            await execCommand(`taskkill /IM ${exe} /F 2>NUL`);
            break;
          }
          case 'mysql':
          case 'mariadb':{
            // MySQL es mejor detenerlo con taskkill directamente
            await execCommand(`taskkill /IM ${exe} /F 2>NUL`);
            break;
          }
          default:{
            await execCommand(`taskkill /IM ${exe} /F 2>NUL`);
            break;
          }
        }
        
        // Invalidar caché de netstat porque los puertos cambian
        invalidateNetstatCache();
        
        console.log(`${serviceName} detenido correctamente`);
        
        return { success: true, message: `${serviceName} stopped` };
      }catch(e){
        const errorMsg = e.message || String(e);
        console.error(`Error al detener servicio: ${errorMsg}`, e);
        return { success: false, message: errorMsg };
      }
    },
    getConfig: async ()=>{
      try{
        const raw = localStorage.getItem('WebServDev-config');
        const cfg = raw ? JSON.parse(raw) : defaultConfig;
        // Forzar siempre el appPath actual para evitar que "C:\App" se quede pegado
        cfg.appPath = appRoot;
        return cfg;
      }catch(e){ return defaultConfig; }
    },
    setConfig: async (cfg)=>{
      try{ localStorage.setItem('WebServDev-config', JSON.stringify(cfg)); return true; }catch(e){return false}
    },
    getLogs: async () => {
      try {
        if (globalThis.Neutralino && globalThis.Neutralino.filesystem) {
          const logPath = globalThis.NL_TOKEN ? (globalThis.NL_PATH || '.') + '/app-debug.log' : './app-debug.log';
          try {
            const text = await globalThis.Neutralino.filesystem.readFile(logPath);
            if (!text || text.trim() === '') return [];
            
            const lines = text.split('\n').filter(l => l.trim());
            return lines.map(line => {
              const match = line.match(/\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.*)/);
              if (match) {
                return {
                  timestamp: new Date(match[1]).getTime() || Date.now(),
                  level: match[2],
                  message: match[3]
                };
              }
              return { timestamp: Date.now(), level: 'INFO', message: line };
            });
          } catch (e) {
            // Si el archivo no existe, devolvemos array vacío
            return [];
          }
        }
        return [];
      } catch (e) {
        console.warn('[SHIM] Error al leer logs:', e);
        return [];
      }
    },
    clearLogs: async () => {
      try {
        // En desarrollo, limpiar vía Proxy API
        if (checkIsDev()) {
          logBuffer = [];
          try {
            const resp = await fetch('/api/clear-logs', { method: 'POST' });
            if (resp.ok) {
              console.log('[SHIM] Logs del servidor (Proxy) limpiados');
              return true;
            }
          } catch (e) {
            console.error('[SHIM] Error al limpiar logs en Proxy:', e);
          }
          return true; // Retornamos true aunque el proxy falle si el buffer local se limpió
        }

        // Modo producción (Neutralino)
        if (globalThis.Neutralino && globalThis.Neutralino.filesystem) {
          const logPath = globalThis.NL_TOKEN ? (globalThis.NL_PATH || '.') + '/app-debug.log' : './app-debug.log';
          await globalThis.Neutralino.filesystem.writeFile(logPath, '');
          logBuffer = [];
          console.log('[SHIM] Logs de sistema (Native) limpiados');
          return true;
        }
      } catch (e) {
        console.error('[SHIM] Error crítico al limpiar logs:', e);
      }
      return false;
    },
    openInBrowser: (url)=>{ safeOpen(url); },
    onLog: (cb)=>{
      // no native stream; return a remover function
      globalThis.__neutralino_log_cb = cb;
      return ()=>{ globalThis.__neutralino_log_cb = null };
    },
    openAppFolder: async () => {
      try {
        const root = globalThis.NL_PATH || '.';
        await execCommand(`explorer "${root}"`);
      } catch(e) { console.error(e); }
    },
    openDocumentRoot: async () => {
      try {
        const cfgRaw = localStorage.getItem('WebServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        await execCommand(`explorer "${cfg.projectsPath || defaultConfig.projectsPath}"`);
      } catch(e) { console.error(e); }
    },
    openDevTools: async () => {
      // 1. Prioridad: Electron (si ya existía el API antes del shim)
      if (existingAPI && typeof existingAPI.openDevTools === 'function') {
        try {
          await existingAPI.openDevTools();
          console.log('[SHIM] DevTools abierto via Electron');
          return;
        } catch (e) {
          console.error('[SHIM] Error al abrir DevTools en Electron:', e.message);
        }
      }

      // 2. Neutralino SDK
      if (globalThis.Neutralino && globalThis.Neutralino.debug && typeof globalThis.Neutralino.debug.openDevTools === 'function') {
        try {
          await globalThis.Neutralino.debug.openDevTools();
          console.log('[SHIM] DevTools abierto via Neutralino');
          return;
        } catch (e) {
          console.error('[SHIM] Error al abrir DevTools en Neutralino:', e.message);
        }
      }

      // 3. Fallback / Información
      if (!globalThis.NL_TOKEN && !navigator.userAgent.includes('Electron')) {
        console.warn('[SHIM] Entorno de navegador detectado. Por favor, usa la tecla F12 de tu teclado para abrir las herramientas de desarrollo.');
      } else {
        console.warn('[SHIM] openDevTools no es soportado o la API debug.* no está habilitada en neutralino.config.json');
      }
    },
    getRemoteServices: async () => {
      console.log('[SHIM] getRemoteServices iniciando...');
      const services = await loadServicesConfig();
      if (services.length > 0) {
        return { services };
      }
      
      // Fallback si falla todo
      return { 
        services: [
          { "id": "php", "name": "PHP", "versions": [] },
          { "id": "apache", "name": "Apache", "versions": [] }
        ]
      };
    },
    installService: async (data) => {
      console.log('[SHIM] ============ installService INICIO ============');
      console.log('[SHIM] Datos recibidos:', data);
      globalThis.__is_installing = true;
      
      try {
        let service, zipUrl;
        
        if (data.service && data.zipUrl) {
          service = data.service;
          zipUrl = data.zipUrl;
        } else if (data.url && data.serviceId) {
          zipUrl = data.url;
          service = {
            name: data.serviceId.toUpperCase(),
            type: data.serviceId.toLowerCase(),
            version: data.version,
            installPath: data.installPath
          };
        } else {
          throw new Error('Faltan parámetros de instalación');
        }

        const cfgRaw = localStorage.getItem('WebServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        let basePath = cfg.basePath || defaultConfig.basePath || neutralinoRoot;

        // RESOLUCIÓN DE RUTA ABSOLUTA TRASCENDENTAL
        if (basePath === '.' || basePath === './' || !basePath.includes(':')) {
           try {
             const res = await execCommand('cd');
             if (res && res.stdout) {
               basePath = res.stdout.trim();
               console.log('[SHIM] [installService] Resolviendo basePath a absoluto:', basePath);
             }
           } catch(e) {}
        }
        basePath = basePath.replace(/\//g, '\\');

        // Limpiar solo caracteres verdaderamente Prohibidos en Windows: < > : " / \ | ? *
        const cleanVersion = service.version.replace(/[<>:"\/\\|?*]/g, '_').trim();
        const destDir = `${basePath}\\neutralino\\bin\\${service.type}\\${cleanVersion}`.replace(/\\\\/g, '\\');
        const tmpDir = `${basePath}\\tmp`.replace(/\\\\/g, '\\');
        const tmpZipPath = `${tmpDir}\\${service.type}-${cleanVersion}.zip`.replace(/\\\\/g, '\\').replace(/\s+/g, '_');

        console.log(`[SHIM] Instalando: ${service.name} v${service.version}`);
        console.log(`[SHIM] BasePath resuelto: ${basePath}`);
        console.log(`[SHIM] Destino Final: ${destDir}`);
        
        console.info(`Iniciando instalación de ${service.name} ${service.version}...`);
        console.info(`Ruta de instalación: ${destDir}`);
        console.info(`Descargando desde: ${zipUrl}`);

        await execCommand(`cmd /C if not exist "${tmpDir}" mkdir "${tmpDir}"`);
        await execCommand(`cmd /C if not exist "${destDir}" mkdir "${destDir}"`);

        // Prioridad PowerShell para Windows
        let downloadSuccess = false;
        let lastError = '';

        console.log('[SHIM] Intentando descarga con PowerShell...');
        console.info('Conectando con el servidor de descarga...');
        try {
          // Usamos rutas absolutas para evitar cualquier ambigüedad en el entorno de ejecución
          const psDownloadCmd = `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '${zipUrl}' -OutFile '${tmpZipPath}' -TimeoutSec 600 -UseBasicParsing -ErrorAction Stop"`;
          console.log('[SHIM] CMD:', psDownloadCmd);
          const psRes = await execCommand(psDownloadCmd);
          if (psRes.exitCode === 0) {
            downloadSuccess = true;
          } else {
            console.error('[SHIM] PowerShell error (exitCode ' + psRes.exitCode + '):', psRes.stderr);
            lastError = psRes.stderr || 'Fallo desconocido en PowerShell';
          }
        } catch (e) {
          console.error('[SHIM] PowerShell catch error:', e.message);
          lastError = e.message;
        }

        if (!downloadSuccess) {
          console.log('[SHIM] Fallback a curl...');
          console.info('PowerShell falló o no está disponible. Reintentando con curl...');
          try {
            // También usamos ruta absoluta para el archivo de salida de curl
            const curlRes = await execCommand(`curl -L "${zipUrl}" -o "${tmpZipPath}" --fail --silent --show-error --connect-timeout 60`);
            if (curlRes.exitCode === 0) {
              downloadSuccess = true;
            } else {
              console.error('[SHIM] Curl error:', curlRes.stderr);
              lastError = curlRes.stderr || `Código de error curl: ${curlRes.exitCode}`;
            }
          } catch (e) {
            console.error('[SHIM] Curl catch error:', e.message);
            lastError = e.message;
          }
        }

        if (!downloadSuccess) throw new Error(`Error de descarga: ${lastError}`);

        console.info('Descarga completada.');
        console.info('Iniciando descompresión de archivos...');

        console.log('[SHIM] Extrayendo...');
        // Expand-Archive también con rutas absolutas
        const extractRes = await execCommand(`powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference = 'SilentlyContinue'; Expand-Archive -Path '${tmpZipPath}' -DestinationPath '${destDir}' -Force"`);

        if (extractRes.exitCode !== 0) {
          console.error('[SHIM] Error Expand-Archive:', extractRes.stderr);
          console.info('PowerShell no pudo extraer los archivos. Reintentando con el comando tar del sistema...');
          const tarRes = await execCommand(`tar -xf "${tmpZipPath}" -C "${destDir}"`);
          if (tarRes.exitCode !== 0) {
            console.error('[SHIM] Error TAR:', tarRes.stderr);
            throw new Error(`Error de extracción: ${extractRes.stderr || tarRes.stderr}`);
          }
        }

        console.info('Instalación de archivos finalizada.');
        console.info('Limpiando archivos temporales...');
        try { await execCommand(`cmd /C del /F /Q "${tmpZipPath}"`); } catch(e) {}

        console.info(`${service.name} v${service.version} se ha instalado correctamente y está listo para usarse.`);

        console.log('[SHIM] Instalación finalizada');
        return { success: true, message: `${service.name} instalado` };
      } finally {
        globalThis.__is_installing = false;
      }
    },
    uninstallService: async (data) => {
      console.log('[SHIM] ============ uninstallService INICIO ============');
      console.log('[SHIM] Datos recibidos:', data);
      
      try {
        const { serviceId, version } = data;
        if (!serviceId || !version) throw new Error('Faltan parámetros de desinstalación (serviceId/version)');

        const cfgRaw = localStorage.getItem('WebServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        let basePath = cfg.basePath || defaultConfig.basePath || neutralinoRoot;

        // Limpiar caché de esa versión de inmediato
        const cacheKey = `${serviceId}-${version}`;
        Object.keys(exePathCache.hits).forEach(key => {
          if (key.startsWith(cacheKey)) delete exePathCache.hits[key];
        });
        saveExeCache();

        // Resolución de ruta absoluta
        if (basePath === '.' || basePath === './' || !basePath.includes(':')) {
           try {
             const res = await execCommand('cd');
             if (res && res.stdout) {
               basePath = res.stdout.trim();
               console.log('[SHIM] [uninstallService] Resolviendo basePath a absoluto:', basePath);
             }
           } catch(e) {}
        }
        basePath = basePath.replace(/\//g, '\\');

        const cleanVersion = version.replace(/[<>:"\/\\|?*]/g, '_').trim();
        const targetDir = `${basePath}\\neutralino\\bin\\${serviceId}\\${cleanVersion}`.replace(/\\\\/g, '\\');

        console.info(`Iniciando desinstalación de ${serviceId.toUpperCase()} v${version}...`);
        console.info(`Eliminando directorio: ${targetDir}`);

        if (await fileExists(targetDir)) {
          console.log(`[SHIM] Ejecutando: cmd /C rmdir /s /q "${targetDir}"`);
          const res = await execCommand(`cmd /C rmdir /s /q "${targetDir}"`);
          
          if (res.exitCode === 0) {
            console.info(`${serviceId.toUpperCase()} v${version} se ha desinstalado correctamente.`);
            return { success: true, message: `${serviceId} v${version} eliminado` };
          } else {
            // Intentar con PowerShell si cmd falla (a veces por rutas largas)
            console.warn('[SHIM] cmd rmdir falló, intentando con PowerShell...');
            const psRes = await execCommand(`powershell -Command "Remove-Item -Path '${targetDir}' -Recurse -Force -ErrorAction SilentlyContinue"`);
            if (psRes.exitCode === 0) {
              console.info(`${serviceId.toUpperCase()} v${version} se ha desinstalado correctamente.`);
              return { success: true, message: `${serviceId} v${version} eliminado` };
            }
            throw new Error(`No se pudo eliminar el directorio: ${res.stderr || psRes.stderr}`);
          }
        } else {
          console.warn(`[SHIM] El directorio no existe: ${targetDir}`);
          return { success: true, message: 'El directorio ya no existía' };
        }
      } catch (e) {
        console.error('[SHIM] Error en uninstallService:', e.message);
        return { success: false, error: e.message };
      }
    },
    updateServiceVersion: async (type, version) => {
      try {
        console.log(`[SHIM] updateServiceVersion: ${type} -> ${version}`);
        const cfgRaw = localStorage.getItem('WebServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        if (!cfg.versions) cfg.versions = {};
        cfg.versions[type] = version;
        localStorage.setItem('WebServDev-config', JSON.stringify(cfg));
        
        // Si cambiamos PHP, actualizar configuración de Apache
        if (type.toLowerCase() === 'php') {
          console.log(`[SHIM] Versión PHP cambió a ${version}, actualizando configuración de Apache...`);
          try {
            let basePath = cfg.basePath || defaultConfig.basePath || appRoot;
            
            // Resolver ruta absoluta si es necesaria
            if (basePath === '.' || basePath === './' || !basePath.includes(':')) {
              try {
                const res = await execCommand('cd');
                if (res && res.stdout) {
                  basePath = res.stdout.trim();
                  console.log('[SHIM] basePath resuelto:', basePath);
                }
              } catch(e) {
                console.warn('[SHIM] No se pudo resolver ruta absoluta:', e.message);
              }
            }
            
            // Buscar PHP binario y módulo
            const phpBin = await findExecutable('php', version, 'php.exe', basePath);
            if (!phpBin) {
              console.warn(`[SHIM] No se encontró PHP ${version}, no se puede actualizar Apache`);
              return { success: true, warning: 'PHP no encontrado' };
            }
            
            const phpDir = phpBin.substring(0, phpBin.lastIndexOf('\\')).replace(/\\/g, '/');
            console.log(`[SHIM] PHP encontrado en: ${phpDir}`);
            
            // Buscar módulo PHP para Apache
            let phpModulePath = null;
            try {
              const phpDirContent = await readDirShim(phpDir);
              const phpDll = phpDirContent.find(f => f.match(/^php\d+apache2_4\.dll$/i));
              if (phpDll) {
                phpModulePath = `${phpDir}/${phpDll}`;
                console.log(`[SHIM] Módulo PHP encontrado: ${phpModulePath}`);
              } else {
                console.warn(`[SHIM] No se encontró módulo PHP (php*apache2_4.dll) en ${phpDir}`);
              }
            } catch(e) {
              console.warn(`[SHIM] Error buscando módulo PHP: ${e.message}`);
            }
            
            if (!phpModulePath) {
              return { success: true, warning: 'Módulo PHP para Apache no encontrado' };
            }
            
            // Buscar httpd.conf de Apache
            const apacheVersions = await getAvailableVersions(basePath, 'apache');
            if (apacheVersions.length === 0) {
              console.warn(`[SHIM] No se encontró Apache instalado`);
              return { success: true, warning: 'Apache no instalado' };
            }
            
            const apacheVersion = cfg.versions?.apache || apacheVersions[0];
            const apacheBin = await findExecutable('apache', apacheVersion, 'httpd.exe', basePath);
            if (!apacheBin) {
              console.warn(`[SHIM] No se encontró Apache ${apacheVersion}`);
              return { success: true, warning: 'Apache no encontrado' };
            }
            
            const apacheBase = apacheBin.substring(0, apacheBin.lastIndexOf('\\')).replace(/\\/g, '/').replace('/bin', '');
            const httpdConfPath = `${apacheBase}/conf/httpd.conf`;
            console.log(`[SHIM] Actualizando httpd.conf: ${httpdConfPath}`);
            
            // Leer httpd.conf
            const httpdConf = await readFileShim(httpdConfPath);
            if (!httpdConf) {
              console.warn(`[SHIM] No se pudo leer httpd.conf`);
              return { success: true, warning: 'No se pudo leer httpd.conf' };
            }
            
            // Actualizar o agregar LoadModule y PHPIniDir
            let updatedConf = httpdConf;
            const loadModuleRegex = /LoadModule\s+php_module\s+"[^"]*"/gi;
            const phpIniDirRegex = /PHPIniDir\s+"[^"]*"/gi;
            
            const newLoadModule = `LoadModule php_module "${phpModulePath}"`;
            const newPHPIniDir = `PHPIniDir "${phpDir}"`;
            
            if (loadModuleRegex.test(httpdConf)) {
              // Reemplazar LoadModule existente
              updatedConf = updatedConf.replace(loadModuleRegex, newLoadModule);
              console.log(`[SHIM] LoadModule actualizado en httpd.conf`);
            } else {
              // Agregar LoadModule antes del primer LoadModule o al final de los LoadModule
              const firstLoadModule = updatedConf.search(/LoadModule\s+\w+\s+"[^"]*"/i);
              if (firstLoadModule !== -1) {
                updatedConf = updatedConf.substring(0, firstLoadModule) + 
                            `${newLoadModule}\n` + 
                            updatedConf.substring(firstLoadModule);
                console.log(`[SHIM] LoadModule agregado en httpd.conf`);
              } else {
                updatedConf += `\n${newLoadModule}\n`;
                console.log(`[SHIM] LoadModule agregado al final de httpd.conf`);
              }
            }
            
            if (phpIniDirRegex.test(updatedConf)) {
              // Reemplazar PHPIniDir existente
              updatedConf = updatedConf.replace(phpIniDirRegex, newPHPIniDir);
              console.log(`[SHIM] PHPIniDir actualizado en httpd.conf`);
            } else {
              // Agregar PHPIniDir después de LoadModule php_module
              const phpModuleIndex = updatedConf.indexOf(newLoadModule);
              if (phpModuleIndex !== -1) {
                const insertIndex = updatedConf.indexOf('\n', phpModuleIndex) + 1;
                updatedConf = updatedConf.substring(0, insertIndex) + 
                            `${newPHPIniDir}\n` + 
                            updatedConf.substring(insertIndex);
                console.log(`[SHIM] PHPIniDir agregado en httpd.conf`);
              } else {
                updatedConf += `\n${newPHPIniDir}\n`;
                console.log(`[SHIM] PHPIniDir agregado al final de httpd.conf`);
              }
            }
            
            // Escribir httpd.conf actualizado
            await writeFileShim(httpdConfPath, updatedConf);
            console.log(`[SHIM] httpd.conf actualizado correctamente`);
            console.log(`[SHIM] ✓ Apache ahora usará PHP ${version}`);
            
            return { success: true, message: `Apache configurado para usar PHP ${version}` };
          } catch(e) {
            console.error(`[SHIM] Error actualizando configuración de Apache: ${e.message}`);
            return { success: true, warning: `Error actualizando Apache: ${e.message}` };
          }
        }
        
        return { success: true };
      } catch(e) { 
        console.error('[SHIM] Error en updateServiceVersion:', e.message);
        return { success: false, message: e.message }; 
      }
    },
    openConfigFile: async ({ path: filePath, type = 'file' }) => {
      try {
        if (type === 'folder') {
          await execCommand(`explorer "${filePath}"`);
        } else {
          await execCommand(`notepad "${filePath}"`);
        }
      } catch(e) { console.error(e); }
    },
    openTerminal: async () => {
      try {
        const root = globalThis.NL_PATH || '.';
        await execCommand(`cmd.exe /K "cd /d ${root}"`);
      } catch(e) { console.error(e); }
    },
    openHosts: async () => {
      await execCommand('powershell -Command "Start-Process notepad C:\\Windows\\System32\\drivers\\etc\\hosts -Verb RunAs"');
    },
    openEnvVars: async () => {
      await execCommand('control sysdm.cpl,,3');
    }
  };

  // Registrar la API en el target apropiado (window o globalThis)
  apiTarget.webservAPI = apiImplementation;
  console.log('[SHIM] webservAPI registrado correctamente en', typeof window !== 'undefined' ? 'window' : 'globalThis');
})();
