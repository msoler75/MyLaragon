import React, { useState, useEffect } from 'react';
import { RefreshCw, Server, Trash2, X, Layers } from 'lucide-react';

function InstallerView({ t, onInstalled, services = [], activeTab }) {
  const [remoteServices, setRemoteServices] = useState([]);
  const [loadingRepo, setLoadingRepo] = useState(true);
  const [activeTasks, setActiveTasks] = useState({}); // { 'id-version': 'installing' | 'uninstalling' }
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      // Si ya hemos intentado cargar, no repetimos
      if (hasFetched) return;
      
      setHasFetched(true);
      setLoadingRepo(true);
      if (window.webservAPI && typeof window.webservAPI.getRemoteServices === 'function') {
        try {
          const data = await window.webservAPI.getRemoteServices();
          console.log('[INSTALLER] getRemoteServices returned:', data);
          console.log('[INSTALLER] Setting remoteServices to:', data.services || []);
          setRemoteServices(data.services || []);
        } catch (e) {
          console.error("Error fetching remote services:", e);
        }
      }
      setLoadingRepo(false);
    };
    fetchServices();
  }, [hasFetched]); // Solo depende de hasFetched

  // Debug logs para rendering
  useEffect(() => {
    console.log('[INSTALLER] Rendering with remoteServices:', remoteServices);
    remoteServices.forEach(service => {
      console.log('[INSTALLER] Rendering service:', service.id, 'with versions:', service.versions);
    });
  }, [remoteServices]);

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

  const handleCancelTask = async (service, versionInfo) => {
    const taskId = `${service.id}-${versionInfo.version}`;
    if (window.webservAPI && window.webservAPI.cancelTask) {
      // Marcamos como cancelando inmediatamente en la UI
      setActiveTasks(prev => ({ ...prev, [taskId]: 'cancelling' }));
      await window.webservAPI.cancelTask(taskId);
      // No eliminamos del estado aquí, dejamos que el finally de la tarea original lo haga
    }
  };

  if (loadingRepo) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-app-text-muted opacity-50 space-y-4">
        <RefreshCw size={48} strokeWidth={1} className="animate-spin" />
        <p className="font-black uppercase tracking-widest text-[10px]">Cargando repositorio de servicios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {remoteServices.map(service => {
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
              {service.versions.map(v => {
                const taskId = `${service.id}-${v.version}`;
                const taskStatus = activeTasks[taskId];
                const isInstalled = services.some(s => {
                  const sType = (s.type || s.id || '').toLowerCase();
                  const typeMatch = sType === service.id.toLowerCase() || 
                                   s.name?.toLowerCase() === service.id.toLowerCase();
                  
                  // Verificar si esta versión específica está en la lista de versiones instaladas detectadas
                  const versionsDetected = s.availableVersions || s.availablePhpVersions || [];
                  return typeMatch && versionsDetected.includes(v.version);
                });

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
              })}
            </div>
            
            {/* Elemento decorativo de fondo */}
            <Layers className="absolute -right-6 -bottom-6 text-app-primary opacity-[0.03] w-32 h-32 -rotate-12 transition-all duration-700 group-hover:scale-125 group-hover:opacity-[0.07]" />
          </div>
        );
        })}
        {remoteServices.length === 0 && (
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
