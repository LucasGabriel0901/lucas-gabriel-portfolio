document.addEventListener('DOMContentLoaded', () => {
    // ... (Mantenha o código do Chatbot e Navegação igual ao que você já tem) ...

    async function renderPublicProjects() {
        const publicProjectsGrid = document.getElementById('dynamic-projects-grid');
        if (!publicProjectsGrid) return;

        try {
            const response = await fetch('projetos.json?' + new Date().getTime());
            const projects = await response.json();
            
            publicProjectsGrid.innerHTML = ''; 

            projects.forEach((proj) => {
                const card = document.createElement('div');
                card.className = 'project-card glass-panel';
                
                let funcionalidadesHtml = '';
                if (proj.funcionalidades && proj.funcionalidades.length > 0) {
                    funcionalidadesHtml = '<ul style="margin-bottom: 20px; padding-left: 20px; font-size: 0.85rem; color: #aaa;">';
                    proj.funcionalidades.forEach(func => {
                        funcionalidadesHtml += `<li style="margin-bottom: 4px;">${func}</li>`;
                    });
                    funcionalidadesHtml += '</ul>';
                }

                card.innerHTML = `
                    <img src="${proj.img}" alt="${proj.title}" onerror="this.style.display='none'">
                    <div class="card-content">
                        <h3>${proj.title}</h3>
                        <p style="margin-bottom: 15px;">${proj.desc}</p>
                        ${funcionalidadesHtml}
                        <a href="${proj.link}" target="_blank" class="btn-project">Visitar Sistema</a>
                    </div>
                    <div class="status-badge status-${proj.status}">${proj.status}</div>
                `;
                publicProjectsGrid.appendChild(card);
            });
        } catch (e) {
            console.error("Erro ao carregar projetos:", e);
        }
    }

    renderPublicProjects();
    // ... (restante do seu código)
});