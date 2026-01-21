// Neutralino compatibility shim for globalThis.electronAPI
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
    // Si hay token de Neutralino, definitivamente NO es el dev server de Vite
    if (globalThis.NL_TOKEN || globalThis.NL_PORT || globalThis.Neutralino) return false;
    // Estamos en el puerto de Vite y sin token? OK, es DEV
    return globalThis.location.port === '5173';
  };

  let IS_DEV = checkIsDev();

  const flushBuffer = async () => {
    if (logBuffer.length === 0) return;
    
    // Re-chequeamos IS_DEV antes de vaciar
    IS_DEV = checkIsDev();

    const content = logBuffer.join('');
    logBuffer = [];

    if (IS_DEV) {
      try {
        const resp = await fetch('/api/write-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content })
        });
        if (!resp.ok) throw new Error('Proxy no disponible');
      } catch (e) {
        // En caso de error en el fetch, si detectamos que quizá no somos DEV,
        // guardamos el contenido para el siguiente intento pero no lo perdemos
        logBuffer.unshift(content);
        originalConsole.warn('[SHIM] Error vaciando buffer de logs (DEV):', e.message);
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
      // Intentar envío directo si no hay buffer acumulado
      if (logBuffer.length === 0) {
        fetch('/api/write-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: logLine })
        }).catch(() => logBuffer.push(logLine));
      } else {
        logBuffer.push(logLine);
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

  console.log('[SHIM] Cargando Neutralino Shim v1.3.2 (Production Fix)');

  // En modo DEV, vaciamos el buffer inicial casi de inmediato
  if (checkIsDev()) {
    setTimeout(flushBuffer, 500);
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

  // SI YA EXISTE electronAPI (estamos en Electron), no sobreescribir
  // Pero podemos registrar el shim para que los logs funcionen en Electron también si se desea
  if (typeof globalThis.electronAPI !== 'undefined' && !globalThis.NL_TOKEN) {
    console.log('[SHIM] Detectado Electron, saltando implementación de globalThis.electronAPI');
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

  async function findExecutable(type, version, exeName, basePath){
    if(!exeName) return null;
    const typeOrAlias = type === 'mysql' ? 'mariadb' : (type === 'mariadb' ? 'mysql' : type);
    
    // Rutas fijas prioritarias (Estructura estándar de binarios)
    const candidates = [];
    if(version) {
      candidates.push(`${basePath}\\bin\\${type}\\${version}\\${exeName}`);
      candidates.push(`${basePath}\\bin\\${type}\\${version}\\bin\\${exeName}`);
      candidates.push(`${basePath}\\bin\\${typeOrAlias}\\${version}\\${exeName}`);
      // Casos específicos: "8.2.30 (NTS)"
      candidates.push(`${basePath}\\bin\\${type}\\${version.replace(/\s+/g, '_')}\\${exeName}`);
      candidates.push(`${basePath}\\neutralino\\bin\\${type}\\${version}\\${exeName}`);
    }
    candidates.push(`${basePath}\\bin\\${type}\\${exeName}`);
    candidates.push(`${basePath}\\bin\\${typeOrAlias}\\${exeName}`);
    
    for(const cand of candidates) {
      const p = cand.replace(/\\\\+/g, '\\');
      if (await fileExists(p)) return p;
    }

    // Búsqueda superficial (solo 1 nivel) si no se encontró en rutas fijas
    const rootsToScan = [
      `${basePath}\\bin\\${type}`,
      `${basePath}\\bin\\${typeOrAlias}`,
      `${basePath}\\neutralino\\bin\\${type}`
    ].map(r => r.replace(/\\\\+/g, '\\'));

    for(const root of rootsToScan) {
      if (await fileExists(root)) {
        const entries = await readDir(root);
        if(!entries) continue;
        for(const entry of entries) {
           const name = (typeof entry === 'object') ? (entry.entry || entry.name) : entry;
           if(!name || name.startsWith('.')) continue;
           
           // Probar: root/name/exeName o root/name/bin/exeName
           const p1 = `${root}\\${name}\\${exeName}`.replace(/\\\\+/g, '\\');
           if(await fileExists(p1)) return p1;
           const p2 = `${root}\\${name}\\bin\\${exeName}`.replace(/\\\\+/g, '\\');
           if(await fileExists(p2)) return p2;
        }
      }
    }
    return null;
  }

  async function getAvailableVersions(basePath, serviceType){
    console.log(`[SHIM] getAvailableVersions para ${serviceType} en ${basePath}`);
    const versions = [];
    
    // Lista de rutas base donde buscar
    const baseRoots = [
      `${basePath}\\bin\\${serviceType}`,
      `${basePath}\\neutralino\\bin\\${serviceType}`,
      `${basePath}\\usr\\bin\\${serviceType}`,
      `.\\bin\\${serviceType}`,
      `.\\neutralino\\bin\\${serviceType}`,
      `..\\bin\\${serviceType}`,
      `${neutralinoRoot}\\bin\\${serviceType}`
    ].map(p => p.replace(/\\\\/g, '\\').replace(/\\$/, ''));

    for (const root of baseRoots) {
      if (!(await fileExists(root))) {
        continue;
      }
      
      const entries = await readDir(root);
      console.log(`[SHIM] readDir para ${root}:`, entries);
      if (entries) {
        for (const entry of entries) {
          const name = (entry && typeof entry === 'object') ? (entry.entry || entry.name) : entry;
          if (!name || name === '.' || name === '..') continue;
          
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
      
      // Timeout de 5000ms por servicio (aumentado para evitar falsos positivos durante carga)
      // Si estamos instalando algo, aumentamos a 15s para no interferir
      const timeoutMs = globalThis.__is_installing ? 15000 : 5000;
      
      return Promise.race([
        statusPromise,
        new Promise(resolve => {
          setTimeout(() => {
            console.log('[SHIM] Timeout verificando', service.name, '- retornando unknown');
            resolve({ status: 'unknown', port, processRunning: false, portInUse: false, details: 'Estado desconocido (Timeout)' });
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
        return result;
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

  globalThis.electronAPI = {
    getServices: async (hiddenServices)=>{
      const startTime = Date.now();
      console.log('[SHIM] >>> getServices INICIO');
      try{
        const cfgRaw = localStorage.getItem('WebServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        
        let basePath = cfg.basePath || defaultConfig.basePath || appRoot;
        console.log('[SHIM] Path Base:', basePath);
        console.log('[SHIM] appRoot:', appRoot);

        // Cargar configuración de servicios
        console.log('[SHIM] Cargando services.json...');
        let servicesList = await loadServicesConfig();
        console.log('[SHIM] services.json cargado. Cantidad:', servicesList?.length);
        
        if (!Array.isArray(servicesList) || servicesList.length === 0) {
          console.warn('[SHIM] Fallback interno activado');
          servicesList = [
            { "id": "php", "name": "PHP", "type": "php", "version": "8.2", "port": null, "processName": "php.exe" },
            { "id": "apache", "name": "Apache", "type": "apache", "version": "2.4", "port": 80, "processName": "httpd.exe" },
            { "id": "mysql", "name": "MySQL", "type": "mysql", "version": "8.0", "port": 3306, "processName": "mysqld.exe" },
            { "id": "nginx", "name": "Nginx", "type": "nginx", "version": "1.22", "port": 80, "processName": "nginx.exe" },
            { "id": "mailpit", "name": "MailPit", "type": "mailpit", "version": "1.8", "port": 8025, "processName": "mailpit.exe" }
          ];
        }

        // Ejecutar netstat una vez (con caché)
        console.log('[SHIM] Refrescando Netstat...');
        await getNetstatData();
        
        // Filtrar servicios visibles
        const hiddenArray = Array.isArray(hiddenServices) ? hiddenServices : [];
        const visibleServices = servicesList.filter(s => !hiddenArray.includes(s.name));
        
        console.log(`[SHIM] Mapeando ${visibleServices.length} servicios visibles...`);

        let completed = 0;
        const results = await Promise.all(visibleServices.map(async (service) => {
          try {
            const svcStart = Date.now();
            console.log(`[SHIM] [${service.name}] Iniciando chequeo...`);
            
            const status = await checkServiceStatus(service, basePath);
            const enriched = { ...service, ...status };

            const type = (service.type || service.id || '').toLowerCase();
            const exeMap = {
              'apache': 'httpd.exe', 'nginx': 'nginx.exe', 'mysql': 'mysqld.exe',
              'mariadb': 'mysqld.exe', 'postgresql': 'postgres.exe', 'redis': 'redis-server.exe',
              'memcached': 'memcached.exe', 'mailpit': 'mailpit.exe', 'mongodb': 'mongod.exe', 'php': 'php.exe'
            };

            const mainExe = exeMap[type];
            if (mainExe) {
              console.log(`[SHIM] [${service.name}] Buscando versiones para ${type}...`);
              enriched.availableVersions = await getAvailableVersions(basePath, type);
              
              let version = service.version;
              if (version && enriched.availableVersions.length > 0 && !enriched.availableVersions.includes(version)) {
                const match = enriched.availableVersions.find(v => v.startsWith(version));
                version = match || enriched.availableVersions[0];
              } else if (!version) {
                version = enriched.availableVersions.length > 0 ? enriched.availableVersions[0] : null;
              }
              
              enriched.version = version;
              if (version) {
                console.log(`[SHIM] [${service.name}] Buscando ejecutable ${mainExe} v${version}...`);
                const binPath = await findExecutable(type, version, mainExe, basePath);
                enriched.isInstalled = binPath !== null;
              } else {
                enriched.isInstalled = false;
              }
            }
            completed++;
            console.log(`[SHIM] [${service.name}] Finalizado en ${Date.now() - svcStart}ms (${completed}/${visibleServices.length})`);
            return enriched;
          } catch (e) {
            console.error(`[SHIM] [${service.name}] ERROR:`, e);
            return { ...service, status: 'error', details: e.message };
          }
        }));

        console.log('[SHIM] Enriqueciendo Apache con PHP...');
        let phpVersions = await getAvailableVersions(basePath, 'php');
        let phpBin = null;
        for (const v of phpVersions) {
          const bin = await findExecutable('php', v, 'php.exe', basePath);
          if (bin) { phpBin = bin; break; }
        }

        for(const svc of results){
          if(svc && (svc.type === 'apache' || svc.name === 'Apache')){
            svc.requiresPhp = true;
            svc.dependenciesReady = svc.isInstalled && !!phpBin;
            svc.availablePhpVersions = phpVersions;
          }
        }
        
        // Agregar ocultos
        hiddenArray.forEach(name => {
          const s = servicesList.find(x => x.name === name);
          if(s) results.push({ ...s, status: 'hidden' });
        });

        console.log(`[SHIM] <<< getServices FIN (Total: ${Date.now() - startTime}ms, Items: ${results.length})`);
        return results;
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
        const basePath = cfg.basePath || defaultConfig.basePath || neutralinoRoot;
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
        switch(type){
          case 'apache':{
            // Basar la ruta en la ubicación real del ejecutable (para soportar carpetas tipo Apache24, httpd-2.4.x, etc.)
            const exeDir = fullExe.replace(/\\[^\\]+$/, '');
            const apacheRoot = exeDir.toLowerCase().endsWith('\\bin') ? exeDir.replace(/\\bin$/, '') : exeDir;
            const conf = `${apacheRoot}\\conf\\httpd.conf`;
            // Usar PowerShell Start-Process para background, más robusto que cmd /C start
            // -WindowStyle Hidden: sin ventana, -PassThru: devuelve el objeto proceso
            startCmd = `powershell -Command "Start-Process -FilePath '${fullExe}' -ArgumentList '-f','${conf}','-d','${apacheRoot}' -WindowStyle Hidden -PassThru | Select-Object -ExpandProperty Id"`;
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
        if (globalThis.Neutralino && globalThis.Neutralino.filesystem) {
          const logPath = globalThis.NL_TOKEN ? (globalThis.NL_PATH || '.') + '/app-debug.log' : './app-debug.log';
          await globalThis.Neutralino.filesystem.writeFile(logPath, '');
          console.log('[SHIM] Logs limpiados correctamente');
          return true;
        }
      } catch (e) {
        console.error('[SHIM] Error al limpiar logs:', e);
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
      console.warn('[SHIM] openDevTools no es soportado nativamente en Neutralino desde JS para el usuario.');
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
        const basePath = (cfg.basePath || defaultConfig.basePath || neutralinoRoot).replace(/\//g, '\\');

        // Limpiar solo caracteres verdaderamente Prohibidos en Windows: < > : " / \ | ? *
        const cleanVersion = service.version.replace(/[<>:"\/\\|?*]/g, '_').trim();
        const destDir = `${basePath}\\neutralino\\bin\\${service.type}\\${cleanVersion}`.replace(/\\\\/g, '\\');
        const tmpDir = `${basePath}\\tmp`.replace(/\\\\/g, '\\');
        const tmpZipPath = `${tmpDir}\\${service.type}-${cleanVersion}.zip`.replace(/\\\\/g, '\\').replace(/\s+/g, '_');

        console.log(`[SHIM] Instalando: ${service.name} v${service.version}`);
        console.log(`[SHIM] Destino Final: ${destDir}`);
        
        console.info(`Iniciando instalación de ${service.name} ${service.version}...`);

        await execCommand(`cmd /C if not exist "${tmpDir}" mkdir "${tmpDir}"`);
        await execCommand(`cmd /C if not exist "${destDir}" mkdir "${destDir}"`);

        // Prioridad PowerShell para Windows
        let downloadSuccess = false;
        let lastError = '';

        console.log('[SHIM] Intentando descarga con PowerShell...');
        try {
          // Cambiamos 'powershell' por 'powershell.exe' y aseguramos que el comando use comillas dobles externas para los parámetros
          const psDownloadCmd = `powershell.exe -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '${zipUrl}' -OutFile '${tmpZipPath}' -TimeoutSec 300"`;
          console.log('[SHIM] CMD:', psDownloadCmd);
          const psRes = await execCommand(psDownloadCmd);
          if (psRes.exitCode === 0) {
            downloadSuccess = true;
          } else {
            console.error('[SHIM] PowerShell error (exitCode ' + psRes.exitCode + '):', psRes.stderr);
            lastError = psRes.stderr;
          }
        } catch (e) {
          console.error('[SHIM] PowerShell catch error:', e.message);
          lastError = e.message;
        }

        if (!downloadSuccess) {
          console.log('[SHIM] Fallback a curl...');
          try {
            const curlRes = await execCommand(`curl -L "${zipUrl}" -o "${tmpZipPath}" --fail --silent --show-error --connect-timeout 30`);
            if (curlRes.exitCode === 0) {
              downloadSuccess = true;
            } else {
              console.error('[SHIM] Curl error:', curlRes.stderr);
              lastError = curlRes.stderr || `Code ${curlRes.exitCode}`;
            }
          } catch (e) {
            console.error('[SHIM] Curl catch error:', e.message);
            lastError = e.message;
          }
        }

        if (!downloadSuccess) throw new Error(`Error de descarga: ${lastError}`);

        console.info('Extrayendo archivos...');

        console.log('[SHIM] Extrayendo...');
        // Usamos shell de cmd para llamar a powershell y asegurar redirección de errores
        const extractRes = await execCommand(`powershell.exe -NoProfile -Command "$ProgressPreference = 'SilentlyContinue'; Expand-Archive -Path '${tmpZipPath}' -DestinationPath '${destDir}' -Force"`);

        if (extractRes.exitCode !== 0) {
          console.error('[SHIM] Error Expand-Archive:', extractRes.stderr);
          const tarRes = await execCommand(`tar -xf "${tmpZipPath}" -C "${destDir}"`);
          if (tarRes.exitCode !== 0) {
            console.error('[SHIM] Error TAR:', tarRes.stderr);
            throw new Error(`Error extracción: ${extractRes.stderr || tarRes.stderr}`);
          }
        }

        try { await execCommand(`cmd /C del "${tmpZipPath}"`); } catch(e) {}

        console.info(`${service.name} v${service.version} instalado correctamente.`);

        console.log('[SHIM] Instalación finalizada');
        return { success: true, message: `${service.name} instalado` };
      } finally {
        globalThis.__is_installing = false;
      }
    },
    updateServiceVersion: async (type, version) => {
      try {
        const cfgRaw = localStorage.getItem('WebServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        if (!cfg.versions) cfg.versions = {};
        cfg.versions[type] = version;
        localStorage.setItem('WebServDev-config', JSON.stringify(cfg));
        return { success: true };
      } catch(e) { return { success: false, message: e.message }; }
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
})();
