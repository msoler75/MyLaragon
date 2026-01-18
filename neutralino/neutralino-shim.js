// Neutralino compatibility shim for window.electronAPI
(function(){
  if(typeof Neutralino !== 'undefined') {
    Neutralino.init();
  }
  
  // Detectar raíz real en Neutralino (NL_PATH es el directorio del binary)
  const neutralinoRoot = window.NL_PATH || '.';
  const defaultConfig = { 
    appPath: neutralinoRoot, 
    projectsPath: neutralinoRoot + '\\www', 
    editor: 'notepad', 
    autoStart: false, 
    language: 'es', 
    theme: 'system' 
  };

  async function fileExists(path){
    try{
      console.log('[SHIM] fileExists verificando:', path);
      
      // En desarrollo, usar Node.js backend. En Neutralino PROD existe NL_TOKEN
      const isDev = !window.NL_TOKEN && (window.location.port === '5173' || window.location.hostname === 'localhost');
      if(isDev){
        console.log('[SHIM] Modo DEV - usando /api/file-exists');
        const response = await fetch('/api/file-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
        });
        const result = await response.json();
        console.log('[SHIM] fileExists resultado DEV:', result);
        return result.exists === true;
      }
      
      // En producción, usar Neutralino
      if(window.Neutralino && Neutralino.filesystem){
        try {
          if (typeof Neutralino.filesystem.exists === 'function') {
            const res = await Neutralino.filesystem.exists(path);
            if(typeof res === 'boolean') return res;
            if(res && typeof res.exists === 'boolean') return res.exists;
          }
          await Neutralino.filesystem.getStats(path);
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
      console.log('[SHIM] readDir leyendo:', path);
      
      const isDev = !window.NL_TOKEN && (window.location.port === '5173' || window.location.hostname === 'localhost');
      if(isDev){
        console.log('[SHIM] Modo DEV - usando /api/read-dir');
        const response = await fetch('/api/read-dir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
        });
        const result = await response.json();
        console.log('[SHIM] readDir resultado DEV:', result);
        return result.entries || null;
      }
      
      // En producción, usar Neutralino
      if(window.Neutralino && Neutralino.filesystem && Neutralino.filesystem.readDirectory){
        const res = await Neutralino.filesystem.readDirectory({ path });
        console.log('[SHIM] readDir resultado:', res);
        if(Array.isArray(res)) return res;
        if(res && Array.isArray(res.entries)) return res.entries;
      }
    }catch(e){
      console.log('[SHIM] readDir error:', e.message);
    }
    return null;
  }

  async function findExecutable(type, version, exeName, laragonPath){
    console.log('[SHIM] findExecutable:', { type, version, exeName, laragonPath });
    if(!exeName) {
      console.log('[SHIM] No exeName, retornando null');
      return null;
    }
    
    // try explicit version first
    if(version){
      const full = `${laragonPath}\\bin\\${type}\\${version}\\${exeName}`;
      console.log('[SHIM] Verificando versión específica:', full);
      if(await fileExists(full)) {
        console.log('[SHIM] Encontrado en versión específica:', full);
        return full;
      }
    }
    
    const base = `${laragonPath}\\bin\\${type}`;
    console.log('[SHIM] Base path:', base);
    
    // try scanning versions folders
    console.log('[SHIM] Leyendo directorio:', base);
    const listing = await readDir(base);
    console.log('[SHIM] Directorio leído, entradas:', listing ? listing.length : 'null');
    
    if(listing){
      for(const entry of listing){
        const name = (entry && entry.name) ? entry.name : entry;
        const candidate = `${base}\\${name}\\${exeName}`;
        console.log('[SHIM] Verificando candidato:', candidate);
        if(await fileExists(candidate)) {
          console.log('[SHIM] Encontrado:', candidate);
          return candidate;
        }
      }
    }
    
    // try exe directly under type folder
    const direct = `${base}\\${exeName}`;
    console.log('[SHIM] Verificando directo:', direct);
    if(await fileExists(direct)) {
      console.log('[SHIM] Encontrado directo:', direct);
      return direct;
    }
    
    console.log('[SHIM] No se encontró el ejecutable');
    return null;
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

  async function checkServiceStatus(service, laragonPath){
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
        // En Neutralino v5/v6 execCommand prefiere STRING
        const result = await (typeof cmd === 'string' ? Neutralino.os.execCommand(cmd) : Neutralino.os.execCommand({ command: cmd }));
        // Normalizar salida (Neutralino suele usar stdOut/stdErr)
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

  window.electronAPI = {
    getServices: async (hiddenServices)=>{
      console.log('[SHIM] getServices called');
      try{
        const cfgRaw = localStorage.getItem('WebServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        const laragonPath = cfg.laragonPath || defaultConfig.laragonPath;

        // Cargar configuración de servicios (desde Vite/public)
        let servicesList = [];
        try{
          // En producción Neutralino, usar fetch al servidor interno
          console.log('[SHIM] Intentando fetch /services.json');
          let res = await fetch('/services.json', { cache: 'no-store' });
          console.log('[SHIM] /services.json status:', res.status);
            
            if(res.ok) {
              const data = await res.json();
              console.log('[SHIM] Datos cargados:', data);
              if (Array.isArray(data) && data.length > 0) {
                servicesList = data;
              } else {
                console.log('[SHIM] Datos vacíos o no array');
                window.__neutralino_push_log && window.__neutralino_push_log({ timestamp: Date.now(), level: 'WARNING', message: 'services.json vacío o inválido; usando fallback' });
              }
            } else {
              console.log('[SHIM] HTTP error:', res.status);
              window.__neutralino_push_log && window.__neutralino_push_log({ timestamp: Date.now(), level: 'WARNING', message: `No se pudo cargar services.json (HTTP ${res.status}); usando fallback` });
            }
          }
        }catch(e){
          console.log('[SHIM] Error cargando services.json:', e.message);
          window.__neutralino_push_log && window.__neutralino_push_log({ timestamp: Date.now(), level: 'WARNING', message: `Error cargando services.json: ${e.message}; usando fallback` });
        }

        // Fallback con todos los servicios
        if(servicesList.length === 0) {
          console.log('[SHIM] Usando fallback con todos los servicios');
          servicesList = [
            { "name": "Apache", "type": "apache", "version": "2.4" },
            { "name": "Nginx", "type": "nginx", "version": "1.22" },
            { "name": "MySQL", "type": "mysql", "version": "8.0" },
            { "name": "PostgreSQL", "type": "postgresql", "version": "14" },
            { "name": "MongoDB", "type": "mongodb", "version": "6.0" },
            { "name": "Redis", "type": "redis", "version": "7.0" },
            { "name": "Memcached", "type": "memcached", "version": "1.6" },
            { "name": "MailPit", "type": "mailpit", "version": "1.8" }
          ];
        }

        // Ejecutar netstat UNA SOLA VEZ
        console.log('[SHIM] Ejecutando netstat una sola vez...');
        await getNetstatData();
        
        // Filtrar servicios visibles (no ocultos)
        const visibleServices = servicesList.filter(s => !hiddenServices || !hiddenServices.includes(s.name));
        console.log('[SHIM] Total:', servicesList.length, 'servicios | Visibles:', visibleServices.length, '| Ocultos:', servicesList.length - visibleServices.length);
        
        // Verificar estado SOLO de servicios visibles EN SECUENCIA
        const servicesWithStatus = [];
        for(const service of visibleServices){
          const status = await checkServiceStatus(service, laragonPath);
          servicesWithStatus.push({ ...service, ...status });
        }
        
        // Agregar servicios ocultos sin verificar estado (solo con datos básicos)
        if(hiddenServices && hiddenServices.length > 0){
          for(const service of servicesList){
            if(hiddenServices.includes(service.name)){
              servicesWithStatus.push({ ...service, status: 'hidden', details: 'Servicio oculto' });
            }
          }
        }

        console.log('[SHIM] Servicios con estado:', servicesWithStatus);

        // Si por alguna razón el resultado es vacío, retornar fallback básico
        if (!Array.isArray(servicesWithStatus) || servicesWithStatus.length === 0) {
          console.log('[SHIM] Resultado vacío, retornando fallback final');
          window.__neutralino_push_log && window.__neutralino_push_log({ timestamp: Date.now(), level: 'WARNING', message: 'No se detectaron servicios; retornando fallback' });
          return [
            { name: 'Apache', type: 'apache', status: 'unknown' },
            { name: 'MySQL', type: 'mysql', status: 'unknown' }
          ];
        }

        console.log('[SHIM] Retornando', servicesWithStatus.length, 'servicios');
        return servicesWithStatus;
      }catch(e){
        console.error('[SHIM] Error getting services:', e);
        window.__neutralino_push_log && window.__neutralino_push_log({ timestamp: Date.now(), level: 'ERROR', message: `Error obteniendo servicios: ${e.message}` });
        // Nunca retornar lista vacía: garantizar mínimo
        console.log('[SHIM] Retornando fallback por error');
        return [
          { name: 'Apache', type: 'apache', status: 'unknown' },
          { name: 'MySQL', type: 'mysql', status: 'unknown' }
        ];
      }
    },
    startService: async (serviceName)=>{
      console.log('[SHIM] startService llamado para:', serviceName);
      try{
        const cfgRaw = localStorage.getItem('WebServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        const laragonPath = cfg.laragonPath || defaultConfig.laragonPath;
        console.log('[SHIM] Laragon path:', laragonPath);
        
        // Cargar configuración de servicios para obtener info del servicio (sin verificar estado)
        let servicesList = [];
        try{
          const isProd = window.NL_TOKEN && window.Neutralino;
          if(isProd && Neutralino.filesystem && Neutralino.filesystem.readFile){
            console.log('[SHIM] Modo PROD - leyendo services.json con filesystem');
            const content = await Neutralino.filesystem.readFile('./www/services.json');
            const data = JSON.parse(content);
            if (Array.isArray(data) && data.length > 0) {
              servicesList = data;
              console.log('[SHIM] Servicios cargados:', servicesList.length);
            }
          }else{
            console.log('[SHIM] Cargando services.json con fetch...');
            let res = await fetch('/neutralino/services.json', { cache: 'no-store' });
            if (!res.ok) {
              res = await fetch('/services.json', { cache: 'no-store' });
            }
            if(res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                servicesList = data;
                console.log('[SHIM] Servicios cargados:', servicesList.length);
              }
            }
          }
        }catch(e){
          console.log('[SHIM] Error cargando services.json:', e.message);
        }
        
        const service = servicesList.find(s => s.name === serviceName);
        if(!service){
          throw new Error(`Servicio no encontrado: ${serviceName}`);
        }
        console.log('[SHIM] Servicio encontrado:', service);
        
        const type = service.type.toLowerCase();
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
          'mongodb': 'mongod.exe'
        };
        
        const exe = exeMap[type];
        if(!exe){
          throw new Error(`Tipo de servicio no soportado: ${type}`);
        }
        console.log('[SHIM] Ejecutable objetivo:', exe);
        
        // Localizar el ejecutable real
        console.log('[SHIM] Buscando ejecutable en:', `${laragonPath}\\bin\\${type}`);
        const fullExe = await findExecutable(type, version, exe, laragonPath);
        if(!fullExe){
          throw new Error(`No se encontró el ejecutable para ${type} en ${laragonPath}\\\\bin\\\\${type}`);
        }
        console.log('[SHIM] Ejecutable encontrado:', fullExe);
        
        window.__neutralino_push_log && window.__neutralino_push_log({ 
          timestamp: Date.now(), 
          level: 'INFO', 
          message: `Iniciando ${serviceName}...` 
        });
        
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
        switch(type){
          case 'apache':{
            const conf = `${laragonPath}\\\\bin\\\\apache\\\\${version}\\\\conf\\\\httpd.conf`;
            startCmd = `start /B "" "${fullExe}" -f "${conf}"`;
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
            const redisConf = `${laragonPath}\\\\bin\\\\redis\\\\${version}\\\\redis.conf`;
            startCmd = `start /B "" "${fullExe}" "${redisConf}"`;
            break;
          }
          case 'mongodb':{
            const mongoData = `${laragonPath}\\\\data\\\\mongodb`;
            startCmd = `start /B "" "${fullExe}" --dbpath "${mongoData}"`;
            break;
          }
          default:{
            startCmd = `start /B "" "${fullExe}"`;
            break;
          }
        }
        
        // Ejecutar comando
        console.log('[SHIM] Ejecutando comando de inicio:', startCmd);
        await execCommand(`cmd /C ${startCmd}`);
        console.log('[SHIM] Comando ejecutado, invalidando caché netstat');
        
        // Invalidar caché de netstat porque el puerto puede estar en transición
        invalidateNetstatCache();
        
        window.__neutralino_push_log && window.__neutralino_push_log({ 
          timestamp: Date.now(), 
          level: 'INFO', 
          message: `${serviceName} iniciado correctamente` 
        });
        
        console.log('[SHIM] Servicio', serviceName, 'iniciado exitosamente');
        return { success: true, message: `${serviceName} started` };
      }catch(e){
        const errorMsg = e.message || String(e);
        console.error('[SHIM] Error en startService:', errorMsg);
        window.__neutralino_push_log && window.__neutralino_push_log({ 
          timestamp: Date.now(), 
          level: 'ERROR', 
          message: `Error al iniciar servicio: ${errorMsg}` 
        });
        return { success: false, message: errorMsg };
      }
    },
    stopService: async (serviceName)=>{
      try{
        const cfgRaw = localStorage.getItem('WebServDev-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        const laragonPath = cfg.laragonPath || defaultConfig.laragonPath;
        
        // Cargar configuración de servicios para obtener info del servicio (sin verificar estado)
        let servicesList = [];
        try{
          const isProd = window.NL_TOKEN && window.Neutralino;
          if(isProd && Neutralino.filesystem && Neutralino.filesystem.readFile){
            const content = await Neutralino.filesystem.readFile('./www/services.json');
            const data = JSON.parse(content);
            if (Array.isArray(data) && data.length > 0) {
              servicesList = data;
            }
          }else{
            let res = await fetch('/neutralino/services.json', { cache: 'no-store' });
            if (!res.ok) {
              res = await fetch('/services.json', { cache: 'no-store' });
            }
            if(res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                servicesList = data;
              }
            }
          }
        }catch(e){}
        
        const service = servicesList.find(s => s.name === serviceName);
        if(!service){
          throw new Error(`Servicio no encontrado: ${serviceName}`);
        }
        
        const type = service.type.toLowerCase();
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
        
        window.__neutralino_push_log && window.__neutralino_push_log({ 
          timestamp: Date.now(), 
          level: 'INFO', 
          message: `Deteniendo ${serviceName}...` 
        });
        
        // Intentar detener de forma elegante primero
        const fullExe = await findExecutable(type, version, exe, laragonPath);
        
        switch(type){
          case 'apache':{
            if(fullExe){
              const conf = `${laragonPath}\\\\bin\\\\apache\\\\${version}\\\\conf\\\\httpd.conf`;
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
        
        window.__neutralino_push_log && window.__neutralino_push_log({ 
          timestamp: Date.now(), 
          level: 'INFO', 
          message: `${serviceName} detenido correctamente` 
        });
        
        return { success: true, message: `${serviceName} stopped` };
      }catch(e){
        const errorMsg = e.message || String(e);
        console.error('Error stopping service:', e);
        window.__neutralino_push_log && window.__neutralino_push_log({ 
          timestamp: Date.now(), 
          level: 'ERROR', 
          message: `Error al detener servicio: ${errorMsg}` 
        });
        return { success: false, message: errorMsg };
      }
    },
    getConfig: async ()=>{
      try{
        const raw = localStorage.getItem('WebServDev-config');
        const cfg = raw ? JSON.parse(raw) : defaultConfig;
        // Forzar siempre el appPath actual para evitar que "C:\App" se quede pegado
        cfg.appPath = neutralinoRoot;
        return cfg;
      }catch(e){ return defaultConfig; }
    },
    setConfig: async (cfg)=>{
      try{ localStorage.setItem('WebServDev-config', JSON.stringify(cfg)); return true; }catch(e){return false}
    },
    getLogs: async ()=>{
      try{
        const res = await fetch('/neutralino/app.log');
        if(res.ok) {
          const text = await res.text();
          // Parsear el texto de logs a un formato estructurado
          if (!text || text.trim() === '') return [];
          const lines = text.split('\n').filter(l => l.trim());
          return lines.map(line => {
            // Intentar parsear formato: [timestamp] [level] mensaje
            const match = line.match(/\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.*)/);
            if (match) {
              return {
                timestamp: new Date(match[1]).getTime(),
                level: match[2],
                message: match[3]
              };
            }
            // Si no coincide, devolver un log genérico
            return {
              timestamp: Date.now(),
              level: 'INFO',
              message: line
            };
          });
        }
      }catch(e){}
      return [];
    },
    openInBrowser: (url)=>{ safeOpen(url); },
    onLog: (cb)=>{
      // no native stream; return a remover function
      window.__neutralino_log_cb = cb;
      return ()=>{ window.__neutralino_log_cb = null };
    },
    openAppFolder: async () => {
      try {
        const root = window.NL_PATH || '.';
        await execCommand(`explorer "${root}"`);
      } catch(e) { console.error(e); }
    },
    openDocumentRoot: async () => {
      try {
        const cfgRaw = localStorage.getItem('myApp-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        await execCommand(`explorer "${cfg.projectsPath || defaultConfig.projectsPath}"`);
      } catch(e) { console.error(e); }
    },
    openDevTools: async () => {
      console.warn('[SHIM] openDevTools no es soportado nativamente en Neutralino desde JS para el usuario.');
    },
    getRemoteServices: async () => {
      try {
        const res = await fetch('/services.json');
        if (res.ok) return await res.json();
      } catch(e) { console.error(e); }
      return { services: [] };
    },
    installService: async (data) => {
      console.error('[SHIM] installService no implementado en shim de Neutralino aún. Use la versión Electron para instalaciones.');
      return { success: false, error: 'Operación no soportada en este entorno.' };
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
