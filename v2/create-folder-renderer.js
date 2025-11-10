let currentDirectory = null;

// Atualizar contador de caracteres
document.getElementById('folderName').addEventListener('input', function(e) {
    const charCount = e.target.value.length;
    document.getElementById('charCount').textContent = charCount;
});

// Permitir criar com Enter
document.getElementById('folderName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        createFolder();
    }
});

async function selectDirectory() {
    try {
        const directory = await window.electronAPI.selectDirectory();
        if (directory) {
            currentDirectory = directory;
            document.getElementById('directoryPathDisplay').textContent = directory;
            updateCreateButton();
            showMessage('Diretório selecionado!', 'success', 2000);
        }
    } catch (error) {
        showMessage('Erro ao selecionar diretório: ' + error.message, 'error');
    }
}

function updateCreateButton() {
    const folderName = document.getElementById('folderName').value.trim();
    const createBtn = document.getElementById('createBtn');
    
    if (currentDirectory && folderName) {
        createBtn.disabled = false;
    } else {
        createBtn.disabled = true;
    }
}

// Atualizar botão quando o texto mudar
document.getElementById('folderName').addEventListener('input', updateCreateButton);

async function createFolder() {
    const folderName = document.getElementById('folderName').value.trim();

    if (!folderName) {
        showMessage('Por favor, digite um nome para a pasta!', 'error');
        return;
    }

    if (!currentDirectory) {
        showMessage('Por favor, selecione um diretório primeiro!', 'error');
        return;
    }

    // Validar nome da pasta
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(folderName)) {
        showMessage('Nome da pasta contém caracteres inválidos: < > : " / \\ | ? *', 'error');
        return;
    }

    if (folderName.endsWith('.') || folderName.endsWith(' ')) {
        showMessage('Nome da pasta não pode terminar com ponto ou espaço!', 'error');
        return;
    }

    try {
        showMessage('Criando pasta...', 'loading');
        
        const result = await window.electronAPI.createFolder(currentDirectory, folderName);
        
        if (result.success) {
            showMessage(`Pasta "${folderName}" criada com sucesso! 🎉`, 'success');
            
            // Notificar a janela principal
            await window.electronAPI.folderCreated({
                name: folderName,
                path: result.path,
                created: new Date().toLocaleString()
            });
            
            // Limpar formulário
            document.getElementById('folderName').value = '';
            updateCreateButton();
            
            // Fechar janela após 2 segundos
            setTimeout(() => {
                closeWindow();
            }, 2000);
            
        } else {
            showMessage(`Erro: ${result.error}`, 'error');
        }
    } catch (error) {
        showMessage('Erro ao criar pasta: ' + error.message, 'error');
    }
}

function closeWindow() {
    window.electronAPI.closeCreateFolderWindow();
}

function showMessage(message, type, duration = 5000) {
    const messageEl = document.getElementById('statusMessage');
    messageEl.textContent = message;
    messageEl.className = `status-message ${type}`;
    messageEl.classList.remove('hidden');

    if (type !== 'loading' && duration > 0) {
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, duration);
    }
}

// Carregar diretório home ao iniciar
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const homeDir = await window.electronAPI.getHomeDirectory();
        currentDirectory = homeDir;
        document.getElementById('directoryPathDisplay').textContent = homeDir;
        updateCreateButton();
    } catch (error) {
        showMessage('Erro ao carregar diretório: ' + error.message, 'error');
    }
});
