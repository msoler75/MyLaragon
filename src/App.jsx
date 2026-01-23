import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Activity, 
  Settings as SettingsIcon, 
  Wrench, 
  RefreshCw,
  Layers,
  Zap,
  FileText,
  Folder
} from 'lucide-react'

// Importar Vistas
import ServicesView from './Views/ServicesView'
import InstallerView from './Views/InstallerView'
import ToolsView from './Views/ToolsView'
import LogsView from './Views/LogsView'
import SettingsView from './Views/SettingsView'

// Detecci�n autom�tica de archivos de idioma
const languageFiles = import.meta.glob('./i18n/*.json', { eager: true });
const translations = {};
const availableLanguages = [];

Object.entries(languageFiles).forEach(([path, content]) => {
  const langCode = path.split('/').pop().replace('.json', '');
  const data = content.default || content;
  translations[langCode] = data;
  availableLanguages.push({
    id: langCode,
    label: data.languageName || langCode.toUpperCase()
  });
});

// Detecci�n autom�tica de temas
const themeFiles = import.meta.glob('./themes/*.json', { eager: true });
const themes = {};
Object.entries(themeFiles).forEach(([path, content]) => {
  const themeKey = path.split('/').pop().replace('.json', '');
  themes[themeKey] = content.default || content;
});

function App() {
  const [activeTab, setActiveTab] = useState('services')
  const [services, setServices] = useState([])
  const [installerServices, setInstallerServices] = useState([])
  const [runningServices, setRunningServices] = useState([])
  const [config, setConfig] = useState({ language: 'es', theme: 'system', toastEnabled: true, monitoringAuto: true })
  const [loading, setLoading] = useState(false)
  const [processingServices, setProcessingServices] = useState([])
  const [isBulkRunning, setIsBulkRunning] = useState(false)
  const [logs, setLogs] = useState([])
  const [unreadErrors, setUnreadErrors] = useState(0)
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [hiddenServices, setHiddenServices] = useState(() => {
    try {
      const saved = localStorage.getItem('hiddenServices')
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch (e) { return [] }
  })
  const [toasts, setToasts] = useState([])

  const activeTranslations = translations[config.language] || translations.es || {};
  const t = activeTranslations;
  
  useEffect(() => {
    if (Object.keys(translations).length === 0) {
      console.error('[APP] ERROR: No hay traducciones cargadas!');
    }
  }, []);
  
  const refreshingRef = useRef(false);
  const lastServicesRef = useRef();
  const loadServices = useCallback(async (isSilent = false, hiddenServicesOverride = null) => {
    // Si viene de un evento de React o similar, isSilent no ser� estrictamente true
    const silent = isSilent === true;
    // Usar hiddenServicesOverride si se proporciona, sino usar el estado actual
    const hiddenToUse = hiddenServicesOverride !== null ? hiddenServicesOverride : hiddenServices;
    
    console.log('[APP] loadServices called, webservAPI:', !!window.webservAPI, 'isSilent:', isSilent);
    if (window.webservAPI && !refreshingRef.current) {
      refreshingRef.current = true;
      if (!silent) setLoading(true)
      try {
        console.log('[APP] Llamando a getServices con hidden:', hiddenToUse);
        const servicesData = await window.webservAPI.getServicesAndState(hiddenToUse)
        console.log('[APP] Servicios recibidos (DATA):', JSON.stringify(servicesData));
        
        if (!servicesData || !servicesData.all || !Array.isArray(servicesData.all)) {
          console.error('[APP] getServices no devolvió un objeto válido con all:', servicesData);
        } else {
          const servicesArray = servicesData.all;
          const installerArray = servicesData.installer || [];
          const runningArray = servicesData.services || [];
          
          const currentState = { all: servicesArray, installer: installerArray, services: runningArray };
          const lastState = lastServicesRef.current || {};
          
          if (JSON.stringify(currentState) !== JSON.stringify(lastState)) {
            setServices(servicesArray)
            setInstallerServices(installerArray)
            setRunningServices(runningArray)
            lastServicesRef.current = currentState;
            console.log('[APP] State actualizado con', servicesArray.length, 'servicios totales,', installerArray.length, 'para instalar,', runningArray.length, 'ejecutándose');
          } else {
            console.log('[APP] Servicios sin cambios, no actualizando state');
          }
        }
      } catch (error) {
        console.error('[APP] Error fatal cargando servicios:', error)
      } finally {
        if (!silent) setLoading(false)
        refreshingRef.current = false;
      }
    } else {
      console.log('[APP] loadServices saltado. webservAPI:', !!window.webservAPI, 'refrescando:', refreshingRef.current);
    }
  }, [hiddenServices]);

  // Aplicar tema
  useEffect(() => {
    const applyTheme = (themeKey) => {
      let activeTheme = themeKey;
      if (themeKey === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      const themeData = themes[activeTheme] || themes.light;
      if (themeData && themeData.colors) {
        const root = document.documentElement;
        Object.entries(themeData.colors).forEach(([key, value]) => {
          root.style.setProperty(`--app-${key}`, value);
        });
      }
    };

    applyTheme(config.theme);

    if (config.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [config.theme]);

  useEffect(() => {
    const loadConfig = async () => {
      if (window.webservAPI) {
        const data = await window.webservAPI.getConfig()
        setConfig(data)
        setIsMonitoring(data.monitoringAuto ?? true)
      }
    }
    loadConfig()
  }, [])

  useEffect(() => {
    let isMounted = true;
    let logBuffer = [];
    
    const flushLogs = () => {
      if (logBuffer.length > 0 && isMounted) {
        setLogs(prev => {
          const newLogs = [...prev, ...logBuffer].slice(-300);
          logBuffer = [];
          return newLogs;
        });
      }
    };
    
    if (window.webservAPI && window.webservAPI.onLog) {
      // Funci�n para formatear la fecha consistentemente
      const formatTime = (ts) => {
        try {
          return new Date(ts).toLocaleTimeString();
        } catch (e) {
          return ts;
        }
      };

      // Cargar logs hist�ricos primero
      window.webservAPI.getLogs().then(historicalLogs => {
        if (!isMounted) return;
        setLogs(prev => {
          // Si ya hay logs (en vivo), los a�adimos despu�s de los hist�ricos sin duplicar
          const history = historicalLogs.map(l => ({...l, timestamp: formatTime(l.timestamp)}));
          // Evitamos duplicar logs que ya podr�an haber llegado "en vivo" comparando mensaje y timestamp aproximado
          return [...history, ...prev].slice(-300);
        });
      });

      // Suscribirse a logs en vivo
      window.webservAPI.onLog((logData) => {
        if (!isMounted) return;
        
        if (logData.level === 'ERROR' && activeTab !== 'logs') {
          setUnreadErrors(prev => prev + 1);
        }

        const formattedLog = {
          ...logData,
          timestamp: formatTime(logData.timestamp)
        };
        logBuffer.push(formattedLog);
        
        // Flush en el pr�ximo tick si es el primer log en el buffer
        if (logBuffer.length === 1) {
          setTimeout(flushLogs, 0);
        }
      });
    }

    return () => {
      isMounted = false;
      // Idealmente aqu� remover�amos el listener, pero onLog en preload.js no devuelve el remover a�n
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'logs') {
      setUnreadErrors(0);
    }
  }, [activeTab]);

  useEffect(() => {
    const onFocus = () => loadServices(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadServices]);

  useEffect(() => {
    localStorage.setItem('hiddenServices', JSON.stringify(hiddenServices))
  }, [hiddenServices])

  // Carga inicial de servicios
  useEffect(() => {
    console.log('[APP] Inicializando carga de servicios...');
    loadServices(false);
  }, []); // Solo al montar

  // Sistema de actualizaci�n inteligente: pausa durante acciones para evitar parpadeos y race conditions
  useEffect(() => {
    // Si hay procesos en curso (start/stop) o el shim indica que est� instalando, pausamos el polling
    if (isMonitoring && processingServices.length === 0) {
      const interval = setInterval(() => {
        // Doble comprobaci�n: si el shim est� ocupado instalando, saltamos este tick
        if (window.__is_installing) return;
        loadServices(true);
      }, 7000)
      return () => clearInterval(interval)
    }
  }, [isMonitoring, hiddenServices, processingServices.length, loadServices])

  useEffect(() => {
    const handleTabChange = (e) => setActiveTab(e.detail);
    window.addEventListener('change-tab', handleTabChange);
    return () => window.removeEventListener('change-tab', handleTabChange);
  }, []);

  const pushToast = ({ title, message, type = 'info', id }) => {
    if (config.toastEnabled === false) {
      console.log('[TOAST:disabled]', title, message);
      return;
    }
    const toastId = id || Date.now() + Math.random();
    setToasts(prev => [...prev, { id: toastId, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 4200);
  };

  const handleStartService = async (serviceName) => {
    if (window.webservAPI && !processingServices.includes(serviceName)) {
      try {
        setProcessingServices(prev => [...prev, serviceName])
        
        // Identificar tipo para el delay de estabilizaci�n
        const service = services.find(s => s.name === serviceName);

        // Dependencias faltantes (p.ej. Apache requiere PHP)
        if (service && service.requiresPhp && service.dependenciesReady === false) {
          pushToast({ title: serviceName, message: t.phpRequired || 'Requiere PHP instalado', type: 'error' });
          setProcessingServices(prev => prev.filter(s => s !== serviceName));
          return;
        }

        // Si el servicio no est� instalado, redirigir a la vista de instalaci�n
        if (service && service.isInstalled === false) {
          window.dispatchEvent(new CustomEvent('change-tab', { detail: 'install' }));
          setProcessingServices(prev => prev.filter(s => s !== serviceName));
          return;
        }

        const type = service?.type?.toLowerCase() || '';
        const isHeavy = ['mysql', 'mariadb', 'mongodb', 'postgresql'].includes(type);
        
        // Verificar si el servicio ya est� corriendo
        if (service?.status === 'running') {
          console.log(`${serviceName} ya est� ejecut�ndose`);
          setProcessingServices(prev => prev.filter(s => s !== serviceName));
          return;
        }
        
        const result = await window.webservAPI.startService(serviceName);
        
        if (!result.success) {
          console.error('Error starting service:', result.message);
          pushToast({ title: serviceName, message: result.message || 'Error al iniciar', type: 'error' });
          setProcessingServices(prev => prev.filter(s => s !== serviceName));
          return;
        }
        
        // Espera din�mica: DBs necesitan m�s tiempo para abrir puertos
        const delay = isHeavy ? 4500 : (['apache', 'nginx'].includes(type) ? 2500 : 1500);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        await loadServices();
        pushToast({ title: serviceName, message: t.started || 'Iniciado', type: 'success' });
      } catch (error) {
        console.error('Error starting service:', error);
        pushToast({ title: serviceName, message: error.message || 'Error al iniciar', type: 'error' });
      } finally {
        setProcessingServices(prev => prev.filter(s => s !== serviceName))
      }
    }
  }

  const handleStopService = async (serviceName) => {
    if (window.webservAPI && !processingServices.includes(serviceName)) {
      try {
        setProcessingServices(prev => [...prev, serviceName])
        
        const service = services.find(s => s.name === serviceName);
        const type = service?.type?.toLowerCase() || '';
        const isHeavy = ['mysql', 'mariadb', 'mongodb', 'postgresql'].includes(type);
        
        await window.webservAPI.stopService(serviceName)
        
        // El stop suele ser m�s r�pido pero las DBs limpian locks
        const delay = isHeavy ? 2000 : 1200;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        await loadServices()
        pushToast({ title: serviceName, message: t.stopped || 'Detenido', type: 'info' });
      } catch (error) {
        console.error('Error stopping service:', error);
        pushToast({ title: serviceName, message: error.message || 'Error al detener', type: 'error' });
      } finally {
        setProcessingServices(prev => prev.filter(s => s !== serviceName))
      }
    }
  }

  const toggleServiceVisibility = async (serviceName) => {
    // Actualizar hiddenServices primero
    const newHidden = hiddenServices.includes(serviceName) 
      ? hiddenServices.filter(s => s !== serviceName) 
      : [...hiddenServices, serviceName];
    setHiddenServices(newHidden);
    // Pasar expl�citamente los servicios ocultos actualizados a loadServices
    loadServices(false, newHidden);
  }

  const menuItems = [
    { id: 'services', label: t.services, icon: Zap },
    { id: 'install', label: 'Instalar', icon: Layers },
    { id: 'tools', label: t.tools, icon: Wrench },
    { id: 'logs', label: t.logs, icon: FileText, badge: unreadErrors },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ]

  return (
    <div className="flex h-screen bg-app-bg text-app-text font-sans transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 bg-app-surface border-r border-app-border flex flex-col shadow-xl z-50 transition-all duration-300">
        <div className="p-4 flex items-center space-x-2 border-b border-app-border">
          <div className="bg-app-primary p-2 rounded-xl shadow-lg shadow-app-primary/20">
            <Activity size={20} className="text-app-primary-text" />
          </div>
          <h2 className="text-lg font-black tracking-tight uppercase">{t.appName || 'MyApp'}</h2>
        </div>
        
        <nav className="flex-1 mt-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${
                  activeTab === item.id 
                    ? 'bg-app-primary text-app-primary-text shadow-lg shadow-app-primary/20' 
                    : 'text-app-text-muted hover:bg-app-bg hover:text-app-text'
                }`}
              >
                <Icon size={18} />
                <span className="font-bold uppercase tracking-wider text-xs flex-1 text-left">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 flex h-4 min-w-4 items-center justify-center rounded-full bg-app-danger px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-app-surface animate-in zoom-in duration-300">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-app-border">
          <div className="bg-app-bg/50 rounded-xl p-3 border border-app-border">
            <div className="flex items-center justify-between text-[10px] text-app-text-muted mb-1.5 font-black uppercase tracking-widest">
              <span>{t.globalStatus || 'ESTADO'}</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-app-success animate-pulse"></span>
            </div>
            <p className="text-xs font-bold truncate">{t.myAppReady}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-app-surface border-b border-app-border h-16 flex items-center justify-between px-8 shrink-0 z-40">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-black text-app-text tracking-tight uppercase">{t[activeTab]}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={async () => {
                const next = !isMonitoring;
                setIsMonitoring(next);
                setConfig(prev => ({ ...prev, monitoringAuto: next }));
                if (window.webservAPI) {
                  await window.webservAPI.setConfig({ ...config, monitoringAuto: next });
                }
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-[10px] font-black shadow-sm transition-all uppercase tracking-wider ${
                isMonitoring 
                  ? 'bg-app-success/10 text-app-success border-app-success/30' 
                  : 'bg-app-surface text-app-text-muted border-app-border hover:text-app-text'
              }`}
              title={isMonitoring ? 'Desactivar monitoreo auto' : 'Activar monitoreo auto'}
            >
              <Activity size={16} className={isMonitoring ? 'animate-pulse' : ''} />
              <span className="hidden sm:inline">{isMonitoring ? 'Auto' : 'Manual'}</span>
            </button>

            <button 
              onClick={() => {
                const dummy = [
                  { name: 'DEBUG_FORCE', type: 'apache', status: 'running', isInstalled: true },
                  { name: 'DEBUG_2', type: 'mysql', status: 'stopped', isInstalled: true }
                ];
                console.log('[APP] FORZANDO SERVICIOS DE DEBUG');
                setServices(dummy);
              }}
              className="p-2 bg-red-500 text-white rounded-xl text-[8px] font-bold"
            >
              DEBUG_UI
            </button>

            <button 
              onClick={loadServices}
              className="p-2 hover:bg-app-bg border border-transparent hover:border-app-border rounded-xl text-app-text-muted hover:text-app-text transition-all"
              title={t.refresh}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-5xl mx-auto">
            {/* Services View */}
            <div className={activeTab === 'services' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
              <ServicesView 
                services={runningServices} 
                hiddenServices={hiddenServices}
                processingServices={processingServices}
                isBulkRunning={isBulkRunning}
                loading={loading}
                onToggleVisibility={toggleServiceVisibility}
                onStart={handleStartService} 
                onStop={handleStopService}
                loadServices={loadServices}
                onStartAll={async () => {
                  if (window.webservAPI) {
                    setIsBulkRunning(true)
                    const current = await window.webservAPI.getServicesAndState(hiddenServices)
                    setServices(current.all)
                    const visible = current.all.filter(s => !hiddenServices.includes(s.name) && s.status !== 'running' && !s.isLibrary)
                    await Promise.all(visible.map(s => handleStartService(s.name)))
                    setIsBulkRunning(false)
                  }
                }}
                onStopAll={async () => {
                  if (window.webservAPI) {
                    setIsBulkRunning(true)
                    const current = await window.webservAPI.getServicesAndState(hiddenServices)
                    setServices(current.all)
                    const visible = current.all.filter(s => !hiddenServices.includes(s.name) && s.status === 'running' && !s.isLibrary)
                    await Promise.all(visible.map(s => handleStopService(s.name)))
                    setIsBulkRunning(false)
                  }
                }}
                t={t}
              />
            </div>

            {/* Services Manager View (Installer) */}
            <div className={activeTab === 'install' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
              <InstallerView t={t} onInstalled={loadServices} services={installerServices} activeTab={activeTab} />
            </div>

            {/* Tools View */}
            <div className={activeTab === 'tools' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
              <ToolsView t={t} />
            </div>

            {/* Logs View */}
            <div className={activeTab === 'logs' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
              <LogsView logs={logs} t={t} setLogs={setLogs} />
            </div>

            {/* Settings View */}
            <div className={activeTab === 'settings' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
              <div className="space-y-8">
                <SettingsView 
                  config={config} 
                  setConfig={setConfig} 
                  t={t} 
                  availableLanguages={availableLanguages} 
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toasts */}
  <div className="fixed bottom-6 right-6 space-y-2 z-50 w-80 max-w-[90vw]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border shadow-lg px-4 py-3 text-sm font-bold backdrop-blur bg-app-surface/90 transition-all animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'error'
                ? 'border-app-danger/50 text-app-danger'
                : toast.type === 'success'
                ? 'border-app-success/50 text-app-success'
                : 'border-app-primary/40 text-app-text'
            }`}
          >
            <div className="text-xs uppercase tracking-widest font-black mb-1 opacity-80">{toast.title}</div>
            <div className="text-sm leading-snug font-semibold">{toast.message}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App;
