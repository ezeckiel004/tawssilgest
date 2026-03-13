import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  PercentBadgeIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  getCodePromoById,
  deleteCodePromo,
  addLivreursToCodePromo,
  removeLivreursFromCodePromo,
} from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import { formatDate, formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";

const CodePromoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [codePromo, setCodePromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddLivreursModalOpen, setIsAddLivreursModalOpen] = useState(false);
  const [selectedLivreurs, setSelectedLivreurs] = useState([]);

  useEffect(() => {
    fetchCodePromo();
  }, [id]);

  const fetchCodePromo = async () => {
    try {
      setLoading(true);
      const response = await getCodePromoById(id);
      setCodePromo(response.data.data);
    } catch (err) {
      setError("Code promo non trouvé");
      toast.error("Impossible de charger les détails");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCodePromo(id);
      toast.success("Code promo supprimé avec succès");
      navigate("/codes-promo");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleAddLivreurs = async () => {
    if (selectedLivreurs.length === 0) {
      toast.error("Veuillez sélectionner au moins un livreur");
      return;
    }

    try {
      await addLivreursToCodePromo(id, selectedLivreurs);
      toast.success("Livreurs ajoutés avec succès");
      setIsAddLivreursModalOpen(false);
      setSelectedLivreurs([]);
      fetchCodePromo(); // Recharger
    } catch (err) {
      toast.error("Erreur lors de l'ajout des livreurs");
    }
  };

  const handleRemoveLivreur = async (livreurId) => {
    try {
      await removeLivreursFromCodePromo(id, [livreurId]);
      toast.success("Livreur retiré du code promo");
      fetchCodePromo(); // Recharger
    } catch (err) {
      toast.error("Erreur lors du retrait du livreur");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      actif: "bg-green-100 text-green-800",
      inactif: "bg-gray-100 text-gray-800",
      expire: "bg-red-100 text-red-800",
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!codePromo) return null;

  const isExpired =
    codePromo.date_fin && new Date(codePromo.date_fin) < new Date();
  const isFull =
    codePromo.max_utilisations &&
    codePromo.utilisations_actuelles >= codePromo.max_utilisations;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/codes-promo")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour à la liste
        </button>

        <div className="flex items-center space-x-3">
          <Link
            to={`/codes-promo/${id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Modifier
          </Link>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* En-tête */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <TagIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {codePromo.code}
                </h3>
                <p className="text-sm text-gray-500">{codePromo.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={getStatusBadge(codePromo.status)}>
              {codePromo.status}
            </span>
            {(isExpired || isFull) && (
              <span className="bg-yellow-100 text-yellow-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {isExpired ? "Expiré" : "Épuisé"}
              </span>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            {/* Type et valeur */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                {codePromo.type === "percentage" ? (
                  <PercentBadgeIcon className="h-4 w-4 mr-1" />
                ) : (
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                )}
                Type de réduction
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {codePromo.type === "percentage" ? (
                  <span className="text-lg font-semibold text-primary-600">
                    {codePromo.valeur}%
                  </span>
                ) : (
                  <span className="text-lg font-semibold text-primary-600">
                    {formatCurrency(codePromo.valeur)}
                  </span>
                )}
              </dd>
            </div>

            {/* Période de validité */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Période de validité
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {codePromo.date_debut
                  ? formatDate(codePromo.date_debut)
                  : "Dès maintenant"}
                {" → "}
                {codePromo.date_fin
                  ? formatDate(codePromo.date_fin)
                  : "Illimité"}
              </dd>
            </div>

            {/* Utilisations */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Utilisations
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex items-center">
                  <span className="text-lg font-semibold">
                    {codePromo.utilisations_actuelles}
                  </span>
                  {codePromo.max_utilisations && (
                    <>
                      <span className="mx-1">/</span>
                      <span>{codePromo.max_utilisations}</span>
                    </>
                  )}
                </div>
                {codePromo.max_utilisations && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 rounded-full h-2"
                      style={{
                        width: `${(codePromo.utilisations_actuelles / codePromo.max_utilisations) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </dd>
            </div>

            {/* Commande minimum */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Commande minimum
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {codePromo.min_commande
                  ? formatCurrency(codePromo.min_commande)
                  : "Aucun minimum"}
              </dd>
            </div>

            {/* Livreurs associés */}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 flex items-center justify-between">
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  Livreurs associés ({codePromo.livreurs?.length || 0})
                </div>
                <button
                  onClick={() => setIsAddLivreursModalOpen(true)}
                  className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Ajouter des livreurs
                </button>
              </dt>
              <dd className="mt-3">
                {codePromo.livreurs && codePromo.livreurs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {codePromo.livreurs.map((livreur) => (
                      <div
                        key={livreur.id}
                        className="relative flex items-center justify-between bg-gray-50 p-3 rounded-md"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {livreur.user?.prenom} {livreur.user?.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            {livreur.user?.telephone}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Utilisations: {livreur.pivot.utilisations}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveLivreur(livreur.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Aucun livreur associé
                  </p>
                )}
              </dd>
            </div>

            {/* Dates de création */}
            <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div>Créé le: {formatDate(codePromo.created_at)}</div>
                <div>Modifié le: {formatDate(codePromo.updated_at)}</div>
              </div>
            </div>
          </dl>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Êtes-vous sûr de vouloir supprimer le code promo{" "}
              <span className="font-semibold">{codePromo.code}</span> ? Cette
              action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de livreurs */}
      {isAddLivreursModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ajouter des livreurs
            </h3>

            {/* Liste des livreurs disponibles (simplifiée) */}
            <div className="space-y-2 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <label
                  key={i}
                  className="flex items-center p-3 border rounded-md hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={selectedLivreurs.includes(i.toString())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLivreurs([
                          ...selectedLivreurs,
                          i.toString(),
                        ]);
                      } else {
                        setSelectedLivreurs(
                          selectedLivreurs.filter((id) => id !== i.toString()),
                        );
                      }
                    }}
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Livreur {i}
                    </p>
                    <p className="text-xs text-gray-500">0550 12 34 5{i}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddLivreursModalOpen(false);
                  setSelectedLivreurs([]);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddLivreurs}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodePromoDetails; // ⚠️ Vérifiez cette ligne
