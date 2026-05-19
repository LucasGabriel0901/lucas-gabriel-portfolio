document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const adminForm = document.getElementById('admin-form');
    
    // As duas listas diferentes (Pública e Admin)
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

    // State variables for editing
    let isEditingProject = false;
    let projectToEditId = null;

    // Projetos iniciais fictícios (Apenas para primeira visualização se quiser)
    const initialProjects = [
        { title: 'Progredir ERP', desc: 'Sistema SaaS completo para gestão.', img: 'https://picsum.photos/400/250?random=1', link: '#' },
        { title: 'Processador NFe', desc: 'Leitor inteligente de Notas Fiscais em nuvem.', img: 'https://picsum.photos/400/250?random=2', link: '#' },
        { title: 'Dashboard Analytics', desc: 'Análise de dados com integration Azure.', img: 'https://picsum.photos/400/250?random=3', link: '#' }
    ];

    // INICIALIZAR BANCO DE DADOS LOCAL
    function getProjects() {
        let saved = localStorage.getItem('portfolio_projects');
        if (saved === null) {
            // CORREÇÃO: Se for a PRIMEIRA VEZ, inicia Vazio e não com fictícios
            localStorage.setItem('portfolio_projects', JSON.stringify([]));
            return [];
        }
        return JSON.parse(saved);
    }

    // FUNÇÃO QUE GERA O HTML DO STATUS BADGE
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

    // 1. RENDERIZA PROJETOS NA PÁGINA PÚBLICA (Sem botões de gestão, com status)
    function renderPublicProjects() {
        publicProjectsGrid.innerHTML = ''; 
        const projects = getProjects();

        if (projects.length === 0) {
            publicProjectsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.6; padding: 40px 0;">Nenhum sistema adicionado ainda.</p>';
            return;
        }

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
                ${getStatusBadgeHtml(proj.status)}
            `;
            publicProjectsGrid.appendChild(card);
        });
    }

    // 2. RENDERIZA LISTA NO PAINEL ADMIN (Com botões Editar e Excluir)
    function renderAdminProjects() {
        if (!adminProjectsList) return;
        adminProjectsList.innerHTML = ''; 
        const projects = getProjects();

        if (projects.length === 0) {
            adminProjectsList.innerHTML = '<p style="text-align: center; opacity: 0.6;">Nenhum projeto cadastrado.</p>';
            return;
        }

        projects.forEach((proj) => {
            const item = document.createElement('div');
            item.className = 'admin-list-item';
            item.innerHTML = `
                <div class="admin-list-info">
                    <h4>${proj.title}</h4>
                </div>
                <div class="admin-item-actions">
                    <button class="btn-action-edit" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn-delete" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            
            // Eventos dos botões baseados no ID único
            item.querySelector('.btn-action-edit').addEventListener('click', () => prepareEditProject(proj.id));
            item.querySelector('.btn-delete').addEventListener('click', () => deleteProject(proj.id));
            
            adminProjectsList.appendChild(item);
        });
    }

    // INICIAR EDIÇÃO DE PROJETO
    function prepareEditProject(projectId) {
        const projects = getProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (!project) return;

        isEditingProject = true;
        projectToEditId = projectId;

        // Preencher o formulário
        document.getElementById('edit-project-id').value = projectId;
        document.getElementById('proj-title').value = project.title;
        document.getElementById('proj-desc').value = project.desc;
        document.getElementById('proj-link').value = project.link;
        document.getElementById('proj-status').value = project.status;
        
        // Mudar visual do formulário para "Edição"
        document.getElementById('admin-form-title').innerText = "Editar Projeto";
        document.getElementById('btn-submit-admin').innerText = "Salvar Alterações";
        document.getElementById('btn-cancel-edit').style.display = "inline-block";
        
        // Rola para o topo do formulário
        adminForm.scrollIntoView({ behavior: 'smooth' });
    }

    // CANCELAR EDIÇÃO
    function cancelEditProject() {
        isEditingProject = false;
        projectToEditId = null;
        
        // Resetar formulário e visual
        adminForm.reset();
        document.getElementById('edit-project-id').value = "";
        document.getElementById('admin-form-title').innerText = "Adicionar Novo";
        document.getElementById('btn-submit-admin').innerText = "Publicar Card";
        document.getElementById('btn-cancel-edit').style.display = "none";
    }

    // EXCLUIR PROJETO
    function deleteProject(projectId) {
        if(confirm("Tem certeza que deseja excluir este projeto permanentemente?")) {
            let projects = getProjects();
            // Filtra removendo o ID correspondente
            projects = projects.filter(p => p.id !== projectId);
            localStorage.setItem('portfolio_projects', JSON.stringify(projects));
            
            // Se estava editando esse projeto, cancela a edição
            if (isEditingProject && projectToEditId === projectId) {
                cancelEditProject();
            }

            renderPublicProjects(); 
            renderAdminProjects(); 
        }
    }

    // Inicializa a tela pública
    renderPublicProjects();

    // NAVEGAÇÃO SPA (Transição Suave)
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (isAnimating) return; 

            const targetSectionId = item.getAttribute('data-section');
            const targetSectionElement = document.getElementById(targetSectionId);

            if (targetSectionElement.classList.contains('active')) return;

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

    // Helper function to save and refresh
    function saveAndRefresh(projectsArray, message) {
        localStorage.setItem('portfolio_projects', JSON.stringify(projectsArray));
        renderPublicProjects();
        renderAdminProjects();
        alert(message);
    }

    // PROCESSAR FORMULÁRIO (ADICIONAR OU EDITAR)
    if (adminForm) {
        document.getElementById('btn-cancel-edit').addEventListener('click', cancelEditProject);

        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('proj-title').value;
            const desc = document.getElementById('proj-desc').value;
            const link = document.getElementById('proj-link').value;
            const status = document.getElementById('proj-status').value;
            const imgFile = document.getElementById('proj-img').files[0];

            let projects = getProjects();

            if (isEditingProject) {
                // MODO EDIÇÃO
                const index = projects.findIndex(p => p.id === projectToEditId);
                if (index === -1) return;

                // Atualiza dados textuais
                projects[index].title = title;
                projects[index].desc = desc;
                projects[index].link = link;
                projects[index].status = status;

                if (imgFile) {
                    // Se enviou imagem nova, processa e salva
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        projects[index].img = event.target.result;
                        saveAndRefresh(projects, '🚀 Projeto atualizado com sucesso!');
                        cancelEditProject();
                    };
                    reader.readAsDataURL(imgFile);
                } else {
                    // Se não enviou imagem, mantém a antiga e salva
                    saveAndRefresh(projects, '🚀 Projeto atualizado com sucesso!');
                    cancelEditProject();
                }

            } else {
                // MODO ADICIONAR NOVO
                if (!imgFile) {
                    alert("Por favor, selecione uma imagem para o novo projeto.");
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64Image = event.target.result;
                    // Cria objeto com ID único baseada no timestamp
                    const newProject = { 
                        id: Date.now().toString(),
                        title, 
                        desc, 
                        img: base64Image, 
                        link,
                        status 
                    };

                    projects.push(newProject);
                    saveAndRefresh(projects, '🚀 Novo sistema publicado com sucesso!');
                    adminForm.reset();
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