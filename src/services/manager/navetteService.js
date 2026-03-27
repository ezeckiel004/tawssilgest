// src/services/manager/navetteService.js
import api from '../api';

const navetteService = {
    // Récupérer toutes les navettes du gestionnaire
    getAllNavettes: async (params = {}) => {
        const response = await api.get('/manager/navettes', { params });
        return response.data;
    },

    // Récupérer une navette par ID
    getNavetteById: async (id) => {
        const response = await api.get(`/manager/navettes/${id}`);
        return response.data;
    },

    // Créer une nouvelle navette
    createNavette: async (navetteData) => {
        const response = await api.post('/manager/navettes', navetteData);
        return response.data;
    },

    // Démarrer une navette
    demarrerNavette: async (id) => {
        const response = await api.post(`/manager/navettes/${id}/demarrer`);
        return response.data;
    },

    // Terminer une navette
    terminerNavette: async (id) => {
        const response = await api.post(`/manager/navettes/${id}/terminer`);
        return response.data;
    },

    // Annuler une navette
    annulerNavette: async (id) => {
        const response = await api.post(`/manager/navettes/${id}/annuler`);
        return response.data;
    },

    // Obtenir les livraisons disponibles pour la navette
    getLivraisonsDisponibles: async () => {
        const response = await api.get('/manager/navettes/disponibles');
        return response.data;
    },

    // Obtenir la liste des hubs disponibles (pour les gestionnaires)
    getHubsDisponibles: async () => {
        try {
            // Utiliser la route manager/hubs
            const response = await api.get('/manager/hubs');
            return response.data;
        } catch (error) {
            console.error("Erreur getHubsDisponibles:", error);
            throw error;
        }
    },

    // Supprimer une navette (si autorisé)
    deleteNavette: async (id) => {
        const response = await api.delete(`/manager/navettes/${id}`);
        return response.data;
    }
};

export default navetteService;