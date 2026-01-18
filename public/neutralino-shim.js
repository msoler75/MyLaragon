// Neutralino compatibility shim for window.electronAPI
(function(){
  if(typeof Neutralino !== 'undefined' && window.NL_PORT) {
    Neutralino.init();
  }
  
  // Detectar raíz real en Neutralino (NL_PATH es el directorio del binary)
  const neutralinoRoot = window.NL_PATH || '.';
  const logPath = neutralinoRoot + '\\webservdev.log';
  const defaultConfig = { 
    appPath: neutralinoRoot, 
    projectsPath: neutralinoRoot + '\\www', 
    editor: 'notepad', 
    autoStart: false, 
    language: 'es', 
    theme: 'system' 
  };

  const activeProcessTasks = {}; // { taskId: { pid, cancelled: boolean } }

  async function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const cleanMessage = String(message).trim();
    const logLine = `[${timestamp}] [${level}] ${cleanMessage}\n`;
    
    console.log(`[SHIM-LOG] ${logLine.trim()}`);
    
    if (window.Neutralino && Neutralino.filesystem) {
      try {
        await Neutralino.filesystem.appendFile(logPath, logLine);
      } catch (e) {
        // Si falla por permisos, al menos lo tenemos en consola
      }
    }
    
    if (window.__neutralino_log_cb) {
      window.__neutralino_log_cb({ timestamp, message: cleanMessage, level });
    }
  }

  log('Iniciando Shim de compatibilidad Neutralino...');

  async function fileExists(path){
    try{
      const isDev = !window.NL_TOKEN && (window.location.port === '5173' || window.location.hostname === 'localhost');
      if(isDev){
        const response = await fetch('/api/file-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
        });
        const result = await response.json();
        return result.exists === true;
      }
      
      if(window.Neutralino && Neutralino.filesystem){
        // En algunas versiones de Neutralino v5, 'exists' no está disponible o se comporta distinto
        // Usar getStats como alternativa más robusta para comprobar existencia
        try {
          if (typeof Neutralino.filesystem.exists === 'function') {
            const res = await Neutralino.filesystem.exists(path);
            if(typeof res === 'boolean') return res;
            if(res && typeof res.exists === 'boolean') return res.exists;
            return !!res;
          }
          await Neutralino.filesystem.getStats(path);
          return true;
        } catch (e) {
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
      console.log('[SHIM] readDir leyendo:', path);
      const isDev = !window.NL_TOKEN && (window.location.port === '5173' || window.location.hostname === 'localhost');
      if(isDev){
        const response = await fetch('/api/read-dir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
        });
        const result = await response.json();
        return result.entries || null;
      }
      
      if(window.Neutralino && Neutralino.filesystem){
        // CORRECCIÓN CRÍTICA: En Neutralino v5/v6, readDirectory recibe el PATH como STRING, no como objeto
        const res = await Neutralino.filesystem.readDirectory(path);
        console.log('[SHIM] readDir resultado nativo:', res);
        // Neutralino devuelve un array de objetos { entry: string, type: string }
        if(Array.isArray(res)) return res;
        if(res && Array.isArray(res.entries)) return res.entries;
        return res;
      }
    }catch(e){
      console.error('[SHIM] Error nativo readDir:', e.message);
    }
    return null;
  }

  async function findExecutable(type, version, exeName, appPath){
    console.log('[SHIM] findExecutable busqueda:', { type, version, exeName, appPath });
    if(!exeName) return null;
    
    let cleanPath = appPath.replace(/[\\\/]+$/, '').replace(/\//g, '\\');
    const base = `${cleanPath}\\bin\\${type}`;
    const candidates = new Set(); // Usar Set para evitar duplicados

    // 1. Si hay una versión específica (completa), probarla primero
    if(version && version.length > 3){
      candidates.add(`${base}\\${version}\\${exeName}`);
      candidates.add(`${base}\\${version}\\bin\\${exeName}`);
    }
    
    // 2. Escaneo de carpetas - el método más fiable
    try {
      const listing = await readDir(base);
      if(listing && Array.isArray(listing)){
        for(const entry of listing){
          const name = (entry && typeof entry === 'object') ? (entry.entry || entry.name) : entry;
          if(!name || name === '.' || name === '..') continue;
          
          // Candidatos usuales
          candidates.add(`${base}\\${name}\\${exeName}`);
          candidates.add(`${base}\\${name}\\bin\\${exeName}`);
          
          // Si la versión solicitada (p.ej. "2.4") está contenida en el nombre de la carpeta,
          // estas rutas ya están añadidas pero el Set se encarga de no duplicar.
        }
      }
    } catch(e) {
      console.warn('[SHIM] Error escaneando base de ejecutables:', base, e.message);
    }
    
    // 3. Casos especiales para bases de datos
    if(type === 'mysql' || type === 'mariadb'){
      const alternate = type === 'mysql' ? 'mariadb' : 'mysql';
      const altBase = `${cleanPath}\\bin\\${alternate}`;
      candidates.add(`${altBase}\\${exeName}`);
      try {
        const altListing = await readDir(altBase);
        if(altListing){
          for(const entry of altListing){
            const name = (entry && typeof entry === 'object') ? (entry.entry || entry.name) : entry;
            if(!name || name === '.' || name === '..') continue;
            candidates.add(`${altBase}\\${name}\\${exeName}`);
            candidates.add(`${altBase}\\${name}\\bin\\${exeName}`);
          }
        }
      } catch(e){}
    }

    // 4. Verificación final de candidatos
    for(const path of candidates){
      if(await fileExists(path)) {
        console.log('[SHIM] Ejecutable encontrado en:', path);
        return path;
      }
    }
    
    console.error('[SHIM] No se encontró ejecutable después de probar', candidates.size, 'candidatos');
    return null;
  }

  async function getAvailableVersions(type, appPath) {
    const base = `${appPath}\\bin\\${type}`;
    const versions = [];
    try {
      const listing = await readDir(base);
      if (listing) {
        for (const entry of listing) {
          const name = (entry && typeof entry === 'object') ? (entry.entry || entry.name) : entry;
          if (!name || name === '.' || name === '..') continue;
          versions.push(name);
        }
      }
      
      // Si es mysql/mariadb, probar también la otra carpeta
      if (type === 'mysql' || type === 'mariadb') {
        const altType = type === 'mysql' ? 'mariadb' : 'mysql';
        const altBase = `${appPath}\\bin\\${altType}`;
        const altListing = await readDir(altBase);
        if (altListing) {
          for (const entry of altListing) {
            const name = (entry && typeof entry === 'object') ? (entry.entry || entry.name) : entry;
            if (!name || name === '.' || name === '..') continue;
            if (!versions.includes(name)) versions.push(name);
          }
        }
      }
    } catch (e) {
      console.log('[SHIM] Error detectando versiones para', type, ':', e.message);
    }
    return versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
  }

  async function parseAppConfig(appPath) {
    try {
      const pathsToTry = [
        `${appPath}\\usr\\app.ini`.replace(/\//g, '\\'),
        `${appPath}\\app.ini`.replace(/\//g, '\\')
      ];
      
      let content = '';
      const isDev = !window.NL_TOKEN && (window.location.port === '5173' || window.location.hostname === 'localhost');
      
      for (const iniPath of pathsToTry) {
        log(`Intentando cargar app.ini desde: ${iniPath}`);
        try {
          if (isDev) {
            const result = await execCommand(`cmd /c "type \\"${iniPath}\\""`);
            if (result.stdout) {
              content = result.stdout;
              break;
            }
          } else if (window.Neutralino && Neutralino.filesystem) {
            content = await Neutralino.filesystem.readFile(iniPath);
            if (content) break;
          }
        } catch (e) {
          // Intentar el siguiente path
        }
      }
      
      if (!content) {
        log('No se pudo localizar app.ini en ninguna ruta', 'WARNING');
        return {};
      }
      
      const ini = {};
      let currentSection = '';
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(';')) return;
        
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          currentSection = trimmed.substring(1, trimmed.length - 1).toLowerCase();
          ini[currentSection] = ini[currentSection] || {};
        } else if (trimmed.includes('=') && currentSection) {
          const parts = trimmed.split('=');
          const key = parts[0].trim().toLowerCase();
          const val = parts.slice(1).join('=').trim();
          ini[currentSection][key] = val;
        }
      });
      console.log('[SHIM] app.ini procesado:', ini);
      return ini;
    } catch (e) {
      console.log('[SHIM] Error crítico parseando app.ini:', e.message);
      return {};
    }
  }
  function safeOpen(url){
    try{
      if(window.Neutralino && Neutralino.os && Neutralino.os.open){
        Neutralino.os.open(url);
        return;
      }
    }catch(e){}
    window.open(url, '_blank');
  }

  // Cache para netstat
  let netstatCache = null;
  let netstatCacheTime = 0;

  async function getNetstatData(){
    const now = Date.now();
    
    // Si el caché es válido (< 3 segundos), devolverlo
    if(netstatCache && (now - netstatCacheTime) < 3000){
      console.log('[SHIM] Usando netstat caché');
      return netstatCache;
    }
    
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
          // Formato flexible: TCP/UDP address:port ... LISTENING pid
          // Ejemplo: "  TCP    0.0.0.0:80    0.0.0.0:0    LISTENING    6908"
          const match = line.match(/:(\d+)\s+.*?LISTENING\s+(\d+)/i);
          if(match){
            const port = match[1];
            const pid = match[2];
            portMap[port] = pid;
            console.log('[SHIM] Detectado puerto', port, '-> PID', pid);
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
    }
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
  let processCacheTime = 0;
  let activeProcessFetch = null;

  async function getProcessList(){
    const now = Date.now();
    if(processCache && (now - processCacheTime) < 3000) return processCache;
    if(activeProcessFetch) return activeProcessFetch;
    
    activeProcessFetch = (async () => {
      try {
        console.log('[SHIM] Actualizando lista de procesos...');
        const result = await execCommand('tasklist /NH /FO CSV');
        if(result && result.stdout){
          processCache = result.stdout.toLowerCase();
          processCacheTime = Date.now();
        }
      } catch(e){
        console.log('[SHIM] Error obteniendo lista de procesos:', e.message);
      }
      activeProcessFetch = null;
      return processCache || "";
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

  async function checkServiceStatus(service, appPath){
    console.log('[SHIM] checkServiceStatus para:', service.name);
    try{
      const type = service.type.toLowerCase();
      const portMap = {
        'apache': 80,
        'nginx': 80,
        'mysql': 3306,
        'mariadb': 3306,
        'postgresql': 5432,
        'postgres': 5432,
        'redis': 6379,
        'memcached': 11211,
        'mailpit': 8025,
        'mongodb': 27017
      };
      
      const exeMap = {
        'apache': 'httpd.exe',
        'nginx': 'nginx.exe',
        'mysql': 'mysqld.exe',
        'mariadb': 'mysqld.exe',
        'postgresql': 'postgres.exe',
        'postgres': 'postgres.exe',
        'redis': 'redis-server.exe',
        'memcached': 'memcached.exe',
        'mailpit': 'mailpit.exe',
        'mongodb': 'mongod.exe'
      };
      
      const port = portMap[type];
      const processName = exeMap[type];
      
      // Intentar verificar estado real mediante API
      const statusPromise = (async () => {
        try {
          // Verificar si el proceso está corriendo usando la lista cacheada
          let processRunning = false;
          try {
            const processList = await getProcessList();
            processRunning = processList.includes(processName.toLowerCase());
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
      
      // Timeout de 2500ms por servicio (netstat y tasklist ya están cacheados)
      return Promise.race([
        statusPromise,
        new Promise(resolve => {
          setTimeout(() => {
            console.log('[SHIM] Timeout verificando', service.name, '- retornando unknown');
            resolve({ status: 'unknown', port, processRunning: false, portInUse: false, details: 'Estado desconocido' });
          }, 2500);
        })
      ]);
    }catch(e){
      console.error('[SHIM] Error en checkServiceStatus:', e);
      return { status: 'unknown', port: null, processRunning: false, portInUse: false, details: 'Error al verificar' };
    }
  }

  async function execCommand(cmd){
    if (!cmd) {
      console.warn('[SHIM] execCommand llamado sin comando');
      return { stdout: '', stderr: 'No command' };
    }
    try{
      // En desarrollo (puerto 5173), usar siempre /api/exec
      const isDev = !window.NL_TOKEN && (window.location.port === '5173' || window.location.hostname === 'localhost');
      
      if (isDev) {
        console.log('[SHIM] Usando /api/exec (dev) para:', cmd);
        const response = await fetch('/api/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd })
        });
        const result = await response.json();
        console.log('[SHIM] /api/exec resultado:', result);
        return result;
      }
      
      // En producción con Neutralino runtime
      if(window.Neutralino && Neutralino.os && Neutralino.os.execCommand){
        console.log('[SHIM] Usando Neutralino.os.execCommand para:', cmd);
        // CORRECCIÓN: En Neutralino v5/v6 execCommand recibe el comando como STRING
        const result = await Neutralino.os.execCommand(cmd);
        // Normalizar salida (Neutralino usa stdOut/stdErr, nuestro código usa stdout/stderr)
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

  async function getEnrichedServices(appPath) {
    console.log('[SHIM] getEnrichedServices para:', appPath);
    // 1. Cargar app.ini
    const AppIni = await parseAppConfig(appPath);
    
    // 2. Cargar configuración de servicios base
    let servicesList = [];
    try {
      const isProd = !!(window.NL_TOKEN && window.Neutralino);
      let data = null;
      if (isProd && Neutralino.filesystem) {
        // En producción (dentro de resources.neu)
        const pathsToTry = ['./www/services.json', './services.json', 'www/services.json'];
        for (const p of pathsToTry) {
          try {
            const content = await Neutralino.filesystem.readFile(p);
            if (content) { 
              data = JSON.parse(content); 
              console.log('[SHIM] services.json cargado desde:', p);
              break; 
            }
          } catch(e) {}
        }
      }
      if (!data) {
        // Fallback a fetch (dev o si FS falla)
        const urlsToTry = ['services.json', '/services.json', '/www/services.json'];
        for (const url of urlsToTry) {
          try {
            let res = await fetch(url, { cache: 'no-store' });
            if (res.ok) { 
              data = await res.json(); 
              log(`services.json cargado vía fetch desde: ${url}`);
              break; 
            }
          } catch(e) {}
        }
      }
      
      // Soportar ambos formatos: array directo o objeto con propiedad services
      if (data) {
        if (Array.isArray(data)) {
          servicesList = data;
        } else if (data.services && Array.isArray(data.services)) {
          servicesList = data.services;
        }
      }
    } catch(e) {
      log(`Error cargando services.json base: ${e.message}`, 'ERROR');
    }

    // Fallback absoluto si nada funcionó
    if (servicesList.length === 0) {
      console.log('[SHIM] Usando servicios hardcoded por defecto');
      servicesList = [
        { "name": "Apache", "type": "apache" },
        { "name": "Nginx", "type": "nginx" },
        { "name": "MySQL", "type": "mysql" },
        { "name": "PHP", "type": "php" },
        { "name": "Redis", "type": "redis" }
      ];
    }

    // 3. Enriquecer con versiones del disco y de app.ini
    const cfgRaw = localStorage.getItem('webServDev-config');
    const cfg = cfgRaw ? JSON.parse(cfgRaw) : {};

    for (const s of servicesList) {
      if (!s) continue;
      // Soportar 'type' o 'id' indistintamente
      const type = (s.type || s.id || '').toLowerCase();
      if (!type) continue;
      
      s.type = type; // Asegurar que tenga type para el resto de la app
      s.availableVersions = await getAvailableVersions(type, appPath);
      
      const overrideVersion = cfg[type]?.version; // Preferencia manual del usuario
      const iniVersion = AppIni[type]?.version; // Preferencia de App
      
      if (overrideVersion && s.availableVersions.includes(overrideVersion)) {
        s.version = overrideVersion;
      } else if (iniVersion && s.availableVersions.includes(iniVersion)) {
        s.version = iniVersion;
      } else if (s.availableVersions.length > 0) {
        // AUTO-DETECT: Si no hay match exacto pero tenemos carpetas, usar la más reciente
        s.version = s.availableVersions[0];
      }
      
      console.log(`[SHIM] Servicio: ${s.name} | Versión determinada: ${s.version || 'desconocida'} | Disponibles: ${s.availableVersions.length}`);
    }
    
    // Excluir servicios que no se pueden iniciar (como PHP)
    servicesList = servicesList.filter(s => s.type !== 'php');
    
    return servicesList;
  }

  window.electronAPI = {
    getServices: async (hiddenServices)=>{
      log('getServices llamado');
      try{
        const cfgRaw = localStorage.getItem('webServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        const appPath = (cfg.appPath || defaultConfig.appPath).replace(/[\\\/]+$/, '').replace(/\//g, '\\');

        // Obtener servicios enriquecidos (con versiones reales del disco)
        const enrichedServices = await getEnrichedServices(appPath);
        
        // Ejecutar netstat una sola vez para todos los servicios
        await getNetstatData();
        
        const visibleServices = enrichedServices.filter(s => !hiddenServices || !hiddenServices.includes(s.name));
        const servicesWithStatus = [];
        
        for(const service of visibleServices){
          const status = await checkServiceStatus(service, appPath);
          servicesWithStatus.push({ ...service, ...status });
        }
        
        // Agregar servicios ocultos (sin verificar estado para ahorrar tiempo)
        if(hiddenServices && hiddenServices.length > 0){
          for(const service of enrichedServices){
            if(hiddenServices.includes(service.name)){
              servicesWithStatus.push({ ...service, status: 'hidden' });
            }
          }
        }
        log(`getServices devolviendo ${servicesWithStatus.length} servicios`);
        return servicesWithStatus;
      }catch(e){
        log(`Error en getServices: ${e.stack || e.message}`, 'ERROR');
        return [{ name: 'Apache', type: 'apache', status: 'unknown' }];
      }
    },
    startService: async (serviceName)=>{
      log(`Iniciando servicio: ${serviceName}`);
      try{
        const cfgRaw = localStorage.getItem('webServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        const appPath = (cfg.appPath || defaultConfig.appPath).replace(/[\\\/]+$/, '').replace(/\//g, '\\');
        
        const servicesList = await getEnrichedServices(appPath);
        const service = servicesList.find(s => s.name === serviceName);
        if(!service) throw new Error(`Servicio no encontrado: ${serviceName}`);
        
        const type = service.type.toLowerCase();
        const version = service.version || '';
        const exeMap = {
          'apache': 'httpd.exe', 'nginx': 'nginx.exe', 'mysql': 'mysqld.exe',
          'mariadb': 'mysqld.exe', 'redis': 'redis-server.exe', 
          'memcached': 'memcached.exe', 'mailpit': 'mailpit.exe', 'mongodb': 'mongod.exe'
        };
        const exe = exeMap[type];
        if(!exe) throw new Error(`Tipo no soportado: ${type}`);
        
        const fullExe = await findExecutable(type, version, exe, appPath);
        if(!fullExe) {
          throw new Error(`No se encontró el ejecutable (${exe}) para ${type} (v${version || 'detectada'}). Verifique appPath.`);
        }

        log(`Matando procesos previos de ${exe}...`);
        try { await execCommand(`taskkill /F /IM ${exe} 2>NUL`); } catch(e){}
        await new Promise(r => setTimeout(r, 600));

        let startCmd = '';
        switch(type){
          case 'apache':{
            const lowFull = fullExe.toLowerCase();
            let apacheRoot = '';
            if (lowFull.includes('\\bin\\httpd.exe')) {
              apacheRoot = fullExe.substring(0, lowFull.lastIndexOf('\\bin\\httpd.exe'));
            } else {
              apacheRoot = fullExe.substring(0, lowFull.lastIndexOf('\\httpd.exe'));
            }
            startCmd = `start /B "" "${fullExe}" -f "${apacheRoot}\\conf\\httpd.conf" -d "${apacheRoot}"`;
            break;
          }
          case 'nginx': startCmd = `start /B "" "${fullExe}"`; break;
          case 'mysql':
          case 'mariadb': startCmd = `start /B "" "${fullExe}" --standalone`; break;
          case 'redis': {
            const redisDir = fullExe.substring(0, fullExe.lastIndexOf('\\'));
            const conf = `${redisDir}\\redis.conf`;
            if (await fileExists(conf)) {
              startCmd = `start /B "" "${fullExe}" "${conf}"`;
            } else {
              startCmd = `start /B "" "${fullExe}"`;
            }
            break;
          }
          case 'mongodb': {
            const mongoData = `${appPath}\\data\\mongodb`;
            startCmd = `start /B "" "${fullExe}" --dbpath "${mongoData}"`;
            break;
          }
          default: startCmd = `start /B "" "${fullExe}"`;
        }
        
        log(`Ejecutando CMD: ${startCmd}`);
        await execCommand(`cmd /C ${startCmd}`);
        invalidateNetstatCache();
        log(`Servicio ${serviceName} iniciado.`);
        return { success: true };
      }catch(e){
        log(`Error al iniciar ${serviceName}: ${e.message}`, 'ERROR');
        return { success: false, message: e.message };
      }
    },
    stopService: async (serviceName)=>{
      log(`Deteniendo servicio: ${serviceName}`);
      try{
        const cfgRaw = localStorage.getItem('webServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        const appPath = (cfg.appPath || defaultConfig.appPath).replace(/[\\\/]+$/, '').replace(/\//g, '\\');
        
        const servicesList = await getEnrichedServices(appPath);
        const service = servicesList.find(s => s.name === serviceName);
        if(!service) throw new Error(`Servicio no encontrado: ${serviceName}`);
        
        const type = service.type.toLowerCase();
        const version = service.version || '';
        const exeMap = {
          'apache': 'httpd.exe', 'nginx': 'nginx.exe', 'mysql': 'mysqld.exe',
          'mariadb': 'mysqld.exe', 'redis': 'redis-server.exe', 
          'memcached': 'memcached.exe', 'mailpit': 'mailpit.exe', 'mongodb': 'mongod.exe'
        };
        const exe = exeMap[type];
        
        const fullExe = await findExecutable(type, version, exe, appPath);

        if(type === 'apache' && fullExe) {
          const lowFull = fullExe.toLowerCase();
          const apacheRoot = lowFull.includes('\\bin\\httpd.exe') 
            ? fullExe.substring(0, lowFull.lastIndexOf('\\bin\\httpd.exe'))
            : fullExe.substring(0, lowFull.lastIndexOf('\\httpd.exe'));
          try { 
            log(`Enviando comando stop a Apache...`);
            await execCommand(`cmd /C "${fullExe}" -k stop -f "${apacheRoot}\\conf\\httpd.conf"`); 
          } catch(e){}
        } else if (type === 'nginx' && fullExe) {
          try { 
            log(`Enviando comando stop a Nginx...`);
            await execCommand(`cmd /C "${fullExe}" -s stop`); 
          } catch(e){}
        }
        
        if (exe) {
          log(`Forzando cierre de ${exe}...`);
          await execCommand(`taskkill /F /IM ${exe} 2>NUL`);
        }
        invalidateNetstatCache();
        log(`${serviceName} detenido.`);
        return { success: true };
      }catch(e){
        log(`Error al detener ${serviceName}: ${e.message}`, 'ERROR');
        return { success: false, message: e.message };
      }
    },
    getConfig: async ()=>{
      try{
        const raw = localStorage.getItem('webServDev-config');
        const cfg = raw ? JSON.parse(raw) : defaultConfig;
        // Forzar siempre el appPath actual para evitar que "C:\App" se quede pegado
        cfg.appPath = neutralinoRoot;
        return cfg;
      }catch(e){ return defaultConfig; }
    },
    setConfig: async (cfg)=>{
      try{ localStorage.setItem('webServDev-config', JSON.stringify(cfg)); return true; }catch(e){return false}
    },
    getLogs: async ()=>{
      try{
        if (window.Neutralino && Neutralino.filesystem) {
          try {
            const text = await Neutralino.filesystem.readFile(logPath);
            if (!text || text.trim() === '') return [];
            const lines = text.split('\n').filter(l => l.trim());
            return lines.map(line => {
              const match = line.match(/\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.*)/);
              if (match) {
                return {
                  timestamp: new Date(match[1]).getTime(),
                  level: match[2],
                  message: match[3]
                };
              }
              return { timestamp: Date.now(), level: 'INFO', message: line };
            }).reverse(); // Mostrar últimos primero
          } catch(e) {}
        }
        
        // Fallback fetch
        const res = await fetch('/webservdev.log');
        if(res.ok) {
          const text = await res.text();
          if (!text || text.trim() === '') return [];
          const lines = text.split('\n').filter(l => l.trim());
          return lines.map(line => {
            const match = line.match(/\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.*)/);
            if (match) {
              return {
                timestamp: new Date(match[1]).getTime(),
                level: match[2],
                message: match[3]
              };
            }
            return { timestamp: Date.now(), level: 'INFO', message: line };
          }).reverse();
        }
      }catch(e){}
      return [];
    },
    openInBrowser: (url)=>{ safeOpen(url); },
    onLog: (cb)=>{
      window.__neutralino_log_cb = cb;
      return ()=>{ window.__neutralino_log_cb = null };
    },
    openAppFolder: async () => {
      try {
        const root = window.NL_PATH || '.';
        await execCommand(`explorer "${root}"`);
      } catch(e) { log(`Error abriendo carpeta: ${e.message}`, 'ERROR'); }
    },
    openDocumentRoot: async () => {
      try {
        const cfgRaw = localStorage.getItem('webServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        await execCommand(`explorer "${cfg.projectsPath || defaultConfig.projectsPath}"`);
      } catch(e) { log(`Error abriendo document root: ${e.message}`, 'ERROR'); }
    },
    openDevTools: async () => {
      log('openDevTools no es soportado nativamente en Neutralino desde JS.', 'WARNING');
    },
    getRemoteServices: async () => {
      try {
        const root = window.NL_PATH || '.';
        log(`Buscando servicios remotos...`);
        
        // 1. Intentar fetch con cache-buster para evitar URLs muertas
        try {
          const res = await fetch(`/services.json?t=${Date.now()}`, { cache: 'no-store' });
          if (res.ok) {
            log('Servicios cargados vía fetch');
            return await res.json();
          }
        } catch(e) {}

        // 2. Intentar lectura directa
        if (window.Neutralino && Neutralino.filesystem) {
          const paths = [root + '/services.json', root + '\\services.json', root + '/www/services.json'];
          for (const p of paths) {
            try {
              const content = await Neutralino.filesystem.readFile(p);
              if (content) {
                log(`Servicios cargados vía filesystem: ${p}`);
                return JSON.parse(content);
              }
            } catch(e) {}
          }
        }
        
        log('No se pudo localizar services.json en las rutas probadas', 'WARNING');
      } catch(e) { 
        log(`Error en getRemoteServices: ${e.message}`, 'ERROR'); 
      }
      return { services: [] };
    },
    cancelTask: async (taskId) => {
      if (activeProcessTasks[taskId]) {
        activeProcessTasks[taskId].cancelled = true;
        log(`[TASK] Solicitada cancelación de ${taskId}`, 'WARNING');
        
        try {
          // Limpiamos el ID para evitar caracteres que rompan el filtro WQL (como paréntesis)
          const safeId = taskId.replace(/[^a-zA-Z0-9]/g, '');
          // Buscamos el proceso de PowerShell que contiene nuestro identificador único en su línea de comandos
          const killCmd = `powershell -Command "Get-CimInstance Win32_Process -Filter \\"Name = 'powershell.exe' AND CommandLine LIKE '%WS-TASK-${safeId}%'\\" | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"`;
          await execCommand(killCmd);
          log(`[TASK] Proceso de ${safeId} detenido satisfactoriamente`);
        } catch (e) {
          log(`[TASK] Error al intentar detener proceso: ${e.message}`, 'WARNING');
        }
        
        return { success: true };
      }
      return { success: false, error: 'Tarea no encontrada o ya finalizada.' };
    },
    installService: async ({ url, serviceId, version, installPath }) => {
      const taskId = `${serviceId}-${version}`;
      const safeId = taskId.replace(/[^a-zA-Z0-9]/g, '');
      activeProcessTasks[taskId] = { cancelled: false };

      try {
        const root = window.NL_PATH || '.';
        const normalizedRoot = root.replace(/\//g, '\\');
        const tempDir = normalizedRoot + '\\tmp';
        const fileName = `${serviceId}-${version}.zip`;
        const filePath = tempDir + '\\' + fileName;
        const normalizedInstallPath = installPath.replace(/\//g, '\\');
        const destDir = normalizedRoot + '\\' + normalizedInstallPath + '\\' + version;

        const runInterruptible = async (powershellCmd, stepName) => {
          if (activeProcessTasks[taskId]?.cancelled) throw new Error('CANCELLED');
          await log(`[INSTALADOR] [${stepName}] Iniciando...`);
          
          // Agregamos una marca única (# WS-TASK-...) al comando para poder identificarlo y matarlo si se cancela
          // Usamos el safeId para asegurar que el filtro WQL funcione
          const cmd = `powershell -WindowStyle Hidden -Command "${powershellCmd} # WS-TASK-${safeId}"`;
          const result = await execCommand(cmd);
          
          if (activeProcessTasks[taskId]?.cancelled) throw new Error('CANCELLED');
          return result;
        };

        await log(`[INSTALADOR] Iniciando instalación de ${serviceId} v${version}`);
        
        await execCommand(`powershell -Command "New-Item -ItemType Directory -Force -Path '${tempDir}', '${destDir}'"`);

        await runInterruptible(
          `$ProgressPreference = 'SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '${url}' -OutFile '${filePath}' -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebServDev/1.0' -UseBasicParsing`,
          'Descarga'
        );
        
        const checkFileCmd = `if (Test-Path '${filePath}') { (Get-Item '${filePath}').Length } else { 0 }`;
        const sizeResult = await runInterruptible(checkFileCmd, 'Verificación');
        const size = parseInt(sizeResult.stdout.trim() || '0');
        await log(`[INSTALADOR] Archivo descargado. Tamaño: ${size} bytes`);

        if (size < 1000) {
          throw new Error('El archivo descargado es demasiado pequeño o no existe. Posible fallo de red o URL inválida.');
        }
        
        await runInterruptible(`Expand-Archive -Path '${filePath}' -DestinationPath '${destDir}' -Force`, 'Extracción');
        
        const verifyResult = await execCommand(`powershell -Command "Get-ChildItem -Path '${destDir}' | Measure-Object | Select-Object -ExpandProperty Count"`);
        const fileCount = parseInt(verifyResult.stdout.trim() || '0');
        await log(`[INSTALADOR] Extracción completada. ${fileCount} archivos encontrados en destino.`);

        await execCommand(`powershell -Command "Remove-Item -Path '${filePath}' -Force"`);
        
        await log(`[INSTALADOR] ✅ ${serviceId} instalado correctamente`);
        return { success: true, message: `${serviceId} v${version} instalado correctamente.` };
      } catch(e) {
        if (activeProcessTasks[taskId]?.cancelled || e.message === 'CANCELLED') {
           await log(`[INSTALADOR] ⚠️ Instalación de ${serviceId} v${version} cancelada por el usuario.`, 'WARNING');
           
           // Limpieza post-cancelación
           try {
             await log(`[INSTALADOR] [Limpieza] Eliminando archivos temporales...`);
             await execCommand(`powershell -Command "Remove-Item -Path '${filePath}' -Force -ErrorAction SilentlyContinue"`);
             // Solo eliminamos destDir si está vacío (para no borrar instalaciones existentes por error)
             await execCommand(`powershell -Command "$items = Get-ChildItem -Path '${destDir}' -ErrorAction SilentlyContinue; if ($items.Count -eq 0 -or $null -eq $items) { Remove-Item -Path '${destDir}' -Recurse -Force -ErrorAction SilentlyContinue }"`);
           } catch (cleanError) {
             await log(`[INSTALADOR] [Limpieza] Nota: ${cleanError.message}`, 'INFO');
           }

           return { success: false, error: 'CANCELLED' };
        }
        await log(`[INSTALADOR] ❌ Error: ${e.message}`, 'ERROR');
        return { success: false, error: e.message };
      } finally {
        delete activeProcessTasks[taskId];
      }
    },
    uninstallService: async ({ serviceId, version, installPath }) => {
      try {
        const root = window.NL_PATH || '.';
        const normalizedRoot = root.replace(/\//g, '\\');
        const normalizedInstallPath = installPath.replace(/\//g, '\\');
        const destDir = normalizedRoot + '\\' + normalizedInstallPath + '\\' + version;

        await log(`[DESINSTALADOR] Iniciando desinstalación de ${serviceId} v${version}`);
        
        // Verificar si el directorio existe
        const checkDirCmd = `powershell -Command "Test-Path '${destDir}'"`;
        const existsResult = await execCommand(checkDirCmd);
        
        if (existsResult.stdout.trim().toLowerCase() === 'false') {
          throw new Error('La carpeta de la versión no existe.');
        }

        // Eliminar directorio
        await log(`[DESINSTALADOR] Eliminando carpeta: ${destDir}`);
        const removeCmd = `powershell -Command "Remove-Item -Path '${destDir}' -Recurse -Force"`;
        const removeResult = await execCommand(removeCmd);
        
        if (removeResult.stderr && removeResult.stderr.includes('Error')) {
          throw new Error(`Error al eliminar carpeta: ${removeResult.stderr}`);
        }

        await log(`[DESINSTALADOR] ✅ ${serviceId} v${version} eliminado.`);
        return { success: true, message: `${serviceId} v${version} desinstalado correctamente.` };
      } catch(e) {
        await log(`[DESINSTALADOR] ❌ Error: ${e.message}`, 'ERROR');
        return { success: false, error: e.message };
      }
    },
    updateServiceVersion: async (type, version) => {
      try {
        const cfgRaw = localStorage.getItem('myApp-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        if (!cfg.versions) cfg.versions = {};
        cfg.versions[type] = version;
        localStorage.setItem('myApp-config', JSON.stringify(cfg));
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
        const root = window.NL_PATH || '.';
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

  // optional: expose a helper to push logs to UI during dev
  window.__neutralino_push_log = function(log){
    if(window.__neutralino_log_cb) window.__neutralino_log_cb(log);
  }
})();
