// src/services/manager/navetteGainService.js
import api from '../api';

const navetteGainService = {
    /**
     * Récupérer les gains navettes du gestionnaire connecté
     * @param {Object} params - { periode, date_debut, date_fin }
     * @returns {Promise}
     */
    getMesGainsNavette: async (params = {}) => {
        try {
            const response = await api.get('/manager/gains-navette', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getMesGainsNavette:', error);
            throw error;
        }
    },

    /**
     * Récupérer les gains navettes en attente
     * @returns {Promise}
     */
    getGainsNavetteEnAttente: async () => {
        try {
            const response = await api.get('/manager/gains-navette/en-attente');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getGainsNavetteEnAttente:', error);
            throw error;
        }
    },

    /**
     * Demander le paiement d'un gain navette
     * @param {string} gainId - ID du gain
     * @returns {Promise}
     */
    demanderPaiementNavette: async (gainId) => {
        try {
            const response = await api.post(`/manager/gains-navette/demander/${gainId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur demanderPaiementNavette:', error);
            throw error;
        }
    },

    /**
     * Demander le paiement de plusieurs gains navette
     * @param {Array} gainIds - Liste des IDs des gains
     * @returns {Promise}
     */
    demanderPaiementMultipleNavette: async (gainIds) => {
        try {
            const response = await api.post('/manager/gains-navette/demander-multiple', { 
                gain_ids: gainIds 
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur demanderPaiementMultipleNavette:', error);
            throw error;
        }
    },

    /**
     * Récupérer les statistiques des gains navette
     * @returns {Promise}
     */
    getStatistiquesGainsNavette: async () => {
        try {
            const response = await api.get('/manager/gains-navette/statistiques');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getStatistiquesGainsNavette:', error);
            throw error;
        }
    }
};

export default navetteGainService;