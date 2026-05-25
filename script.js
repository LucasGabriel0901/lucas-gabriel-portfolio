document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const curtain = document.querySelector('.transition-curtain');
    let isAnimating = false;

    // MODAL DE LOGIN
    const loginModal = document.getElementById('login-modal');
    const btnLogin = document.getElementById('btn-login');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const passwordInput = document.getElementById('modal-password');
    let pendingNavItem = null; 

    const MASTER_PASSWORD = "Luc@s6575";
    let isAdminAuthenticated = false;

    // ======================================================================
    // 1. BUSCA OS PROJETOS DIRETO DO ARQUIVO projetos.json
    // ======================================================================
    async function fetchProjects() {
        try {
            const response = await fetch('projetos.json?' + new Date().getTime());
            if (!response.ok) throw new Error('Arquivo JSON não encontrado');
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            return [];
        }
    }

    function getStatusBadgeHtml(status) {
        let label = "Concluído";
        let cssClass = "status-concluido";

        switch (status) {
            case 'desenvolvimento':
                label = "Em desenvolvimento";
                cssClass = "status-desenvolvimento";
                break;
            case 'teste':
                label = "Em teste";
                cssClass = "status-teste";
                break;
        }

        return `<div class="status-badge ${cssClass}">${label}</div>`;
    }

    // RENDERIZA NA TELA PÚBLICA
    async function renderPublicProjects() {
        const publicProjectsGrid = document.getElementById('dynamic-projects-grid');
        if (!publicProjectsGrid) return;

        publicProjectsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--neon-green);">Carregando projetos da nuvem...</p>';

        let projects = await fetchProjects();
        publicProjectsGrid.innerHTML = ''; 

        // TRAVA DE SEGURANÇA para o JSON
        if (projects && !Array.isArray(projects) && projects.title) {
            projects = [projects];
        }

        if (!projects || projects.length === 0) {
            publicProjectsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.6; padding: 40px 0;">Nenhum sistema adicionado no arquivo projetos.json ainda.</p>';
            return;
        }

        projects.forEach((proj) => {
            const card = document.createElement('div');
            card.className = 'project-card glass-panel';
            
            // Monta a lista de funcionalidades se ela existir no JSON
            let funcionalidadesHtml = '';
            if (proj.funcionalidades && Array.isArray(proj.funcionalidades) && proj.funcionalidades.length > 0) {
                funcionalidadesHtml = '<ul style="margin-bottom: 20px; padding-left: 20px; font-size: 0.85rem; color: #aaa; line-height: 1.5;">';
                proj.funcionalidades.forEach(func => {
                    funcionalidadesHtml += `<li style="margin-bottom: 6px;">${func}</li>`;
                });
                funcionalidadesHtml += '</ul>';
            }

            card.innerHTML = `
                <img src="${proj.img}" alt="${proj.title}" onerror="this.src='Foto_perfil_port.jpeg'">
                <div class="card-content">
                    <h3>${proj.title}</h3>
                    <p style="margin-bottom: 15px;">${proj.desc}</p>
                    
                    ${funcionalidadesHtml}
                    
                    <a href="${proj.link}" target="_blank" class="btn-project">Visitar Sistema</a>
                </div>
                ${getStatusBadgeHtml(proj.status)}
            `;
            publicProjectsGrid.appendChild(card);
        });
    }

    renderPublicProjects();

    // BLOQUEIA O FORMULÁRIO ANTIGO E AVISA PARA EDITAR NO CÓDIGO
    function renderAdminProjects() {
        const adminProjectsList = document.getElementById('admin-projects-list');
        if (!adminProjectsList) return;
        
        adminProjectsList.innerHTML = `
            <div style="background: rgba(255, 165, 0, 0.1); border: 1px solid rgba(255, 165, 0, 0.3); padding: 25px; border-radius: 15px; text-align: center;">
                <i class="fa-solid fa-code" style="font-size: 2.5rem; color: #ff9f43; margin-bottom: 15px;"></i>
                <h4 style="color: #ff9f43; margin-bottom: 10px; font-size: 1.2rem;">Modo de Edição Direto no Código</h4>
                <p style="font-size: 0.95rem; color: #ddd; line-height: 1.6;">
                    Como o portfólio está no GitHub Pages, os projetos são gerenciados diretamente nos arquivos para que todos possam ver.<br><br>
                    Para gerenciar, edite o arquivo <code>projetos.json</code>.
                </p>
            </div>
        `;

        const adminForm = document.getElementById('admin-form');
        if(adminForm) {
            const inputs = adminForm.querySelectorAll('input, textarea, select');
            inputs.forEach(i => i.disabled = true);
            const btn = document.getElementById('btn-submit-admin');
            if(btn) {
                btn.innerText = "Edição bloqueada: Use o projetos.json";
                btn.style.background = "#333";
                btn.style.color = "#888";
                btn.style.cursor = "not-allowed";
            }
        }
    }

    // ======================================================================
    // 2. NAVEGAÇÃO E MODAL DE LOGIN
    // ======================================================================
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (isAnimating) return; 

            const targetSectionId = item.getAttribute('data-section');
            const targetSectionElement = document.getElementById(targetSectionId);

            if (targetSectionElement.classList.contains('active')) return;

            if (targetSectionId !== 'admin') {
                isAdminAuthenticated = false;
            }

            if (targetSectionId === 'admin' && !isAdminAuthenticated) {
                pendingNavItem = item;
                loginModal.classList.add('active');
                return; 
            }

            triggerPageTransition(item, targetSectionElement);
        });
    });

    btnCloseModal.addEventListener('click', () => {
        loginModal.classList.remove('active');
        passwordInput.value = '';
    });

    btnLogin.addEventListener('click', validateLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') validateLogin();
    });

    function validateLogin() {
        if (passwordInput.value === MASTER_PASSWORD) {
            isAdminAuthenticated = true;
            loginModal.classList.remove('active');
            passwordInput.value = '';
            
            renderAdminProjects();
            triggerPageTransition(pendingNavItem, document.getElementById('admin'));
        } else {
            alert("❌ Senha Incorreta!");
            passwordInput.value = '';
        }
    }

    function triggerPageTransition(clickedItem, targetElement) {
        isAnimating = true;
        curtain.classList.add('cover');

        setTimeout(() => {
            sections.forEach(sec => sec.classList.remove('active'));
            navItems.forEach(nav => nav.classList.remove('active'));

            targetElement.classList.add('active');
            clickedItem.classList.add('active');

            window.scrollTo(0, 0);

            curtain.classList.remove('cover');
            curtain.classList.add('reveal');

            setTimeout(() => {
                curtain.style.transition = 'none'; 
                curtain.classList.remove('reveal');
                
                setTimeout(() => {
                    curtain.style.transition = 'transform 0.7s cubic-bezier(0.85, 0, 0.15, 1)';
                    isAnimating = false; 
                }, 50);
            }, 700); 
        }, 600); 
    }

    // ======================================================================
    // 3. WIDGET CHATBOT WHATSAPP
    // ======================================================================
    const waWidget = document.getElementById('whatsapp-widget');
    const waButton = document.querySelector('.wa-button');
    const waClose = document.getElementById('wa-close');
    const waMessages = document.getElementById('wa-messages-container');
    const waInput = document.getElementById('wa-input');
    const waSend = document.getElementById('wa-send');

    if (waButton && waWidget) {
        waButton.addEventListener('click', () => {
            waWidget.classList.toggle('open');
            if (waWidget.classList.contains('open') && waMessages.children.length === 0) {
                sendBotMenu();
            }
        });
        waClose.addEventListener('click', () => waWidget.classList.remove('open'));
    }

    function sendBotMenu() {
        sendBotMessage("Olá! Sou o assistente virtual do Lucas Gabriel. Como posso te ajudar hoje?\n\nEscolha uma das opções abaixo ou digite o número:", [
            { text: "1. Solicitar um Orçamento", value: "1" },
            { text: "2. Conhecer as Tecnologias", value: "2" },
            { text: "3. Falar no WhatsApp Real ➔", value: "3" }
        ]);
    }

    function sendBotMessage(text, options = []) {
        const msgHtml = document.createElement('div');
        msgHtml.className = 'wa-msg bot';
        msgHtml.innerText = text;
        
        if (options.length > 0) {
            const optsContainer = document.createElement('div');
            optsContainer.className = 'wa-options-list';
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'wa-opt-btn';
                btn.innerText = opt.text;
                btn.onclick = () => handleOptionSelection(opt.value, opt.text);
                optsContainer.appendChild(btn);
            });
            msgHtml.appendChild(optsContainer);
        }

        waMessages.appendChild(msgHtml);
        waMessages.scrollTop = waMessages.scrollHeight;
    }

    function handleOptionSelection(value, label) {
        addUserMessage(label);
        setTimeout(() => processBotResponse(value), 600);
    }

    function addUserMessage(text) {
        const msgHtml = document.createElement('div');
        msgHtml.className = 'wa-msg user';
        msgHtml.innerText = text;
        waMessages.appendChild(msgHtml);
        waMessages.scrollTop = waMessages.scrollHeight;
    }

    if (waSend) {
        waSend.addEventListener('click', handleUserSend);
        waInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserSend();
        });
    }

    function handleUserSend() {
        const text = waInput.value.trim();
        if (!text) return;
        addUserMessage(text);
        waInput.value = '';
        setTimeout(() => processBotResponse(text), 600);
    }

    function processBotResponse(input) {
        const cleanInput = input.toString().toLowerCase();

        if (cleanInput.includes('1') || cleanInput.includes('orçamento') || cleanInput.includes('orcamento')) {
            sendBotMessage("Sensacional! O Lucas cria Landing Pages, Sistemas Web robustos e Bots integrados. Vamos conversar direto no WhatsApp dele para alinhar o escopo?", [
                { text: "Ir para o WhatsApp Comercial", value: "3" }
            ]);
        } else if (cleanInput.includes('2') || cleanInput.includes('tecnologias') || cleanInput.includes('stack')) {
            sendBotMessage("Ele domina o desenvolvimento Full Stack com Python (FastAPI/Django), Dart/Flutter para Mobile, JavaScript, Bancos PostgreSQL e Nuvem Azure. Posso te direcionar para o contato dele?");
        } else if (cleanInput.includes('3') || cleanInput.includes('falar') || cleanInput.includes('contato')) {
            sendBotMessage("Perfeito! Redirecionando você para o WhatsApp pessoal do Lucas em instantes...");
            setTimeout(() => {
                window.open("https://wa.me/5511978730908?text=Olá%20Lucas!%20Falei%20com%20seu%20bot%20e%20gostaria%20de%20um%20atendimento.", "_blank");
            }, 1200);
        } else {
            sendBotMessage("Não entendi muito bem. Por favor, escolha uma das opções válidas:", [
                { text: "1. Solicitar um Orçamento", value: "1" },
                { text: "2. Conhecer as Tecnologias", value: "2" },
                { text: "3. Falar no WhatsApp Real ➔", value: "3" }
            ]);
        }
    }
});