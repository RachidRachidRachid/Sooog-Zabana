/**
 * SOGE ZABANA Google Apps Script Backend REST API
 * Automatically constructs sheets schema and implements transactional queries.
 */

// Enable CORS
function doGet(e) {
  return HtmlService.createHtmlOutput("SOGE ZABANA API is running. Send POST requests to write/query data.");
}

function doPost(e) {
  const result = { success: false };
  try {
    // Check tables initialization
    checkAndInitDatabase();

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    let responseData;
    switch (action) {
      // Security Gates
      case 'register':
        responseData = registerUser(payload);
        break;
      case 'login':
        responseData = loginUser(payload);
        break;

      // Ads listings CRUD
      case 'getAnnonces':
        responseData = getAnnoncesList(payload);
        break;
      case 'getAnnonceById':
        responseData = getAnnonceDetail(payload);
        break;
      case 'creerAnnonce':
        responseData = insertAnnonce(payload);
        break;
      case 'modifierAnnonce':
        responseData = updateAnnonce(payload);
        break;
      case 'supprimerAnnonce':
        responseData = deleteAnnonce(payload);
        break;

      // Bookmarks Favorites
      case 'toggleFavori':
        responseData = toggleBookmark(payload);
        break;
      case 'getFavoris':
        responseData = getBookmarksList(payload);
        break;

      // Chats Private messengers
      case 'getMessages':
        responseData = getChatMessages(payload);
        break;
      case 'envoyerMessage':
        responseData = sendChatMessage(payload);
        break;

      // Administrator CRM lookups
      case 'getAdminStats':
        responseData = executeAdminStats(payload);
        break;
      case 'getAdminUsers':
        responseData = getAdminUsersList(payload);
        break;
      case 'modifierUtilisateur':
        responseData = updateUserStatus(payload);
        break;
      case 'getAdminAnnonces':
        responseData = getAdminAnnoncesList(payload);
        break;
      case 'getAdminSettings':
        responseData = getSystemSettings(payload);
        break;
      case 'saveAdminSettings':
        responseData = saveSystemSettings(payload);
        break;

      default:
        throw new Error("Action " + action + " non reconnue");
    }

    result.success = true;
    result.data = responseData;
    if (responseData && responseData.error) {
      result.success = false;
      result.error = responseData.error;
    }
  } catch (err) {
    result.success = false;
    result.error = err.toString();
  }

  // Set CORS headers
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------
// Database Auto-Initialization: 15 Relational Tables
// -------------------------------------------------------------
function checkAndInitDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsDef = {
    "utilisateurs": ["id", "nom", "prenom", "email", "telephone", "mot_de_passe", "role", "statut", "date_creation"],
    "annonces": ["id", "titre", "description", "prix", "categorie_id", "region", "commune", "utilisateur_id", "telephone_contact", "images", "views", "statut", "date_creation"],
    "categories": ["id", "nom", "nom_ar", "icone", "slug", "parent_id"],
    "messages": ["id", "expediteur_id", "destinataire_id", "annonce_id", "message", "date_envoi", "lu"],
    "favoris": ["id", "utilisateur_id", "annonce_id", "date_ajout"],
    "wilayas": ["id", "code", "nom", "nom_ar"],
    "communes": ["id", "wilaya_id", "nom", "nom_ar"],
    "signalements": ["id", "utilisateur_id", "annonce_id", "motif", "date_creation", "statut"],
    "notifications": ["id", "utilisateur_id", "titre", "message", "lu", "date_creation"],
    "parametres": ["cle", "valeur", "description"],
    "statistiques": ["date", "visites", "nouvelles_annonces", "nouveaux_utilisateurs"],
    "historique_connexions": ["id", "utilisateur_id", "ip", "agent", "date"],
    "audit_log": ["id", "utilisateur_id", "action", "details", "date"],
    "commentaires": ["id", "annonce_id", "utilisateur_id", "texte", "date_creation"],
    "abonnements": ["id", "utilisateur_id", "type_abonnement", "date_debut", "date_fin", "statut"]
  };

  for (let sheetName in sheetsDef) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(sheetsDef[sheetName]);
      
      // Inject seed categories if categories sheet created
      if (sheetName === "categories") {
        sheet.appendRow([1, "Téléphones & Tablettes", "الهواتف واللوحات", "phone_android", "telephones", ""]);
        sheet.appendRow([2, "Véhicules & Auto", "السيارات والمركبات", "directions_car", "vehicules", ""]);
        sheet.appendRow([3, "Immobilier", "العقارات", "home", "immobilier", ""]);
        sheet.appendRow([4, "Informatique & Electronique", "الإعلام الآلي", "laptop", "informatique", ""]);
      }
      
      // Inject default parameters if parameters created
      if (sheetName === "parametres") {
        sheet.appendRow(["app_name", "SOOG ZABANA", "Nom de l'application"]);
        sheet.appendRow(["maintenance", "non", "Désactiver le site pour maintenance (oui/non)"]);
      }
    }
  }
}

// -------------------------------------------------------------
// Transaction Helpers: Read/Write Objects mapping Rows
// -------------------------------------------------------------
function getSheetRows(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    obj._rowIdx = i + 1; // Map physical line index for updates
    rows.push(obj);
  }
  return rows;
}

function appendSheetRow(sheetName, item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getDataRange().getValues()[0];
  const rowVal = [];
  for (let i = 0; i < headers.length; i++) {
    rowVal.push(item[headers[i]] !== undefined ? item[headers[i]] : "");
  }
  sheet.appendRow(rowVal);
}

function updateSheetRow(sheetName, rowIdx, item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getDataRange().getValues()[0];
  for (let j = 0; j < headers.length; j++) {
    const key = headers[j];
    if (item[key] !== undefined) {
      sheet.getCell(rowIdx, j + 1).setValue(item[key]);
    }
  }
}

function deleteSheetRow(sheetName, rowIdx) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  sheet.deleteRow(rowIdx);
}

// SHA-256 hash using Apps Script built-in Utilities
function hashDigestPassword(str) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  let hashStr = "";
  for (let i = 0; i < rawHash.length; i++) {
    let byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    let byteString = byteVal.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    hashStr += byteString;
  }
  return hashStr;
}

// -------------------------------------------------------------
// Core Handlers
// -------------------------------------------------------------

function registerUser(data) {
  const users = getSheetRows("utilisateurs");
  const exists = users.find(u => u.email === data.email);
  if (exists) return { error: "Cet email est déjà utilisé" };

  const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const hash = hashDigestPassword(data.mot_de_passe);
  const newUser = {
    id,
    nom: data.nom,
    prenom: data.prenom,
    email: data.email,
    telephone: data.telephone,
    mot_de_passe: hash,
    role: "utilisateur",
    statut: "actif",
    date_creation: new Date().toISOString()
  };
  appendSheetRow("utilisateurs", newUser);
  return { success: true };
}

function loginUser(data) {
  const users = getSheetRows("utilisateurs");
  const hash = hashDigestPassword(data.mot_de_passe);
  const user = users.find(u => u.email === data.email && u.mot_de_passe === hash);
  if (!user) return { error: "Adresse email ou mot de passe incorrect" };
  if (user.statut !== "actif") return { error: "Compte suspendu" };

  // Log in Connection History
  appendSheetRow("historique_connexions", {
    id: new Date().getTime(),
    utilisateur_id: user.id,
    ip: "Web",
    agent: "Browser",
    date: new Date().toISOString()
  });

  return {
    success: true,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role
    }
  };
}

function getAnnoncesList(data) {
  const ads = getSheetRows("annonces");
  let filtered = ads.filter(a => a.statut === "valide" || data.includeInactive);

  if (data.categorie_id) {
    filtered = filtered.filter(a => a.categorie_id == data.categorie_id);
  }
  if (data.region) {
    filtered = filtered.filter(a => a.region.toLowerCase() === data.region.toLowerCase());
  }
  if (data.q) {
    const query = data.q.toLowerCase();
    filtered = filtered.filter(a => a.titre.toLowerCase().indexOf(query) !== -1 || a.description.toLowerCase().indexOf(query) !== -1);
  }

  // Parse images (which are saved in Sheets cells as base64 stringified array)
  filtered.forEach(ad => {
    try {
      ad.images = JSON.parse(ad.images);
    } catch (e) {
      ad.images = [];
    }
  });

  return filtered;
}

function getAnnonceDetail(data) {
  const ads = getSheetRows("annonces");
  const ad = ads.find(a => a.id == data.id);
  if (!ad) return { error: "Annonce introuvable" };

  // Increment views
  ad.views = (parseInt(ad.views) || 0) + 1;
  updateSheetRow("annonces", ad._rowIdx, { views: ad.views });

  try {
    ad.images = JSON.parse(ad.images);
  } catch (e) {
    ad.images = [];
  }
  return ad;
}

function insertAnnonce(data) {
  const ads = getSheetRows("annonces");
  const id = ads.length ? Math.max(...ads.map(a => a.id)) + 1 : 1;

  const newAd = {
    id,
    titre: data.titre,
    description: data.description,
    prix: parseFloat(data.prix) || 0,
    categorie_id: data.categorie_id,
    region: data.region,
    commune: data.commune,
    utilisateur_id: data.utilisateur_id,
    telephone_contact: data.telephone_contact,
    images: JSON.stringify(data.images || []),
    views: 0,
    statut: "valide", // Set validation by default
    date_creation: new Date().toISOString()
  };

  appendSheetRow("annonces", newAd);
  
  // Audits Logs
  appendSheetRow("audit_log", {
    id: new Date().getTime(),
    utilisateur_id: data.utilisateur_id,
    action: "CREATION_ANNONCE",
    details: "Création annonce " + id + " - " + data.titre,
    date: new Date().toISOString()
  });

  return { id };
}

function updateAnnonce(payload) {
  const ads = getSheetRows("annonces");
  const ad = ads.find(a => a.id == payload.id);
  if (!ad) return { error: "Annonce introuvable" };

  // Convert images to string if provided
  if (payload.updates.images) {
    payload.updates.images = JSON.stringify(payload.updates.images);
  }

  updateSheetRow("annonces", ad._rowIdx, payload.updates);
  return { success: true };
}

function deleteAnnonce(payload) {
  const ads = getSheetRows("annonces");
  const ad = ads.find(a => a.id == payload.id);
  if (!ad) return { error: "Annonce introuvable" };

  deleteSheetRow("annonces", ad._rowIdx);
  return { success: true };
}

function toggleBookmark(data) {
  const favs = getSheetRows("favoris");
  const exists = favs.find(f => f.utilisateur_id == data.utilisateur_id && f.annonce_id == data.annonce_id);
  if (exists) {
    deleteSheetRow("favoris", exists._rowIdx);
    return { saved: false };
  } else {
    appendSheetRow("favoris", {
      id: favs.length ? Math.max(...favs.map(f => f.id)) + 1 : 1,
      utilisateur_id: data.utilisateur_id,
      annonce_id: data.annonce_id,
      date_ajout: new Date().toISOString()
    });
    return { saved: true };
  }
}

function getBookmarksList(data) {
  const favs = getSheetRows("favoris");
  const ads = getSheetRows("annonces");
  const userFavIds = favs.filter(f => f.utilisateur_id == data.utilisateur_id).map(f => f.annonce_id);
  
  const results = ads.filter(a => userFavIds.includes(a.id));
  results.forEach(ad => {
    try {
      ad.images = JSON.parse(ad.images);
    } catch(e) {
      ad.images = [];
    }
  });
  return results;
}

function getChatMessages(data) {
  const msgs = getSheetRows("messages");
  return msgs.filter(m => m.expediteur_id == data.utilisateur_id || m.destinataire_id == data.utilisateur_id);
}

function sendChatMessage(data) {
  const msgs = getSheetRows("messages");
  const newMsg = {
    id: msgs.length ? Math.max(...msgs.map(m => m.id)) + 1 : 1,
    expediteur_id: data.expediteur_id,
    destinataire_id: data.destinataire_id,
    annonce_id: data.annonce_id,
    message: data.message,
    date_envoi: new Date().toISOString(),
    lu: 0
  };
  appendSheetRow("messages", newMsg);
  return newMsg;
}

// -------------------------------------------------------------
// Admin Handlers
// -------------------------------------------------------------

function executeAdminStats(data) {
  if (data.role !== "admin") return { error: "Accès refusé" };
  const ads = getSheetRows("annonces");
  const users = getSheetRows("utilisateurs");
  const stats = getSheetRows("statistiques");
  const logs = getSheetRows("audit_log");

  const totalAds = ads.length;
  const totalUsers = users.length;
  const totalViews = ads.reduce((acc, curr) => acc + (parseInt(curr.views) || 0), 0);
  const totalReports = getSheetRows("signalements").length;

  return {
    success: true,
    kpi: { totalAds, totalUsers, totalViews, totalReports },
    statsDaily: stats.slice(-7), // return 7 records
    logs: logs.slice(-15)
  };
}

function getAdminUsersList(data) {
  // Read users for administration panel
  return getSheetRows("utilisateurs");
}

function updateUserStatus(data) {
  const users = getSheetRows("utilisateurs");
  const u = users.find(usr => usr.id == data.id);
  if (!u) return { error: "Utilisateur introuvable" };
  updateSheetRow("utilisateurs", u._rowIdx, data.updates);
  return { success: true };
}

function getAdminAnnoncesList(payload) {
  const ads = getSheetRows("annonces");
  ads.forEach(ad => {
    try {
      ad.images = JSON.parse(ad.images);
    } catch(e) {
      ad.images = [];
    }
  });
  return ads;
}

function getSystemSettings(data) {
  return getSheetRows("parametres");
}

function saveSystemSettings(data) {
  if (data.role !== "admin") return { error: "Accès refusé" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("parametres");
  sheet.clearContents();
  sheet.appendRow(["cle", "valeur", "description"]);
  
  data.settings.forEach(cfg => {
    sheet.appendRow([cfg.cle, cfg.valeur, cfg.description]);
  });
  return { success: true };
}
