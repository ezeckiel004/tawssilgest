import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import {
  getLivreurById,
  toggleLivreurActivation,
} from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import { formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

const LivreurDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [livreur, setLivreur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLivreur();
  }, [id]);

  const fetchLivreur = async () => {
    try {
      setLoading(true);
      const response = await getLivreurById(id);
      setLivreur(response.data.data);
    } catch (err) {
      setError("Livreur non trouvé");
      toast.error("Impossible de charger les détails");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivation = async () => {
    try {
      await toggleLivreurActivation(id);
      toast.success(
        `Livreur ${livreur.livreur.desactiver ? "activé" : "désactivé"} avec succès`,
      );
      fetchLivreur(); // Recharger
    } catch (err) {
      toast.error("Erreur lors de la modification");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!livreur) return null;

  const { livreur: data, stats } = livreur;

  return (
    <div>
      <button
        onClick={() => navigate("/livreurs")}
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Retour à la liste
      </button>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* En-tête */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {data.user?.prenom} {data.user?.nom}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Livreur {data.type}
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
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                data.desactiver
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {data.desactiver ? "Activer" : "Désactiver"}
            </button>
          </div>
        </div>

        {/* Informations */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
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
                  {data.user?.prenom} {data.user?.nom}
                </p>
                <p className="flex items-center">
                  <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                  {data.user?.telephone}
                </p>
                {data.user?.email && (
                  <p className="flex items-center">
                    <EnvelopeIcon className="h-3 w-3 mr-1 text-gray-400" />
                    {data.user?.email}
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
                  <span className="font-medium">Type:</span> {data.type}
                </p>
                <p>
                  <span className="font-medium">Date inscription:</span>{" "}
                  {formatDate(data.created_at)}
                </p>
              </dd>
            </div>

            {/* Demande d'adhésion */}
            {data.demande_adhesion && (
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
                          {data.demande_adhesion.id_card_type}
                        </p>
                        <p>
                          <span className="font-medium">N° pièce:</span>{" "}
                          {data.demande_adhesion.id_card_number}
                        </p>
                        <p>
                          <span className="font-medium">Type véhicule:</span>{" "}
                          {data.demande_adhesion.vehicule_type}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Expiration:</span>{" "}
                          {formatDate(
                            data.demande_adhesion.id_card_expiry_date,
                          )}
                        </p>
                        <p>
                          <span className="font-medium">Statut:</span>{" "}
                          {data.demande_adhesion.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
            )}

            {/* Statistiques */}
            {stats && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Statistiques
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-md text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.livraisons_total}
                      </p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-md text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.livraisons_en_cours}
                      </p>
                      <p className="text-xs text-gray-500">En cours</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-md text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {stats.livraisons_terminees}
                      </p>
                      <p className="text-xs text-gray-500">Terminées</p>
                    </div>
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default LivreurDetails;
