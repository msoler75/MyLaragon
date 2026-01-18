const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getServices: (hiddenServices) => ipcRenderer.invoke('get-services', hiddenServices),
  startService: (serviceName) => ipcRenderer.invoke('start-service', serviceName),
  stopService: (serviceName) => ipcRenderer.invoke('stop-service', serviceName),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  clearLogs: () => ipcRenderer.invoke('clear-logs'),
  openAppFolder: () => ipcRenderer.invoke('open-app-folder'),
  openDocumentRoot: () => ipcRenderer.invoke('open-document-root'),
  openDbTool: () => ipcRenderer.invoke('open-db-tool'),
  openConfigFile: (config) => ipcRenderer.invoke('open-config-file', config),
  openTerminal: () => ipcRenderer.invoke('open-terminal'),
  openHosts: () => ipcRenderer.invoke('open-hosts'),
  updateServiceVersion: (data) => ipcRenderer.invoke('update-service-version', data),
  openEnvVars: () => ipcRenderer.invoke('open-env-vars'),
  openStartupLog: () => ipcRenderer.invoke('open-startup-log'),
  getProjects: () => ipcRenderer.invoke('get-projects'),
  openInBrowser: (url) => ipcRenderer.invoke('open-in-browser', url),
  openInVSCode: (projectPath) => ipcRenderer.invoke('open-in-vscode', projectPath),
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config) => ipcRenderer.invoke('set-config', config),
  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),
  openDevTools: () => ipcRenderer.invoke('open-devtools'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  // WebServDev Extensions
  getRemoteServices: () => ipcRenderer.invoke('get-remote-services'),
  installService: (data) => ipcRenderer.invoke('install-service', data),
  uninstallService: (data) => ipcRenderer.invoke('uninstall-service', data),
  
  // Listeners
  onLog: (callback) => ipcRenderer.on('app-log', (event, data) => callback(data))
});
