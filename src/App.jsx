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

// Detección automática de archivos de idioma
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

// Detección automática de temas
const themeFiles = import.meta.glob('./themes/*.json', { eager: true });
const themes = {};
Object.entries(themeFiles).forEach(([path, content]) => {
  const themeKey = path.split('/').pop().replace('.json', '');
  themes[themeKey] = content.default || content;
});

function App() {
  const [activeTab, setActiveTab] = useState('services')
  const [services, setServices] = useState([])
  const [config, setConfig] = useState({ language: 'es', theme: 'system' })
  const [loading, setLoading] = useState(false)
  const [processingServices, setProcessingServices] = useState([])
  const [isBulkRunning, setIsBulkRunning] = useState(false)
  const [logs, setLogs] = useState([])
  const [unreadErrors, setUnreadErrors] = useState(0)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [hiddenServices, setHiddenServices] = useState(() => {
    const saved = localStorage.getItem('hiddenServices')
    return saved ? JSON.parse(saved) : []
  })

  const t = translations[config.language] || translations.es

  const refreshingRef = useRef(false);
  const loadServices = useCallback(async (isSilent = false, hiddenServicesOverride = null) => {
    // Si viene de un evento de React o similar, isSilent no será estrictamente true
    const silent = isSilent === true;
    // Usar hiddenServicesOverride si se proporciona, sino usar el estado actual
    const hiddenToUse = hiddenServicesOverride !== null ? hiddenServicesOverride : hiddenServices;
    
    console.log('[APP] loadServices called, electronAPI:', !!window.electronAPI, 'isSilent:', isSilent);
    if (window.electronAPI && !refreshingRef.current) {
      refreshingRef.current = true;
      if (!silent) setLoading(true)
      try {
        const servicesData = await window.electronAPI.getServices(hiddenToUse)
        console.log('[APP] Servicios recibidos:', servicesData);
        // Solo actualizamos si no hay acciones en curso que puedan ser invalidadas
        setServices(servicesData)
        console.log('[APP] State actualizado con', servicesData?.length || 0, 'servicios');
      } catch (error) {
        console.error('[APP] Error loading services:', error)
      } finally {
        if (!silent) setLoading(false)
        refreshingRef.current = false;
      }
    } else {
      console.log('[APP] electronAPI no disponible:', !window.electronAPI, 'refrescando:', refreshingRef.current);
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
      if (window.electronAPI) {
        const data = await window.electronAPI.getConfig()
        setConfig(data)
      }
    }
    loadConfig()
  }, [])

  useEffect(() => {
    let isMounted = true;
    
    if (window.electronAPI && window.electronAPI.onLog) {
      // Función para formatear la fecha consistentemente
      const formatTime = (ts) => {
        try {
          return new Date(ts).toLocaleTimeString();
        } catch (e) {
          return ts;
        }
      };

      // Cargar logs históricos primero
      window.electronAPI.getLogs().then(historicalLogs => {
        if (!isMounted) return;
        setLogs(prev => {
          // Si ya hay logs (en vivo), los añadimos después de los históricos sin duplicar
          const history = historicalLogs.map(l => ({...l, timestamp: formatTime(l.timestamp)}));
          // Evitamos duplicar logs que ya podrían haber llegado "en vivo" comparando mensaje y timestamp aproximado
          return [...history, ...prev].slice(-300);
        });
      });

      // Suscribirse a logs en vivo
      window.electronAPI.onLog((logData) => {
        if (!isMounted) return;
        
        if (logData.level === 'ERROR' && activeTab !== 'logs') {
          setUnreadErrors(prev => prev + 1);
        }

        const formattedLog = {
          ...logData,
          timestamp: formatTime(logData.timestamp)
        };
        setLogs(prev => [...prev, formattedLog].slice(-300));
      });
    }

    return () => {
      isMounted = false;
      // Idealmente aquí removeríamos el listener, pero onLog en preload.js no devuelve el remover aún
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      setUnreadErrors(0);
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('hiddenServices', JSON.stringify(hiddenServices))
    loadServices()
  }, [hiddenServices])

  // Sistema de actualización inteligente: pausa durante acciones para evitar parpadeos y race conditions
  useEffect(() => {
    if (isMonitoring && processingServices.length === 0) {
      const interval = setInterval(() => loadServices(true), 7000)
      return () => clearInterval(interval)
    }
  }, [isMonitoring, hiddenServices, processingServices.length, loadServices])

  useEffect(() => {
    const handleTabChange = (e) => setActiveTab(e.detail);
    window.addEventListener('change-tab', handleTabChange);
    return () => window.removeEventListener('change-tab', handleTabChange);
  }, []);

  const handleStartService = async (serviceName) => {
    if (window.electronAPI && !processingServices.includes(serviceName)) {
      try {
        setProcessingServices(prev => [...prev, serviceName])
        
        // Identificar tipo para el delay de estabilización
        const service = services.find(s => s.name === serviceName);
        const type = service?.type?.toLowerCase() || '';
        const isHeavy = ['mysql', 'mariadb', 'mongodb', 'postgresql'].includes(type);
        
        // Verificar si el servicio ya está corriendo
        if (service?.status === 'running') {
          console.log(`${serviceName} ya está ejecutándose`);
          setProcessingServices(prev => prev.filter(s => s !== serviceName));
          return;
        }
        
        const result = await window.electronAPI.startService(serviceName);
        
        if (!result.success) {
          console.error('Error starting service:', result.message);
          alert(`Error al iniciar ${serviceName}: ${result.message}`);
          setProcessingServices(prev => prev.filter(s => s !== serviceName));
          return;
        }
        
        // Espera dinámica: DBs necesitan más tiempo para abrir puertos
        const delay = isHeavy ? 4500 : (['apache', 'nginx'].includes(type) ? 2500 : 1500);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        await loadServices();
      } catch (error) {
        console.error('Error starting service:', error);
        alert(`Error al iniciar ${serviceName}: ${error.message || error}`);
      } finally {
        setProcessingServices(prev => prev.filter(s => s !== serviceName))
      }
    }
  }

  const handleStopService = async (serviceName) => {
    if (window.electronAPI && !processingServices.includes(serviceName)) {
      try {
        setProcessingServices(prev => [...prev, serviceName])
        
        const service = services.find(s => s.name === serviceName);
        const type = service?.type?.toLowerCase() || '';
        const isHeavy = ['mysql', 'mariadb', 'mongodb', 'postgresql'].includes(type);
        
        await window.electronAPI.stopService(serviceName)
        
        // El stop suele ser más rápido pero las DBs limpian locks
        const delay = isHeavy ? 2000 : 1200;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        await loadServices()
      } catch (error) {
        console.error('Error stopping service:', error);
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
    // Pasar explícitamente los servicios ocultos actualizados a loadServices
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
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-app-danger px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-app-surface animate-in zoom-in duration-300">
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
              onClick={() => setIsMonitoring(prev => !prev)}
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
                services={services} 
                hiddenServices={hiddenServices}
                processingServices={processingServices}
                isBulkRunning={isBulkRunning}
                loading={loading}
                onToggleVisibility={toggleServiceVisibility}
                onStart={handleStartService} 
                onStop={handleStopService}
                loadServices={loadServices}
                onStartAll={async () => {
                  if (window.electronAPI) {
                    setIsBulkRunning(true)
                    const current = await window.electronAPI.getServices(hiddenServices)
                    setServices(current)
                    const visible = current.filter(s => !hiddenServices.includes(s.name) && s.status !== 'running')
                    await Promise.all(visible.map(s => handleStartService(s.name)))
                    setIsBulkRunning(false)
                  }
                }}
                onStopAll={async () => {
                  if (window.electronAPI) {
                    setIsBulkRunning(true)
                    const current = await window.electronAPI.getServices(hiddenServices)
                    setServices(current)
                    const visible = current.filter(s => !hiddenServices.includes(s.name) && s.status === 'running')
                    await Promise.all(visible.map(s => handleStopService(s.name)))
                    setIsBulkRunning(false)
                  }
                }}
                t={t}
              />
            </div>

            {/* Services Manager View (Installer) */}
            <div className={activeTab === 'install' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-black text-app-text uppercase tracking-tight">Instalar</span>
                <button 
                  onClick={() => window.electronAPI.openAppFolder()}
                  className="flex items-center space-x-2 bg-app-surface px-3 py-1.5 rounded-xl border border-app-border text-[10px] font-black text-app-text shadow-sm hover:bg-app-bg transition-all uppercase tracking-wider"
                >
                  <Folder size={12} />
                  <span>Manual</span>
                </button>
              </div>
              <InstallerView t={t} onInstalled={loadServices} services={services} activeTab={activeTab} />
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
    </div>
  )
}

export default App;
