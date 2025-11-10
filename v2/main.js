const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

let mainWindow;
let createFolderWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

function createFolderModal() {
  createFolderWindow = new BrowserWindow({
    width: 500,
    height: 400,
    parent: mainWindow, // Torna modal
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  createFolderWindow.loadFile('create-folder.html');
  
  createFolderWindow.on('ready-to-show', () => {
    createFolderWindow.show();
  });

  createFolderWindow.on('closed', () => {
    createFolderWindow = null;
  });
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// IPC Handlers
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('create-folder', async (event, folderPath, folderName) => {
  try {
    const fullPath = path.join(folderPath, folderName);
    
    try {
      await fs.access(fullPath);
      return { success: false, error: 'Pasta já existe!' };
    } catch (error) {
      // Pasta não existe, pode criar
    }
    
    await fs.mkdir(fullPath, { recursive: true });
    return { success: true, path: fullPath };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-home-directory', () => {
  return os.homedir();
});

ipcMain.handle('list-folders', async (event, directoryPath) => {
  try {
    const items = await fs.readdir(directoryPath, { withFileTypes: true });
    const folders = items
      .filter(item => item.isDirectory())
      .map(item => ({
        name: item.name,
        path: path.join(directoryPath, item.name),
        created: new Date().toLocaleString()
      }));
    
    return { success: true, folders };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Novo handler para abrir janela de criar pasta
ipcMain.handle('open-create-folder-window', () => {
  if (!createFolderWindow) {
    createFolderModal();
  }
  return true;
});

// Handler para fechar a janela modal
ipcMain.handle('close-create-folder-window', () => {
  if (createFolderWindow) {
    createFolderWindow.close();
  }
});

// Handler para notificar a janela principal sobre nova pasta criada
ipcMain.handle('folder-created', (event, folderInfo) => {
  if (mainWindow) {
    mainWindow.webContents.send('new-folder-created', folderInfo);
  }
});

// Handler para executar comandos do sistema de forma segura
const { exec } = require('child_process');
ipcMain.handle('run-command', (event, command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error.message);
      if (stderr) {
        // Alguns comandos escrevem no stderr sem serem erros; retornamos stdout e stderr
        return resolve({ stdout, stderr });
      }
      resolve({ stdout });
    });
  });
});