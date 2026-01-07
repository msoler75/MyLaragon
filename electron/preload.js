const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Gestión de servicios
  getServices: (hiddenServices) => ipcRenderer.invoke('get-services', hiddenServices),
  startService: (serviceName) => ipcRenderer.invoke('start-service', serviceName),
  stopService: (serviceName) => ipcRenderer.invoke('stop-service', serviceName),
  
  // Gestión de proyectos
  getProjects: () => ipcRenderer.invoke('get-projects'),
  openInBrowser: (url) => ipcRenderer.invoke('open-in-browser', url),
  openInVSCode: (path) => ipcRenderer.invoke('open-in-vscode', path),
  
  // Configuración
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config) => ipcRenderer.invoke('set-config', config),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // Abrir herramientas
  openLaragonFolder: () => ipcRenderer.invoke('open-laragon-folder'),
  openDocumentRoot: () => ipcRenderer.invoke('open-document-root'),
  openDbTool: () => ipcRenderer.invoke('open-db-tool'),
  openConfigFile: (filePath) => ipcRenderer.invoke('open-config-file', filePath),

  // Debugging con DevTools
  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),
  openDevTools: () => ipcRenderer.invoke('open-devtools'),

  // Herramientas
  openTerminal: () => ipcRenderer.invoke('open-terminal'),
  openHosts: () => ipcRenderer.invoke('open-hosts'),
  openEnvVars: () => ipcRenderer.invoke('open-env-vars'),
  updateServiceVersion: (type, version) => ipcRenderer.invoke('update-service-version', { type, version }),
});