const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Funções principais
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  createFolder: (folderPath, folderName) => ipcRenderer.invoke('create-folder', folderPath, folderName),
  getHomeDirectory: () => ipcRenderer.invoke('get-home-directory'),
  listFolders: (directoryPath) => ipcRenderer.invoke('list-folders', directoryPath),
  
  // Novas funções para janelas
  openCreateFolderWindow: () => ipcRenderer.invoke('open-create-folder-window'),
  closeCreateFolderWindow: () => ipcRenderer.invoke('close-create-folder-window'),
  folderCreated: (folderInfo) => ipcRenderer.invoke('folder-created', folderInfo),
  runCommand: (command) => ipcRenderer.invoke('run-command', command),
  
  // Listeners de eventos
  onNewFolderCreated: (callback) => ipcRenderer.on('new-folder-created', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});