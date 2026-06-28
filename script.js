document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================
       ANIMAÇÕES DE SCROLL
       ========================================================== */
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


    /* ==========================================================
       TEXTO DIGITANDO NO HERO
       ========================================================== */
    const typingText = document.getElementById('typing-text');

    const typingPhrases = [
        'desenvolvendo interfaces modernas...',
        'criando sistemas com banco de dados...',
        'automatizando processos com tecnologia...',
        'transformando ideias em produtos digitais...',
        'conectando front-end, back-end e dados...'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        if (!typingText) return;

        const currentPhrase = typingPhrases[phraseIndex];

        if (!isDeleting) {
            typingText.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === currentPhrase.length) {
                isDeleting = true;
                setTimeout(typeEffect, 1400);
                return;
            }
        } else {
            typingText.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % typingPhrases.length;
            }
        }

        setTimeout(typeEffect, isDeleting ? 35 : 65);
    }

    typeEffect();


    /* ==========================================================
       MARQUEE DOS CARDS SUPERIORES
       ========================================================== */
    function duplicateMarqueeItems() {
        const marquees = document.querySelectorAll('.marquee');

        marquees.forEach(marquee => {
            const children = Array.from(marquee.children);

            children.forEach(child => {
                const clone = child.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                marquee.appendChild(clone);
            });
        });
    }

    duplicateMarqueeItems();


    /* ==========================================================
       FUNÇÕES AUXILIARES
       ========================================================== */
    function escapeHTML(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getProjectImage(project) {
        if (Array.isArray(project.images) && project.images.length > 0) {
            return project.images[0];
        }

        return project.img || 'https://via.placeholder.com/600x400/111/333?text=Projeto';
    }


    /* ==========================================================
       CRIA CARD DE PROJETO
       ========================================================== */
    function createProjectCard(project) {
        const card = document.createElement('article');
        card.className = 'card project-card fade-up';

        const title = escapeHTML(project.title || 'Projeto');
        const desc = escapeHTML(project.desc || 'Projeto desenvolvido com foco em performance, design e funcionalidade.');
        const link = project.link || '#';
        const image = getProjectImage(project);
        const type = escapeHTML(project.type || 'Projeto');
        const stack = Array.isArray(project.stack) ? project.stack : [];

        const stackHTML = stack
            .map(item => `<span>${escapeHTML(item)}</span>`)
            .join('');

        card.innerHTML = `
            <a href="${link}" target="_blank" rel="noopener noreferrer" class="project-link">
                <div class="project-media">
                    <img 
                        src="${image}" 
                        alt="${title}" 
                        class="project-img"
                        onerror="this.src='https://via.placeholder.com/600x400/111/333?text=Projeto'"
                    >
                    <span class="project-badge">${type}</span>
                </div>

                <div class="project-content">
                    <h3>${title}</h3>

                    <p class="text-muted">${desc}</p>

                    <div class="project-stack">
                        ${stackHTML}
                    </div>

                    <span class="btn-outline">
                        Ver projeto
                    </span>
                </div>
            </a>
        `;

        return card;
    }


    /* ==========================================================
       RENDERIZA GRID DE PROJETOS
       ========================================================== */
    function renderProjectGrid(container, projects) {
        if (!container) return;

        container.innerHTML = '';

        if (!Array.isArray(projects) || projects.length === 0) {
            container.innerHTML = `
                <p class="text-muted">
                    Nenhum projeto cadastrado no momento.
                </p>
            `;
            return;
        }

        projects.forEach(project => {
            const card = createProjectCard(project);
            container.appendChild(card);
            scrollObserver.observe(card);
        });
    }


    /* ==========================================================
       CARREGA PROJETOS DO JSON SEPARADO
       ========================================================== */
    async function loadProjects() {
        const frontendContainer = document.getElementById('frontend-projects');
        const backendContainer = document.getElementById('backend-projects');

        if (!frontendContainer || !backendContainer) return;

        try {
            const response = await fetch('projetos.json');

            if (!response.ok) {
                throw new Error('Não foi possível carregar o projetos.json');
            }

            const data = await response.json();

            const frontendProjects = Array.isArray(data.frontend) ? data.frontend : [];
            const backendProjects = Array.isArray(data.backend) ? data.backend : [];

            renderProjectGrid(frontendContainer, frontendProjects);
            renderProjectGrid(backendContainer, backendProjects);

        } catch (error) {
            console.error('Erro ao carregar projetos:', error);

            frontendContainer.innerHTML = `
                <p class="text-muted">
                    Erro ao carregar os projetos Front-End. Verifique o projetos.json.
                </p>
            `;

            backendContainer.innerHTML = `
                <p class="text-muted">
                    Erro ao carregar os projetos Back-End. Verifique o projetos.json.
                </p>
            `;
        }
    }

    loadProjects();

});