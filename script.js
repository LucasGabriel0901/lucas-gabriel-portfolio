document.addEventListener('DOMContentLoaded', () => {

    // 1. ANIMAÇÕES DE SCROLL (Fade Up)
    const fadeElements = document.querySelectorAll('.fade-up');

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => scrollObserver.observe(el));


    // 2. LÓGICA DO CARROSSEL INFINITO (MARQUEE)
    const marquees = document.querySelectorAll('.marquee');
    marquees.forEach(marquee => {
        const children = Array.from(marquee.children);
        children.forEach(child => {
            const clone = child.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            marquee.appendChild(clone);
        });
    });


    // 3. CARREGAMENTO DOS PROJETOS
    async function loadProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;

        try {
            const response = await fetch('projetos.json');
            let projects = await response.json();
            
            if (!Array.isArray(projects)) { projects = [projects]; }

            container.innerHTML = '';

            projects.forEach((proj) => {
                const card = document.createElement('div');
                card.className = 'card project-card fade-up';
                
                card.innerHTML = `
                    <a href="${proj.link}" target="_blank" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                        <div style="overflow: hidden;">
                            <img src="${proj.img}" alt="${proj.title}" class="project-img" onerror="this.src='https://via.placeholder.com/600x400/111/333?text=Projeto'">
                        </div>
                        <div class="project-content">
                            <h3>${proj.title}</h3>
                            <span class="btn-outline">Acessar Sistema</span>
                        </div>
                    </a>
                `;
                
                container.appendChild(card);
                scrollObserver.observe(card);
            });

        } catch (error) {
            console.error("Erro ao carregar projetos:", error);
            container.innerHTML = `<p class="text-muted">Erro ao carregar portfólio. Verifique o projetos.json</p>`;
        }
    }

    loadProjects();

    // 4. WIDGET CHATBOT WHATSAPP
    const waWidget = document.getElementById('whatsapp-widget');
    const waButton = document.querySelector('.wa-button');
    const waClose = document.getElementById('wa-close');
    const waMessages = document.getElementById('wa-messages-container');
    const waInput = document.getElementById('wa-input');
    const waSend = document.getElementById('wa-send');

    if (waButton && waWidget) {
        waButton.addEventListener('click', () => {
            waWidget.classList.toggle('open');
            if (waWidget.classList.contains('open') && waMessages.children.length === 0) { sendBotMenu(); }
        });
        waClose.addEventListener('click', () => waWidget.classList.remove('open'));
    }

    function sendBotMenu() {
        sendBotMessage("Olá! Sou o assistente virtual do Lucas. Como posso te ajudar hoje?\n\nEscolha uma opção:", [
            { text: "1. Solicitar Orçamento", value: "1" },
            { text: "2. Ver Tecnologias", value: "2" },
            { text: "3. Falar no WhatsApp ➔", value: "3" }
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
        waInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserSend(); });
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

        if (cleanInput.includes('1') || cleanInput.includes('orçamento')) {
            sendBotMessage("Ótimo! O Lucas desenvolve Landing Pages, Dashboards e Sistemas. Vamos conversar no WhatsApp dele para alinhar detalhes?", [
                { text: "Ir para o WhatsApp", value: "3" }
            ]);
        } else if (cleanInput.includes('2') || cleanInput.includes('tecnologias')) {
            sendBotMessage("Stack principal: Python, JavaScript, Figma e Banco de Dados (PostgreSQL). Deseja falar diretamente com ele?");
        } else if (cleanInput.includes('3') || cleanInput.includes('falar')) {
            sendBotMessage("Redirecionando você para o WhatsApp pessoal em instantes...");
            setTimeout(() => {
                window.open("https://wa.me/5511978730908?text=Olá%20Lucas!%20Gostaria%20de%20falar%20sobre%20um%20projeto.", "_blank");
            }, 1200);
        } else {
            sendBotMenu();
        }
    }
});