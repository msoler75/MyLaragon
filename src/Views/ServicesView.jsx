import React, { useState } from 'react';
import { 
  Zap, 
  Globe, 
  Database, 
  Mail, 
  Wind, 
  Server, 
  Play, 
  Square, 
  RefreshCw, 
  Folder, 
  ExternalLink, 
  Activity, 
  MoreVertical, 
  Layers, 
  ChevronRight, 
  ChevronLeft, 
  EyeOff, 
  Eye, 
  ChevronUp, 
  ChevronDown, 
  AlertCircle,
  FileText,
  Code,
  CheckCircle
} from 'lucide-react';

function ServicesView({ services, hiddenServices, processingServices = [], isBulkRunning, loading, onToggleVisibility, onStart, onStop, onStartAll, onStopAll, t, loadServices }) {
  const [showHidden, setShowHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null); // 'version' or 'php'

  // Helper function to shorten long version strings for the UI
  const formatVersion = (v) => {
    if (!v) return '';
    let clean = v.replace(/^(httpd|php|mysql|mariadb|nginx|redis|postgres|mongodb|memcached)-/i, '');
    const match = clean.match(/^\d+\.\d+(\.\d+)?/);
    if (match) return match[0];
    return clean.split('-')[0];
  };

  const handleChangeVersion = async (type, version) => {
    try {
      const result = await window.webservAPI.updateServiceVersion(type, version);
      if (result.success) {
        setMenuOpen(null);
        setActiveSubMenu(null);
        
        // Mostrar mensaje si PHP cambió y Apache se actualizó
        if (type === 'php' && result.message) {
          console.log(`✓ ${result.message}`);
          setNotification({ type: 'success', message: result.message });
          setTimeout(() => setNotification(null), 4000);
        }
        if (result.warning) {
          console.warn(`⚠ ${result.warning}`);
          setNotification({ type: 'warning', message: result.warning });
          setTimeout(() => setNotification(null), 4000);
        }
        
        loadServices(); // Force refresh to show new version
      } else {
        alert("Error: " + result.message);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const visibleServices = Array.isArray(services) ? services.filter(s => !hiddenServices.includes(s.name) && !s.isLibrary) : [];
  
  const hiddenList = Array.isArray(services) ? services.filter(s => hiddenServices.includes(s.name) && !s.isLibrary) : [];
  
  const canStartAll = visibleServices.some(s => s.status !== 'running');
  const canStopAll = visibleServices.some(s => s.status === 'running');

  if (loading && visibleServices.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
        <div className="relative">
          <RefreshCw size={64} strokeWidth={1} className="text-app-primary animate-spin opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity size={24} className="text-app-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-sm font-black text-app-text uppercase tracking-[0.2em]">{t.scanningServices || 'Escaneando Servicios...'}</h3>
          <p className="text-[10px] font-bold text-app-text-muted uppercase tracking-widest">{t.waitAMoment || 'Por favor, espera un momento'}</p>
        </div>
      </div>
    );
  }

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
      {/* Notificación Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center space-x-3 animate-in slide-in-from-top-2 fade-in duration-300 ${
          notification.type === 'success' 
            ? 'bg-app-success/10 border-app-success/30 text-app-success' 
            : 'bg-app-warning/10 border-app-warning/30 text-app-warning'
        }`}>
          <CheckCircle size={20} />
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}
      
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
            onClick={() => window.webservAPI.openAppFolder()}
            className="flex items-center space-x-2 bg-app-surface px-3 py-1.5 rounded-xl border border-app-border text-[10px] font-black text-app-text shadow-sm hover:bg-app-bg transition-all uppercase tracking-wider"
          >
            <Folder size={12} />
            <span>{t.app}</span>
          </button>
          <button 
            onClick={() => window.webservAPI.openDocumentRoot()}
            className="flex items-center space-x-2 bg-app-surface px-3 py-1.5 rounded-xl border border-app-border text-[10px] font-black text-app-text shadow-sm hover:bg-app-bg transition-all uppercase tracking-wider"
          >
            <ExternalLink size={12} />
            <span>{t.www}</span>
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
          const isPortOccupied = service.status === 'port-occupied';
          const depsMissing = service.requiresPhp && service.dependenciesReady === false;
          
          return (
            <div key={service.name} className={`group rounded-2xl shadow-sm border p-4 transition-all duration-300 relative flex flex-col h-full ${
              isRunning 
                ? 'bg-app-surface border-app-success/50 shadow-[0_8px_30px_rgba(16,185,129,0.1)] ring-1 ring-app-success/20' 
                : isPortOccupied
                ? 'bg-app-surface border-app-warning/50 shadow-[0_8px_30px_rgba(249,115,22,0.1)] ring-1 ring-app-warning/20'
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
                  <div className="fixed inset-0 z-30" onClick={() => { setMenuOpen(null); setActiveSubMenu(null); }}></div>
                  <div className={`absolute top-10 right-3 ${activeSubMenu ? 'w-56' : 'w-48'} bg-app-surface border border-app-border rounded-xl shadow-2xl z-40 py-1.5 animate-in fade-in zoom-in-95 origin-top-right overflow-hidden transition-all duration-75`}>
                    {!activeSubMenu ? (
                      <>
                        <div className="px-3 py-1 mb-1 border-b border-app-border">
                          <span className="text-[10px] font-black text-app-text-muted uppercase tracking-wider">{t.configurations}</span>
                        </div>
                        
                        {service.availableVersions?.length > 1 && (
                          <button 
                            onClick={() => setActiveSubMenu('version')} 
                            className="w-full text-left px-3 py-1.5 text-xs text-app-text hover:bg-app-primary/10 hover:text-app-primary flex items-center justify-between transition-colors font-bold"
                          >
                            <div className="flex items-center space-x-2">
                              <Layers size={12} />
                              <span>{t.switchVersion || 'Cambiar Versión'}</span>
                            </div>
                            <ChevronRight size={10} />
                          </button>
                        )}

                        {service.availablePhpVersions?.length > 1 && (
                          <button 
                            onClick={() => setActiveSubMenu('php')} 
                            className="w-full text-left px-3 py-1.5 text-xs text-app-text hover:bg-app-primary/10 hover:text-app-primary flex items-center justify-between transition-colors font-bold"
                          >
                            <div className="flex items-center space-x-2">
                              <Zap size={12} />
                              <span>{t.switchPhp || 'Cambiar PHP'}</span>
                            </div>
                            <ChevronRight size={10} />
                          </button>
                        )}

                        {(service.availableVersions?.length > 1 || service.availablePhpVersions?.length > 1) && (
                          <div className="h-px bg-app-border my-1"></div>
                        )}

                        {service.name === 'MySQL' && (
                          <>
                            <button 
                              onClick={() => { window.webservAPI.openStartupLog(); setMenuOpen(null); }} 
                              className="w-full text-left px-3 py-1.5 text-xs text-app-text hover:bg-app-primary/10 hover:text-app-primary flex items-center space-x-2 transition-colors font-bold"
                            >
                              <FileText size={12} />
                              <span>{t.diagnosticLog || '?? Diagnóstico'}</span>
                            </button>
                            <div className="h-px bg-app-border my-1"></div>
                          </>
                        )}

                        {service.configs?.map((conf, idx) => {
                          const isLog = conf.label.toLowerCase().endsWith('.log');
                          return (
                            <button 
                              key={idx}
                              onClick={() => { window.webservAPI.openConfigFile(conf); setMenuOpen(null); }} 
                              className="w-full text-left px-3 py-1.5 text-xs text-app-text hover:bg-app-primary/10 hover:text-app-primary flex items-center space-x-2 transition-colors font-bold"
                            >
                              {conf.type === 'folder' ? <Folder size={12} /> : (isLog ? <FileText size={12} /> : <Code size={12} />)}
                              <span className="truncate">{t[conf.label] || conf.label}</span>
                            </button>
                          );
                        })}
                        <div className="h-px bg-app-border my-1"></div>
                        <button 
                          onClick={() => { onToggleVisibility(service.name); setMenuOpen(null); }} 
                          className="w-full text-left px-3 py-1.5 text-xs text-app-danger hover:bg-app-danger/10 flex items-center space-x-2 transition-colors font-bold"
                        >
                          <EyeOff size={12} />
                          <span>{t.hideService}</span>
                        </button>
                      </>
                    ) : (
                      <div className="animate-in slide-in-from-right-2 duration-75">
                        <button 
                          onClick={() => setActiveSubMenu(null)}
                          className="w-full text-left px-3 py-2 text-[10px] font-black text-app-primary hover:bg-app-primary/5 flex items-center space-x-2 border-b border-app-border uppercase tracking-widest"
                        >
                          <ChevronLeft size={12} />
                          <span>{t.back || 'Volver'}</span>
                        </button>
                        <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                          {activeSubMenu === 'version' ? (
                            service.availableVersions?.map(v => (
                              <button
                                key={v}
                                onClick={() => handleChangeVersion(service.type, v)}
                                className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between transition-colors ${
                                  service.version === v 
                                    ? 'bg-app-primary/10 text-app-primary font-black' 
                                    : 'text-app-text hover:bg-app-bg'
                                }`}
                              >
                                <span className="truncate">{v}</span>
                                {service.version === v && <div className="w-1.5 h-1.5 rounded-full bg-app-primary"></div>}
                              </button>
                            ))
                          ) : (
                            service.availablePhpVersions?.map(v => (
                              <button
                                key={v}
                                onClick={() => handleChangeVersion('php', v)}
                                className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between transition-colors ${
                                  service.phpVersion === v 
                                    ? 'bg-app-primary/10 text-app-primary font-black' 
                                    : 'text-app-text hover:bg-app-bg'
                                }`}
                              >
                                <span className="truncate">{v}</span>
                                {service.phpVersion === v && <div className="w-1.5 h-1.5 rounded-full bg-app-primary"></div>}
                              </button>
                            )))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-xl transition-all duration-500 shrink-0 ${
                  isProcessing 
                    ? 'bg-app-primary/10 text-app-primary animate-pulse'
                    : isRunning 
                      ? 'bg-app-success text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] rotate-3' 
                      : isPortOccupied
                      ? 'bg-app-warning text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                      : 'bg-app-bg text-app-text-muted border border-app-border'
                }`}>
                  {getServiceIcon(service.type)}
                </div>
                <div className="overflow-hidden flex-1">
                  <h3 className={`text-base font-black tracking-tight truncate uppercase italic transition-colors ${isRunning ? 'text-app-success' : (!service.isInstalled || depsMissing) ? 'text-app-danger' : isPortOccupied ? 'text-app-warning' : 'text-app-text'}`}>{service.name}</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className={`rounded-full transition-all duration-500 ${
                      isProcessing 
                        ? 'h-2 w-2 bg-app-primary animate-bounce' 
                        : !service.isInstalled
                          ? 'h-2 w-2 bg-app-danger animate-pulse'
                          : isRunning 
                            ? 'h-2.5 w-2.5 bg-app-success animate-pulse shadow-[0_0_8px_var(--app-success)]' 
                            : isPortOccupied
                            ? 'h-2.5 w-2.5 bg-app-warning animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                            : 'h-2 w-2 bg-app-text-muted'
                    }`}></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isRunning ? 'text-app-success/80' : (!service.isInstalled || depsMissing) ? 'text-app-danger/80' : isPortOccupied ? 'text-app-warning/80' : 'text-app-text-muted'}`}>
                      {isProcessing
                        ? t.processing
                        : !service.isInstalled
                          ? (t.notInstalled || 'NO INSTALADO')
                          : depsMissing
                            ? (t.phpRequired || 'REQUIERE PHP')
                            : isRunning
                              ? t.online
                              : isPortOccupied
                                ? (t.portOccupied || 'PUERTO OCUPADO')
                                : t.offline}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-2.5 flex flex-col justify-center space-y-2 border mb-3 grow transition-all duration-500 ${
                isRunning ? 'bg-app-success/5 border-app-success/20' : isPortOccupied ? 'bg-app-warning/5 border-app-warning/20' : 'bg-app-bg/50 border-app-border'
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
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isRunning ? 'text-app-success/70' : 'text-app-text-muted'}`}>{t.version}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span 
                          title={service.version}
                          className="text-[8px] font-black px-1.5 py-0.5 rounded-lg bg-app-bg text-app-text-muted border border-app-border uppercase tracking-widest cursor-help hover:border-app-primary/50 hover:text-app-text transition-colors"
                        >
                          {formatVersion(service.version) || '---'}
                        </span>
                        {service.phpVersion && (
                          <button 
                            title={`${t.switchPhp || 'Cambiar PHP'}: ${service.phpVersion}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (service.availablePhpVersions?.length > 1) {
                                setMenuOpen(service.name);
                                setActiveSubMenu('php');
                              }
                            }}
                            className={`text-[8px] font-black px-1.5 py-0.5 rounded-lg bg-app-primary/10 text-app-primary border border-app-primary/20 uppercase tracking-widest transition-all ${
                              service.availablePhpVersions?.length > 1 ? 'cursor-pointer hover:bg-app-primary hover:text-white' : 'cursor-help'
                            }`}
                          >
                            PHP {formatVersion(service.phpVersion)}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          service.portInUse 
                            ? (isPortOccupied ? 'bg-app-warning shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-app-success shadow-[0_0_8px_var(--app-success)]') 
                            : 'bg-app-text-muted'
                        }`}></div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isRunning ? 'text-app-success/70' : isPortOccupied ? 'text-app-warning/70' : 'text-app-text-muted'}`}>{t.portShort} {service.port || '---'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {isPortOccupied && service.portOccupiedByName && (
                          <div className="group/tooltip relative">
                            <AlertCircle size={14} className="text-app-warning animate-pulse cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-app-surface border border-app-warning/50 rounded-xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-50 animate-in fade-in slide-in-from-bottom-1">
                              <span className="text-[10px] font-black text-app-warning uppercase tracking-widest block mb-1">?? {t.portWarning || 'ADVERTENCIA'}</span>
                              <span className="text-xs font-bold text-app-text block leading-relaxed">{t.portUsedBy || 'PUERTO EN USO POR'}: <span className="text-app-warning font-black">{service.portOccupiedByName}</span></span>
                            </div>
                          </div>
                        )}
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-widest transition-all ${
                          service.portInUse 
                            ? (isPortOccupied ? 'bg-app-warning text-white shadow-sm' : 'bg-app-success text-white shadow-sm') 
                            : 'bg-app-bg text-app-text-muted border border-app-border'
                        }`}>
                          {service.portInUse 
                            ? (isPortOccupied ? (t.occupied || 'OCUPADO') : (t.active || 'ACTIVE')) 
                            : (t.idle || 'IDLE')}
                        </span>
                      </div>
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
                  <button onClick={() => window.webservAPI.openInBrowser('http://localhost:8025')} className="w-full py-1.5 bg-app-primary/10 text-app-primary hover:bg-app-primary hover:text-white rounded-lg text-[10px] font-black border border-app-primary/20 transition-all flex items-center justify-center space-x-2 uppercase tracking-widest animate-in fade-in zoom-in-95 duration-200">
                    <ExternalLink size={10} /><span>{t.openMail}</span>
                  </button>
                )}
                {service.type === 'apache' && isRunning && !isProcessing && (
                  <button onClick={() => window.webservAPI.openInBrowser('http://localhost')} className="w-full py-1.5 bg-app-success/10 text-app-success hover:bg-app-success hover:text-white rounded-lg text-[10px] font-black border border-app-success/20 transition-all flex items-center justify-center space-x-2 uppercase tracking-widest animate-in fade-in zoom-in-95 duration-200">
                    <Globe size={10} /><span>{t.openWeb}</span>
                  </button>
                )}
                {service.type === 'mysql' && isRunning && !isProcessing && (
                  <button onClick={() => window.webservAPI.openDbTool()} className="w-full py-1.5 bg-app-warning/10 text-app-warning hover:bg-app-warning hover:text-white rounded-lg text-[10px] font-black border border-app-warning/20 transition-all flex items-center justify-center space-x-2 uppercase tracking-widest animate-in fade-in zoom-in-95 duration-200">
                    <Database size={10} /><span>{t.openDb}</span>
                  </button>
                )}
              </div>
              
              <button
                disabled={isProcessing}
                onClick={() => {
                  if (!service.isInstalled || depsMissing) {
                    window.dispatchEvent(new CustomEvent('change-tab', { detail: 'install' }));
                    return;
                  }
                  service.status === 'running' ? onStop(service.name) : onStart(service.name);
                }}
                className={`w-full py-2 rounded-xl font-black flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95 border-b-2 mt-auto uppercase tracking-widest text-xs ${
                  isProcessing
                    ? 'bg-app-bg text-app-text-muted border-app-border cursor-not-allowed translate-y-1 border-b-0 opacity-60'
                    : !service.isInstalled
                      ? 'bg-app-warning/10 text-app-warning border-app-warning/30 hover:bg-app-warning hover:text-white hover:border-app-warning'
                    : depsMissing
                      ? 'bg-app-warning/10 text-app-warning border-app-warning/30 hover:bg-app-warning hover:text-white hover:border-app-warning'
                      : service.status === 'running'
                        ? 'bg-app-danger/10 text-app-danger border-app-danger/30 hover:bg-app-danger hover:text-white hover:border-app-danger'
                        : 'bg-app-primary text-white border-app-primary/50 hover:bg-app-primary/90 shadow-lg shadow-app-primary/10'
                }`}
              >
                {isProcessing ? (
                  <><RefreshCw size={14} className="animate-spin" /><span>{t.wait}</span></>
                ) : !service.isInstalled ? (
                  <><Layers size={14} /><span>{t.install || 'INSTALAR'}</span></>
                ) : depsMissing ? (
                  <><Layers size={14} /><span>{t.installPhp || 'INSTALAR PHP'}</span></>
                ) : service.status === 'running' ? (
                  <><Square size={14} fill="currentColor" /><span>{t.stop}</span></>
                ) : (
                  <><Play size={14} fill="currentColor" /><span>{t.start}</span></>
                )}
              </button>
            </div>
          )
        })}

        {visibleServices.length === 0 && !loading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-app-surface/50 rounded-[40px] border-2 border-dashed border-app-border group hover:border-app-primary/30 transition-all duration-500">
            <div className="bg-app-primary/10 p-8 rounded-full mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Server size={48} className="text-app-primary/50" />
            </div>
            <h3 className="text-lg font-black text-app-text uppercase tracking-tight mb-2">
              {services.length === 0 ? "NO SE DETECTARON SERVICIOS" : (t.noServicesInstalled || "No hay servicios visibles")}
            </h3>
            <p className="text-xs font-bold text-app-text-muted uppercase tracking-widest max-w-sm text-center px-6 leading-relaxed mb-8">
              {services.length === 0 
                ? "No se pudieron cargar los servicios. Revisa los logs en la pestaña Registro." 
                : (t.noServicesConfigured || "Todos los servicios están ocultos.")}
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => loadServices()}
                className="px-8 py-3 bg-app-primary text-app-primary-text rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-app-primary/20 hover:-translate-y-1 transition-all"
              >
                Reintentar Carga
              </button>
            </div>
          </div>
        )}
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
  );
}

export default ServicesView;
