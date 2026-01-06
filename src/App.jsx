import { useState, useEffect } from 'react'
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

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [services, setServices] = useState([])
  const [config, setConfig] = useState({ language: 'es' })
  const [loading, setLoading] = useState(false)
  const [processingServices, setProcessingServices] = useState([])
  const [hiddenServices, setHiddenServices] = useState(() => {
    const saved = localStorage.getItem('hiddenServices')
    return saved ? JSON.parse(saved) : []
  })

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

  useEffect(() => {
    const interval = setInterval(loadServices, 7000)
    return () => clearInterval(interval)
  }, [hiddenServices])

  const t = translations[config.language] || translations.es
  const loadServices = async () => {
    if (window.electronAPI) {
      setLoading(true)
      try {
        const servicesData = await window.electronAPI.getServices(hiddenServices)
        setServices(servicesData)
      } catch (error) {
        console.error('Error loading services:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleStartService = async (serviceName) => {
    if (window.electronAPI) {
      try {
        setProcessingServices(prev => [...prev, serviceName])
        console.log('Starting service:', serviceName);
        await window.electronAPI.startService(serviceName);
        // Esperar un tiempo prudencial para que el proceso se asiente antes de permitir refrescos
        await new Promise(resolve => setTimeout(resolve, 2500));
        await loadServices();
      } catch (error) {
        console.error('Error starting service:', error);
      } finally {
        setProcessingServices(prev => prev.filter(s => s !== serviceName))
      }
    }
  }

  const handleStopService = async (serviceName) => {
    if (window.electronAPI) {
      try {
        setProcessingServices(prev => [...prev, serviceName])
        await window.electronAPI.stopService(serviceName)
        // Esperar un tiempo prudencial para el cierre limpio
        await new Promise(resolve => setTimeout(resolve, 1500));
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
    { id: 'dashboard', label: t.dashboard, icon: Activity },
    { id: 'tools', label: t.tools, icon: Wrench },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ]

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Server size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">MyLaragon</h2>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} className={activeTab === item.id ? 'text-white' : 'group-hover:text-white'} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>{t.globalStatus}</span>
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <p className="text-sm font-semibold">Laragon Online</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">{t[activeTab]}</h1>
            <div className="h-4 w-px bg-slate-200 mx-2"></div>
            <span className="text-slate-400 text-sm font-medium">{t.panelControl}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={loadServices}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title={t.refresh}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <Services 
                services={services} 
                hiddenServices={hiddenServices}
                processingServices={processingServices}
                onToggleVisibility={toggleServiceVisibility}
                onStart={handleStartService} 
                onStop={handleStopService} 
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

function Services({ services, hiddenServices, processingServices = [], onToggleVisibility, onStart, onStop, t }) {
  const [showHidden, setShowHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  
  const visibleServices = services.filter(s => !hiddenServices.includes(s.name))
  const hiddenList = services.filter(s => hiddenServices.includes(s.name))

  const getServiceIcon = (type) => {
    const iconProps = { size: 24 };
    switch (type?.toLowerCase()) {
      case 'apache':
      case 'nginx':
        return <Globe {...iconProps} />;
      case 'mysql':
      case 'mariadb':
      case 'mongodb':
        return <Database {...iconProps} />;
      case 'redis':
        return <Zap {...iconProps} />;
      case 'mailpit':
        return <Mail {...iconProps} />;
      case 'memcached':
        return <Wind {...iconProps} />;
      default:
        return <Server {...iconProps} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end space-x-3 mb-6">
        <button 
          onClick={() => window.electronAPI.openLaragonFolder()}
          className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
          title={t.laragonRoot}
        >
          <Folder size={16} />
          <span>Laragon</span>
        </button>
        <button 
          onClick={() => window.electronAPI.openDocumentRoot()}
          className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
          title={t.projectsRoot}
        >
          <ExternalLink size={16} />
          <span>WWW</span>
        </button>
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
          <Activity size={12} className="text-green-500" />
          <span>{services.filter(s => s.status === 'running').length}/{services.length} {t.activeServices}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
        {visibleServices.map(service => {
          const isProcessing = processingServices.includes(service.name);
          return (
            <div key={service.name} className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative flex flex-col h-full">
              <button 
                onClick={() => setMenuOpen(menuOpen === service.name ? null : service.name)}
                className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all z-20 ${
                  menuOpen === service.name 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50 opacity-0 group-hover:opacity-100'
                }`}
                title={t.configurations}
              >
                <MoreVertical size={14} />
              </button>

              {menuOpen === service.name && (
                <>
                  {/* Backdrop para cerrar menu */}
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(null)}></div>
                  
                  {/* Dropdown Menu Real */}
                  <div className="absolute top-12 right-3 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="px-3 py-1.5 mb-1 border-b border-slate-50">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.configurations}</span>
                    </div>
                    
                    {service.configs?.map((conf, idx) => (
                      <button 
                        key={idx}
                        onClick={() => { window.electronAPI.openConfigFile(conf); setMenuOpen(null); }} 
                        className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2 transition-colors font-medium"
                      >
                        {conf.type === 'folder' ? <Folder size={14} /> : <Code size={14} />}
                        <span>{t[conf.label] || conf.label}</span>
                      </button>
                    ))}

                    <div className="h-px bg-slate-100 my-1"></div>
                    
                    <button 
                      onClick={() => { onToggleVisibility(service.name); setMenuOpen(null); }} 
                      className="w-full text-left px-4 py-2 text-xs text-rose-500 hover:bg-rose-50 flex items-center space-x-2 transition-colors font-medium"
                    >
                      <EyeOff size={14} />
                      <span>{t.hideService}</span>
                    </button>
                  </div>
                </>
              )}

              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2.5 rounded-xl transition-all duration-500 ${
                  isProcessing 
                    ? 'bg-blue-50 text-blue-500 animate-pulse'
                    : service.status === 'running' 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-slate-50 text-slate-400'
                }`}>
                  {getServiceIcon(service.type)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-base font-black text-slate-800 tracking-tight truncate">{service.name}</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      isProcessing 
                        ? 'bg-blue-400 animate-bounce' 
                        : service.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                    }`}></span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {isProcessing ? t.processing : service.status === 'running' ? t.online : t.offline}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50/50 rounded-xl p-3 flex flex-col justify-center space-y-2.5 border border-slate-100/50 mb-3 flex-grow">
                {isProcessing ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                    <RefreshCw size={16} className="text-blue-500 animate-spin" />
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{t.syncing}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${service.portInUse ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{t.portShort} {service.port || '---'}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${service.portInUse ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                        {service.portInUse ? 'ACTIVE' : 'IDLE'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${service.processRunning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider truncate max-w-[100px]">{service.processName || t.process}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${service.processRunning ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                        {service.processRunning ? 'RUNNING' : 'STOPPED'}
                      </span>
                    </div>

                    {service.status === 'port_occupied_by_other' && (
                      <div className="flex items-center justify-center space-x-2 bg-rose-50 p-1.5 rounded-lg border border-rose-100 animate-pulse mt-0.5">
                        <Activity size={12} className="text-rose-600" />
                        <span className="text-[9px] font-black text-rose-600 uppercase tracking-tight">{t.statusWarning}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {service.name === 'Mailpit' && service.status === 'running' && !isProcessing && (
                <button
                  onClick={() => window.electronAPI.openInBrowser('http://localhost:8025')}
                  className="w-full py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg text-[9px] font-black border border-purple-100 transition-all flex items-center justify-center space-x-2 uppercase mb-2 animate-in fade-in zoom-in-95 duration-200"
                >
                  <ExternalLink size={10} />
                  <span>{t.openMail}</span>
                </button>
              )}

              {service.type === 'apache' && service.status === 'running' && !isProcessing && (
                <button
                  onClick={() => window.electronAPI.openInBrowser('http://localhost')}
                  className="w-full py-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg text-[9px] font-black border border-green-100 transition-all flex items-center justify-center space-x-2 uppercase mb-2 animate-in fade-in zoom-in-95 duration-200"
                >
                  <Globe size={10} />
                  <span>{t.openWeb}</span>
                </button>
              )}

              {service.type === 'mysql' && service.status === 'running' && !isProcessing && (
                <button
                  onClick={() => window.electronAPI.openDbTool()}
                  className="w-full py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg text-[9px] font-black border border-orange-100 transition-all flex items-center justify-center space-x-2 uppercase mb-2 animate-in fade-in zoom-in-95 duration-200"
                >
                  <Database size={10} />
                  <span>{t.openDb}</span>
                </button>
              )}
              
              <button
                disabled={isProcessing}
                onClick={() => {
                  if (service.status === 'running') {
                    onStop(service.name);
                  } else {
                    onStart(service.name);
                  }
                }}
                className={`w-full py-2.5 rounded-xl font-black flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95 border-b-2 mt-auto ${
                  isProcessing 
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed translate-y-0.5 border-b-0'
                    : service.status === 'running'
                      ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-700'
                      : 'bg-blue-600 text-white border-blue-800 hover:bg-blue-700 shadow-md shadow-blue-100'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span className="text-[10px] tracking-widest uppercase">{t.wait}</span>
                  </>
                ) : service.status === 'running' ? (
                  <>
                    <Square size={14} fill="currentColor" />
                    <span className="text-xs">STOP</span>
                  </>
                ) : (
                  <>
                    <Play size={14} fill="currentColor" />
                    <span className="text-xs">START</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {visibleServices.length === 0 && hiddenList.length > 0 && (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">{t.allHidden}</p>
        </div>
      )}

      {hiddenList.length > 0 && (
        <div className="mt-12">
          <button 
            onClick={() => setShowHidden(!showHidden)}
            className="flex items-center space-x-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors w-full group"
          >
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="px-4 flex items-center bg-slate-50 rounded-full py-1 border border-slate-200 group-hover:border-slate-300">
              {showHidden ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
              {hiddenList.length} {t.hiddenServices}
            </span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </button>

          {showHidden && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {hiddenList.map(service => (
                <div key={service.name} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${service.status === 'running' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <span className="font-bold text-slate-700 text-sm">{service.name}</span>
                  </div>
                  <button 
                    onClick={() => onToggleVisibility(service.name)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t.showService}
                  >
                    <Eye size={16} />
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
      desc: t.terminalDesc, 
      icon: Terminal, 
      color: 'bg-slate-900', 
      onClick: () => window.electronAPI.openTerminal() 
    },
    { 
      id: 'hosts', 
      name: t.hostsEditor, 
      desc: t.hostsDesc, 
      icon: FileText, 
      color: 'bg-blue-600', 
      onClick: () => window.electronAPI.openHosts() 
    },
    { 
      id: 'env', 
      name: t.envVars, 
      desc: t.envVarsDesc, 
      icon: Cpu, 
      color: 'bg-emerald-600', 
      onClick: () => window.electronAPI.openEnvVars() 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{t.tools}</h2>
        <p className="text-slate-500 text-sm">{t.toolsDesc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={tool.onClick}
            className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all text-left overflow-hidden"
          >
            <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <tool.icon size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">{tool.name}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
            
            <div className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-500 transition-colors">
              <ChevronRight size={20} />
            </div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center mt-8">
        <h3 className="text-blue-800 font-bold mb-2">{t.needMore}</h3>
        <p className="text-blue-600/70 text-sm mb-4">{t.workingMore}</p>
        <button 
          onClick={() => window.electronAPI.openInBrowser('https://github.com/leandromaro/MyLaragon/issues')}
          className="text-blue-700 font-bold text-sm hover:underline"
        >
          {t.suggestFunc} →
        </button>
      </div>
    </div>
  )
}

function Settings({ config, setConfig, t, availableLanguages }) {
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = async () => {
    if (window.electronAPI) {
      await window.electronAPI.setConfig(localConfig);
      const updatedConfig = await window.electronAPI.getConfig();
      setConfig(updatedConfig);
      alert(t.saveSuccess);
    }
  };

  const handleSelectDir = async (key) => {
    const path = await window.electronAPI.selectDirectory();
    if (path) {
      setLocalConfig({ ...localConfig, [key]: path });
    }
  };

  const editors = [
    { id: 'notepad', label: t.editorDefault },
    { id: 'code', label: t.editorVSCode },
    { id: 'notepad++', label: t.editorNpp },
    { id: 'default', label: t.editorSystem }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{t.settings}</h2>
        <p className="text-slate-500 text-sm">{t.globalSettings}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{t.language}</h3>
              <p className="text-xs text-slate-400">Selecciona el idioma de la interfaz (Auto-detectado)</p>
            </div>
            <div className="relative group w-64">
              <select 
                value={localConfig.language}
                onChange={(e) => setLocalConfig({...localConfig, language: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {availableLanguages.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t.systemPaths}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.laragonDir}</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={localConfig.laragonPath || ''} 
                  onChange={(e) => setLocalConfig({...localConfig, laragonPath: e.target.value})}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  onClick={() => handleSelectDir('laragonPath')}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all"
                >
                  <Folder size={18} />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.projectsDir}</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={localConfig.projectsPath || ''} 
                  onChange={(e) => setLocalConfig({...localConfig, projectsPath: e.target.value})}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  onClick={() => handleSelectDir('projectsPath')}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all"
                >
                   <Folder size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t.fileEditor}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editors.map(editor => (
              <button
                key={editor.id}
                onClick={() => setLocalConfig({...localConfig, editor: editor.id})}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  localConfig.editor === editor.id 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Code size={18} className={localConfig.editor === editor.id ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="text-sm font-bold">{editor.label}</span>
                </div>
                {localConfig.editor === editor.id && (
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t.preferences}</h3>
          <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-slate-800 font-bold">{t.autoStart}</p>
              <p className="text-xs text-slate-400">{t.autoStartDesc}</p>
            </div>
            <button 
              onClick={() => setLocalConfig({...localConfig, autoStart: !localConfig.autoStart})}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 focus:outline-none shadow-inner ${
                localConfig.autoStart ? 'bg-blue-600 shadow-blue-900/20' : 'bg-slate-200'
              }`}
            >
              <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                localConfig.autoStart ? 'translate-x-7' : 'translate-x-0'
              }`}>
                <div className={`w-1 h-1 rounded-full ${localConfig.autoStart ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button 
          onClick={() => setLocalConfig(config)}
          className="px-6 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all"
        >
          {t.discard}
        </button>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
        >
          {t.saveChanges}
        </button>
      </div>
    </div>
  )
}

export default App
