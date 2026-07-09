/**
 * SOGE ZABANA Configuration file
 */
const CONFIG = {
    // Paste your Google Apps Script Deploy Web App URL here
    API_URL: "https://script.google.com/macros/s/AKfycbwUQ7C8Xk6IvE_Dp0Mgp6epGmWGNDSOey9MlXI0A5RfZYIS_LJrHo3la06tzvoR_v8_/exec",
    
    // Prefix for localized localStorage databases
    STORAGE_PREFIX: "soge_zabana_",
    
    // Automatically use client emulation database if API is not deployed
    USE_LOCAL_FALLBACK: false,
    
    // Multi-Language localization support (fr: French, ar: Arabic)
    DEFAULT_LANG: "fr",
    
    // Static lists for regions (Wilayas)
    WILAYAS: [
        { id: 31, code: "31", name: "Oran", name_ar: "وهران" },
        { id: 16, code: "16", name: "Alger", name_ar: "الجزائر" },
        { id: 25, code: "25", name: "Constantine", name_ar: "قسنطينة" },
        { id: 9, code: "09", name: "Blida", name_ar: "البليدة" },
        { id: 19, code: "19", name: "Sétif", name_ar: "سطيف" },
        { id: 35, code: "35", name: "Boumerdès", name_ar: "بومرداس" },
        { id: 15, code: "15", name: "Tizi Ouzou", name_ar: "تيزي وزو" },
        { id: 2, code: "02", name: "Chlef", name_ar: "الشلف" },
        { id: 13, code: "13", name: "Tlemcen", name_ar: "تلمسان" },
        { id: 22, code: "22", name: "Sidi Bel Abbès", name_ar: "سيدي بلعباس" }
    ],
    
    // Static lists for communes
    COMMUNES: [
        { id: 1, wilaya_id: 31, name: "Oran", name_ar: "وهران" },
        { id: 2, wilaya_id: 31, name: "Zabana", name_ar: "زبانة" },
        { id: 3, wilaya_id: 31, name: "Bir El Djir", name_ar: "بئر الجير" },
        { id: 4, wilaya_id: 31, name: "Es Senia", name_ar: "السانية" },
        { id: 5, wilaya_id: 16, name: "Alger Centre", name_ar: "الجزائر الوسطى" },
        { id: 6, wilaya_id: 16, name: "Bab El Oued", name_ar: "باب الوادي" },
        { id: 7, wilaya_id: 16, name: "Sidi M'Hamed", name_ar: "سيدي امحمد" },
        { id: 8, wilaya_id: 25, name: "Constantine", name_ar: "قسنطينة" },
        { id: 9, wilaya_id: 25, name: "El Khroub", name_ar: "الخروب" },
        { id: 10, wilaya_id: 9, name: "Blida", name_ar: "البليدة" },
        { id: 11, wilaya_id: 9, name: "Boufarik", name_ar: "بوفاريك" }
    ],

    // Default main categories
    CATEGORIES: [
        { id: 1, slug: "telephones", name: "Téléphones & Tablettes", name_ar: "الهواتف واللوحات Digital", icon: "phone_android" },
        { id: 2, slug: "vehicules", name: "Véhicules & Auto", name_ar: "السيارات والمركبات", icon: "directions_car" },
        { id: 3, slug: "immobilier", name: "Immobilier", name_ar: "العقارات", icon: "home" },
        { id: 4, slug: "informatique", name: "Informatique & Electronique", name_ar: "الإعلام الآلي والإلكترونيات", icon: "laptop" },
        { id: 5, slug: "maison", name: "Pour la Maison", name_ar: "المنزل والحديقة", icon: "chair" },
        { id: 6, slug: "mode", name: "Mode & Vêtements", name_ar: "الملابس والموضة", icon: "checkroom" },
        { id: 7, slug: "loisirs", name: "Sports & Loisirs", name_ar: "الرياضة والترفيه", icon: "sports_soccer" },
        { id: 8, slug: "emploi", name: "Emploi & Services", name_ar: "الخدمات والوظائف", icon: "work" }
    ],

    // System text database
    LANG: {
        fr: {
            appName: "SOOG ZABANA",
            tagline: "Le Marché Algérien Moderne",
            searchPlaceholder: "Que recherchez-vous aujourd'hui ?",
            allCategories: "Toutes les catégories",
            publishAd: "Déposer une annonce",
            login: "Se connecter",
            register: "S'inscrire",
            logout: "Se déconnecter",
            favorites: "Favoris",
            myProfile: "Mon Profil",
            adminPanel: "Administration",
            price: "Prix",
            negotiable: "Négociable",
            contactSeller: "Contacter le vendeur",
            region: "Wilaya",
            commune: "Commune",
            noResult: "Aucun résultat trouvé",
            category: "Catégorie",
            title: "Titre",
            description: "Description",
            uploadImages: "Glisser-déposer des images ou cliquez pour choisir",
            maxImages: "Maximum 5 images",
            submitting: "Envoi en cours...",
            save: "Enregistrer",
            cancel: "Annuler",
            edit: "Modifier",
            delete: "Supprimer",
            recentAds: "Annonces Récentes",
            filters: "Filtres de recherche",
            minPrice: "Prix Min",
            maxPrice: "Prix Max",
            applyFilters: "Appliquer",
            backHome: "Retour à l'accueil",
            activeAds: "Annonces Actives",
            messages: "Messagerie",
            send: "Envoyer",
            unread: "Non lu",
            userDashboard: "Tableau de Bord Vendeur",
            welcome: "Bienvenue",
            notConnected: "Vous devez être connecté"
        },
        ar: {
            appName: "سوق زبّانة",
            tagline: "السوق الجزائري الحديث",
            searchPlaceholder: "ماذا تبحث عنه اليوم؟",
            allCategories: "جميع الفئات",
            publishAd: "نشـر إعلان",
            login: "تسجيل الدخول",
            register: "إنشاء حساب",
            logout: "خروج",
            favorites: "المفضلة",
            myProfile: "الملف الشخصي",
            adminPanel: "لوحة التحكم",
            price: "السعر",
            negotiable: "قابل للتفاوض",
            contactSeller: "الاتصال بالبائع",
            region: "الولاية",
            commune: "البلدية",
            noResult: "لم يتم العثور على نتائج",
            category: "الفئة",
            title: "العنوان",
            description: "الوصف",
            uploadImages: "اسحب وأفلت الصور هنا أو اضغط للتصفح",
            maxImages: "أقصى حد 5 صور",
            submitting: "جاري الإرسال...",
            save: "حفظ",
            cancel: "إلغاء",
            edit: "تعديل",
            delete: "حذف",
            recentAds: "الإعلانات الأخيرة",
            filters: "تصفية البحث",
            minPrice: "السعر الأدنى",
            maxPrice: "السعر الأقصى",
            applyFilters: "تطبيق التصفية",
            backHome: "العودة للرئيسية",
            activeAds: "الإعلانات النشطة",
            messages: "الرسائل الواردة",
            send: "إرسال",
            unread: "غير مقروء",
            userDashboard: "لوحة تحكم البائع",
            welcome: "مرحباً بكم",
            notConnected: "يجب تسجيل الدخول أولاً"
        }
    }
};
