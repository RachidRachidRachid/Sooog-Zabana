/**
 * SOGE ZABANA Admin CRM Console Actions
 */
const Admin = {
    activeTab: 'dashboard',

    init() {
        Auth.requireAdmin();
        this.setupTabListeners();
        
        // Initial load
        Dashboard.init();
    },

    // Tabs control panel switcher
    setupTabListeners() {
        const triggers = document.querySelectorAll('.admin-menu-item');
        triggers.forEach(item => {
            const link = item.querySelector('a');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Set active CSS class
                triggers.forEach(t => t.classList.remove('active'));
                item.classList.add('active');

                const targetTab = link.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    },

    switchTab(tabName) {
        this.activeTab = tabName;
        
        // Show/hide sections in the DOM
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.style.display = 'none';
        });
        
        const activeSec = document.getElementById(`admin-section-${tabName}`);
        if (activeSec) activeSec.style.display = 'block';

        // Load specific tab parameters
        switch (tabName) {
            case 'dashboard':
                Dashboard.init();
                break;
            case 'annonces':
                this.loadAnnonces();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    },

    // 1. Manage Listings
    async loadAnnonces() {
        const user = Auth.getCurrentUser();
        const response = await API.call('getAdminAnnonces', { role: user.role });
        const body = document.getElementById('admin-annonces-body');
        if (!body) return;

        body.innerHTML = '';

        if (!response.success || !response.data) {
            body.innerHTML = `<tr><td colspan="6" style="text-align:center;">Erreur ou aucune annonce</td></tr>`;
            return;
        }

        response.data.forEach(ad => {
            const price = ad.prix > 0 ? `${ad.prix.toLocaleString('fr-FR')} DA` : 'Négociable';
            const cat = CONFIG.CATEGORIES.find(c => c.id == ad.categorie_id) || { name: 'Autre' };
            const statusClass = ad.statut === 'valide' ? 'badge-success' : 'badge-danger';
            
            body.innerHTML += `
                <tr>
                    <td>#${ad.id}</td>
                    <td>
                        <div style="font-weight:700; color:var(--secondary); font-size:0.9rem;">${ad.titre}</div>
                        <span style="font-size: 0.75rem; color:var(--text-muted);">${cat.name} • ${ad.region}</span>
                    </td>
                    <td>${price}</td>
                    <td>
                        <span class="badge ${statusClass}">${ad.statut.toUpperCase()}</span>
                    </td>
                    <td>${new Date(ad.date_creation).toLocaleDateString('fr-FR')}</td>
                    <td>
                        <div class="action-buttons">
                            <a href="annonce.html?id=${ad.id}" target="_blank" class="btn-icon btn-icon-view" title="Voir l'annonce">
                                <span class="material-icons">visibility</span>
                            </a>
                            <button onclick="Admin.toggleAdStatus(${ad.id}, '${ad.statut === 'valide' ? 'suspendu' : 'valide'}')" class="btn-icon btn-icon-edit" style="color:var(--primary);" title="Modifier le statut">
                                <span class="material-icons">swap_horiz</span>
                            </button>
                            <button onclick="Admin.deleteAd(${ad.id})" class="btn-icon btn-icon-delete" title="Supprimer définitivement">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    },

    async toggleAdStatus(adId, newStatus) {
        const user = Auth.getCurrentUser();
        const res = await API.call('modifierAnnonce', { id: adId, utilisateur_id: user.id, updates: { statut: newStatus } });
        if (res.success) {
            this.loadAnnonces();
        } else {
            alert(res.error);
        }
    },

    async deleteAd(adId) {
        if (!confirm("Voulez-vous vraiment supprimer définitivement cette annonce ?")) return;
        const user = Auth.getCurrentUser();
        const res = await API.call('supprimerAnnonce', { id: adId, utilisateur_id: user.id });
        if (res.success) {
            this.loadAnnonces();
        } else {
            alert(res.error);
        }
    },

    // 2. Manage Users
    async loadUsers() {
        const adminUser = Auth.getCurrentUser();
        const response = await API.call('getAdminUsers', { role: adminUser.role });
        const body = document.getElementById('admin-users-body');
        if (!body) return;

        body.innerHTML = '';

        if (!response.success || !response.data) {
            body.innerHTML = `<tr><td colspan="6" style="text-align:center;">Erreur ou aucun utilisateur</td></tr>`;
            return;
        }

        response.data.forEach(u => {
            const statusClass = u.statut === 'actif' ? 'badge-success' : 'badge-danger';
            
            body.innerHTML += `
                <tr>
                    <td>#${u.id}</td>
                    <td>
                        <div class="user-info-cell">
                            <div class="user-avatar-small">${u.prenom.charAt(0).toUpperCase()}</div>
                            <div>
                                <div style="font-weight:700; color:var(--secondary); font-size:0.9rem;">${u.prenom} ${u.nom}</div>
                                <span style="font-size:0.75rem; color:var(--text-muted);">${u.email}</span>
                            </div>
                        </div>
                    </td>
                    <td>${u.telephone}</td>
                    <td>
                        <span class="badge ${u.role === 'admin' ? 'badge-primary' : 'badge-outline'}" style="font-size:0.7rem;">${u.role.toUpperCase()}</span>
                    </td>
                    <td>
                        <span class="badge ${statusClass}">${u.statut.toUpperCase()}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="Admin.toggleUserStatus(${u.id}, '${u.statut === 'actif' ? 'bloque' : 'actif'}')" class="btn-icon btn-icon-edit" title="Changer le statut">
                                <span class="material-icons">lock_open</span>
                            </button>
                            <button onclick="Admin.toggleUserRole(${u.id}, '${u.role === 'admin' ? 'utilisateur' : 'admin'}')" class="btn-icon btn-icon-view" style="color:var(--primary);" title="Modifier les privilèges">
                                <span class="material-icons">security</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    },

    async toggleUserStatus(userId, newStatus) {
        const user = Auth.getCurrentUser();
        const res = await API.call('modifierUtilisateur', { id: userId, role: user.role, updates: { statut: newStatus } });
        if (res.success) {
            this.loadUsers();
        } else {
            alert(res.error);
        }
    },

    async toggleUserRole(userId, newRole) {
        const user = Auth.getCurrentUser();
        const res = await API.call('modifierUtilisateur', { id: userId, role: user.role, updates: { role: newRole } });
        if (res.success) {
            this.loadUsers();
        } else {
            alert(res.error);
        }
    },

    // 3. App Settings Configuration key-value
    async loadSettings() {
        const user = Auth.getCurrentUser();
        const response = await API.call('getAdminSettings', { role: user.role });
        const form = document.getElementById('admin-settings-form');
        if (!form) return;

        form.innerHTML = '';

        if (!response.success || !response.data) {
            form.innerHTML = `<p>Erreur lors du chargement des paramètres</p>`;
            return;
        }

        response.data.forEach(cfg => {
            form.innerHTML += `
                <div class="form-group">
                    <label class="form-label" for="cfg-${cfg.cle}">${cfg.description}</label>
                    <input type="text" id="cfg-${cfg.cle}" class="form-control" value="${cfg.valeur}" data-key="${cfg.cle}">
                </div>
            `;
        });

        form.innerHTML += `
            <div style="margin-top:24px;">
                <button type="submit" class="btn btn-primary">Enregistrer les paramètres</button>
            </div>
        `;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = form.querySelectorAll('input');
            const updatedSettings = [];
            
            inputs.forEach(input => {
                updatedSettings.push({
                    cle: input.getAttribute('data-key'),
                    valeur: input.value,
                    description: form.querySelector(`label[for="cfg-${input.getAttribute('data-key')}"]`).innerText
                });
            });

            const saveRes = await API.call('saveAdminSettings', { role: user.role, settings: updatedSettings });
            if (saveRes.success) {
                alert("Paramètres enregistrés avec succès !");
                this.loadSettings();
            } else {
                alert(saveRes.error);
            }
        });
    }
};
