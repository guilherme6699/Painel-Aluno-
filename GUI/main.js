const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');

function createWindow(){
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: true,
    title: 'teste',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  
  // Opcional: Abrir DevTools para debug
  // win.webContents.openDevTools();
}

// Quando o Electron terminar de inicializar
app.whenReady().then(() => {
  createWindow();

  // No macOS, recriar a janela quando clicar no ícone do dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Fechar a aplicação quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});