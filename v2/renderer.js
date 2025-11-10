// Função para abrir a janela de criar pasta
async function openCreateFolderWindow() {
    try {
        await window.electronAPI.openCreateFolderWindow();
    } catch (error) {
        showMessage('Erro ao abrir janela: ' + error.message, 'error');
    }
}

// Ouvir eventos de pasta criada
window.electronAPI.onNewFolderCreated((event, folderInfo) => {
    // Mostrar alert em vez de mensagem na tela
    try {
        alert(`Pasta "${folderInfo.name}" criada com sucesso!`);
    } catch (e) {
        // Fallback para showMessage se alert não estiver disponível
        showMessage(`Pasta "${folderInfo.name}" criada com sucesso!`, 'success');
    }
});

// Carregar pastas ao iniciar
window.addEventListener('DOMContentLoaded', async () => {
    // Por solicitação do usuário: não listar diretórios na inicialização.
    // O app continuará a receber eventos sobre pastas criadas e irá apenas notificar o usuário.
});

async function listFolders() {
    try {
        const homeDir = await window.electronAPI.getHomeDirectory();
        const result = await window.electronAPI.listFolders(homeDir);
        const container = document.getElementById('foldersContainer');

        if (result.success) {
            // Whitelist - pastas que normalmente importam ao usuário
            const whitelist = new Set(['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos']);
            // Blacklist de sistema/ocultas
            const systemBlackList = new Set([
                'AppData', 'Application Data', 'Cookies', 'Local Settings', 'Ntuser.dat', 'Temp', 'Templates', 'Saved Games'
            ]);

            // Param showAll: se true, mostrar lista filtrada (sem whitelist), se false mostrar apenas whitelist
            const showAll = arguments[0] === true;

            let items = result.folders.filter(f => f.name);
            // remover ocultas iniciadas por ponto e system blacklist
            items = items.filter(f => !f.name.startsWith('.') && !systemBlackList.has(f.name));

            let visibleFolders;
            if (showAll) {
                visibleFolders = items.slice(0, 200);
            } else {
                visibleFolders = items.filter(f => whitelist.has(f.name));
            }

            if (visibleFolders.length === 0) {
                container.innerHTML = '<p>Nenhuma pasta relevante encontrada. Clique em "Mostrar mais" para ver todas as pastas.</p>';
                return;
            }

            container.innerHTML = visibleFolders.map(folder => `
                <div class="folder-item">
                    <div class="folder-info">
                        <div class="folder-name">📁 ${folder.name}</div>
                        <div class="folder-path" title="${folder.path}">${folder.path.replace(/\\\\/g, '/')}</div>
                        <div class="folder-created">Criado em: ${folder.created}</div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `<p>Erro ao listar pastas: ${result.error}</p>`;
        }
    } catch (error) {
        document.getElementById('foldersContainer').innerHTML = 
            `<p>Erro ao carregar pastas: ${error.message}</p>`;
    }
}

function showMessage(message, type) {
    const messageEl = document.getElementById('statusMessage');
    messageEl.textContent = message;
    messageEl.className = `status-message ${type}`;
    messageEl.classList.remove('hidden');

    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 5000);
}

// Limpar listeners quando a página for descarregada
window.addEventListener('beforeunload', () => {
    window.electronAPI.removeAllListeners('new-folder-created');
});