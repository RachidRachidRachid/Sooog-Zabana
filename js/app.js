/**
 * SOGE ZABANA General UI Initializer
 */
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    currentLang: 'fr',
    
    init() {
        this.loadTheme();
        this.loadLanguage();
        this.renderHeader();
        this.setupMobileMenu();
        this.translatePage();
        this.setupGlobalEvents();
    },

    // Theme Manager
    loadTheme() {
        const theme = localStorage.getItem(CONFIG.STORAGE_PREFIX + "theme") || "light";
        if (theme === "dark") {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    },

    toggleTheme() {
        const isDark = document.body.classList.contains("dark-mode");
        if (isDark) {
            document.body.classList.remove("dark-mode");
            localStorage.setItem(CONFIG.STORAGE_PREFIX + "theme", "light");
        } else {
            document.body.classList.add("dark-mode");
            localStorage.setItem(CONFIG.STORAGE_PREFIX + "theme", "dark");
        }
    },

    // Language localization configs
    loadLanguage() {
        this.currentLang = localStorage.getItem(CONFIG.STORAGE_PREFIX + "lang") || CONFIG.DEFAULT_LANG;
        if (this.currentLang === 'ar') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    },

    toggleLanguage() {
        const nextLang = this.currentLang === 'fr' ? 'ar' : 'fr';
        localStorage.setItem(CONFIG.STORAGE_PREFIX + "lang", nextLang);
        window.location.reload();
    },

    // Translate page elements containing data-i18n tags
    translatePage() {
        const dic = CONFIG.LANG[this.currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dic[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = dic[key];
                } else {
                    el.innerText = dic[key];
                }
            }
        });
    },

    // Dynamically render Navigation Header based on session
    renderHeader() {
        const header = document.querySelector('header');
        if (!header) return;

        const dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
        const user = Auth.getCurrentUser();
        const dic = CONFIG.LANG[this.currentLang];

        const path = window.location.pathname;
        const isAdminPage = path.includes('admin.html');

        // Layout HTML
        header.innerHTML = `
            <div class="container header-container" style="direction: ${dir};">
                <a href="index.html" class="logo-link">
                    <span class="material-icons" style="color: var(--primary); font-size: 32px;">shopping_bag</span>
                    SOGE <span class="highlight">ZABANA</span>
                </a>

                ${!isAdminPage ? `
                <div class="header-search">
                    <form id="global-search-form" action="index.html" method="GET">
                        <div class="search-input-wrapper">
                            <span class="material-icons search-icon">search</span>
                            <input type="text" name="q" id="header-search-input" data-i18n="searchPlaceholder" placeholder="${dic.searchPlaceholder}">
                        </div>
                    </form>
                </div>
                ` : ''}

                <div class="nav-actions">
                    <!-- Translate button -->
                    <button class="btn btn-text btn-icon-only" id="lang-switch-btn" title="Changer de langue">
                        <span class="material-icons">language</span>
                    </button>

                    <!-- Dark mode button -->
                    <button class="btn btn-text btn-icon-only" id="theme-switch-btn" title="Mode Sombre/Clair">
                        <span class="material-icons">dark_mode</span>
                    </button>

                    ${user ? `
                        <!-- Notifications -->
                        <a href="profil.html?tab=chat" class="btn btn-text btn-icon-only notification-bell" title="Messages">
                            <span class="material-icons">chat</span>
                            <span class="bell-badge"></span>
                        </a>

                        <!-- User Profile pill -->
                        <div style="position: relative;">
                            <div class="profile-pill" id="profile-menu-trigger">
                                <div class="profile-avatar">${user.prenom.charAt(0).toUpperCase()}</div>
                                <span class="profile-name">${user.prenom}</span>
                                <span class="material-icons" style="font-size: 16px;">expand_more</span>
                            </div>

                            <div class="dropdown-menu" id="profile-dropdown-menu">
                                <a href="profil.html" class="dropdown-item">
                                    <span class="material-icons">account_circle</span>
                                    <span data-i18n="myProfile">${dic.myProfile}</span>
                                </a>
                                <a href="favoris.html" class="dropdown-item">
                                    <span class="material-icons">favorite</span>
                                    <span data-i18n="favorites">${dic.favorites}</span>
                                </a>
                                ${user.role === 'admin' ? `
                                    <a href="admin.html" class="dropdown-item">
                                        <span class="material-icons">admin_panel_settings</span>
                                        <span data-i18n="adminPanel">${dic.adminPanel}</span>
                                    </a>
                                ` : ''}
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item" id="logout-btn" style="color: var(--error);">
                                    <span class="material-icons">logout</span>
                                    <span data-i18n="logout">${dic.logout}</span>
                                </a>
                            </div>
                        </div>
                    ` : `
                        <a href="login.html" class="btn btn-outline" data-i18n="login">${dic.login}</a>
                        <a href="publier.html" class="btn btn-primary" style="display: flex;">
                            <span class="material-icons">add_circle</span>
                            <span data-i18n="publishAd">${dic.publishAd}</span>
                        </a>
                    `}
                </div>
            </div>
        `;

        // Handle parameters backfill in search input on home/listings
        if (!isAdminPage) {
            const urlParams = new URLSearchParams(window.location.search);
            const searchInput = document.getElementById('header-search-input');
            if (searchInput && urlParams.get('q')) {
                searchInput.value = urlParams.get('q');
            }
        }

        // Attach Header specific listeners
        this.setupHeaderActions();
    },

    setupHeaderActions() {
        // Theme switch
        const themeBtn = document.getElementById('theme-switch-btn');
        if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());

        // Language switch
        const langBtn = document.getElementById('lang-switch-btn');
        if (langBtn) langBtn.addEventListener('click', () => this.toggleLanguage());

        // User dropdown trigger
        const profileTrigger = document.getElementById('profile-menu-trigger');
        const dropdownMenu = document.getElementById('profile-dropdown-menu');
        
        if (profileTrigger && dropdownMenu) {
            profileTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('active');
            });

            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('active');
            });
        }

        // Logout action
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Auth.logout();
            });
        }
    },

    // Mobile Bottom Menu quick bar
    setupMobileMenu() {
        const user = Auth.getCurrentUser();
        const dic = CONFIG.LANG[this.currentLang];
        const dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';

        const mobileBar = document.createElement('div');
        mobileBar.className = 'mobile-menu-drawer';
        mobileBar.style.direction = dir;

        mobileBar.innerHTML = `
            <a href="index.html" class="mobile-menu-item">
                <span class="material-icons icon">home</span>
                <span>Accueil</span>
            </a>
            <a href="favoris.html" class="mobile-menu-item">
                <span class="material-icons icon">favorite</span>
                <span>Favoris</span>
            </a>
            <a href="publier.html" class="mobile-menu-item" style="position: relative; z-index: 1060; width: 60px;">
                <div class="mobile-fab-publish">
                    <span class="material-icons">add</span>
                </div>
            </a>
            <a href="profil.html?tab=chat" class="mobile-menu-item">
                <span class="material-icons icon">chat</span>
                <span>Messages</span>
            </a>
            <a href="${user ? 'profil.html' : 'login.html'}" class="mobile-menu-item">
                <span class="material-icons icon">account_circle</span>
                <span>Profil</span>
            </a>
        `;

        // Check if device is desktop before building bottombar
        if (window.innerWidth <= 768) {
            document.body.appendChild(mobileBar);
        }
    },

    // Global setups
    setupGlobalEvents() {
        // Handle window resizing to toggle bottom drawer
        window.addEventListener('resize', () => {
            const bar = document.querySelector('.mobile-menu-drawer');
            if (window.innerWidth <= 768 && !bar) {
                this.setupMobileMenu();
            } else if (window.innerWidth > 768 && bar) {
                bar.remove();
            }
        });
    }
};
