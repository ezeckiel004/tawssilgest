// src/services/manager/navetteService.js
import api from '../api';

const navetteService = {
    // ==================== NAVETTES ====================
    
    /**
     * Récupérer toutes les navettes du gestionnaire
     * @param {Object} params - Paramètres de filtrage (status, date_debut, date_fin, search, page, per_page)
     * @returns {Promise}
     */
    getAllNavettes: async (params = {}) => {
        const response = await api.get('/manager/navettes', { params });
        return response.data;
    },

    /**
     * Récupérer une navette par ID
     * @param {string} id - ID de la navette
     * @returns {Promise}
     */
    getNavetteById: async (id) => {
        const response = await api.get(`/manager/navettes/${id}`);
        return response.data;
    },

    /**
     * Créer une nouvelle navette
     * @param {Object} navetteData - Données de la navette
     * @returns {Promise}
     */
    createNavette: async (navetteData) => {
        const response = await api.post('/manager/navettes', navetteData);
        return response.data;
    },

    /**
     * Mettre à jour une navette existante
     * @param {string} id - ID de la navette
     * @param {Object} navetteData - Données à mettre à jour
     * @returns {Promise}
     */
    updateNavette: async (id, navetteData) => {
        const response = await api.put(`/manager/navettes/${id}`, navetteData);
        return response.data;
    },

    /**
     * Supprimer une navette
     * @param {string} id - ID de la navette
     * @returns {Promise}
     */
    deleteNavette: async (id) => {
        const response = await api.delete(`/manager/navettes/${id}`);
        return response.data;
    },

    // ==================== ACTIONS SUR NAVETTES ====================
    
    /**
     * Démarrer une navette
     * @param {string} id - ID de la navette
     * @returns {Promise}
     */
    demarrerNavette: async (id) => {
        const response = await api.post(`/manager/navettes/${id}/demarrer`);
        return response.data;
    },

    /**
     * Terminer une navette
     * @param {string} id - ID de la navette
     * @returns {Promise}
     */
    terminerNavette: async (id) => {
        const response = await api.post(`/manager/navettes/${id}/terminer`);
        return response.data;
    },

    /**
     * Annuler une navette
     * @param {string} id - ID de la navette
     * @returns {Promise}
     */
    annulerNavette: async (id) => {
        const response = await api.post(`/manager/navettes/${id}/annuler`);
        return response.data;
    },

    // ==================== LIVRAISONS ====================
    
    /**
     * Obtenir les livraisons disponibles pour une nouvelle navette
     * (Livraisons en attente, non assignées, de la wilaya du gestionnaire)
     * @returns {Promise}
     */
    getLivraisonsDisponibles: async () => {
        const response = await api.get('/manager/navettes/disponibles');
        return response.data;
    },

    /**
     * Obtenir les livraisons disponibles pour une navette spécifique
     * (Exclut les livraisons déjà dans la navette)
     * @param {string} navetteId - ID de la navette
     * @returns {Promise}
     */
    getLivraisonsDisponiblesForNavette: async (navetteId) => {
        const response = await api.get(`/manager/navettes/${navetteId}/livraisons-disponibles`);
        return response.data;
    },

    /**
     * Ajouter des livraisons à une navette existante
     * @param {string} navetteId - ID de la navette
     * @param {Array} livraisonIds - Liste des IDs des livraisons à ajouter
     * @returns {Promise}
     */
    ajouterLivraisons: async (navetteId, livraisonIds) => {
        // Récupérer d'abord la navette pour obtenir ses livraisons actuelles
        const navette = await navetteService.getNavetteById(navetteId);
        const currentLivraisonIds = navette.data?.livraisons?.map(l => l.id) || [];
        const newLivraisonIds = [...currentLivraisonIds, ...livraisonIds];
        
        // Mettre à jour la navette avec les nouvelles livraisons
        const response = await api.put(`/manager/navettes/${navetteId}`, {
            livraison_ids: newLivraisonIds
        });
        return response.data;
    },

    /**
     * Retirer des livraisons d'une navette
     * @param {string} navetteId - ID de la navette
     * @param {Array} livraisonIds - Liste des IDs des livraisons à retirer
     * @returns {Promise}
     */
    retirerLivraisons: async (navetteId, livraisonIds) => {
        // Récupérer d'abord la navette pour obtenir ses livraisons actuelles
        const navette = await navetteService.getNavetteById(navetteId);
        const currentLivraisonIds = navette.data?.livraisons?.map(l => l.id) || [];
        const newLivraisonIds = currentLivraisonIds.filter(id => !livraisonIds.includes(id));
        
        // Mettre à jour la navette avec les livraisons restantes
        const response = await api.put(`/manager/navettes/${navetteId}`, {
            livraison_ids: newLivraisonIds
        });
        return response.data;
    },

    // ==================== HUBS ====================
    
    /**
     * Obtenir la liste des hubs disponibles
     * @returns {Promise}
     */
    getHubsDisponibles: async () => {
        try {
            const response = await api.get('/manager/hubs');
            return response.data;
        } catch (error) {
            console.error("Erreur getHubsDisponibles:", error);
            throw error;
        }
    },

    /**
     * Obtenir la liste de tous les hubs (alias)
     * @returns {Promise}
     */
    getHubs: async () => {
        return navetteService.getHubsDisponibles();
    },

    // ==================== PROFIL ====================
    
    /**
     * Récupérer le profil du gestionnaire connecté
     * @returns {Promise}
     */
    getProfile: async () => {
        const response = await api.get('/manager/profile');
        return response.data;
    },

    // ==================== STATISTIQUES ====================
    
    /**
     * Obtenir les statistiques des navettes
     * @returns {Promise}
     */
    getStats: async () => {
        const response = await api.get('/manager/navettes/stats');
        return response.data;
    },

    /**
     * Exporter les navettes (Excel ou PDF)
     * @param {Object} params - Paramètres d'export (format, date_debut, date_fin)
     * @returns {Promise}
     */
    exportNavettes: async (params = {}) => {
        const response = await api.get('/manager/navettes/export', {
            params,
            responseType: 'blob'
        });
        return response.data;
    },

    // ==================== MÉTHODES UTILITAIRES ====================
    
    /**
     * Formater une date pour l'API
     * @param {Date|string} date - Date à formater
     * @returns {string}
     */
    formatDateForApi: (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    },

    /**
     * Formater une heure pour l'API
     * @param {string} time - Heure au format HH:MM
     * @returns {string}
     */
    formatTimeForApi: (time) => {
        if (!time) return null;
        return time;
    }
};

export default navetteService;