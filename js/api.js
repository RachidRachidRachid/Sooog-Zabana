/**
 * SOGE ZABANA Database API & LocalStorage Emulator
 */
const API = {
    async call(action, data = {}) {
        if (CONFIG.API_URL) {
            try {
                const response = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'text/plain', // Bypasses the CORS preflight OPTIONS request blocked by Apps Script
                    },
                    body: JSON.stringify({ action, ...data })
                });
                const result = await response.json();
                if (result.error) throw new Error(result.error);
                return result;
            } catch (err) {
                console.error("API Call error, falling back to local emulator: ", err);
                return this.emulate(action, data);
            }
        } else {
            // Emulate networking lag for fluid UX transition animations
            await new Promise(resolve => setTimeout(resolve, 200));
            return this.emulate(action, data);
        }
    },

    // Get table from LS
    getTable(tableName) {
        const key = CONFIG.STORAGE_PREFIX + tableName;
        let data = localStorage.getItem(key);
        if (!data) {
            data = this.getSeeds(tableName);
            localStorage.setItem(key, JSON.stringify(data));
        } else {
            data = JSON.parse(data);
        }
        return data;
    },

    // Save table to LS
    saveTable(tableName, data) {
        const key = CONFIG.STORAGE_PREFIX + tableName;
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Generate Initial Seed Data
    getSeeds(tableName) {
        switch (tableName) {
            case 'categories':
                return CONFIG.CATEGORIES;
            case 'wilayas':
                return CONFIG.WILAYAS;
            case 'communes':
                return CONFIG.COMMUNES;
            case 'utilisateurs':
                return [
                    { id: 1, nom: "Zabana", prenom: "Soge", email: "admin@soog.dz", telephone: "0550112233", mot_de_passe: "admin123", role: "admin", statut: "actif", date_creation: "2026-06-01" },
                    { id: 2, nom: "Lamine", prenom: "Mohamed", email: "lamine@soog.dz", telephone: "0660445566", mot_de_passe: "user123", role: "utilisateur", statut: "actif", date_creation: "2026-06-15" }
                ];
            case 'annonces':
                return [
                    {
                        id: 1,
                        titre: "Renault Clio 4 GT-Line 2019",
                        description: "Très belle Clio 4 GT-Line, première main, peinture d'origine, entretien régulier chez Renault, pneus neufs, aucun frais à prévoir. Prix légèrement négociable.",
                        prix: 2850000,
                        categorie_id: 2,
                        region: "Oran",
                        commune: "Bir El Djir",
                        utilisateur_id: 2,
                        telephone_contact: "0660445566",
                        images: [
                            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23FF6F00'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'>Renault Clio 4 GT-Line</text></svg>"
                        ],
                        views: 145,
                        statut: "valide",
                        date_creation: "2026-07-01T12:00:00Z"
                    },
                    {
                        id: 2,
                        titre: "Appartement F3 Zabana Oran",
                        description: "Vente superbe F3 spacieux de 85m², avec acte et livret foncier. Quartier calme et sécurisé, cuisine équipée, ascenseur fonctionnel. Libre de suite.",
                        prix: 12500000,
                        categorie_id: 3,
                        region: "Oran",
                        commune: "Zabana",
                        utilisateur_id: 1,
                        telephone_contact: "0550112233",
                        images: [
                            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%230F172A'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'>Appartement F3 Zabana</text></svg>"
                        ],
                        views: 92,
                        statut: "valide",
                        date_creation: "2026-07-02T14:30:00Z"
                    },
                    {
                        id: 3,
                        titre: "iPhone 15 Pro Max 256GB Neuf",
                        description: "iPhone 15 Pro Max, couleur Titane Naturel, 256 Go, sous emballage, scellé, avec facture et garantie de 12 mois. Magasin situé à Alger Centre.",
                        prix: 215000,
                        categorie_id: 1,
                        region: "Alger",
                        commune: "Alger Centre",
                        utilisateur_id: 1,
                        telephone_contact: "0550112233",
                        images: [
                            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%233B82F6'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'>iPhone 15 Pro Max</text></svg>"
                        ],
                        views: 230,
                        statut: "valide",
                        date_creation: "2026-07-03T09:15:00Z"
                    }
                ];
            case 'messages':
                return [
                    { id: 1, expediteur_id: 2, destinataire_id: 1, annonce_id: 2, message: "Bonjour, l'appartement est toujours disponible ? Est-ce que le prix est négociable ?", date_envoi: "2026-07-05T10:30:00Z", lu: false },
                    { id: 2, expediteur_id: 1, destinataire_id: 2, annonce_id: 2, message: "Bonjour, oui il est disponible. On peut en discuter après la visite.", date_envoi: "2026-07-05T11:00:00Z", lu: true }
                ];
            case 'favoris':
                return [];
            case 'statistiques':
                return [
                    { Date: "2026-07-05", Visites: 120, NouvellesAnnonces: 4, NouveauxMembres: 2 },
                    { Date: "2026-07-06", Visites: 180, NouvellesAnnonces: 6, NouveauxMembres: 3 },
                    { Date: "2026-07-07", Visites: 220, NouvellesAnnonces: 8, NouveauxMembres: 4 },
                    { Date: "2026-07-08", Visites: 310, NouvellesAnnonces: 12, NouveauxMembres: 5 },
                    { Date: "2026-07-09", Visites: 450, NouvellesAnnonces: 15, NouveauxMembres: 9 }
                ];
            case 'audit_log':
                return [
                    { id: 1, utilisateur_id: 1, action: "CONNEXION", details: "L'administrateur s'est connecté", date: "2026-07-09T08:00:00Z" }
                ];
            case 'abonnements':
                return [];
            case 'commentaires':
                return [];
            case 'signalements':
                return [];
            case 'notifications':
                return [
                    { id: 1, utilisateur_id: 2, titre: "Bienvenue !", message: "Bienvenue sur سوق زبّانة SOGE ZABANA, la plateforme de confiance.", lu: false, date_creation: "2026-07-09T08:00:00Z" }
                ];
            case 'parametres':
                return [
                    { cle: "app_name", valeur: "SOOG ZABANA", description: "Nom général de l'application" },
                    { cle: "maintenance", valeur: "non", description: "Désactiver le site pour maintenance" }
                ];
            default:
                return [];
        }
    },

    // Emulated API router
    emulate(action, data) {
        console.log(`[EMU API] executing action: ${action}`, data);
        const users = this.getTable('utilisateurs');
        const annonces = this.getTable('annonces');
        const categories = this.getTable('categories');
        const favoris = this.getTable('favoris');
        const messages = this.getTable('messages');
        const stats = this.getTable('statistiques');
        const logs = this.getTable('audit_log');
        const configs = this.getTable('parametres');
        const signalements = this.getTable('signalements');

        switch (action) {
            // Auth Operations
            case 'register': {
                const exists = users.find(u => u.email === data.email);
                if (exists) return { success: false, error: "Cet email est déjà utilisé" };
                const newUser = {
                    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
                    nom: data.nom,
                    prenom: data.prenom,
                    email: data.email,
                    telephone: data.telephone,
                    mot_de_passe: data.mot_de_passe,
                    role: "utilisateur",
                    statut: "actif",
                    date_creation: new Date().toISOString()
                };
                users.push(newUser);
                this.saveTable('utilisateurs', users);
                // Audit log
                logs.push({ id: logs.length + 1, utilisateur_id: newUser.id, action: "INSCRIPTION", details: `Nouveau compte créé: ${data.email}`, date: new Date().toISOString() });
                this.saveTable('audit_log', logs);
                return { success: true, user: { id: newUser.id, nom: newUser.nom, prenom: newUser.prenom, email: newUser.email, telephone: newUser.telephone, role: newUser.role } };
            }

            case 'login': {
                const user = users.find(u => u.email === data.email && u.mot_de_passe === data.mot_de_passe);
                if (!user) return { success: false, error: "Identifiants incorrects" };
                if (user.statut !== 'actif') return { success: false, error: "Votre compte a été suspendu" };
                
                logs.push({ id: logs.length + 1, utilisateur_id: user.id, action: "CONNEXION", details: `Utilisateur connecté: ${user.email}`, date: new Date().toISOString() });
                this.saveTable('audit_log', logs);
                
                return { success: true, user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, telephone: user.telephone, role: user.role } };
            }

            // Ads Operations (CRUD)
            case 'getAnnonces': {
                let filtered = annonces.filter(a => a.statut === 'valide' || data.includeInactive);
                if (data.categorie_id) filtered = filtered.filter(a => a.categorie_id == data.categorie_id);
                if (data.region) filtered = filtered.filter(a => a.region.toLowerCase() === data.region.toLowerCase());
                if (data.q) {
                    const qLower = data.q.toLowerCase();
                    filtered = filtered.filter(a => a.titre.toLowerCase().includes(qLower) || a.description.toLowerCase().includes(qLower));
                }
                return { success: true, data: filtered.reverse() };
            }

            case 'getAnnonceById': {
                const ad = annonces.find(a => a.id == data.id);
                if (!ad) return { success: false, error: "Annonce introuvable" };
                ad.views = (ad.views || 0) + 1;
                this.saveTable('annonces', annonces);
                return { success: true, data: ad };
            }

            case 'creerAnnonce': {
                const newAd = {
                    id: annonces.length ? Math.max(...annonces.map(a => a.id)) + 1 : 1,
                    titre: data.titre,
                    description: data.description,
                    prix: parseFloat(data.prix) || 0,
                    categorie_id: data.categorie_id,
                    region: data.region,
                    commune: data.commune,
                    utilisateur_id: data.utilisateur_id,
                    telephone_contact: data.telephone_contact,
                    images: data.images || [],
                    views: 0,
                    statut: "valide", // Auto approve in emulator
                    date_creation: new Date().toISOString()
                };
                annonces.push(newAd);
                this.saveTable('annonces', annonces);
                
                logs.push({ id: logs.length + 1, utilisateur_id: data.utilisateur_id, action: "CREATION_ANNONCE", details: `Annonce #${newAd.id}: ${newAd.titre}`, date: new Date().toISOString() });
                this.saveTable('audit_log', logs);

                return { success: true, id: newAd.id };
            }

            case 'modifierAnnonce': {
                const idx = annonces.findIndex(a => a.id == data.id);
                if (idx === -1) return { success: false, error: "Annonce introuvable" };
                annonces[idx] = { ...annonces[idx], ...data.updates };
                this.saveTable('annonces', annonces);

                logs.push({ id: logs.length + 1, utilisateur_id: data.utilisateur_id || 1, action: "MODIFICATION_ANNONCE", details: `Mise à jour Annonce #${data.id}`, date: new Date().toISOString() });
                this.saveTable('audit_log', logs);

                return { success: true };
            }

            case 'supprimerAnnonce': {
                const idx = annonces.findIndex(a => a.id == data.id);
                if (idx === -1) return { success: false, error: "Annonce introuvable" };
                annonces.splice(idx, 1);
                this.saveTable('annonces', annonces);

                logs.push({ id: logs.length + 1, utilisateur_id: data.utilisateur_id || 1, action: "SUPPRESSION_ANNONCE", details: `Supprimé Annonce #${data.id}`, date: new Date().toISOString() });
                this.saveTable('audit_log', logs);

                return { success: true };
            }

            // Favorites Operations
            case 'toggleFavori': {
                const idx = favoris.findIndex(f => f.utilisateur_id == data.utilisateur_id && f.annonce_id == data.annonce_id);
                if (idx !== -1) {
                    favoris.splice(idx, 1);
                    this.saveTable('favoris', favoris);
                    return { success: true, saved: false };
                } else {
                    favoris.push({ id: favoris.length + 1, utilisateur_id: data.utilisateur_id, annonce_id: data.annonce_id, date_ajout: new Date().toISOString() });
                    this.saveTable('favoris', favoris);
                    return { success: true, saved: true };
                }
            }

            case 'getFavoris': {
                const userFavIds = favoris.filter(f => f.utilisateur_id == data.utilisateur_id).map(f => f.annonce_id);
                const favAds = annonces.filter(a => userFavIds.includes(a.id));
                return { success: true, data: favAds };
            }

            // Messages chat
            case 'getMessages': {
                const list = messages.filter(m => m.expediteur_id == data.utilisateur_id || m.destinataire_id == data.utilisateur_id);
                return { success: true, data: list };
            }

            case 'envoyerMessage': {
                const newMsg = {
                    id: messages.length ? Math.max(...messages.map(m => m.id)) + 1 : 1,
                    expediteur_id: data.expediteur_id,
                    destinataire_id: data.destinataire_id,
                    annonce_id: data.annonce_id,
                    message: data.message,
                    date_envoi: new Date().toISOString(),
                    lu: false
                };
                messages.push(newMsg);
                this.saveTable('messages', messages);
                return { success: true, data: newMsg };
            }

            // Admin queries
            case 'getAdminStats': {
                if (data.role !== 'admin') return { success: false, error: "Accès refusé" };
                const totalAds = annonces.length;
                const totalUsers = users.length;
                const totalViews = annonces.reduce((acc, curr) => acc + (curr.views || 0), 0);
                const totalReports = signalements.length;
                return {
                    success: true,
                    kpi: { totalAds, totalUsers, totalViews, totalReports },
                    statsDaily: stats,
                    logs: logs.slice(-20).reverse()
                };
            }

            case 'getAdminUsers': {
                if (data.role !== 'admin') return { success: false, error: "Accès refusé" };
                return { success: true, data: users };
            }

            case 'modifierUtilisateur': {
                if (data.role !== 'admin') return { success: false, error: "Accès refusé" };
                const idx = users.findIndex(u => u.id == data.id);
                if (idx === -1) return { success: false, error: "Utilisateur introuvable" };
                users[idx] = { ...users[idx], ...data.updates };
                this.saveTable('utilisateurs', users);
                
                logs.push({ id: logs.length + 1, utilisateur_id: 1, action: "MODIF_USER", details: `Compte ID #${data.id} mis à jour: ${JSON.stringify(data.updates)}`, date: new Date().toISOString() });
                this.saveTable('audit_log', logs);

                return { success: true };
            }

            case 'getAdminAnnonces': {
                if (data.role !== 'admin') return { success: false, error: "Accès refusé" };
                return { success: true, data: annonces };
            }

            case 'getAdminSettings': {
                if (data.role !== 'admin') return { success: false, error: "Accès refusé" };
                return { success: true, data: configs };
            }

            case 'saveAdminSettings': {
                if (data.role !== 'admin') return { success: false, error: "Accès refusé" };
                this.saveTable('parametres', data.settings);
                return { success: true };
            }

            default:
                return { success: false, error: `Action ${action} inconnue` };
        }
    }
};
