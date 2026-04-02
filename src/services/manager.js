// src/services/manager.js
// ==================== PROJET MANAGER ====================

import api from './api';
import navetteGainService from './manager/navetteGainService';

// ==================== FONCTIONS UTILITAIRES ====================

/**
 * Formater un montant en DZD
 * @param {number} montant - Montant à formater
 * @returns {string} Montant formaté
 */
export const formatMontant = (montant) => {
  if (montant === null || montant === undefined) return '0 DA';
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(montant).replace('DZD', 'DA').trim();
};

/**
 * Formater un nombre avec séparateurs de milliers
 * @param {number} nombre - Nombre à formater
 * @returns {string} Nombre formaté
 */
export const formatNombre = (nombre) => {
  if (nombre === null || nombre === undefined) return '0';
  return new Intl.NumberFormat('fr-DZ').format(nombre);
};

/**
 * Obtenir la couleur selon la tendance
 * @param {number} evolution
 * @returns {string}
 */
export const getTendanceColor = (evolution) => {
  if (evolution > 0) return 'text-green-600';
  if (evolution < 0) return 'text-red-600';
  return 'text-gray-600';
};

/**
 * Obtenir l'icône selon la tendance
 * @param {number} evolution
 * @returns {string}
 */
export const getTendanceIcon = (evolution) => {
  if (evolution > 0) return '↑';
  if (evolution < 0) return '↓';
  return '→';
};

/**
 * Formater une date au format français
 * @param {string|Date} date
 * @param {boolean} avecHeure
 * @returns {string}
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
 * Traduire un statut en français
 * @param {string} statut
 * @returns {string}
 */
export const traduireStatut = (statut) => {
  const traductions = {
    'en_attente': 'En attente',
    'demande_envoyee': 'Demande envoyée',
    'paye': 'Payé',
    'annule': 'Annulé',
    'prise_en_charge_ramassage': 'Prise en charge (ramassage)',
    'ramasse': 'Ramasse',
    'en_transit': 'En transit',
    'prise_en_charge_livraison': 'Prise en charge (livraison)',
    'livre': 'Livré',
    'calcule': 'Calculé',
    'verse': 'Versé'
  };
  return traductions[statut] || statut;
};

/**
 * Obtenir la couleur CSS pour un statut
 * @param {string} statut
 * @returns {string}
 */
export const getCouleurStatut = (statut) => {
  const couleurs = {
    'en_attente': 'bg-yellow-100 text-yellow-800',
    'demande_envoyee': 'bg-blue-100 text-blue-800',
    'paye': 'bg-green-100 text-green-800',
    'annule': 'bg-red-100 text-red-800',
    'prise_en_charge_ramassage': 'bg-blue-100 text-blue-800',
    'ramasse': 'bg-indigo-100 text-indigo-800',
    'en_transit': 'bg-purple-100 text-purple-800',
    'prise_en_charge_livraison': 'bg-orange-100 text-orange-800',
    'livre': 'bg-green-100 text-green-800',
    'calcule': 'bg-blue-100 text-blue-800',
    'verse': 'bg-green-100 text-green-800'
  };
  return couleurs[statut] || 'bg-gray-100 text-gray-800';
};

// ==================== FONCTIONS DE TÉLÉCHARGEMENT ====================

/**
 * Télécharger un fichier (blob)
 * @param {Blob} blob - Données du fichier
 * @param {string} filename - Nom du fichier
 */
const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
};

// ==================== DASHBOARD ====================

/**
 * Récupérer les statistiques du dashboard
 */
export const getDashboardStats = () => api.get('/manager/dashboard');

// ==================== LIVRAISONS ====================

/**
 * Récupérer la liste des livraisons
 * @param {number} page - Numéro de page
 */
export const getLivraisons = (page = 1) => 
  api.get(`/manager/livraisons?page=${page}`);

/**
 * Récupérer une livraison par son ID
 * @param {string} id - ID de la livraison
 */
export const getLivraisonById = (id) => 
  api.get(`/manager/livraisons/${id}`);

/**
 * Rechercher des livraisons
 * @param {string} query - Terme de recherche
 */
export const searchLivraisons = (query) => 
  api.get(`/manager/livraisons/search?q=${encodeURIComponent(query)}`);

/**
 * Récupérer les livraisons par statut
 * @param {string} status - Statut des livraisons
 * @param {number} page - Numéro de page
 */
export const getLivraisonsByStatus = (status, page = 1) => 
  api.get(`/manager/livraisons/status/${status}?page=${page}`);

/**
 * Mettre à jour le statut d'une livraison
 * @param {string} id - ID de la livraison
 * @param {string} status - Nouveau statut
 */
export const updateLivraisonStatus = (id, status) => 
  api.patch(`/manager/livraisons/${id}/status`, { status });

// ==================== LIVREURS ====================

/**
 * Récupérer la liste des livreurs (natifs + assignés)
 */
export const getLivreurs = () => 
  api.get('/manager/livreurs');

/**
 * Récupérer les livreurs natifs uniquement
 */
export const getLivreursNatifs = () => 
  api.get('/manager/livreurs?origine=natif');

/**
 * Récupérer les livreurs assignés uniquement
 */
export const getLivreursAssignes = () => 
  api.get('/manager/livreurs?origine=assigne');

/**
 * Récupérer un livreur par son ID avec son origine
 * @param {string} id - ID du livreur
 */
export const getLivreurById = (id) => 
  api.get(`/manager/livreurs/${id}`);

/**
 * Activer/désactiver un livreur
 * @param {string} id - ID du livreur
 */
export const toggleLivreurActivation = (id) => 
  api.patch(`/manager/livreurs/${id}/toggle-activation`);

// ==================== CODES PROMO ====================

/**
 * Récupérer la liste des codes promo
 * @param {number} page - Numéro de page
 */
export const getCodesPromo = (page = 1) => 
  api.get(`/manager/codes-promo?page=${page}`);

/**
 * Récupérer un code promo par son ID
 * @param {string} id - ID du code promo
 */
export const getCodePromoById = (id) => 
  api.get(`/manager/codes-promo/${id}`);

/**
 * Créer un code promo
 * @param {Object} data - Données du code promo
 */
export const createCodePromo = (data) => 
  api.post('/manager/codes-promo', data);

/**
 * Mettre à jour un code promo
 * @param {string} id - ID du code promo
 * @param {Object} data - Données à mettre à jour
 */
export const updateCodePromo = (id, data) => 
  api.put(`/manager/codes-promo/${id}`, data);

/**
 * Supprimer un code promo
 * @param {string} id - ID du code promo
 */
export const deleteCodePromo = (id) => 
  api.delete(`/manager/codes-promo/${id}`);

/**
 * Ajouter des livreurs à un code promo
 * @param {string} id - ID du code promo
 * @param {Array} livreurs - IDs des livreurs
 */
export const addLivreursToCodePromo = (id, livreurs) => {
  const livreursArray = Array.isArray(livreurs) ? livreurs : [livreurs];
  const validLivreurs = livreursArray.filter(l => l != null && l !== '');
  return api.post(`/manager/codes-promo/${id}/add-livreurs`, { 
    livreurs: validLivreurs 
  });
};

/**
 * Retirer des livreurs d'un code promo
 * @param {string} id - ID du code promo
 * @param {Array} livreurs - IDs des livreurs
 */
export const removeLivreursFromCodePromo = (id, livreurs) => {
  const livreursArray = Array.isArray(livreurs) ? livreurs : [livreurs];
  const validLivreurs = livreursArray.filter(l => l != null && l !== '');
  return api.delete(`/manager/codes-promo/${id}/remove-livreurs`, { 
    data: { livreurs: validLivreurs } 
  });
};

// ==================== PROFIL ====================

/**
 * Récupérer le profil du gestionnaire
 */
export const getProfile = () => 
  api.get('/manager/profile');

/**
 * Mettre à jour le profil
 * @param {Object} data - Données du profil
 */
export const updateProfile = (data) => 
  api.put('/manager/profile', data);

/**
 * Changer le mot de passe
 * @param {Object} data - { current_password, new_password, new_password_confirmation }
 */
export const changePassword = (data) => 
  api.post('/manager/profile/change-password', data);

// ==================== GAINS LIVRAISONS ====================
// Ces fonctions concernent les commissions sur les livraisons individuelles
// Table: gestionnaire_gains
// Controller: GainController.php

/**
 * Récupérer tous les gains du gestionnaire connecté (livraisons)
 * @param {Object} params - { periode, date, date_debut, date_fin }
 * @returns {Promise}
 */
export const getMesGains = async (params = {}) => {
  try {
    const response = await api.get('/manager/gains', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getMesGains:', error);
    throw error;
  }
};

/**
 * Récupérer uniquement les gains en attente (livraisons)
 * @returns {Promise}
 */
export const getGainsEnAttente = async () => {
  try {
    const response = await api.get('/manager/gains/en-attente');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getGainsEnAttente:', error);
    throw error;
  }
};

/**
 * Demander le paiement d'un gain spécifique (livraison)
 * @param {string} gainId - ID du gain
 * @returns {Promise}
 */
export const demanderPaiementGain = async (gainId) => {
  try {
    const response = await api.post(`/manager/gains/demander/${gainId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur demanderPaiementGain:', error);
    throw error;
  }
};

/**
 * Demander le paiement de plusieurs gains (livraisons)
 * @param {Array} gainIds - Liste des IDs des gains
 * @returns {Promise}
 */
export const demanderPaiementMultiple = async (gainIds) => {
  try {
    const response = await api.post('/manager/gains/demander-multiple', { 
      gain_ids: gainIds 
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur demanderPaiementMultiple:', error);
    throw error;
  }
};

/**
 * Récupérer les statistiques des gains (livraisons)
 * @returns {Promise}
 */
export const getStatistiquesGains = async () => {
  try {
    const response = await api.get('/manager/gains/statistiques');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getStatistiquesGains:', error);
    throw error;
  }
};

// ==================== GAINS NAVETTES ====================
// Ces fonctions concernent les commissions sur les navettes
// Table: gestionnaire_navette_gains
// Controller: GestionnaireNavetteGainController.php

/**
 * Récupérer tous les gains navettes du gestionnaire connecté
 * @param {Object} params - { periode, date_debut, date_fin }
 * @returns {Promise}
 */
export const getMesGainsNavette = async (params = {}) => {
  try {
    const response = await api.get('/manager/gains-navette', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getMesGainsNavette:', error);
    throw error;
  }
};

/**
 * Récupérer uniquement les gains navettes en attente
 * @returns {Promise}
 */
export const getGainsNavetteEnAttente = async () => {
  try {
    const response = await api.get('/manager/gains-navette/en-attente');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getGainsNavetteEnAttente:', error);
    throw error;
  }
};

/**
 * Demander le paiement d'un gain navette spécifique
 * @param {string} gainId - ID du gain navette
 * @returns {Promise}
 */
export const demanderPaiementNavette = async (gainId) => {
  try {
    const response = await api.post(`/manager/gains-navette/demander/${gainId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur demanderPaiementNavette:', error);
    throw error;
  }
};

/**
 * Demander le paiement de plusieurs gains navette
 * @param {Array} gainIds - Liste des IDs des gains navette
 * @returns {Promise}
 */
export const demanderPaiementMultipleNavette = async (gainIds) => {
  try {
    const response = await api.post('/manager/gains-navette/demander-multiple', { 
      gain_ids: gainIds 
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur demanderPaiementMultipleNavette:', error);
    throw error;
  }
};

/**
 * Récupérer les statistiques des gains navette
 * @returns {Promise}
 */
export const getStatistiquesGainsNavette = async () => {
  try {
    const response = await api.get('/manager/gains-navette/statistiques');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getStatistiquesGainsNavette:', error);
    throw error;
  }
};

// ==================== COMPTABILITÉ ====================

/**
 * Récupérer le bilan financier du gestionnaire
 * @param {Object} params - { periode, date, date_debut, date_fin }
 */
export const getBilanComptable = async (params = {}) => {
  try {
    const response = await api.get('/manager/comptabilite', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getBilanComptable:', error);
    throw error;
  }
};

/**
 * Récupérer les statistiques mensuelles pour les graphiques
 * @param {number} annee - Année
 */
export const getStatistiquesMensuelles = async (annee) => {
  try {
    const response = await api.get('/manager/comptabilite/statistiques-mensuelles', { 
      params: { annee } 
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getStatistiquesMensuelles:', error);
    throw error;
  }
};

/**
 * Exporter le bilan (Excel ou PDF)
 * @param {Object} params - { periode, date_debut, date_fin, format }
 */
export const exportBilan = async (params = {}) => {
  try {
    const format = params.format || 'excel';
    const response = await api.get('/manager/comptabilite/export', { 
      params,
      responseType: 'blob' 
    });
    
    // Déterminer le nom du fichier
    const contentDisposition = response.headers['content-disposition'];
    let filename = `bilan-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, '');
      }
    }
    
    // Télécharger le fichier
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] 
    });
    downloadFile(blob, filename);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur exportBilan:', error);
    throw error;
  }
};

// ==================== NAVETTES ====================

/**
 * Récupérer la liste des navettes
 */
export const getNavettes = () => 
  api.get('/manager/navettes');

/**
 * Récupérer une navette par son ID
 * @param {string} id - ID de la navette
 */
export const getNavetteById = (id) => 
  api.get(`/manager/navettes/${id}`);

/**
 * Créer une navette
 * @param {Object} data - Données de la navette
 */
export const createNavette = (data) => 
  api.post('/manager/navettes', data);

/**
 * Démarrer une navette
 * @param {string} id - ID de la navette
 */
export const demarrerNavette = (id) => 
  api.post(`/manager/navettes/${id}/demarrer`);

/**
 * Terminer une navette
 * @param {string} id - ID de la navette
 */
export const terminerNavette = (id) => 
  api.post(`/manager/navettes/${id}/terminer`);

/**
 * Annuler une navette
 * @param {string} id - ID de la navette
 */
export const annulerNavette = (id) => 
  api.post(`/manager/navettes/${id}/annuler`);

/**
 * Récupérer les livraisons disponibles pour une navette
 */
export const getLivraisonsDisponibles = () => 
  api.get('/manager/navettes/disponibles');

// ==================== HUBS ====================

/**
 * Récupérer la liste des hubs
 */
export const getHubs = () => 
  api.get('/manager/hubs');

// ==================== CASH ON DELIVERY (COD) ====================

/**
 * Récupérer la liste des gestionnaires disponibles (sauf soi-même)
 * @returns {Promise}
 */
export const getGestionnairesDisponibles = async () => {
  try {
    const response = await api.get('/manager/cash-delivery/gestionnaires');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getGestionnairesDisponibles:', error);
    throw error;
  }
};

/**
 * Envoyer une demande COD
 * @param {Object} data - { destinataire_id, montant, motif }
 * @returns {Promise}
 */
export const envoyerDemandeCOD = async (data) => {
  try {
    const response = await api.post('/manager/cash-delivery/envoyer', data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur envoyerDemandeCOD:', error);
    throw error;
  }
};

/**
 * Accepter une demande COD reçue
 * @param {string} id - ID de la demande
 * @returns {Promise}
 */
export const accepterDemandeCOD = async (id) => {
  try {
    const response = await api.post(`/manager/cash-delivery/${id}/accepter`);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur accepterDemandeCOD:', error);
    throw error;
  }
};

/**
 * Refuser une demande COD reçue
 * @param {string} id - ID de la demande
 * @returns {Promise}
 */
export const refuserDemandeCOD = async (id) => {
  try {
    const response = await api.post(`/manager/cash-delivery/${id}/refuser`);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur refuserDemandeCOD:', error);
    throw error;
  }
};

/**
 * Annuler une demande COD envoyée
 * @param {string} id - ID de la demande
 * @returns {Promise}
 */
export const annulerDemandeCOD = async (id) => {
  try {
    const response = await api.post(`/manager/cash-delivery/${id}/annuler`);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur annulerDemandeCOD:', error);
    throw error;
  }
};

/**
 * Récupérer les demandes envoyées par le gestionnaire connecté
 * @returns {Promise}
 */
export const getDemandesEnvoyeesCOD = async () => {
  try {
    const response = await api.get('/manager/cash-delivery/envoyees');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getDemandesEnvoyeesCOD:', error);
    throw error;
  }
};

/**
 * Récupérer les demandes reçues par le gestionnaire connecté
 * @returns {Promise}
 */
export const getDemandesRecuesCOD = async () => {
  try {
    const response = await api.get('/manager/cash-delivery/recues');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getDemandesRecuesCOD:', error);
    throw error;
  }
};

/**
 * Récupérer les statistiques COD
 * @returns {Promise}
 */
export const getStatistiquesCOD = async () => {
  try {
    const response = await api.get('/manager/cash-delivery/statistiques');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getStatistiquesCOD:', error);
    throw error;
  }
};

/**
 * Traduire le statut COD en français
 * @param {string} statut
 * @returns {string}
 */
export const traduireStatutCOD = (statut) => {
  const traductions = {
    'en_attente': 'En attente',
    'accepte': 'Accepté',
    'refuse': 'Refusé',
    'annule': 'Annulé'
  };
  return traductions[statut] || statut;
};

/**
 * Obtenir la couleur CSS pour un statut COD
 * @param {string} statut
 * @returns {string}
 */
export const getCouleurStatutCOD = (statut) => {
  const couleurs = {
    'en_attente': 'bg-yellow-100 text-yellow-800',
    'accepte': 'bg-green-100 text-green-800',
    'refuse': 'bg-red-100 text-red-800',
    'annule': 'bg-gray-100 text-gray-800'
  };
  return couleurs[statut] || 'bg-gray-100 text-gray-800';
};

// Export de l'API pour les cas où on a besoin de l'instance directement
export { api };