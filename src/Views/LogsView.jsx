import React, { useState, useEffect, useRef } from 'react';
import { SquareTerminal } from 'lucide-react';

function LogsView({ logs, t, setLogs }) {
  const scrollRef = useRef(null);
  const [activeFilters, setActiveFilters] = useState(['INFO', 'WARNING', 'ERROR']);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, activeFilters]);

  const handleClear = async () => {
    if (window.webservAPI) {
      const success = await window.webservAPI.clearLogs();
      if (success) setLogs([]);
    }
  };

  const toggleFilter = (level) => {
    setActiveFilters(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
  };

  const filteredLogs = logs.filter(log => activeFilters.includes(log.level));

  const filterStats = {
    INFO: logs.filter(l => l.level === 'INFO').length,
    WARNING: logs.filter(l => l.level === 'WARNING').length,
    ERROR: logs.filter(l => l.level === 'ERROR').length
  };

  return (
    <div className="bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      <div className="p-4 border-b border-app-border flex flex-wrap items-center justify-between gap-4 shrink-0 bg-app-surface/50 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5 bg-app-bg/50 p-1 rounded-xl border border-app-border mr-2">
            {[
              { id: 'INFO', label: 'Info', color: 'text-app-primary', bg: 'bg-app-primary/10' },
              { id: 'WARNING', label: 'Warn', color: 'text-app-warning', bg: 'bg-app-warning/10' },
              { id: 'ERROR', label: 'Err', color: 'text-app-danger', bg: 'bg-app-danger/10' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => toggleFilter(f.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider ${
                  activeFilters.includes(f.id)
                    ? `${f.bg} ${f.color} shadow-sm ring-1 ring-inset ring-current/20`
                    : 'text-app-text-muted hover:bg-app-bg hover:text-app-text'
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md ${activeFilters.includes(f.id) ? 'bg-white/20' : 'bg-app-bg'} opacity-60`}>
                  {filterStats[f.id]}
                </span>
              </button>
            ))}
          </div>

          <button 
            onClick={handleClear}
            className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-app-text-muted hover:text-app-danger transition-colors px-4 py-2 rounded-xl hover:bg-app-danger/10 border border-app-border"
          >
            Limpiar
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest bg-app-bg/50 px-4 py-2 rounded-xl border border-app-border">
              <span className="w-1.5 h-1.5 rounded-full bg-app-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-app-text-muted">{t.liveActive}</span>
          </span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 font-mono text-[11px] space-y-2 bg-black/5 custom-scrollbar"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-app-text-muted opacity-50 space-y-4">
            <SquareTerminal size={48} strokeWidth={1} />
            <div className="text-center">
              <p className="font-black uppercase tracking-widest text-[10px]">{t.noMessagesToShow}</p>
              <p className="text-[9px] font-bold mt-1 uppercase tracking-tighter opacity-70">{t.adjustFiltersOrWait}</p>
            </div>
          </div>
        ) : (
          filteredLogs.map((log, i) => (
            <div key={i} className={`flex space-x-3 items-start animate-in fade-in slide-in-from-left-1 duration-300 leading-relaxed group`}>
              <span className="text-app-text-muted shrink-0 select-none opacity-50 w-20 group-hover:opacity-100 transition-opacity">[{log.timestamp}]</span>
              <span className={`shrink-0 font-black uppercase text-[9px] px-1.5 py-0.5 rounded min-w-[65px] text-center shadow-sm ${
                log.level === 'ERROR' ? 'bg-app-danger text-white' : 
                log.level === 'WARNING' ? 'bg-app-warning text-white' : 
                'bg-app-primary/10 text-app-primary ring-1 ring-inset ring-app-primary/20'
              }`}>
                {log.level}
              </span>
              <span className={`break-all ${
                log.level === 'ERROR' ? 'text-app-danger font-bold' : 
                log.level === 'WARNING' ? 'text-app-warning' : 
                'text-app-text/90'
              }`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LogsView;
