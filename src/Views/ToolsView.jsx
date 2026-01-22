import React from 'react';
import { Terminal, FileText, Cpu, Search, ChevronRight, Zap } from 'lucide-react';

function ToolsView({ t }) {
  const tools = [
    {
      id: 'terminal',
      name: t.terminal,
      desc: t.terminalDesc || 'Open terminal in App root.',
      icon: Terminal,
      color: 'bg-[#1e1e1e] border border-white/10',
      iconColor: 'text-app-success',
      onClick: () => window.webservAPI.openTerminal()
    },
    {
      id: 'hosts',
      name: t.hostsEditor || 'Hosts Editor',
      desc: t.hostsDesc || 'Edit system hosts file.',
      icon: FileText,
      color: 'bg-app-primary',
      iconColor: 'text-white',
      onClick: () => window.webservAPI.openHosts()
    },
    {
      id: 'env',
      name: t.envVars,
      desc: t.envVarsDesc || 'Configure system environment variables.',
      icon: Cpu,
      color: 'bg-app-success',
      iconColor: 'text-white',
      onClick: () => window.webservAPI.openEnvVars()
    },
    {
      id: 'inspect_resources',
      name: 'Inspeccionar',
      desc: 'Inspecciona los recursos de la App localmente.',
      icon: Search,
      color: 'bg-app-warning',
      iconColor: 'text-white',
      onClick: () => {
        if (window.webservAPI) {
          window.webservAPI.openDevTools();
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
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
            onClick={() => window.webservAPI.openInBrowser('https://github.com/msoler75/WebServDev/issues')}
            className="bg-app-primary text-app-primary-text px-6 py-2 rounded-xl font-black text-[10px] hover:scale-110 transform transition-all uppercase tracking-[0.2em] shadow-lg shadow-app-primary/20"
          >
            {t.suggestFunc} 
          </button>
        </div>
        <Zap className="absolute -left-8 -top-8 text-app-primary/5 w-40 h-40 -rotate-12" />
      </div>
    </div>
  );
}

export default ToolsView;
