// src/components/Livraisons/AssignLivreurModal.jsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { XMarkIcon, UserPlusIcon, PhoneIcon, MapPinIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { getLivreursDisponiblesManager, assignLivreurManager } from '../../services/manager';

const AssignLivreurModal = ({ isOpen, onClose, livraisonId, currentStatus, onAssignSuccess, initialType, isDepotClient = false }) => {
    const [loading, setLoading] = useState(false);
    const [livreurs, setLivreurs] = useState([]);
    const [selectedLivreur, setSelectedLivreur] = useState('');
    const [assignType, setAssignType] = useState(initialType || null);
    const [loadingLivreurs, setLoadingLivreurs] = useState(false);
    const [stats, setStats] = useState({ natifs: 0, assignes: 0, total: 0 });

    // Déterminer quel type de livreur peut être assigné selon le statut et le mode dépôt client
    const getAvailableTypes = () => {
        const types = [];
        
        if (isDepotClient) {
            // Mode dépôt client : uniquement distributeur
            if (['en_attente', 'en_transit'].includes(currentStatus)) {
                types.push({ value: 'distributeur', label: 'Distributeur', code: 2, color: 'blue' });
            }
        } else {
            // Mode normal
            // Ramasseur : peut être assigné si statut différent de "ramasse" et "livre" et "annule"
            if (!['ramasse', 'livre', 'annule'].includes(currentStatus)) {
                types.push({ value: 'ramasseur', label: 'Ramasseur', code: 1, color: 'blue' });
            }
            
            // Distributeur : peut être assigné si statut = "en_transit"
            if (currentStatus === 'en_transit') {
                types.push({ value: 'distributeur', label: 'Distributeur', code: 2, color: 'green' });
            }
        }
        
        return types;
    };

    const availableTypes = getAvailableTypes();

    // Charger TOUS les livreurs disponibles une seule fois
    useEffect(() => {
        if (isOpen) {
            fetchLivreurs();
        }
    }, [isOpen]);

    const fetchLivreurs = async () => {
        setLoadingLivreurs(true);
        try {
            // On appelle l'API SANS paramètre type pour récupérer TOUS les livreurs
            const response = await getLivreursDisponiblesManager();
            if (response.success) {
                setLivreurs(response.data);
                setStats({
                    total: response.meta?.total || response.data.length,
                    natifs: response.meta?.natifs || 0,
                    assignes: response.meta?.assignes || 0,
                });
            } else {
                setLivreurs([]);
            }
        } catch (error) {
            console.error('Erreur chargement livreurs:', error);
            toast.error('Impossible de charger la liste des livreurs');
            setLivreurs([]);
        } finally {
            setLoadingLivreurs(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedLivreur) {
            toast.error('Veuillez sélectionner un livreur');
            return;
        }

        if (!assignType) {
            toast.error('Veuillez sélectionner le type de livreur');
            return;
        }

        const typeCode = assignType === 'ramasseur' ? 1 : 2;

        setLoading(true);
        try {
            const response = await assignLivreurManager(livraisonId, selectedLivreur, typeCode);
            
            if (response.success) {
                toast.success(`Livreur ${assignType} attribué avec succès`);
                if (onAssignSuccess) {
                    onAssignSuccess(response.data);
                }
                handleClose();
            } else {
                toast.error(response.message || "Erreur lors de l'attribution");
            }
        } catch (error) {
            console.error('Erreur assignation:', error);
            
            let errorMessage = "Erreur lors de l'attribution du livreur";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedLivreur('');
        setAssignType(null);
        setLivreurs([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={handleClose}
                ></div>

                {/* Modal */}
                <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="px-6 pt-5 pb-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                                    <UserPlusIcon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Attribuer un livreur
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Livraison #{livraisonId}
                                        {isDepotClient && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <ArchiveBoxIcon className="w-3 h-3 mr-1" />
                                                Dépôt client
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4">
                        {/* Message spécifique pour dépôt client */}
                        {isDepotClient && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-200">
                                <ArchiveBoxIcon className="inline w-4 h-4 mr-2" />
                                <span className="font-medium">Mode dépôt client :</span> Ce colis a été déposé directement par le client.
                                Vous pouvez uniquement assigner un <strong>distributeur</strong> pour la livraison finale.
                            </div>
                        )}

                        {/* Etape 1 : Choix du type de livreur */}
                        {!assignType && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Quel type de livreur souhaitez-vous attribuer ?
                                </label>
                                <div className={`grid ${availableTypes.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                                    {availableTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => setAssignType(type.value)}
                                            className={`p-4 text-center border-2 rounded-lg transition-all
                                                ${type.color === 'blue' 
                                                    ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' 
                                                    : 'border-green-200 hover:border-green-400 hover:bg-green-50'
                                                }`}
                                        >
                                            <div className={`text-lg font-medium ${
                                                type.color === 'blue' ? 'text-blue-700' : 'text-green-700'
                                            }`}>
                                                {type.label}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {type.value === 'ramasseur' 
                                                    ? 'Responsable du ramassage du colis'
                                                    : 'Responsable de la livraison au destinataire'
                                                }
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Etape 2 : Selection du livreur */}
                        {assignType && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sélectionnez un livreur {assignType}
                                    </label>
                                    <button
                                        onClick={() => setAssignType(null)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        ← Changer de type
                                    </button>
                                </div>

                                {/* Stats des livreurs disponibles */}
                                {stats.total > 0 && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total disponible :</span>
                                            <span className="font-semibold">{stats.total}</span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-gray-600">Livreurs de votre wilaya :</span>
                                            <span className="font-semibold text-blue-600">{stats.natifs}</span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-gray-600">Livreurs assignés :</span>
                                            <span className="font-semibold text-green-600">{stats.assignes}</span>
                                        </div>
                                    </div>
                                )}

                                {loadingLivreurs ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-indigo-600"></div>
                                    </div>
                                ) : livreurs.length === 0 ? (
                                    <div className="p-8 text-center bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">
                                            Aucun livreur disponible dans votre wilaya.
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Contactez l'administrateur pour assigner des livreurs à votre wilaya.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {livreurs
                                            .filter(livreur => {
                                                // Filtrer par type selon le type sélectionné
                                                if (assignType === 'ramasseur') {
                                                    return livreur.type === 'ramasseur' || livreur.type === 'polyvalent';
                                                }
                                                if (assignType === 'distributeur') {
                                                    return livreur.type === 'distributeur' || livreur.type === 'polyvalent';
                                                }
                                                return true;
                                            })
                                            .map((livreur) => (
                                            <label
                                                key={livreur.value}
                                                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all
                                                    ${selectedLivreur === livreur.value 
                                                        ? 'border-indigo-500 bg-indigo-50' 
                                                        : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="livreur"
                                                    value={livreur.value}
                                                    checked={selectedLivreur === livreur.value}
                                                    onChange={(e) => setSelectedLivreur(e.target.value)}
                                                    className="mt-1 mr-3 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-gray-900">
                                                            {livreur.label}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                            livreur.origine === 'natif' 
                                                                ? 'bg-blue-100 text-blue-700' 
                                                                : 'bg-green-100 text-green-700'
                                                        }`}>
                                                            {livreur.origine === 'natif' ? 'Natif' : 'Assigné'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center mt-1 text-sm text-gray-500">
                                                        <PhoneIcon className="w-3 h-3 mr-1" />
                                                        {livreur.telephone}
                                                    </div>
                                                    <div className="flex items-center mt-0.5 text-xs text-gray-400">
                                                        <MapPinIcon className="w-3 h-3 mr-1" />
                                                        Type: {livreur.type === 'ramasseur' ? 'Ramasseur' : (livreur.type === 'distributeur' ? 'Distributeur' : 'Polyvalent')}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {assignType && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAssign}
                                    disabled={!selectedLivreur || loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                                            Attribution...
                                        </div>
                                    ) : (
                                        `Attribuer le ${assignType}`
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignLivreurModal;