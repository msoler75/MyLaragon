// Neutralino compatibility shim for window.electronAPI
(function(){
  const defaultConfig = { laragonPath: 'C:\\laragon', projectsPath: 'C:\\laragon\\www', editor: 'notepad', autoStart: false, language: 'es', theme: 'system' };

  async function fileExists(path){
    try{
      if(window.Neutralino && Neutralino.filesystem && Neutralino.filesystem.exists){
        const res = await Neutralino.filesystem.exists(path);
        if(typeof res === 'boolean') return res;
        if(res && typeof res.exists === 'boolean') return res.exists;
      }
    }catch(e){}
    return false;
  }

  async function readDir(path){
    try{
      if(window.Neutralino && Neutralino.filesystem && Neutralino.filesystem.readDirectory){
        const res = await Neutralino.filesystem.readDirectory({ path });
        if(Array.isArray(res)) return res;
        if(res && Array.isArray(res.entries)) return res.entries;
      }
    }catch(e){}
    return null;
  }

  async function findExecutable(type, version, exeName, laragonPath){
    if(!exeName) return null;
    // try explicit version first
    if(version){
      const full = `${laragonPath}\\bin\\${type}\\${version}\\${exeName}`;
      if(await fileExists(full)) return full;
    }
    const base = `${laragonPath}\\bin\\${type}`;
    // try scanning versions folders
    const listing = await readDir(base);
    if(listing){
      for(const entry of listing){
        const name = (entry && entry.name) ? entry.name : entry;
        const candidate = `${base}\\${name}\\${exeName}`;
        if(await fileExists(candidate)) return candidate;
      }
    }
    // try exe directly under type folder
    const direct = `${base}\\${exeName}`;
    if(await fileExists(direct)) return direct;
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
          // Verificar si el proceso está corriendo
          let processRunning = false;
          try {
            const tasklistResult = await execCommand(`tasklist /FI "IMAGENAME eq ${processName}" /FO CSV /NH`);
            processRunning = tasklistResult && tasklistResult.stdout && tasklistResult.stdout.includes(processName);
            console.log('[SHIM]', service.name, 'tasklist check:', processRunning);
          } catch(e) {
            console.log('[SHIM] Error verificando proceso:', e.message);
          }
          
          // Verificar si el puerto está en uso - usando cmd /c para shell
          let portInUse = false;
          try {
            const netstatResult = await execCommand(`cmd /c "netstat -ano | findstr :${port}"`);
            portInUse = netstatResult && netstatResult.stdout && netstatResult.stdout.includes('LISTENING');
            console.log('[SHIM]', service.name, 'netstat check:', portInUse, 'salida:', netstatResult?.stdout?.slice(0, 100));
          } catch(e) {
            console.log('[SHIM] Error verificando puerto:', e.message);
          }
          
          // Usar solo el proceso para determinar estado (evita falsos positivos con puertos compartidos)
          const status = processRunning ? 'running' : 'stopped';
          console.log('[SHIM]', service.name, 'status:', status, '(proceso:', processRunning, ', puerto:', portInUse, ')');
          
          return { 
            status, 
            port, 
            processRunning, 
            portInUse,
            processName,
            details: status === 'running' ? `Servicio activo en puerto ${port}` : 'Servicio detenido'
          };
        } catch (e) {
          console.log('[SHIM] No se pudo verificar estado real - retornando unknown');
          return { status: 'unknown', port, processRunning: false, portInUse: false };
        }
      })();
      
      // Timeout de 2 segundos para no bloquear UI
      return Promise.race([
        statusPromise,
        new Promise(resolve => {
          setTimeout(() => {
            console.log('[SHIM] Timeout verificando', service.name, '- retornando unknown');
            resolve({ status: 'unknown', port, processRunning: false, portInUse: false });
          }, 2000);
        })
      ]);
    }catch(e){
      console.error('[SHIM] Error en checkServiceStatus:', e);
      return { status: 'unknown', port: null, processRunning: false, portInUse: false };
    }
  }

  async function execCommand(cmd){
    try{
      // En desarrollo (puerto 5173), usar siempre /api/exec
      const isDev = window.location.port === '5173' || window.location.hostname === 'localhost';
      
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
        const result = await Neutralino.os.execCommand({ command: cmd });
        return result;
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
        const cfgRaw = localStorage.getItem('mylaragon-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        const laragonPath = cfg.laragonPath || defaultConfig.laragonPath;

        // Cargar configuración de servicios (desde Vite/public)
        let servicesList = [];
        try{
          // Intentar desde la ruta del shim primero (/neutralino/services.json)
          console.log('[SHIM] Intentando fetch /neutralino/services.json');
          let res = await fetch('/neutralino/services.json', { cache: 'no-store' });
          console.log('[SHIM] /neutralino/services.json status:', res.status);
          
          // Si falla, intentar desde raíz (/services.json)
          if (!res.ok) {
            console.log('[SHIM] Intentando fetch /services.json');
            res = await fetch('/services.json', { cache: 'no-store' });
            console.log('[SHIM] /services.json status:', res.status);
          }
          
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
        }catch(e){
          console.log('[SHIM] Fetch error:', e.message);
          window.__neutralino_push_log && window.__neutralino_push_log({ timestamp: Date.now(), level: 'WARNING', message: `Error cargando services.json: ${e.message}; usando fallback` });
        }

        // Fallback mínimo
        if(servicesList.length === 0) {
          console.log('[SHIM] Usando fallback: Apache + MySQL');
          servicesList = [
            { name: 'Apache', type: 'apache', version: null },
            { name: 'MySQL', type: 'mysql', version: null }
          ];
        }

        // Verificar estado de cada servicio
        console.log('[SHIM] Verificando estado de', servicesList.length, 'servicios');
        const servicesWithStatus = await Promise.all(servicesList.map(async (service) => {
          const status = await checkServiceStatus(service, laragonPath);
          return { ...service, ...status };
        }));

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
      try{
        const cfgRaw = localStorage.getItem('mylaragon-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        const laragonPath = cfg.laragonPath || defaultConfig.laragonPath;
        
        // Obtener info del servicio
        const services = await window.electronAPI.getServices();
        const service = services.find(s => s.name === serviceName);
        
        if(!service){
          throw new Error(`Servicio no encontrado: ${serviceName}`);
        }
        
        // Verificar si ya está corriendo
        if(service.status === 'running'){
          console.log(`${serviceName} ya está ejecutándose`);
          return { success: true, message: `${serviceName} is already running`, alreadyRunning: true };
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
        
        // Localizar el ejecutable real
        const fullExe = await findExecutable(type, version, exe, laragonPath);
        if(!fullExe){
          throw new Error(`No se encontró el ejecutable para ${type} en ${laragonPath}\\\\bin\\\\${type}`);
        }
        
        window.__neutralino_push_log && window.__neutralino_push_log({ 
          timestamp: Date.now(), 
          level: 'INFO', 
          message: `Iniciando ${serviceName}...` 
        });
        
        // Limpiar procesos antiguos primero
        try{
          await execCommand(`taskkill /F /IM ${exe} 2>NUL`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }catch(e){}
        
        // Iniciar el servicio según su tipo
        let startCmd = '';
        switch(type){
          case 'apache':{
            const conf = `${laragonPath}\\\\bin\\\\apache\\\\${version}\\\\conf\\\\httpd.conf`;
            startCmd = `start "" "${fullExe}" -f "${conf}"`;
            break;
          }
          case 'nginx':{
            startCmd = `start "" "${fullExe}"`;
            break;
          }
          case 'mysql':
          case 'mariadb':{
            startCmd = `start "" "${fullExe}" --standalone`;
            break;
          }
          case 'redis':{
            const redisConf = `${laragonPath}\\\\bin\\\\redis\\\\${version}\\\\redis.conf`;
            startCmd = `start "" "${fullExe}" "${redisConf}"`;
            break;
          }
          case 'mongodb':{
            const mongoData = `${laragonPath}\\\\data\\\\mongodb`;
            startCmd = `start "" "${fullExe}" --dbpath "${mongoData}"`;
            break;
          }
          default:{
            startCmd = `start "" "${fullExe}"`;
            break;
          }
        }
        
        // Ejecutar comando
        await execCommand(`cmd /C ${startCmd}`);
        
        window.__neutralino_push_log && window.__neutralino_push_log({ 
          timestamp: Date.now(), 
          level: 'INFO', 
          message: `${serviceName} iniciado correctamente` 
        });
        
        return { success: true, message: `${serviceName} started` };
      }catch(e){
        const errorMsg = e.message || String(e);
        console.error('Error starting service:', e);
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
        const cfgRaw = localStorage.getItem('mylaragon-config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : defaultConfig;
        const laragonPath = cfg.laragonPath || defaultConfig.laragonPath;
        
        // Obtener info del servicio
        const services = await window.electronAPI.getServices();
        const service = services.find(s => s.name === serviceName);
        
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
        const raw = localStorage.getItem('mylaragon-config');
        return raw ? JSON.parse(raw) : defaultConfig;
      }catch(e){ return defaultConfig; }
    },
    setConfig: async (cfg)=>{
      try{ localStorage.setItem('mylaragon-config', JSON.stringify(cfg)); return true; }catch(e){return false}
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
    }
  };

  // optional: expose a helper to push logs to UI during dev
  window.__neutralino_push_log = function(log){
    if(window.__neutralino_log_cb) window.__neutralino_log_cb(log);
  }
})();
