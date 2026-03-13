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
export const getCodesPromo = () => 
  api.get('/manager/codes-promo');

export const getCodePromoById = (id) => 
  api.get(`/manager/codes-promo/${id}`);

export const createCodePromo = (data) => 
  api.post('/manager/codes-promo', data);

export const updateCodePromo = (id, data) => 
  api.put(`/manager/codes-promo/${id}`, data);

export const deleteCodePromo = (id) => 
  api.delete(`/manager/codes-promo/${id}`);

export const addLivreursToCodePromo = (id, livreurs) => 
  api.post(`/manager/codes-promo/${id}/add-livreurs`, { livreurs });

export const removeLivreursFromCodePromo = (id, livreurs) => 
  api.delete(`/manager/codes-promo/${id}/remove-livreurs`, { data: { livreurs } });

// Profil
export const getProfile = () => 
  api.get('/manager/profile');

export const updateProfile = (data) => 
  api.put('/manager/profile', data);

export const changePassword = (data) => 
  api.post('/manager/profile/change-password', data);