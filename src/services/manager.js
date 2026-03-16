import api from './api';

// Dashboard
export const getDashboardStats = () => api.get('/manager/dashboard');

// Livraisons
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

// Livreurs
export const getLivreurs = () => 
  api.get('/manager/livreurs');

export const getLivreurById = (id) => 
  api.get(`/manager/livreurs/${id}`);

export const toggleLivreurActivation = (id) => 
  api.patch(`/manager/livreurs/${id}/toggle-activation`);

// Codes Promo
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

// Gestion des livreurs pour les codes promo - CORRIGÉ
export const addLivreursToCodePromo = (id, livreurs) => {
  // S'assurer que livreurs est un tableau
  const livreursArray = Array.isArray(livreurs) ? livreurs : [livreurs];
  
  // Filtrer les valeurs null/undefined et convertir en nombre si nécessaire
  const validLivreurs = livreursArray
    .filter(l => l != null && l !== '')
    .map(l => {
      // Si c'est un UUID ou un string, le garder comme string
      // Si c'est un nombre, le garder comme nombre
      return l;
    });
  
  console.log("Envoi des livreurs:", validLivreurs);
  
  return api.post(`/manager/codes-promo/${id}/add-livreurs`, { 
    livreurs: validLivreurs 
  });
};

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

// Profil
export const getProfile = () => 
  api.get('/manager/profile');

export const updateProfile = (data) => 
  api.put('/manager/profile', data);

export const changePassword = (data) => 
  api.post('/manager/profile/change-password', data);