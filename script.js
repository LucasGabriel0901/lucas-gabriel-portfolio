document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const adminForm = document.getElementById('admin-form');
    
    const publicProjectsGrid = document.getElementById('dynamic-projects-grid');
    const adminProjectsList = document.getElementById('admin-projects-list');
    
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

    const initialProjects = [
        { title: 'Progredir ERP', desc: 'Sistema SaaS completo para gestão.', img: 'https://picsum.photos/400/250?random=1', link: '#' },
        { title: 'Processador NFe', desc: 'Leitor inteligente de Notas Fiscais em nuvem.', img: 'https://picsum.photos/400/250?random=2', link: '#' },
        { title: 'Dashboard Analytics', desc: 'Análise de dados com integration Azure.', img: 'https://picsum.photos/400/250?random=3', link: '#' }
    ];

    // CORREÇÃO DA LIXEIRA: Impede que re-popule se estiver intencionalmente vazio []
    function getProjects() {
        let saved = localStorage.getItem('portfolio_projects');
        if (saved === null) {
            localStorage.setItem('portfolio_projects', JSON.stringify(initialProjects));
            return initialProjects;
        }
        return JSON.parse(saved);
    }

    function renderPublicProjects() {
        if (!publicProjectsGrid) return;
        publicProjectsGrid.innerHTML = ''; 
        const projects = getProjects();

        projects.forEach((proj) => {
            const card = document.createElement('div');
            card.className = 'project-card glass-panel';
            card.innerHTML = `
                <img src="${proj.img}" alt="${proj.title}">
                <div class="card-content">
                    <h3>${proj.title}</h3>
                    <p>${proj.desc}</p>
                    <a href="${proj.link}" target="_blank" class="btn-project">Visitar Sistema</a>
                </div>
            `;
            publicProjectsGrid.appendChild(card);
        });
    }

    function renderAdminProjects() {
        if (!adminProjectsList) return;
        adminProjectsList.innerHTML = ''; 
        const projects = getProjects();

        projects.forEach((proj, index) => {
            const item = document.createElement('div');
            item.className = 'admin-list-item';
            item.innerHTML = `
                <div class="admin-list-info">
                    <h4>${proj.title}</h4>
                </div>
                <button class="btn-delete" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            `;
            
            item.querySelector('.btn-delete').addEventListener('click', () => deleteProject(index));
            adminProjectsList.appendChild(item);
        });
    }

    function deleteProject(index) {
        if(confirm("Tem certeza que deseja excluir este projeto do portfólio?")) {
            let projects = getProjects();
            projects.splice(index, 1); 
            localStorage.setItem('portfolio_projects', JSON.stringify(projects));
            
            renderPublicProjects(); 
            renderAdminProjects(); 
        }
    }

    renderPublicProjects();

    // NAVEGAÇÃO COM SISTEMA DE LOGOUT AUTOMÁTICO
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (isAnimating) return; 

            const targetSectionId = item.getAttribute('data-section');
            const targetSectionElement = document.getElementById(targetSectionId);

            if (targetSectionElement.classList.contains('active')) return;

            // BLOQUEIO REQUISITADO: Desautentica se o usuário sair da aba admin
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

    if (adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('proj-title').value;
            const desc = document.getElementById('proj-desc').value;
            const link = document.getElementById('proj-link').value;
            const imgFile = document.getElementById('proj-img').files[0];

            if (imgFile) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64Image = event.target.result;
                    const newProject = { title, desc, img: base64Image, link };

                    let currentProjects = getProjects();
                    currentProjects.push(newProject);
                    localStorage.setItem('portfolio_projects', JSON.stringify(currentProjects));

                    renderPublicProjects();
                    renderAdminProjects();
                    
                    adminForm.reset();
                    alert('🚀 Sucesso! Novo sistema publicado.');
                };
                reader.readAsDataURL(imgFile);
            }
        });
    }

    // ==========================================
    // LÓGICA DO INTERATIVA DO CHATBOT WHATSAPP
    // ==========================================
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