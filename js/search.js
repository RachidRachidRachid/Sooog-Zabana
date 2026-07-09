/**
 * SOGE ZABANA Autocomplete Search & Cascading Dropdowns
 */
const Search = {
    initLocationDropdowns(wilayaSelectId, communeSelectId) {
        const wSelect = document.getElementById(wilayaSelectId);
        const cSelect = document.getElementById(communeSelectId);

        if (!wSelect || !cSelect) return;

        // Load wilayas
        wSelect.innerHTML = `<option value="">Toutes les Wilayas</option>`;
        CONFIG.WILAYAS.forEach(w => {
            wSelect.innerHTML += `<option value="${w.name}">${w.code} - ${w.name} ${w.name_ar}</option>`;
        });

        // Event listener on Wilaya change
        wSelect.addEventListener('change', (e) => {
            const selectedWilayaName = e.target.value;
            const wilayaObj = CONFIG.WILAYAS.find(w => w.name === selectedWilayaName);
            
            cSelect.innerHTML = `<option value="">Toutes les Communes</option>`;
            
            if (wilayaObj) {
                const filtered = CONFIG.COMMUNES.filter(c => c.wilaya_id === wilayaObj.id);
                filtered.forEach(c => {
                    cSelect.innerHTML += `<option value="${c.name}">${c.name} ${c.name_ar}</option>`;
                });
                cSelect.disabled = false;
            } else {
                cSelect.disabled = true;
            }
        });
    },

    // Build categories layout cards
    renderCategoryGrid(containerId, activeSlug = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(130px, 1fr))';
        container.style.gap = '16px';
        container.style.margin = '24px 0';

        CONFIG.CATEGORIES.forEach(cat => {
            const card = document.createElement('a');
            card.href = `index.html?category=${cat.id}`;
            card.className = `category-card animate-fade-up ${cat.slug === activeSlug ? 'active' : ''}`;
            
            // Inline stylesheet for category design details if needed
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'center';
            card.style.padding = '16px';
            card.style.background = cat.slug === activeSlug ? 'var(--primary)' : 'var(--surface)';
            card.style.color = cat.slug === activeSlug ? 'white' : 'var(--secondary)';
            card.style.borderRadius = 'var(--radius-lg)';
            card.style.boxShadow = 'var(--shadow-sm)';
            card.style.border = '1px solid var(--border)';
            card.style.transition = 'var(--transition)';

            card.innerHTML = `
                <div class="cat-icon-wrapper" style="width:50px; height: 50px; border-radius: 50%; background: ${cat.slug === activeSlug ? 'rgba(255,255,255,0.2)' : 'var(--primary-soft)'}; display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
                    <span class="material-icons" style="color: ${cat.slug === activeSlug ? 'white' : 'var(--primary)'}; font-size:24px;">${cat.icon}</span>
                </div>
                <span class="cat-name" style="font-size:0.85rem; font-weight:600; text-align:center;">${cat.name}</span>
            `;

            // Hover animations
            card.addEventListener('mouseenter', () => {
                if (cat.slug !== activeSlug) {
                    card.style.transform = 'translateY(-4px)';
                    card.style.borderColor = 'var(--primary)';
                    card.style.boxShadow = 'var(--shadow-md)';
                }
            });
            card.addEventListener('mouseleave', () => {
                if (cat.slug !== activeSlug) {
                    card.style.transform = 'translateY(0)';
                    card.style.borderColor = 'var(--border)';
                    card.style.boxShadow = 'var(--shadow-sm)';
                }
            });

            container.appendChild(card);
        });
    },

    // Autocomplete Input binding
    bindAutocomplete(inputId, suggestionsContainerId) {
        const input = document.getElementById(inputId);
        const container = document.getElementById(suggestionsContainerId);

        if (!input || !container) return;

        // Styles for container
        container.style.position = 'absolute';
        container.style.top = '100%';
        container.style.left = '0';
        container.style.right = '0';
        container.style.background = 'var(--surface)';
        container.style.border = '1px solid var(--border)';
        container.style.borderRadius = '0 0 var(--radius-md) var(--radius-md)';
        container.style.boxShadow = 'var(--shadow-lg)';
        container.style.zIndex = '1020';
        container.style.display = 'none';
        container.style.maxHeight = '280px';
        container.style.overflowY = 'auto';

        input.addEventListener('input', () => {
            const query = input.value.trim().toLowerCase();
            if (query.length < 2) {
                container.innerHTML = '';
                container.style.display = 'none';
                return;
            }

            // Find categories, wilayas and mock terms matching search
            const matches = [];

            // Category matches
            CONFIG.CATEGORIES.forEach(c => {
                if (c.name.toLowerCase().includes(query)) {
                    matches.push({ type: 'category', label: c.name, val: `category:${c.id}`, icon: c.icon });
                }
            });

            // Wilaya matches
            CONFIG.WILAYAS.forEach(w => {
                if (w.name.toLowerCase().includes(query)) {
                    matches.push({ type: 'location', label: `Wilaya: ${w.name} (${w.code})`, val: `wilaya:${w.name}`, icon: 'location_on' });
                }
            });

            // Populate matches in UI
            if (matches.length === 0) {
                container.innerHTML = `<div style="padding:12px 16px; font-size:0.9rem; color:var(--text-muted);">Aucune suggestion</div>`;
            } else {
                container.innerHTML = '';
                matches.forEach(item => {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.alignItems = 'center';
                    row.style.gap = '12px';
                    row.style.padding = '10px 16px';
                    row.style.cursor = 'pointer';
                    row.style.fontSize = '0.9rem';
                    row.style.borderBottom = '1px solid var(--border)';
                    row.style.transition = 'var(--transition)';

                    row.innerHTML = `
                        <span class="material-icons" style="font-size:18px; color:var(--primary);">${item.icon}</span>
                        <span>${item.label}</span>
                    `;

                    row.addEventListener('mouseenter', () => row.style.background = 'var(--primary-soft)');
                    row.addEventListener('mouseleave', () => row.style.background = 'transparent');
                    row.addEventListener('click', () => {
                        if (item.val.startsWith('category:')) {
                            const catId = item.val.split(':')[1];
                            window.location.href = `index.html?category=${catId}`;
                        } else if (item.val.startsWith('wilaya:')) {
                            const wilName = item.val.split(':')[1];
                            window.location.href = `index.html?wilaya=${encodeURIComponent(wilName)}`;
                        }
                    });

                    container.appendChild(row);
                });
            }
            container.style.display = 'block';
        });

        // Hide when click outside
        document.addEventListener('click', (e) => {
            if (e.target !== input && e.target !== container) {
                container.style.display = 'none';
            }
        });
    }
};
