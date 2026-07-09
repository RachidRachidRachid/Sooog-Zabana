# SOGE ZABANA - Plateforme de Marché Algérienne Premium

SOGE ZABANA est un clone professionnel moderne d'Ouedkniss, optimisé pour les commerces, boutiques et particuliers algériens.

## Fonctionnalités Clés

- **100% Sans Coût de Serveur** : Hébergé gratuitement sur GitHub Pages avec base de données utilisant Google Sheets et REST API hébergée sur Google Apps Script.
- **Micro-Interactions Premium** : Animations fluides au survol, scrollbars stylisés, menus responsive et support complet du mode sombre (Dark Mode).
- **Responsive Mobile First** : Barre de navigation inférieure native sur smartphone (Quick Drawer Menu), grilles de cartes adaptatives pour PC, tablettes et mobiles.
- **Système de Messagerie Privée** : Discussion en direct entre acheteurs et vendeurs avec rafraîchissement dynamique.
- **Intégration d'Outils Mobiles** : Appels et messages WhatsApp instantanés en un clic, et partage d'annonce facile par **Code QR**.
- **Gestionnaire d'Images Intelligent** : Upload par Drag & Drop avec compression automatique des images côté client (via HTML Canvas) pour économiser la mémoire.
- **Cockpit d'Administration Complet** : Statistiques graphiques en temps réel (via des vecteurs SVG personnalisés), modération complète des annonces et des utilisateurs, journalisation de sécurité et paramétrage dynamique.

---

## Architecture des Dossiers

```
SOGE-ZABANA/
│
├── index.html         - Accueil de la plateforme et recherche
├── login.html         - Interface de connexion
├── register.html      - Formulaire de création de compte
├── annonce.html       - Affichage détaillé d'une annonce
├── publier.html       - Formulaire de publication d'annonces
├── profil.html        - Tableau de bord utilisateur (Profil, Messagerie, Annonces)
├── favoris.html       - Liste des annonces sauvegardées
├── admin.html         - Console d'administration et CRM
│
├── css/
│   ├── style.css      - Variables HSL globales et styles de base
│   ├── responsive.css - Adaptateur d'écran universel Mobile, Tablette, PC
│   ├── admin.css      - Mise en page du Back-office d'administration
│   ├── dark.css       - Définition du thème sombre OLED
│   └── animation.css  - Effets visuels, chargement pulse, pop et fade
│
├── js/
│   ├── config.js      - Paramétrages de l'API et localisations
│   ├── api.js         - Client API REST et Simulateur de base de données
│   ├── auth.js        - Gestion des sessions et redirections
│   ├── upload.js      - Moteur de compression et Drag & Drop d'images
│   ├── app.js         - Initialisation UI générale et traductions
│   ├── search.js      - Formulaire de recherche et suggestions
│   ├── annonces.js    - Cartes d'annonces et galerie d'images
│   ├── charts.js      - Graphiques SVG d'analyse pour l'administration
│   ├── dashboard.js   - Analyseurs de KPI
│   └── admin.js       - Gestion CRM administrateur
│
├── assets/
│   └── logo.svg       - Identité visuelle vectorielle
│
└── appscript/
    └── Code.gs        - Code source de l'API REST Google Apps Script
```

---

## 🛠️ Guide d'installation et de Déploiement

### Étape 1 : Création de la Base de Données Google Sheets
1. Créez une nouvelle feuille de calcul sur votre compte Google Drive : [Google Sheets](https://sheets.google.com).
2. Notez l'ID de votre classeur (présent dans l'URL : `https://docs.google.com/spreadsheets/d/VOTRE_ID_DE_CLASSEUR/edit`).

### Étape 2 : Déploiement de l'API sur Google Apps Script
1. Dans votre feuille Google Sheets, cliquez sur **Extensions** > **Apps Script**.
2. Remplacez le code existant dans l'éditeur de script par le contenu du fichier [appscript/Code.gs](file:///c:/Users/LHlco/Desktop/bureaux/encour/aadl%20market/sooog%2001/soog%202026/appscript/Code.gs).
3. Cliquez sur l'icône de disquette pour **Enregistrer le projet**.
4. Cliquez sur le bouton de déploiement en haut à droite : **Déployer** > **Nouveau déploiement**.
5. Configurez le déploiement comme suit :
   - **Type de déploiement** : Application Web
   - **Description** : Soge Zabana API v1
   - **Exécuter en tant que** : Moi (votre adresse e-mail)
   - **Qui a accès** : Tout le monde (indispensable pour permettre les requêtes d'insertion/lecture)
6. Cliquez sur **Déployer**. Google vous demandera d'accorder des autorisations (cliquez sur "Paramètres avancés" puis sur "Accéder à Soge Zabana (non sécurisé)" puis validez).
7. Copiez l'**URL de l'application Web** fournie (elle se termine par `/exec`).

### Étape 3 : Liaison de l'API avec le Frontend
1. Ouvrez le fichier [js/config.js](file:///c:/Users/LHlco/Desktop/bureaux/encour/aadl%20market/sooog%2001/soog%202026/js/config.js).
2. Collez l'URL de votre application Web copiée précédemment dans le champ `API_URL` :
   ```javascript
   const CONFIG = {
       API_URL: "https://script.google.com/macros/s/...",
       // ...
   }
   ```
3. *(Facultatif)* Vous pouvez désactiver le simulateur LocalStorage en passant la variable `USE_LOCAL_FALLBACK` à `false` si vous souhaitez forcer uniquement les appels serveurs.

> [!NOTE]
> Lors de son tout premier appel de requête, le script Google Apps Script construira automatiquement les 15 tables nécessaires (onglets) dans votre feuille Google Sheets avec les en-têtes de colonnes appropriés de manière totalement transparente.

---

## 🚀 Déploiement sur GitHub Pages

1. Créez un dépôt sur votre compte GitHub (ex: `soge-zabana`).
2. Ouvrez votre terminal Git dans le dossier du projet et exécutez :
   ```bash
   git init
   git add .
   git commit -m "Initial release SOGE ZABANA"
   git remote add origin https://github.com/VOTRE_PSEUDO/soge-zabana.git
   git branch -M main
   git push -u origin main
   ```
3. Rendez-vous sur votre dépôt sur GitHub.com, cliquez sur **Settings** > **Pages**.
4. Sous la rubrique **Build and deployment**, choisissez de déployer à partir de la branche `main` (dossier `/root`), puis pressez **Save**.
5. Votre site sera disponible gratuitement en ligne après quelques secondes à l'adresse `https://VOTRE_PSEUDO.github.io/soge-zabana/`.

---

## Mode Simulateur Local (Fallback)

Si la variable `API_URL` dans `js/config.js` est vide ou inaccessible, l'application s'initialise automatiquement en mode **Simulateur**. Toutes les actions de connexion, de création d'annonces, de favoris, de messagerie et de dashboard d'administration s'exécutent alors instantanément dans votre navigateur via la base de données locale **LocalStorage**.
Cela vous permet d'évaluer, de tester et de présenter 100% des composants de l'application localement sans étapes de configurations complexes préalables.
