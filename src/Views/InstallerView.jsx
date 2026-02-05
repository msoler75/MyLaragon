import React, { useState, useEffect } from 'react';
import { RefreshCw, Server, Trash2, X, Layers, ChevronDown, ChevronUp } from 'lucide-react';

function InstallerView({ t, onInstalled, services = [] }) {
  const [activeTasks, setActiveTasks] = useState({}); // { 'id-version': 'installing' | 'uninstalling' }
  const [expandedServices, setExpandedServices] = useState({}); // { 'serviceId': boolean }

  // Debug logs para rendering
  useEffect(() => {
    console.log('[INSTALLER] Rendering with services:', services);
    services.forEach(service => {
      console.log('[INSTALLER] Rendering service:', service.id, 'with availableVersions:', service.availableVersions);
    });
  }, [services]);

  const handleInstall = async (service, versionInfo) => {
    const taskId = `${service.id}-${versionInfo.version}`;
    if (activeTasks[taskId]) return; // Evitar duplicados

    setActiveTasks(prev => ({ ...prev, [taskId]: 'installing' }));
    try {
      const result = await window.webservAPI.installService({
        url: versionInfo.url,
        serviceId: service.id,
        version: versionInfo.version,
        installPath: service.installPath
      });
      if (result.success) {
        console.log("Instalación exitosa:", result.message);
        if (onInstalled) {
          await onInstalled();
        }
      } else {
        // Si fue cancelado manualmente (status cancelado en el shim), no mostrar error
        if (result.error !== 'CANCELLED') {
          console.error("Error en instalación:", result.error);
          alert(`Error: ${result.error}`);
        }
      }
    } catch (e) {
      console.error("Error fatal:", e.message);
    } finally {
      setActiveTasks(prev => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    }
  };

  const handleUninstall = async (service, versionInfo) => {
    const taskId = `${service.id}-${versionInfo.version}`;
    if (activeTasks[taskId]) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar ${service.name} v${versionInfo.version}? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    setActiveTasks(prev => ({ ...prev, [taskId]: 'uninstalling' }));
    try {
      const result = await window.webservAPI.uninstallService({
        serviceId: service.id,
        version: versionInfo.version,
        installPath: service.installPath
      });
      if (result.success) {
        console.log("Desinstalación exitosa:", result.message);
        if (onInstalled) {
          await onInstalled();
        }
      } else {
        console.error("Error en desinstalación:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (e) {
      console.error("Error fatal:", e.message);
    } finally {
      setActiveTasks(prev => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    }
  };

  const toggleExpanded = (serviceId) => {
    setExpandedServices(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  const isApacheCompatible = (version) => {
    return version.includes('(TS)');
  };

  const getDisplayedVersion = (service) => {
    if (!service.availableVersions || service.availableVersions.length === 0) return null;
    
    // Si hay una versión instalada, mostrarla
    const installedVersion = service.availableVersions.find(v => v.installed);
    if (installedVersion) return installedVersion;
    
    // Si no hay instalada, mostrar la primera (más reciente)
    return service.availableVersions[0];
  };

  const handleCancelTask = async (service, versionInfo) => {
    const taskId = `${service.id}-${versionInfo.version}`;
    if (window.webservAPI && window.webservAPI.cancelTask) {
      // Marcamos como cancelando inmediatamente en la UI
      setActiveTasks(prev => ({ ...prev, [taskId]: 'cancelling' }));
      await window.webservAPI.cancelTask(taskId);
      // No eliminamos del estado aquí, dejamos que el finally de la tarea original lo haga
    }
  };

  if (!services || services.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-app-text-muted opacity-50 space-y-4">
        <Server size={48} strokeWidth={1} />
        <p className="font-black uppercase tracking-widest text-[10px]">No hay servicios disponibles</p>
      </div>
    );
  }

  // Filtrar servicios duplicados por id para evitar errores de React
  const uniqueServices = services.filter((service, index, self) => 
    self.findIndex(s => s.id === service.id) === index
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {uniqueServices.map(service => {
          return (
          <div key={service.id} className="bg-app-surface rounded-3xl p-6 border border-app-border shadow-sm hover:shadow-xl hover:border-app-primary/30 transition-all duration-500 overflow-hidden relative group">
            <div className="flex items-center space-x-4 mb-6 relative z-10">
              <div className="bg-app-primary/10 p-4 rounded-2xl border border-app-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Server size={28} className="text-app-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black text-app-text uppercase tracking-tight">{service.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-success"></span>
                  <p className="text-[9px] font-bold text-app-text-muted uppercase tracking-widest">Disponible para {service.installPath}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 relative z-10">
              {service.id === 'php' ? (
                // Render especial para PHP
                (() => {
                  const displayedVersion = getDisplayedVersion(service);
                  const isExpanded = expandedServices[service.id];
                  
                  return (
                    <div className="space-y-2">
                      {/* Versión destacada */}
                      {displayedVersion && (
                        <div className="flex items-center justify-between p-3.5 bg-app-bg/40 rounded-2xl border border-app-border group/item hover:bg-app-primary/5 hover:border-app-primary/40 transition-all duration-300">
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] font-black text-app-text uppercase">Versión {displayedVersion.version}</span>
                              {displayedVersion.installed && !activeTasks[`${service.id}-${displayedVersion.version}`] && (
                                <span className="px-1.5 py-0.5 rounded-md bg-app-success/10 text-app-success text-[8px] font-black uppercase tracking-widest border border-app-success/20">
                                  Instalado
                                </span>
                              )}
                              {activeTasks[`${service.id}-${displayedVersion.version}`] && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border animate-pulse ${
                                  activeTasks[`${service.id}-${displayedVersion.version}`] === 'installing' ? 'bg-app-warning/10 text-app-warning border-app-warning/20' : 'bg-app-danger/10 text-app-danger border-app-danger/20'
                                }`}>
                                  {activeTasks[`${service.id}-${displayedVersion.version}`] === 'installing' ? 'Instalando' : activeTasks[`${service.id}-${displayedVersion.version}`] === 'uninstalling' ? 'Borrando' : 'Cancelando'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-[8px] font-bold text-app-text-muted uppercase tracking-tighter truncate max-w-[120px]">{displayedVersion.filename}</span>
                              {isApacheCompatible(displayedVersion.version) && (
                                <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-app-success/10 text-app-success border border-app-success/20">
                                  apache compatible
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Botón expandir/colapsar */}
                            <button
                              onClick={() => toggleExpanded(service.id)}
                              className="p-2 rounded-xl text-app-text-muted hover:bg-app-primary/10 hover:text-app-primary transition-all"
                              title={isExpanded ? "Mostrar menos versiones" : "Mostrar todas las versiones"}
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {displayedVersion.installed && !activeTasks[`${service.id}-${displayedVersion.version}`] && (
                              <button
                                onClick={() => handleUninstall(service, displayedVersion)}
                                className="p-2.5 rounded-xl text-app-text-muted hover:bg-app-danger/10 hover:text-app-danger transition-all"
                                title="Desinstalar"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}

                            {(activeTasks[`${service.id}-${displayedVersion.version}`] === 'installing' || activeTasks[`${service.id}-${displayedVersion.version}`] === 'cancelling') && (
                              <button
                                disabled={activeTasks[`${service.id}-${displayedVersion.version}`] === 'cancelling'}
                                onClick={() => handleCancelTask(service, displayedVersion)}
                                className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center space-x-2 ${
                                  activeTasks[`${service.id}-${displayedVersion.version}`] === 'cancelling' 
                                    ? 'bg-app-danger/5 text-app-danger/50 cursor-wait' 
                                    : 'bg-app-danger/10 text-app-danger hover:bg-app-danger hover:text-white'
                                }`}
                                title="Cancelar Instalación"
                              >
                                <X size={12} className={activeTasks[`${service.id}-${displayedVersion.version}`] === 'cancelling' ? 'animate-spin' : ''} />
                                <span className="hidden sm:inline">
                                  {activeTasks[`${service.id}-${displayedVersion.version}`] === 'cancelling' ? 'Cancelando...' : 'Cancelar'}
                                </span>
                              </button>
                            )}

                            {!activeTasks[`${service.id}-${displayedVersion.version}`] && (
                              <button
                                disabled={displayedVersion.installed}
                                onClick={() => handleInstall(service, displayedVersion)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                                  displayedVersion.installed
                                    ? 'bg-app-success/10 text-app-success cursor-default opacity-80'
                                    : 'bg-app-primary text-app-primary-text hover:shadow-lg hover:shadow-app-primary/30 hover:-translate-y-0.5 active:translate-y-0'
                                }`}
                              >
                                {displayedVersion.installed ? 'Instalado' : 'Instalar'}
                              </button>
                            )}

                            {activeTasks[`${service.id}-${displayedVersion.version}`] === 'uninstalling' && (
                              <div className="flex items-center space-x-2 px-4 py-2 text-app-danger">
                                 <RefreshCw size={14} className="animate-spin" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">{t.deleting}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Versiones expandidas */}
                      {isExpanded && service.availableVersions && service.availableVersions
                        .filter((v, index, self) => self.findIndex(v2 => v2.version === v.version) === index)
                        .filter(v => v !== displayedVersion) // Excluir la versión destacada
                        .map(v => {
                        const taskId = `${service.id}-${v.version}`;
                        const taskStatus = activeTasks[taskId];
                        const isInstalled = v.installed;

                        return (
                          <div key={v.version} className="flex items-center justify-between p-3.5 bg-app-bg/20 rounded-2xl border border-app-border/50 group/item hover:bg-app-primary/5 hover:border-app-primary/40 transition-all duration-300 ml-4">
                            <div className="flex flex-col flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-[11px] font-black text-app-text uppercase">Versión {v.version}</span>
                                {isInstalled && !taskStatus && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-app-success/10 text-app-success text-[8px] font-black uppercase tracking-widest border border-app-success/20">
                                    Instalado
                                  </span>
                                )}
                                {taskStatus && (
                                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border animate-pulse ${
                                    taskStatus === 'installing' ? 'bg-app-warning/10 text-app-warning border-app-warning/20' : 'bg-app-danger/10 text-app-danger border-app-danger/20'
                                  }`}>
                                    {taskStatus === 'installing' ? 'Instalando' : taskStatus === 'uninstalling' ? 'Borrando' : 'Cancelando'}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 mt-1">
                                <span className="text-[8px] font-bold text-app-text-muted uppercase tracking-tighter truncate max-w-[120px]">{v.filename}</span>
                                {isApacheCompatible(v.version) && (
                                  <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-app-success/10 text-app-success border border-app-success/20">
                                    apache compatible
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {isInstalled && !taskStatus && (
                                <button
                                  onClick={() => handleUninstall(service, v)}
                                  className="p-2.5 rounded-xl text-app-text-muted hover:bg-app-danger/10 hover:text-app-danger transition-all"
                                  title="Desinstalar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}

                              {(taskStatus === 'installing' || taskStatus === 'cancelling') && (
                                <button
                                  disabled={taskStatus === 'cancelling'}
                                  onClick={() => handleCancelTask(service, v)}
                                  className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center space-x-2 ${
                                    taskStatus === 'cancelling' 
                                      ? 'bg-app-danger/5 text-app-danger/50 cursor-wait' 
                                      : 'bg-app-danger/10 text-app-danger hover:bg-app-danger hover:text-white'
                                  }`}
                                  title="Cancelar Instalación"
                                >
                                  <X size={12} className={taskStatus === 'cancelling' ? 'animate-spin' : ''} />
                                  <span className="hidden sm:inline">
                                    {taskStatus === 'cancelling' ? 'Cancelando...' : 'Cancelar'}
                                  </span>
                                </button>
                              )}

                              {!taskStatus && (
                                <button
                                  disabled={isInstalled}
                                  onClick={() => handleInstall(service, v)}
                                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                                    isInstalled
                                      ? 'bg-app-success/10 text-app-success cursor-default opacity-80'
                                      : 'bg-app-primary text-app-primary-text hover:shadow-lg hover:shadow-app-primary/30 hover:-translate-y-0.5 active:translate-y-0'
                                  }`}
                                >
                                  {isInstalled ? 'Instalado' : 'Instalar'}
                                </button>
                              )}

                              {taskStatus === 'uninstalling' && (
                                <div className="flex items-center space-x-2 px-4 py-2 text-app-danger">
                                   <RefreshCw size={14} className="animate-spin" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">{t.deleting}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                // Render normal para otros servicios
                service.availableVersions && service.availableVersions
                  .filter((v, index, self) => self.findIndex(v2 => v2.version === v.version) === index)
                  .map(v => {
                  const taskId = `${service.id}-${v.version}`;
                  const taskStatus = activeTasks[taskId];
                  const isInstalled = v.installed;

                  return (
                    <div key={v.version} className="flex items-center justify-between p-3.5 bg-app-bg/40 rounded-2xl border border-app-border group/item hover:bg-app-primary/5 hover:border-app-primary/40 transition-all duration-300">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-black text-app-text uppercase">Versión {v.version}</span>
                          {isInstalled && !taskStatus && (
                            <span className="px-1.5 py-0.5 rounded-md bg-app-success/10 text-app-success text-[8px] font-black uppercase tracking-widest border border-app-success/20">
                              Instalado
                            </span>
                          )}
                          {taskStatus && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border animate-pulse ${
                              taskStatus === 'installing' ? 'bg-app-warning/10 text-app-warning border-app-warning/20' : 'bg-app-danger/10 text-app-danger border-app-danger/20'
                            }`}>
                              {taskStatus === 'installing' ? 'Instalando' : taskStatus === 'uninstalling' ? 'Borrando' : 'Cancelando'}
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] font-bold text-app-text-muted uppercase tracking-tighter truncate max-w-[150px]">{v.filename}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isInstalled && !taskStatus && (
                          <button
                            onClick={() => handleUninstall(service, v)}
                            className="p-2.5 rounded-xl text-app-text-muted hover:bg-app-danger/10 hover:text-app-danger transition-all"
                            title="Desinstalar"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        {(taskStatus === 'installing' || taskStatus === 'cancelling') && (
                          <button
                            disabled={taskStatus === 'cancelling'}
                            onClick={() => handleCancelTask(service, v)}
                            className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center space-x-2 ${
                              taskStatus === 'cancelling' 
                                ? 'bg-app-danger/5 text-app-danger/50 cursor-wait' 
                                : 'bg-app-danger/10 text-app-danger hover:bg-app-danger hover:text-white'
                            }`}
                            title="Cancelar Instalación"
                          >
                            <X size={12} className={taskStatus === 'cancelling' ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">
                              {taskStatus === 'cancelling' ? 'Cancelando...' : 'Cancelar'}
                            </span>
                          </button>
                        )}

                        {!taskStatus && (
                          <button
                            disabled={isInstalled}
                            onClick={() => handleInstall(service, v)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                              isInstalled
                                ? 'bg-app-success/10 text-app-success cursor-default opacity-80'
                                : 'bg-app-primary text-app-primary-text hover:shadow-lg hover:shadow-app-primary/30 hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                          >
                            {isInstalled ? 'Instalado' : 'Instalar'}
                          </button>
                        )}

                        {taskStatus === 'uninstalling' && (
                          <div className="flex items-center space-x-2 px-4 py-2 text-app-danger">
                             <RefreshCw size={14} className="animate-spin" />
                             <span className="text-[10px] font-black uppercase tracking-widest">{t.deleting}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Elemento decorativo de fondo */}
            <Layers className="absolute -right-6 -bottom-6 text-app-primary opacity-[0.03] w-32 h-32 -rotate-12 transition-all duration-700 group-hover:scale-125 group-hover:opacity-[0.07]" />
          </div>
        );
        })}
        {services.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-app-bg/30 rounded-3xl border border-app-border">
            <Server size={32} className="text-app-text-muted mb-4 opacity-30" />
            <p className="text-xs font-bold text-app-text-muted uppercase tracking-widest truncate">{t.noServicesDetected}</p>
            <p className="text-[9px] text-app-text-muted/50 mt-2 italic">{t.verifyServicesJson}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstallerView;
