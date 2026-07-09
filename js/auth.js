/**
 * SOGE ZABANA Authentication & Session Manager
 */
const Auth = {
    // Retrieve current logged in user object
    getCurrentUser() {
        const u = localStorage.getItem(CONFIG.STORAGE_PREFIX + "session");
        return u ? JSON.parse(u) : null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },

    // Check if user is administrator
    isAdmin() {
        const u = this.getCurrentUser();
        return u && u.role === 'admin';
    },

    // Execute Login Request
    async login(email, password) {
        if (!email || !password) {
            return { success: false, error: "Veuillez remplir tous les champs" };
        }
        const result = await API.call('login', { email, mot_de_passe: password });
        if (result.success) {
            localStorage.setItem(CONFIG.STORAGE_PREFIX + "session", JSON.stringify(result.user));
        }
        return result;
    },

    // Execute Register Request
    async register(nom, prenom, email, telephone, password) {
        if (!nom || !prenom || !email || !telephone || !password) {
            return { success: false, error: "Veuillez remplir tous les champs" };
        }
        // Validation patterns
        const emailFilter = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailFilter.test(email)) {
            return { success: false, error: "Format d'email invalide" };
        }
        if (telephone.length < 9) {
            return { success: false, error: "Numéro de téléphone trop court" };
        }
        if (password.length < 6) {
            return { success: false, error: "Le mot de passe doit faire au moins 6 caractères" };
        }
        return await API.call('register', { nom, prenom, email, telephone, mot_de_passe: password });
    },

    // Terminate Session
    logout() {
        localStorage.removeItem(CONFIG.STORAGE_PREFIX + "session");
        window.location.href = "index.html";
    },

    // Guards
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname + window.location.search);
        }
    },

    requireAdmin() {
        if (!this.isAdmin()) {
            window.location.href = "index.html";
        }
    }
};
