import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Activity, 
  Folder, 
  Settings as SettingsIcon, 
  Wrench, 
  Play, 
  Square, 
  ExternalLink, 
  Code,
  RefreshCw,
  Server,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Database,
  Globe,
  Mail,
  Wind,
  Zap,
  MoreVertical,
  Terminal,
  SquareTerminal,
  FileText,
  Cpu
} from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState('dashboard')
  const [services, setServices] = useState([])
  const [config, setConfig] = useState({ language: 'es', theme: 'system' })
  const [loading, setLoading] = useState(false)
  const [processingServices, setProcessingServices] = useState([])
  const [isBulkRunning, setIsBulkRunning] = useState(false)
  const [hiddenServices, setHiddenServices] = useState(() => {
    const saved = localStorage.getItem('hiddenServices')
    return saved ? JSON.parse(saved) : []
  })

  const t = translations[config.language] || translations.es

  const refreshingRef = useRef(false);
  const loadServices = useCallback(async (isSilent = false) => {
    // Si viene de un evento de React o similar, isSilent no será estrictamente true
    const silent = isSilent === true;
    
    if (window.electronAPI && !refreshingRef.current) {
      refreshingRef.current = true;
      if (!silent) setLoading(true)
      try {
        const servicesData = await window.electronAPI.getServices(hiddenServices)
        // Solo actualizamos si no hay acciones en curso que puedan ser invalidadas
        setServices(servicesData)
      } catch (error) {
        console.error('Error loading services:', error)
      } finally {
        if (!silent) setLoading(false)
        refreshingRef.current = false;
      }
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
    localStorage.setItem('hiddenServices', JSON.stringify(hiddenServices))
    loadServices()
  }, [hiddenServices])

  // Sistema de actualización inteligente: pausa durante acciones para evitar parpadeos y race conditions
  useEffect(() => {
    if (processingServices.length === 0) {
      const interval = setInterval(() => loadServices(true), 7000)
      return () => clearInterval(interval)
    }
  }, [hiddenServices, processingServices.length, loadServices])

  const handleStartService = async (serviceName) => {
    if (window.electronAPI && !processingServices.includes(serviceName)) {
      try {
        setProcessingServices(prev => [...prev, serviceName])
        
        // Identificar tipo para el delay de estabilización
        const service = services.find(s => s.name === serviceName);
        const type = service?.type?.toLowerCase() || '';
        const isHeavy = ['mysql', 'mariadb', 'mongodb', 'postgresql'].includes(type);
        
        await window.electronAPI.startService(serviceName);
        
        // Espera dinámica: DBs necesitan más tiempo para abrir puertos
        const delay = isHeavy ? 4500 : (['apache', 'nginx'].includes(type) ? 2500 : 1500);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        await loadServices();
      } catch (error) {
        console.error('Error starting service:', error);
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
    setHiddenServices(prev => 
      prev.includes(serviceName) 
        ? prev.filter(s => s !== serviceName) 
        : [...prev, serviceName]
    );
  }

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: Zap },
    { id: 'tools', label: t.tools, icon: Wrench },
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
          <h2 className="text-lg font-black tracking-tight uppercase">{t.appName || 'MyLaragon'}</h2>
        </div>
        
        <nav className="flex-1 mt-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                  activeTab === item.id 
                    ? 'bg-app-primary text-app-primary-text shadow-lg shadow-app-primary/20' 
                    : 'text-app-text-muted hover:bg-app-bg hover:text-app-text'
                }`}
              >
                <Icon size={18} />
                <span className="font-bold uppercase tracking-wider text-xs">{item.label}</span>
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
            <p className="text-xs font-bold truncate">Laragon Online</p>
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
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dashboard' && (
              <Services 
                services={services} 
                hiddenServices={hiddenServices}
                processingServices={processingServices}
                isBulkRunning={isBulkRunning}
                loading={loading}
                onToggleVisibility={toggleServiceVisibility}
                onStart={handleStartService} 
                onStop={handleStopService}
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
            )}
            {activeTab === 'tools' && <Tools t={t} />}
            {activeTab === 'settings' && (
              <Settings 
                config={config} 
                setConfig={setConfig} 
                t={t} 
                availableLanguages={availableLanguages} 
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Services({ services, hiddenServices, processingServices = [], isBulkRunning, loading, onToggleVisibility, onStart, onStop, onStartAll, onStopAll, t }) {
  const [showHidden, setShowHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)

  // Helper function to shorten long version strings for the UI
  // (e.g. httpd-2.4.62-240904-win... -> 2.4.62)
  const formatVersion = (v) => {
    if (!v) return '';
    // Normalize and remove common prefixes
    let clean = v.replace(/^(httpd|php|mysql|mariadb|nginx|redis|postgres|mongodb|memcached)-/i, '');
    // Regex to match the version number x.x.x
    const match = clean.match(/^\d+\.\d+(\.\d+)?/);
    if (match) return match[0];
    // Fallback: take the first segment before any dash
    return clean.split('-')[0];
  };
  
  const visibleServices = services.filter(s => !hiddenServices.includes(s.name))
  const hiddenList = services.filter(s => hiddenServices.includes(s.name))
  
  const canStartAll = visibleServices.some(s => s.status !== 'running')
  const canStopAll = visibleServices.some(s => s.status === 'running')

  const getServiceIcon = (type) => {
    const iconProps = { size: 18 };
    switch (type?.toLowerCase()) {
      case 'apache':
      case 'nginx': return <Globe {...iconProps} />;
      case 'mysql':
      case 'mariadb':
      case 'mongodb': return <Database {...iconProps} />;
      case 'redis': return <Zap {...iconProps} />;
      case 'mailpit': return <Mail {...iconProps} />;
      case 'memcached': return <Wind {...iconProps} />;
      default: return <Server {...iconProps} />;
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onStartAll}
            disabled={!canStartAll || isBulkRunning}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-wider transition-all shadow-sm ${
              !canStartAll || isBulkRunning
                ? 'bg-app-bg text-app-text-muted border-app-border cursor-not-allowed opacity-50'
                : 'bg-app-success/10 text-app-success border-app-success/30 hover:bg-app-success hover:text-white'
            }`}
          >
            {isBulkRunning ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
            <span>{t.startAll}</span>
          </button>
          <button 
            onClick={onStopAll}
            disabled={!canStopAll || isBulkRunning}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-wider transition-all shadow-sm ${
              !canStopAll || isBulkRunning
                ? 'bg-app-bg text-app-text-muted border-app-border cursor-not-allowed opacity-50'
                : 'bg-app-danger/10 text-app-danger border-app-danger/30 hover:bg-app-danger hover:text-white'
            }`}
          >
            {isBulkRunning ? <RefreshCw size={12} className="animate-spin" /> : <Square size={12} fill="currentColor" />}
            <span>{t.stopAll}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => window.electronAPI.openLaragonFolder()}
            className="flex items-center space-x-2 bg-app-surface px-3 py-1.5 rounded-xl border border-app-border text-[10px] font-black text-app-text shadow-sm hover:bg-app-bg transition-all uppercase tracking-wider"
          >
            <Folder size={12} />
            <span>Laragon</span>
          </button>
          <button 
            onClick={() => window.electronAPI.openDocumentRoot()}
            className="flex items-center space-x-2 bg-app-surface px-3 py-1.5 rounded-xl border border-app-border text-[10px] font-black text-app-text shadow-sm hover:bg-app-bg transition-all uppercase tracking-wider"
          >
            <ExternalLink size={12} />
            <span>WWW</span>
          </button>
          <div className="flex items-center space-x-2 bg-app-surface px-2.5 py-1.5 rounded-xl border border-app-border text-[10px] font-black text-app-text shadow-sm uppercase tracking-widest">
            <Activity size={10} className="text-app-success" />
            <span>{services.filter(s => s.status === 'running').length}/{services.length} {t.activeServices}</span>
          </div>
        </div>
      </div>
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleServices.map(service => {
          const isProcessing = processingServices.includes(service.name);
          const isRunning = service.status === 'running';
          
          return (
            <div key={service.name} className={`group rounded-2xl shadow-sm border p-4 transition-all duration-300 relative flex flex-col h-full ${
              isRunning 
                ? 'bg-app-surface border-app-success/50 shadow-[0_8px_30px_rgba(16,185,129,0.1)] ring-1 ring-app-success/20' 
                : 'bg-app-surface/80 border-app-border hover:shadow-lg hover:border-app-primary/30'
            }`}>
              <button 
                onClick={() => setMenuOpen(menuOpen === service.name ? null : service.name)}
                className={`absolute top-3 right-3 p-1 rounded-lg transition-all z-20 ${
                  menuOpen === service.name 
                    ? 'bg-app-text text-app-bg shadow-lg' 
                    : 'text-app-text-muted hover:text-app-text hover:bg-app-bg opacity-0 group-hover:opacity-100'
                }`}
              >
                <MoreVertical size={14} />
              </button>

              {menuOpen === service.name && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(null)}></div>
                  <div className="absolute top-10 right-3 w-44 bg-app-surface border border-app-border rounded-xl shadow-2xl z-40 py-1.5 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="px-3 py-1 mb-1 border-b border-app-border">
                      <span className="text-[10px] font-black text-app-text-muted uppercase tracking-wider">{t.configurations}</span>
                    </div>
                    {service.configs?.map((conf, idx) => (
                      <button 
                        key={idx}
                        onClick={() => { window.electronAPI.openConfigFile(conf); setMenuOpen(null); }} 
                        className="w-full text-left px-3 py-1.5 text-xs text-app-text hover:bg-app-primary/10 hover:text-app-primary flex items-center space-x-2 transition-colors font-bold"
                      >
                        {conf.type === 'folder' ? <Folder size={12} /> : <Code size={12} />}
                        <span className="truncate">{t[conf.label] || conf.label}</span>
                      </button>
                    ))}
                    <div className="h-px bg-app-border my-1"></div>
                    <button 
                      onClick={() => { onToggleVisibility(service.name); setMenuOpen(null); }} 
                      className="w-full text-left px-3 py-1.5 text-xs text-app-danger hover:bg-app-danger/10 flex items-center space-x-2 transition-colors font-bold"
                    >
                      <EyeOff size={12} />
                      <span>{t.hideService}</span>
                    </button>
                  </div>
                </>
              )}

              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-xl transition-all duration-500 shrink-0 ${
                  isProcessing 
                    ? 'bg-app-primary/10 text-app-primary animate-pulse'
                    : isRunning 
                      ? 'bg-app-success text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] rotate-3' 
                      : 'bg-app-bg text-app-text-muted border border-app-border'
                }`}>
                  {getServiceIcon(service.type)}
                </div>
                <div className="overflow-hidden flex-1">
                  <h3 className={`text-base font-black tracking-tight truncate uppercase italic transition-colors ${isRunning ? 'text-app-success' : 'text-app-text'}`}>{service.name}</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className={`rounded-full transition-all duration-500 ${
                      isProcessing 
                        ? 'h-2 w-2 bg-app-primary animate-bounce' 
                        : isRunning 
                          ? 'h-2.5 w-2.5 bg-app-success animate-pulse shadow-[0_0_8px_var(--app-success)]' 
                          : 'h-2 w-2 bg-app-text-muted'
                    }`}></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isRunning ? 'text-app-success/80' : 'text-app-text-muted'}`}>
                      {isProcessing ? t.processing : isRunning ? t.online : t.offline}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-2.5 flex flex-col justify-center space-y-2 border mb-3 grow transition-all duration-500 ${
                isRunning ? 'bg-app-success/5 border-app-success/20' : 'bg-app-bg/50 border-app-border'
              }`}>
                {isProcessing ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-1 py-2">
                    <RefreshCw size={14} className="text-app-primary animate-spin" />
                    <span className="text-[9px] font-black text-app-primary uppercase tracking-widest">{t.syncing}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-app-text-muted/30"></div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isRunning ? 'text-app-success/70' : 'text-app-text-muted'}`}>Version</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-lg bg-app-bg text-app-text-muted border border-app-border uppercase tracking-widest">
                          {formatVersion(service.version) || '---'}
                        </span>
                        {service.phpVersion && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-lg bg-app-primary/10 text-app-primary border border-app-primary/20 uppercase tracking-widest">
                            PHP {formatVersion(service.phpVersion)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${service.portInUse ? 'bg-app-success shadow-[0_0_8px_var(--app-success)]' : 'bg-app-text-muted'}`}></div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isRunning ? 'text-app-success/70' : 'text-app-text-muted'}`}>{t.portShort} {service.port || '---'}</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-widest transition-all ${service.portInUse ? 'bg-app-success text-white shadow-sm' : 'bg-app-bg text-app-text-muted border border-app-border'}`}>
                        {service.portInUse ? (t.active || 'ACTIVE') : (t.idle || 'IDLE')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${service.processRunning ? 'bg-app-success shadow-[0_0_8px_var(--app-success)]' : 'bg-app-text-muted'}`}></div>
                        <span className={`text-[9px] font-black uppercase tracking-widest truncate max-w-20 ${isRunning ? 'text-app-success/70' : 'text-app-text-muted'}`}>{service.processName || t.process}</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-widest transition-all ${service.processRunning ? 'bg-app-success text-white shadow-sm' : 'bg-app-bg text-app-text-muted border border-app-border'}`}>
                        {service.processRunning ? (t.running || 'RUNNING') : (t.stopped || 'STOPPED')}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="h-8 mb-3 flex items-center">
                {service.name === 'Mailpit' && isRunning && !isProcessing && (
                  <button onClick={() => window.electronAPI.openInBrowser('http://localhost:8025')} className="w-full py-1.5 bg-app-primary/10 text-app-primary hover:bg-app-primary hover:text-white rounded-lg text-[10px] font-black border border-app-primary/20 transition-all flex items-center justify-center space-x-2 uppercase tracking-widest animate-in fade-in zoom-in-95 duration-200">
                    <ExternalLink size={10} /><span>{t.openMail}</span>
                  </button>
                )}
                {service.type === 'apache' && isRunning && !isProcessing && (
                  <button onClick={() => window.electronAPI.openInBrowser('http://localhost')} className="w-full py-1.5 bg-app-success/10 text-app-success hover:bg-app-success hover:text-white rounded-lg text-[10px] font-black border border-app-success/20 transition-all flex items-center justify-center space-x-2 uppercase tracking-widest animate-in fade-in zoom-in-95 duration-200">
                    <Globe size={10} /><span>{t.openWeb}</span>
                  </button>
                )}
                {service.type === 'mysql' && isRunning && !isProcessing && (
                  <button onClick={() => window.electronAPI.openDbTool()} className="w-full py-1.5 bg-app-warning/10 text-app-warning hover:bg-app-warning hover:text-white rounded-lg text-[10px] font-black border border-app-warning/20 transition-all flex items-center justify-center space-x-2 uppercase tracking-widest animate-in fade-in zoom-in-95 duration-200">
                    <Database size={10} /><span>{t.openDb}</span>
                  </button>
                )}
              </div>
              
              <button
                disabled={isProcessing}
                onClick={() => service.status === 'running' ? onStop(service.name) : onStart(service.name)}
                className={`w-full py-2 rounded-xl font-black flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95 border-b-2 mt-auto uppercase tracking-widest text-xs ${
                  isProcessing
                    ? 'bg-app-bg text-app-text-muted border-app-border cursor-not-allowed translate-y-1 border-b-0 opacity-60'
                    : service.status === 'running'
                      ? 'bg-app-danger/10 text-app-danger border-app-danger/30 hover:bg-app-danger hover:text-white hover:border-app-danger'
                      : 'bg-app-primary text-white border-app-primary/50 hover:bg-app-primary/90 shadow-lg shadow-app-primary/10'
                }`}
              >
                {isProcessing ? (
                  <><RefreshCw size={14} className="animate-spin" /><span>{t.wait}</span></>
                ) : service.status === 'running' ? (
                  <><Square size={14} fill="currentColor" /><span>{t.stop}</span></>
                ) : (
                  <><Play size={14} fill="currentColor" /><span>{t.start}</span></>
                )}
              </button>
            </div>
          )
        })}
      </div>

     

      {hiddenList.length > 0 && (
        <div className="mt-8 bg-app-surface/50 border border-app-border/50 rounded-2xl p-4">
          <button 
            onClick={() => setShowHidden(!showHidden)}
            className="flex items-center space-x-2 text-app-text-muted hover:text-app-text transition-all font-black uppercase tracking-widest text-[10px]"
          >
            {showHidden ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span>{t.hiddenServices} ({hiddenList.length})</span>
          </button>
          
          {showHidden && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {hiddenList.map(service => (
                <div key={service.name} className="bg-app-surface border border-app-border rounded-xl p-2.5 flex items-center justify-between hover:border-app-primary/50 transition-all">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <div className="text-app-text-muted shrink-0">{getServiceIcon(service.type)}</div>
                    <span className="text-[10px] font-black text-app-text truncate uppercase">{service.name}</span>
                  </div>
                  <button 
                    onClick={() => onToggleVisibility(service.name)}
                    className="p-1.5 hover:bg-app-primary/10 hover:text-app-primary text-app-text-muted rounded-lg transition-all"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Tools({ t }) {
  const tools = [
    {
      id: 'terminal',
      name: t.terminal,
      desc: t.terminalDesc || 'Open terminal in Laragon root.',
      icon: Terminal,
      color: 'bg-[#1e1e1e] border border-white/10',
      iconColor: 'text-app-success',
      onClick: () => window.electronAPI.openTerminal()
    },
    {
      id: 'hosts',
      name: t.hostsEditor || 'Hosts Editor',
      desc: t.hostsDesc || 'Edit system hosts file.',
      icon: FileText,
      color: 'bg-app-primary',
      iconColor: 'text-white',
      onClick: () => window.electronAPI.openHosts()
    },
    {
      id: 'env',
      name: t.envVars,
      desc: t.envVarsDesc || 'Configure system environment variables.',
      icon: Cpu,
      color: 'bg-app-success',
      iconColor: 'text-white',
      onClick: () => window.electronAPI.openEnvVars()
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={tool.onClick}
            className="group relative bg-app-surface rounded-2xl p-5 border border-app-border shadow-sm hover:shadow-xl hover:border-app-primary/50 transition-all duration-500 text-left overflow-hidden"
          >
            <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center ${tool.iconColor} mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
              <tool.icon size={20} />
            </div>
            <h3 className="text-sm font-black text-app-text mb-1 uppercase tracking-tight">{tool.name}</h3>
            <p className="text-[10px] text-app-text-muted leading-relaxed font-bold uppercase tracking-tight opacity-70">{tool.desc}</p>
            
            <div className="absolute top-4 right-4 text-app-text-muted group-hover:text-app-primary transition-colors">
              <ChevronRight size={18} />
            </div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-app-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </button>
        ))}
      </div>

      <div className="bg-app-primary/5 border border-app-primary/10 rounded-2xl p-6 text-center mt-6 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-app-primary text-sm font-black mb-1 uppercase tracking-tight">{t.needMore}</h3>
          <p className="text-[10px] font-bold text-app-text-muted mb-4 uppercase tracking-widest">{t.workingMore}</p>
          <button 
            onClick={() => window.electronAPI.openInBrowser('https://github.com/msoler75/MyLaragon/issues')}
            className="bg-app-primary text-app-primary-text px-6 py-2 rounded-xl font-black text-[10px] hover:scale-110 transform transition-all uppercase tracking-[0.2em] shadow-lg shadow-app-primary/20"
          >
            {t.suggestFunc} 
          </button>
        </div>
        <Zap className="absolute -left-8 -top-8 text-app-primary/5 w-40 h-40 -rotate-12" />
      </div>
    </div>
  )
}

function Settings({ config, setConfig, t, availableLanguages }) {
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(config);

  const handleSave = async () => {
    if (window.electronAPI) {
      await window.electronAPI.setConfig(localConfig);
      const updatedConfig = await window.electronAPI.getConfig();
      setConfig(updatedConfig);
    }
  };

  const handleSelectDir = async (key) => {
    const path = await window.electronAPI.selectDirectory();
    if (path) {
      setLocalConfig({ ...localConfig, [key]: path });
    }
  };

  const themesList = [
    { id: 'system', label: t.themeSystem },
    { id: 'light', label: t.themeLight },
    { id: 'dark', label: t.themeDark },
    { id: 'sepia', label: t.themeSepia }
  ];

  const editors = [
    { id: 'notepad', label: t.editorDefault },
    { id: 'code', label: t.editorVSCode },
    { id: 'notepad++', label: t.editorNpp },
    { id: 'default', label: t.editorSystem }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-app-surface rounded-2xl shadow-sm border border-app-border divide-y divide-app-border overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-3 px-1">{t.language}</h3>
              <div className="relative">
                <select 
                  value={localConfig.language}
                  onChange={(e) => setLocalConfig({...localConfig, language: e.target.value})}
                  className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-xs font-bold text-app-text outline-none focus:ring-2 focus:ring-app-primary/20 transition-all appearance-none cursor-pointer"
                >
                  {availableLanguages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-app-text-muted pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-3 px-1">{t.theme}</h3>
              <div className="relative">
                <select 
                  value={localConfig.theme}
                  onChange={(e) => setLocalConfig({...localConfig, theme: e.target.value})}
                  className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-xs font-bold text-app-text outline-none focus:ring-2 focus:ring-app-primary/20 transition-all appearance-none cursor-pointer"
                >
                  {themesList.map(theme => (
                    <option key={theme.id} value={theme.id}>{theme.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-app-text-muted pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-app-bg/10">
          <h3 className="text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-4 px-1">{t.systemPaths}</h3>
          <div className="space-y-4">
            <div className="group">
              <label className="block text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-1.5 px-1">{t.laragonDir}</label>
              <div className="flex items-center space-x-2">
                <input type="text" value={localConfig.laragonPath || ''} readOnly className="flex-1 bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-xs font-bold text-app-text-muted/70 outline-none" />
                <button onClick={() => handleSelectDir('laragonPath')} className="p-2.5 bg-app-surface border border-app-border rounded-xl text-app-text hover:bg-app-primary hover:text-white transition-all">
                  <Folder size={18} />
                </button>
              </div>
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-1.5 px-1">{t.projectsDir}</label>
              <div className="flex items-center space-x-2">
                <input type="text" value={localConfig.projectsPath || ''} readOnly className="flex-1 bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-xs font-bold text-app-text-muted/70 outline-none" />
                <button onClick={() => handleSelectDir('projectsPath')} className="p-2.5 bg-app-surface border border-app-border rounded-xl text-app-text hover:bg-app-primary hover:text-white transition-all">
                  <Folder size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-4 px-1">{t.fileEditor}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {editors.map(editor => (
              <button
                key={editor.id}
                onClick={() => setLocalConfig({...localConfig, editor: editor.id})}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                  localConfig.editor === editor.id 
                    ? 'border-app-primary bg-app-primary/5 text-app-primary scale-105 shadow-md shadow-app-primary/5' 
                    : 'border-app-border hover:border-app-text-muted text-app-text-muted bg-app-bg/30'
                }`}
              >
                <Code size={20} className="mb-2" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{editor.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-app-bg/10">
          <div className="flex items-center justify-between bg-app-surface p-4 rounded-2xl border border-app-border shadow-sm">
            <div>
              <p className="text-sm font-black text-app-text uppercase italic tracking-tight">{t.autoStart}</p>
              <p className="text-[10px] font-bold text-app-text-muted">{t.autoStartDesc}</p>
            </div>
            <button 
              onClick={() => setLocalConfig({...localConfig, autoStart: !localConfig.autoStart})}
              className={`w-12 h-6 rounded-full transition-all duration-500 relative border-2 ${
                localConfig.autoStart ? 'bg-app-primary/10 border-app-primary/40' : 'bg-app-bg border-app-border'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-500 shadow-sm ${
                localConfig.autoStart ? 'left-6.5 bg-app-primary' : 'left-0.5 bg-app-text-muted/50'
              }`}></div>
            </button>
          </div>
        </div>

        <div className="p-6 flex justify-between items-center bg-app-surface">
          <button 
            onClick={() => setLocalConfig(config)} 
            disabled={!hasChanges}
            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${!hasChanges ? 'text-app-text-muted/30 cursor-not-allowed' : 'text-app-text-muted hover:text-app-text'}`}
          >
            {t.discard}
          </button>
          <button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className={`px-8 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest ${
              !hasChanges 
                ? 'bg-app-bg text-app-text-muted/50 border border-app-border cursor-not-allowed opacity-60' 
                : 'bg-app-primary text-app-primary-text shadow-lg shadow-app-primary/20 hover:scale-105 active:scale-95'
            }`}
          >
            {t.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
