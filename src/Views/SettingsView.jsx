import React, { useState, useEffect } from 'react';
import { ChevronDown, Folder, Code } from 'lucide-react';

function SettingsView({ config, setConfig, t, availableLanguages }) {
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
              <label className="block text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-1.5 px-1">{t.AppDir}</label>
              <div className="flex items-center space-x-2">
                <input type="text" value={localConfig.appPath || ''} readOnly className="flex-1 bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-xs font-bold text-app-text-muted/70 outline-none grayscale" />
                <div className="p-2.5 bg-app-surface border border-app-border rounded-xl text-app-text-muted/40 cursor-not-allowed">
                  <Folder size={18} />
                </div>
              </div>
              <p className="mt-1.5 px-1 text-[10px] text-app-text-muted italic opacity-70">
                {localConfig.isPortable ? 'Detectado automáticamente (Modo Portable)' : 'Ubicación de la aplicación'}
              </p>
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
          <div className="flex items-center justify-between bg-app-surface p-4 rounded-2xl border border-app-border shadow-sm mb-4">
            <div>
              <p className="text-sm font-black text-app-text uppercase italic tracking-tight">{t.toastTitle || 'Notificaciones'}</p>
              <p className="text-[10px] font-bold text-app-text-muted">{t.toastDesc || 'Muestra toasts de éxito y error. Puedes desactivarlos si prefieres una UX silenciosa.'}</p>
            </div>
            <button 
              onClick={() => setLocalConfig({...localConfig, toastEnabled: !(localConfig.toastEnabled ?? true)})}
              className={`w-12 h-6 rounded-full transition-all duration-500 relative border-2 ${
                localConfig.toastEnabled ?? true ? 'bg-app-primary/10 border-app-primary/40' : 'bg-app-bg border-app-border'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-500 shadow-sm ${
                localConfig.toastEnabled ?? true ? 'left-6.5 bg-app-primary' : 'left-0.5 bg-app-text-muted/50'
              }`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between bg-app-surface p-4 rounded-2xl border border-app-border shadow-sm">
            <div>
              <p className="text-sm font-black text-app-text uppercase italic tracking-tight">{t.autoMonitor || 'Monitoreo automático'}</p>
              <p className="text-[10px] font-bold text-app-text-muted">{t.autoMonitorDesc || 'Refresca el estado cada pocos segundos y al recuperar el foco.'}</p>
            </div>
            <button 
              onClick={() => setLocalConfig({...localConfig, monitoringAuto: !(localConfig.monitoringAuto ?? true)})}
              className={`w-12 h-6 rounded-full transition-all duration-500 relative border-2 ${
                localConfig.monitoringAuto ?? true ? 'bg-app-primary/10 border-app-primary/40' : 'bg-app-bg border-app-border'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-500 shadow-sm ${
                localConfig.monitoringAuto ?? true ? 'left-6.5 bg-app-primary' : 'left-0.5 bg-app-text-muted/50'
              }`}></div>
            </button>
          </div>

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

export default SettingsView;
