// ==================== PROJET MANAGER ====================
// src/pages/Livreurs/LivreurDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  TruckIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  getLivreurById,
  toggleLivreurActivation,
  formatDate,
  formatMontant,
} from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import toast from "react-hot-toast";

const LivreurDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [livreur, setLivreur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchLivreur();
  }, [id]);

  const fetchLivreur = async () => {
    try {
      setLoading(true);
      const response = await getLivreurById(id);
      console.log("Réponse API livreur:", response.data);
      
      let livreurData = null;
      
      // Adaptation selon la structure de l'API
      if (response.data?.data?.livreur) {
        livreurData = response.data.data;
      } else if (response.data?.data) {
        livreurData = response.data.data;
      } else if (response.data?.livreur) {
        livreurData = response.data;
      } else {
        livreurData = response.data;
      }
      
      setLivreur(livreurData);
    } catch (err) {
      setError("Livreur non trouvé");
      toast.error("Impossible de charger les détails");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivation = async () => {
    if (!livreur) return;
    
    setUpdating(true);
    try {
      await toggleLivreurActivation(id);
      toast.success(
        `Livreur ${livreur.desactiver ? "activé" : "désactivé"} avec succès`,
      );
      fetchLivreur(); // Recharger
    } catch (err) {
      toast.error("Erreur lors de la modification");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getOrigineInfo = (origine, assignation) => {
    if (origine === 'natif') {
      return {
        label: 'Natif de la wilaya',
        color: 'bg-green-100 text-green-800',
        icon: <MapPinIcon className="h-4 w-4" />,
        description: 'Ce livreur appartient à votre wilaya'
      };
    } else if (origine === 'assigne') {
      return {
        label: 'Assigné à cette wilaya',
        color: 'bg-blue-100 text-blue-800',
        icon: <ClockIcon className="h-4 w-4" />,
        description: assignation?.date_fin 
          ? `Assigné du ${formatDate(assignation.date_debut)} au ${formatDate(assignation.date_fin)}`
          : `Assigné depuis le ${formatDate(assignation?.date_debut)}`,
        date_debut: assignation?.date_debut,
        date_fin: assignation?.date_fin
      };
    }
    return {
      label: 'Origine inconnue',
      color: 'bg-gray-100 text-gray-800',
      icon: <MapPinIcon className="h-4 w-4" />,
      description: 'Information non disponible'
    };
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!livreur) return null;

  const data = livreur.livreur || livreur;
  const stats = livreur.stats || {};
  const user = data.user || {};
  const demandeAdhesion = data.demande_adhesion || data.demandeAdhesion;
  const origine = data.origine || (data.wilaya_id === data.wilaya_cible ? 'natif' : 'assigne');
  const assignation = data.assignation || null;
  const origineInfo = getOrigineInfo(origine, assignation);

  return (
    <div>
      {/* Bouton retour */}
      <button
        onClick={() => navigate("/livreurs")}
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Retour à la liste
      </button>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* En-tête */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {user.prenom} {user.nom}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Livreur {data.type === "distributeur" ? "Distributeur" : "Ramasseur"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                data.desactiver
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {data.desactiver ? "Inactif" : "Actif"}
            </span>
            <button
              onClick={handleToggleActivation}
              disabled={updating}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                data.desactiver
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50`}
            >
              {updating ? "Chargement..." : (data.desactiver ? "Activer" : "Désactiver")}
            </button>
          </div>
        </div>

        {/* Informations */}
        <div className="px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            {/* Informations personnelles */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                Informations personnelles
              </dt>
              <dd className="mt-1 text-sm text-gray-900 space-y-2">
                <p>
                  <span className="font-medium">Nom complet:</span>{" "}
                  {user.prenom} {user.nom}
                </p>
                <p className="flex items-center">
                  <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                  {user.telephone || "Non renseigné"}
                </p>
                {user.email && (
                  <p className="flex items-center">
                    <EnvelopeIcon className="h-3 w-3 mr-1 text-gray-400" />
                    {user.email}
                  </p>
                )}
              </dd>
            </div>

            {/* Informations professionnelles */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <TruckIcon className="h-4 w-4 mr-1" />
                Informations professionnelles
              </dt>
              <dd className="mt-1 text-sm text-gray-900 space-y-2">
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {data.type === "distributeur" ? "Distributeur" : "Ramasseur"}
                </p>
                <p>
                  <span className="font-medium">Date inscription:</span>{" "}
                  {formatDate(data.created_at)}
                </p>
                <p>
                  <span className="font-medium">Wilaya native:</span>{" "}
                  {data.wilaya_id || "Non renseignée"}
                </p>
              </dd>
            </div>

            {/* Origine du livreur */}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                {origineInfo.icon}
                <span className="ml-1">Origine</span>
              </dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${origineInfo.color}`}>
                  {origineInfo.label}
                </span>
                <p className="mt-2 text-sm text-gray-600">{origineInfo.description}</p>
                {origine === 'assigne' && assignation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">Début:</span>
                        <span className="font-medium">{formatDate(assignation.date_debut)}</span>
                      </div>
                      {assignation.date_fin && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4 text-orange-600" />
                          <span className="text-gray-600">Fin:</span>
                          <span className="font-medium">{formatDate(assignation.date_fin)}</span>
                        </div>
                      )}
                    </div>
                    {assignation.motif && (
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Motif:</span> {assignation.motif}
                      </p>
                    )}
                  </div>
                )}
              </dd>
            </div>

            {/* Demande d'adhésion */}
            {demandeAdhesion && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <IdentificationIcon className="h-4 w-4 mr-1" />
                  Demande d'adhésion
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p>
                          <span className="font-medium">Type pièce:</span>{" "}
                          {demandeAdhesion.id_card_type || "Non renseigné"}
                        </p>
                        <p>
                          <span className="font-medium">N° pièce:</span>{" "}
                          {demandeAdhesion.id_card_number || "Non renseigné"}
                        </p>
                        <p>
                          <span className="font-medium">Type véhicule:</span>{" "}
                          {demandeAdhesion.vehicule_type || "Non renseigné"}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Expiration:</span>{" "}
                          {formatDate(demandeAdhesion.id_card_expiry_date)}
                        </p>
                        <p>
                          <span className="font-medium">Statut:</span>{" "}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            demandeAdhesion.status === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : demandeAdhesion.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {demandeAdhesion.status === 'approved' ? 'Approuvé' :
                             demandeAdhesion.status === 'rejected' ? 'Rejeté' : 'En attente'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
            )}

            {/* Statistiques */}
            {Object.keys(stats).length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Statistiques
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-md text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.livraisons_total || 0}
                      </p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-md text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.livraisons_en_cours || 0}
                      </p>
                      <p className="text-xs text-gray-500">En cours</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-md text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {stats.livraisons_terminees || 0}
                      </p>
                      <p className="text-xs text-gray-500">Terminées</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-md text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.taux_reussite || 0}%
                      </p>
                      <p className="text-xs text-gray-500">Taux réussite</p>
                    </div>
                  </div>
                </dd>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                Informations système
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                  <p>ID: {data.id}</p>
                  <p>Dernière mise à jour: {formatDate(data.updated_at, true)}</p>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default LivreurDetails;