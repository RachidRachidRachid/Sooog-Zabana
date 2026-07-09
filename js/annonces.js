/**
 * SOGE ZABANA Ads Card Grid & Ad details display logic
 */
const Annonces = {
    // Generate card block for listings grids
    createAdCard(ad, userFavIds = []) {
        const isFav = userFavIds.includes(ad.id);
        const dateStr = this.formatDate(ad.date_creation);
        const priceStr = ad.prix > 0 ? `${ad.prix.toLocaleString('fr-FR')} DA` : "Prix non spécifié";
        const cat = CONFIG.CATEGORIES.find(c => c.id == ad.categorie_id) || { name: 'Autre' };

        // Handle image placeholder if empty
        const imageSrc = ad.images && ad.images.length > 0 ? ad.images[0] : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23eeeeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23999">Sans Image</text></svg>';

        const card = document.createElement('div');
        card.className = 'card hover-card animate-fade-up';
        card.style.background = 'var(--surface)';
        card.style.border = '1px solid var(--border)';
        card.style.borderRadius = 'var(--radius-lg)';
        card.style.overflow = 'hidden';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.position = 'relative';

        card.innerHTML = `
            <!-- Favorite button absolute top -->
            <button class="fav-heart-btn" data-id="${ad.id}" style="position: absolute; top: 12px; right: 12px; z-index: 10; border: none; background: rgba(255,255,255,0.7); backdrop-filter: blur(4px); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: ${isFav ? 'var(--error)' : 'var(--text-muted)'}; transition: var(--transition);">
                <span class="material-icons" style="font-size: 20px;">${isFav ? 'favorite' : 'favorite_border'}</span>
            </button>

            <!-- Card Visual -->
            <a href="annonce.html?id=${ad.id}" style="display: block; aspect-ratio: 4/3; width: 100%; overflow: hidden; background: #f1f5f9;">
                <img src="${imageSrc}" alt="${ad.titre}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
            </a>

            <!-- Card Details -->
            <div style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span class="badge badge-primary">${cat.name}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted); display:flex; align-items:center; gap:2px;">
                        <span class="material-icons" style="font-size:12px;">visibility</span> ${ad.views || 0}
                    </span>
                </div>

                <a href="annonce.html?id=${ad.id}" style="font-size: 0.95rem; font-weight: 700; color: var(--secondary); margin-bottom: 8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height: 2.5em; line-height: 1.25;">
                    ${ad.titre}
                </a>

                <!-- Price and Location footer info -->
                <div style="margin-top: auto; display: flex; flex-direction: column; gap: 6px; padding-top: 12px; border-top: 1px solid var(--border);">
                    <div style="font-size: 1.05rem; font-weight: 800; color: var(--primary);">${priceStr}</div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
                        <span style="display:flex; align-items:center; gap:2px;">
                            <span class="material-icons" style="font-size: 12px; color: var(--primary);">location_on</span>
                            ${ad.region}, ${ad.commune}
                        </span>
                        <span>${dateStr}</span>
                    </div>
                </div>
            </div>
        `;

        // Image zoom-on-hover bind
        const img = card.querySelector('img');
        card.addEventListener('mouseenter', () => img.style.transform = 'scale(1.05)');
        card.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');

        // Toggle Favorites Heart pop action
        const favBtn = card.querySelector('.fav-heart-btn');
        favBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const user = Auth.getCurrentUser();
            if (!user) {
                alert("Vous devez vous connecter pour ajouter cet article aux favoris.");
                window.location.href = "login.html";
                return;
            }

            favBtn.classList.add('pop-heart');
            setTimeout(() => favBtn.classList.remove('pop-heart'), 300);

            const result = await API.call('toggleFavori', { utilisateur_id: user.id, annonce_id: ad.id });
            if (result.success) {
                const icon = favBtn.querySelector('.material-icons');
                if (result.saved) {
                    favBtn.style.color = 'var(--error)';
                    icon.innerText = 'favorite';
                } else {
                    favBtn.style.color = 'var(--text-muted)';
                    icon.innerText = 'favorite_border';
                }
            }
        });

        return card;
    },

    // Populate Cards Grid Layout
    renderGrid(containerId, adsList) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (!adsList || adsList.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: var(--surface); border:1px solid var(--border); border-radius: var(--radius-lg);">
                    <span class="material-icons" style="font-size: 48px; color: var(--text-muted); margin-bottom: 12px;">search_off</span>
                    <h3 style="color:var(--text-muted); font-size:1.1rem; margin-bottom:4px;">Aucun résultat correspondant</h3>
                    <p style="color:var(--text-muted); font-size:0.9rem;">Essayez de modifier vos filtres ou mot-clés.</p>
                </div>
            `;
            return;
        }

        // Get favorites of active user for heart outlines
        const user = Auth.getCurrentUser();
        let userFavIds = [];
        
        const loadCardsingsings = async () => {
            if (user) {
                const favs = await API.call('getFavoris', { utilisateur_id: user.id });
                if (favs.success && favs.data) {
                    userFavIds = favs.data.map(f => f.id);
                }
            }

            container.style.display = 'grid';
            container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
            container.style.gap = '24px';

            adsList.forEach(ad => {
                const card = this.createAdCard(ad, userFavIds);
                container.appendChild(card);
            });
        };

        loadCardsingsings();
    },

    // Parse date strings to clean relative format
    formatDate(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHrs < 1) {
            return "À l'instant";
        } else if (diffHrs < 24) {
            return `Il y a ${diffHrs}h`;
        } else {
            const diffDays = Math.floor(diffHrs / 24);
            if (diffDays === 1) return "Hier";
            return past.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    },

    // Construct Detail Ad View
    renderDetail(adElementId, ad) {
        const container = document.getElementById(adElementId);
        if (!container) return;

        const priceStr = ad.prix > 0 ? `${ad.prix.toLocaleString('fr-FR')} DA` : "Prix non spécifié";
        const authorInitial = "S"; // Fallback
        const adUrl = window.location.href;
        
        container.innerHTML = `
            <div style="grid-column: 1 / -1; display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px; flex-wrap:wrap; gap:16px;">
                <a href="index.html" class="btn btn-outline" style="padding: 8px 16px;">
                    <span class="material-icons">arrow_back</span> Retour
                </a>
                <span class="badge badge-success" style="padding:6px 12px; font-weight:700;">VALIDE</span>
            </div>

            <!-- Left Grid: Photos Panel -->
            <div class="ad-media-panel" style="display:flex; flex-direction:column; gap:16px;">
                <div class="ad-gallery-main" style="width: 100%; aspect-ratio: 4/3; border-radius: var(--radius-lg); overflow: hidden; border:1px solid var(--border); background: #000; position:relative;">
                    <img id="gallery-main-img" src="${ad.images[0] || ''}" alt="${ad.titre}" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                
                <!-- Thumbnails Slider list -->
                <div class="ad-thumbnails" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom:8px;">
                    ${ad.images.map((img, i) => `
                        <div class="ad-thumb ${i === 0 ? 'active' : ''}" data-src="${img}" style="width: 70px; height:50px; border-radius: var(--radius-sm); overflow:hidden; border:2px solid ${i === 0 ? 'var(--primary)' : 'var(--border)'}; cursor:pointer; flex-shrink:0;">
                            <img src="${img}" style="width: 100%; height:100%; object-fit:cover;">
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Right Grid: Information panel -->
            <div class="ad-details-panel" style="background:var(--surface); border:1px solid var(--border); border-radius: var(--radius-lg); padding:32px; display:flex; flex-direction:column; gap:20px; box-shadow: var(--shadow-sm);">
                <div>
                    <h1 style="font-size:1.6rem; color:var(--secondary); margin-bottom:12px; font-weight:800;">${ad.titre}</h1>
                    <div style="font-size: 1.8rem; font-weight:800; color:var(--primary); margin-bottom:12px;">${priceStr}</div>
                    
                    <div style="display:flex; gap:12px; align-items:center; color:var(--text-muted); font-size:0.85rem;">
                        <span style="display:flex; align-items:center; gap:2px;"><span class="material-icons" style="font-size:14px;">location_on</span> ${ad.region}, ${ad.commune}</span>
                        <span>•</span>
                        <span style="display:flex; align-items:center; gap:2px;"><span class="material-icons" style="font-size:14px;">calendar_today</span> Publié ${this.formatDate(ad.date_creation)}</span>
                        <span>•</span>
                        <span style="display:flex; align-items:center; gap:2px;"><span class="material-icons" style="font-size:14px;">visibility</span> ${ad.views || 0} vues</span>
                    </div>
                </div>

                <div style="border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:20px 0;">
                    <h3 style="font-size:1rem; font-weight:700; margin-bottom:10px; color:var(--secondary);">Description</h3>
                    <p style="white-space: pre-line; color:var(--text); font-size:0.95rem; line-height: 1.6;">${ad.description}</p>
                </div>

                <!-- Seller Info block and Actions -->
                <div style="display:flex; align-items:center; gap:16px; padding:16px; background:var(--bg); border-radius: var(--radius-md);">
                    <div class="profile-avatar" style="width:48px; height: 48px; background: var(--secondary); color:white; display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:1.1rem; font-weight:700;">
                        ${authorInitial}
                    </div>
                    <div>
                        <div style="font-weight:700; color:var(--secondary);">Annonceur SOGE ZABANA</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">Membre depuis 2026</div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <a href="tel:${ad.telephone_contact}" class="btn btn-secondary" style="height:48px;">
                        <span class="material-icons">phone</span> Appeler
                    </a>
                    
                    <a href="https://wa.me/${ad.telephone_contact.replace(/\s+/g, '')}" target="_blank" class="btn btn-primary" style="height:48px; background:#25D366; border-color:#25D366;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style="margin-right:6px;">
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.907h.004c4.368 0 7.926-3.559 7.93-7.93a7.897 7.897 0 0 0-2.327-5.615zM7.994 14.52a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.69-4.98c-.202-.101-1.192-.588-1.378-.654-.188-.066-.325-.101-.462.101-.137.202-.53.654-.65.787-.12.132-.239.148-.44.047a5.034 5.034 0 0 1-1.631-1.005 5.093 5.093 0 0 1-1.13-1.405c-.12-.202-.013-.31.088-.41.09-.09.202-.239.3-.358.098-.118.131-.202.197-.336.066-.134.033-.252-.017-.353-.05-.101-.462-1.114-.632-1.52-.166-.399-.333-.344-.462-.35-.127-.006-.273-.007-.42-.007a.78.78 0 0 0-.568.264c-.19.208-.724.708-.724 1.729 0 1.02.742 2.01 1.03 2.4c.29.39 1.458 2.23 3.532 3.12.493.212.879.339 1.18.435.496.158.95.135 1.307.083.397-.058 1.192-.488 1.358-.959.166-.472.166-.877.117-.959-.05-.084-.189-.133-.39-.234z"/>
                        </svg>WhatsApp
                    </a>
                </div>

                <!-- QR Code & Map Panel info -->
                <div style="border-top:1px solid var(--border); padding-top:20px; display:flex; gap:16px; align-items:center;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(adUrl)}" alt="Scan QR Code" style="width:76px; height: 76px; border:1px solid var(--border); padding:2px; border-radius: var(--radius-sm);">
                    <div>
                        <div style="font-weight:700; font-size:0.85rem; color:var(--secondary);">Partager via QR Code</div>
                        <div style="font-size:0.75rem; color:var(--text-muted); max-width:200px;">Scannez l'image ci-contre pour ouvrir instantanément cette annonce sur un autre appareil mobile.</div>
                    </div>
                </div>

                <!-- Send Private Message Section -->
                <div style="border-top:1px solid var(--border); padding-top:20px;">
                    <h3 style="font-size: 0.95rem; font-weight:700; margin-bottom:10px; color:var(--secondary);">Envoyer un message privé</h3>
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="quick-msg-input" class="form-control" placeholder="Bonjour, je suis intéressé par votre annonce...">
                        <button id="send-quick-msg" class="btn btn-primary">Envoyer</button>
                    </div>
                </div>
            </div>
        `;

        // Image gallery carousel logic
        const mainImg = document.getElementById('gallery-main-img');
        const thumbs = container.querySelectorAll('.ad-thumb');
        
        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                thumbs.forEach(t => {
                    t.style.borderColor = 'var(--border)';
                    t.classList.remove('active');
                });
                thumb.style.borderColor = 'var(--primary)';
                thumb.classList.add('active');
                mainImg.src = thumb.getAttribute('data-src');
            });
        });

        // Quick message delivery
        const sendBtn = document.getElementById('send-quick-msg');
        const input = document.getElementById('quick-msg-input');

        if (sendBtn) {
            sendBtn.addEventListener('click', async () => {
                const user = Auth.getCurrentUser();
                if (!user) {
                    alert("Connectez-vous pour envoyer un message.");
                    window.location.href = "login.html";
                    return;
                }
                const msgText = input.value.trim();
                if (!msgText) return;

                const result = await API.call('envoyerMessage', {
                    expediteur_id: user.id,
                    destinataire_id: ad.utilisateur_id,
                    annonce_id: ad.id,
                    message: msgText
                });

                if (result.success) {
                    alert("Message envoyé avec succès ! Retrouvez le vendeur dans l'onglet Profil > Messagerie.");
                    input.value = '';
                }
            });
        }
    }
};
