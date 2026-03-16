// src/services/manager.js
import api from './api';

// ==================== DASHBOARD ====================
export const getDashboardStats = () => api.get('/manager/dashboard');

// ==================== LIVRAISONS ====================
export const getLivraisons = (page = 1) => 
  api.get(`/manager/livraisons?page=${page}`);

export const getLivraisonById = (id) => 
  api.get(`/manager/livraisons/${id}`);

export const searchLivraisons = (query) => 
  api.get(`/manager/livraisons/search?q=${query}`);

export const getLivraisonsByStatus = (status, page = 1) => 
  api.get(`/manager/livraisons/status/${status}?page=${page}`);

export const updateLivraisonStatus = (id, status) => 
  api.patch(`/manager/livraisons/${id}/status`, { status });

// ==================== LIVREURS ====================
export const getLivreurs = () => 
  api.get('/manager/livreurs');

export const getLivreurById = (id) => 
  api.get(`/manager/livreurs/${id}`);

export const toggleLivreurActivation = (id) => 
  api.patch(`/manager/livreurs/${id}/toggle-activation`);

// ==================== CODES PROMO ====================
export const getCodesPromo = (page = 1) => 
  api.get(`/manager/codes-promo?page=${page}`);

export const getCodePromoById = (id) => 
  api.get(`/manager/codes-promo/${id}`);

export const createCodePromo = (data) => 
  api.post('/manager/codes-promo', data);

export const updateCodePromo = (id, data) => 
  api.put(`/manager/codes-promo/${id}`, data);

export const deleteCodePromo = (id) => 
  api.delete(`/manager/codes-promo/${id}`);

/**
 * Ajouter des livreurs à un code promo
 * @param {string|number} id - ID du code promo
 * @param {Array|string|number} livreurs - IDs des livreurs à ajouter
 */
export const addLivreursToCodePromo = (id, livreurs) => {
  // S'assurer que livreurs est un tableau
  const livreursArray = Array.isArray(livreurs) ? livreurs : [livreurs];
  
  // Filtrer les valeurs null/undefined
  const validLivreurs = livreursArray
    .filter(l => l != null && l !== '')
    .map(l => l);
  
  console.log("Envoi des livreurs:", validLivreurs);
  
  return api.post(`/manager/codes-promo/${id}/add-livreurs`, { 
    livreurs: validLivreurs 
  });
};

/**
 * Retirer des livreurs d'un code promo
 * @param {string|number} id - ID du code promo
 * @param {Array|string|number} livreurs - IDs des livreurs à retirer
 */
export const removeLivreursFromCodePromo = (id, livreurs) => {
  // S'assurer que livreurs est un tableau
  const livreursArray = Array.isArray(livreurs) ? livreurs : [livreurs];
  
  // Filtrer les valeurs null/undefined
  const validLivreurs = livreursArray
    .filter(l => l != null && l !== '')
    .map(l => l);
  
  console.log("Retrait des livreurs:", validLivreurs);
  
  return api.delete(`/manager/codes-promo/${id}/remove-livreurs`, { 
    data: { livreurs: validLivreurs } 
  });
};

// ==================== PROFIL ====================
export const getProfile = () => 
  api.get('/manager/profile');

export const updateProfile = (data) => 
  api.put('/manager/profile', data);

export const changePassword = (data) => 
  api.post('/manager/profile/change-password', data);

// ==================== COMPTABILITÉ ====================

/**
 * Récupérer le bilan financier du gestionnaire
 * @param {Object} params - Paramètres de filtrage
 * @param {string} params.periode - 'jour', 'semaine', 'mois', 'annee', 'personnalise'
 * @param {string} params.date - Date pour les périodes fixes (format YYYY-MM-DD)
 * @param {string} params.date_debut - Date début pour période personnalisée
 * @param {string} params.date_fin - Date fin pour période personnalisée
 */
export const getBilanComptable = (params = {}) => 
  api.get('/manager/comptabilite', { params });

/**
 * Exporter le bilan (Excel ou PDF)
 * @param {Object} params - Paramètres d'export
 * @param {string} params.format - 'excel' ou 'pdf'
 * @param {string} params.periode - Période
 * @param {string} params.date - Date pour les périodes fixes
 * @param {string} params.date_debut - Date début (pour période personnalisée)
 * @param {string} params.date_fin - Date fin (pour période personnalisée)
 */
export const exportBilan = async (params) => {
  const response = await api.get('/manager/comptabilite/export', { 
    params,
    responseType: 'blob' 
  });
  
  // Créer un lien de téléchargement
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  // Déterminer l'extension et le nom du fichier à partir des headers
  const contentDisposition = response.headers['content-disposition'];
  let filename = 'bilan.xlsx';
  
  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      filename = match[1].replace(/['"]/g, '');
    }
  } else {
    const extension = params.format === 'pdf' ? '.pdf' : '.xlsx';
    filename = `bilan-${new Date().toISOString().split('T')[0]}${extension}`;
  }
  
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  return response;
};

/**
 * Récupérer les statistiques mensuelles pour les graphiques
 * @param {number} annee - Année (ex: 2024)
 */
export const getStatistiquesMensuelles = (annee) => 
  api.get('/manager/comptabilite/statistiques-mensuelles', { params: { annee } });

/**
 * Formater un montant en DZD
 * @param {number} montant - Montant à formater
 * @returns {string} Montant formaté (ex: "15 000 DZD")
 */
export const formatMontant = (montant) => {
  if (montant === null || montant === undefined) return '0 DZD';
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(montant).replace('DZD', '').trim() + ' DZD';
};

/**
 * Formater un nombre avec séparateurs de milliers
 * @param {number} nombre - Nombre à formater
 * @returns {string} Nombre formaté (ex: "15 000")
 */
export const formatNombre = (nombre) => {
  if (nombre === null || nombre === undefined) return '0';
  return new Intl.NumberFormat('fr-DZ').format(nombre);
};

/**
 * Obtenir la couleur CSS selon la tendance (évolution)
 * @param {number} evolution - Pourcentage d'évolution
 * @returns {string} Classe CSS de couleur
 */
export const getTendanceColor = (evolution) => {
  if (evolution > 0) return 'text-green-600';
  if (evolution < 0) return 'text-red-600';
  return 'text-gray-600';
};

/**
 * Obtenir l'icône selon la tendance (évolution)
 * @param {number} evolution - Pourcentage d'évolution
 * @returns {string} Symbole de tendance
 */
export const getTendanceIcon = (evolution) => {
  if (evolution > 0) return '↑';
  if (evolution < 0) return '↓';
  return '→';
};

/**
 * Tronquer un texte trop long
 * @param {string} texte - Texte à tronquer
 * @param {number} longueurMax - Longueur maximale
 * @returns {string} Texte tronqué
 */
export const tronquerTexte = (texte, longueurMax = 50) => {
  if (!texte) return '';
  if (texte.length <= longueurMax) return texte;
  return texte.substring(0, longueurMax) + '...';
};

/**
 * Formater une date au format français
 * @param {string|Date} date - Date à formater
 * @param {boolean} avecHeure - Inclure l'heure ou non
 * @returns {string} Date formatée
 */
export const formatDate = (date, avecHeure = false) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(avecHeure && { hour: '2-digit', minute: '2-digit' })
  };
  
  return d.toLocaleDateString('fr-FR', options);
};

/**
 * Obtenir la couleur associée à un statut de livraison
 * @param {string} statut - Statut de la livraison
 * @returns {string} Classe CSS de couleur
 */
export const getCouleurStatut = (statut) => {
  const couleurs = {
    'en_attente': 'bg-gray-100 text-gray-800',
    'prise_en_charge_ramassage': 'bg-blue-100 text-blue-800',
    'ramasse': 'bg-indigo-100 text-indigo-800',
    'en_transit': 'bg-yellow-100 text-yellow-800',
    'prise_en_charge_livraison': 'bg-orange-100 text-orange-800',
    'livre': 'bg-green-100 text-green-800',
    'annule': 'bg-red-100 text-red-800'
  };
  
  return couleurs[statut] || 'bg-gray-100 text-gray-800';
};

/**
 * Traduire un statut en français
 * @param {string} statut - Statut à traduire
 * @returns {string} Statut traduit
 */
export const traduireStatut = (statut) => {
  const traductions = {
    'en_attente': 'En attente',
    'prise_en_charge_ramassage': 'Prise en charge (ramassage)',
    'ramasse': 'Ramasse',
    'en_transit': 'En transit',
    'prise_en_charge_livraison': 'Prise en charge (livraison)',
    'livre': 'Livré',
    'annule': 'Annulé'
  };
  
  return traductions[statut] || statut;
};