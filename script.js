document.addEventListener('DOMContentLoaded', () => {

    // ======================================================================
    // 1. INSPIRA UI - SPOTLIGHT EFFECT (Efeito do mouse nos cards)
    // ======================================================================
    const spotlightCards = document.querySelectorAll('.inspira-spotlight');
    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // ======================================================================
    // 2. LENIS DEV - SMOOTH SCROLLING (Configuração Amanteigada / Fluid)
    // ======================================================================
    const lenis = new Lenis({
        lerp: 0.07, // Interpolador Linear (deixa o scroll extremamente suave e natural)
        wheelMultiplier: 1,
        smoothWheel: true,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ======================================================================
    // 3. GSAP SCROLLTRIGGER (Animações Premium Moles/Fluidas)
    // ======================================================================
    gsap.registerPlugin(ScrollTrigger);

    // Sincroniza o ScrollTrigger com o Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{ lenis.raf(time * 1000) });
    gsap.ticker.lagSmoothing(0);

    // Efeito Parallax no Fundo (Background Aura)
    gsap.to("#parallax-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: { trigger: "body", start: "top top", end: "bottom top", scrub: true }
    });

    // Animação da Navbar e Hero no load
    gsap.from(".gsap-fade-down", { y: -30, opacity: 0, duration: 1.2, ease: "expo.out" });
    gsap.from(".gsap-fade-up-slow", { y: 40, opacity: 0, duration: 1.5, delay: 0.2, ease: "expo.out" });

    // Animação de Escala do Objetivo
    gsap.from(".gsap-scale-up", {
        scrollTrigger: { trigger: ".objective-section", start: "top 80%" },
        scale: 0.9, opacity: 0, duration: 1.2, ease: "back.out(1.5)"
    });

    // Animação lateral do Sobre Mim
    gsap.from(".gsap-slide-right", {
        scrollTrigger: { trigger: "#sobre", start: "top 80%" },
        x: -50, opacity: 0, duration: 1.2, ease: "expo.out"
    });
    gsap.from(".gsap-slide-left", {
        scrollTrigger: { trigger: "#sobre", start: "top 80%" },
        x: 50, opacity: 0, duration: 1.2, ease: "expo.out"
    });

    // Animação dos Títulos (Fade Up Suave)
    gsap.utils.toArray('.gsap-fade-up').forEach(element => {
        gsap.from(element, {
            scrollTrigger: { trigger: element, start: "top 85%" },
            y: 40, opacity: 0, duration: 1, ease: "expo.out"
        });
    });

    // Animação dos Grids / Cards em cascata (Entrada mais rápida e suave)
    gsap.utils.toArray('.gsap-stagger-grid').forEach(grid => {
        const items = grid.children;
        gsap.from(items, {
            scrollTrigger: { trigger: grid, start: "top 85%" },
            y: 50, scale: 0.98, opacity: 0, duration: 0.8, stagger: 0.1, ease: "expo.out"
        });
    });

    // ======================================================================
    // 4. RENDERIZAR OS PROJETOS DO JSON
    // ======================================================================
    async function renderPublicProjects() {
        const publicProjectsGrid = document.getElementById('dynamic-projects-grid');
        if (!publicProjectsGrid) return;

        try {
            const response = await fetch('projetos.json?' + new Date().getTime());
            let projects = await response.json();
            if (projects && !Array.isArray(projects) && projects.title) { projects = [projects]; }

            publicProjectsGrid.innerHTML = ''; 
            const gradientClasses = ['bg-vibrant-1', 'bg-vibrant-2', 'bg-vibrant-3'];

            projects.forEach((proj, index) => {
                const bgClass = gradientClasses[index % gradientClasses.length];
                let funcionalidadesHtml = '';
                
                if (proj.funcionalidades && Array.isArray(proj.funcionalidades)) {
                    funcionalidadesHtml = '<ul>' + proj.funcionalidades.map(f => `<li>${f}</li>`).join('') + '</ul>';
                }

                const cardHtml = `
                    <div class="project-card bento-card ${bgClass}">
                        <div class="status-badge">${proj.status}</div>
                        <img src="${proj.img}" alt="${proj.title}" onerror="this.style.display='none'">
                        <div class="card-content">
                            <h3>${proj.title}</h3>
                            <p>${proj.desc}</p>
                            ${funcionalidadesHtml}
                            <a href="${proj.link}" target="_blank" class="btn-project">Ver Detalhes →</a>
                        </div>
                    </div>
                `;
                publicProjectsGrid.insertAdjacentHTML('beforeend', cardHtml);
            });
            ScrollTrigger.refresh();

        } catch (e) {
            console.error("Erro ao carregar projetos:", e);
            publicProjectsGrid.innerHTML = '<p style="color: #ff5e00; text-align: center;">Erro ao carregar projetos.</p>';
        }
    }
    renderPublicProjects();

    // ======================================================================
    // 5. WIDGET CHATBOT WHATSAPP
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
            if (waWidget.classList.contains('open') && waMessages.children.length === 0) { sendBotMenu(); }
        });
        waClose.addEventListener('click', () => waWidget.classList.remove('open'));
    }

    function sendBotMenu() {
        sendBotMessage("Olá! Sou o assistente virtual do Lucas. Como posso te ajudar hoje?\n\nEscolha uma opção:", [
            { text: "1. Iniciar meu projeto", value: "1" },
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

        if (cleanInput.includes('1') || cleanInput.includes('projeto')) {
            sendBotMessage("Ótimo! O primeiro passo do nosso processo é a Reunião de Alinhamento. Vamos pro WhatsApp marcar?", [
                { text: "Ir para o WhatsApp", value: "3" }
            ]);
        } else if (cleanInput.includes('2') || cleanInput.includes('tecnologias')) {
            sendBotMessage("Stack principal: Python, JavaScript, Dart/Flutter, PostgreSQL, Figma e Azure. Deseja falar com ele?");
        } else if (cleanInput.includes('3') || cleanInput.includes('falar')) {
            sendBotMessage("Redirecionando você para o WhatsApp pessoal em instantes...");
            setTimeout(() => {
                window.open("https://wa.me/5511978730908?text=Olá%20Lucas!%20Gostaria%20de%20iniciar%20meu%20projeto.", "_blank");
            }, 1200);
        } else {
            sendBotMenu();
        }
    }
});