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
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getCodePromoById,
  deleteCodePromo,
  getLivreurs,
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
  
  // États pour la modal d'ajout de livreurs
  const [livreursDisponibles, setLivreursDisponibles] = useState([]);
  const [loadingLivreurs, setLoadingLivreurs] = useState(false);
  const [selectedLivreurs, setSelectedLivreurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorLivreurs, setErrorLivreurs] = useState(null);

  useEffect(() => {
    fetchCodePromo();
  }, [id]);

  // Charger les livreurs quand la modal s'ouvre
  useEffect(() => {
    if (isAddLivreursModalOpen) {
      fetchLivreursDisponibles();
      setSelectedLivreurs([]);
      setSearchTerm("");
      setErrorLivreurs(null);
    }
  }, [isAddLivreursModalOpen]);

  const fetchCodePromo = async () => {
    try {
      setLoading(true);
      const response = await getCodePromoById(id);
      console.log("Code promo chargé:", response.data);
      setCodePromo(response.data.data);
    } catch (err) {
      console.error("Erreur chargement code promo:", err);
      setError("Code promo non trouvé");
      toast.error("Impossible de charger les détails");
    } finally {
      setLoading(false);
    }
  };

  const fetchLivreursDisponibles = async () => {
    setLoadingLivreurs(true);
    setErrorLivreurs(null);
    try {
      const response = await getLivreurs();
      console.log("Livreurs reçus:", response.data);

      // Adapter selon la structure de l'API
      let livreursData = [];
      if (response.data?.success && response.data?.data) {
        if (Array.isArray(response.data.data)) {
          livreursData = response.data.data;
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          livreursData = response.data.data.data;
        }
      } else if (Array.isArray(response.data)) {
        livreursData = response.data;
      }

      console.log("Livreurs extraits:", livreursData);

      // Exclure les livreurs déjà associés au code promo
      const livreursIdsAssocies = codePromo?.livreurs?.map(l => l.id) || [];
      const livreursFiltres = livreursData.filter(
        livreur => !livreursIdsAssocies.includes(livreur.id)
      );

      setLivreursDisponibles(livreursFiltres);
    } catch (err) {
      console.error("Erreur chargement livreurs:", err);
      setErrorLivreurs("Impossible de charger la liste des livreurs");
      toast.error("Erreur de chargement des livreurs");
    } finally {
      setLoadingLivreurs(false);
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
      console.log("Ajout des livreurs:", selectedLivreurs);
      await addLivreursToCodePromo(id, selectedLivreurs);
      toast.success(`${selectedLivreurs.length} livreur(s) ajouté(s) avec succès`);
      setIsAddLivreursModalOpen(false);
      setSelectedLivreurs([]);
      fetchCodePromo(); // Recharger les détails
    } catch (err) {
      console.error("Erreur ajout livreurs:", err.response?.data);
      // Le toast est déjà géré par l'intercepteur
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

  const handleToggleLivreur = (livreurId) => {
    setSelectedLivreurs((prev) =>
      prev.includes(livreurId)
        ? prev.filter((id) => id !== livreurId)
        : [...prev, livreurId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLivreurs.length === filteredLivreurs.length) {
      setSelectedLivreurs([]);
    } else {
      setSelectedLivreurs(filteredLivreurs.map((l) => l.id));
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

  // Filtrer les livreurs par recherche
  const filteredLivreurs = livreursDisponibles.filter((livreur) => {
    const searchLower = searchTerm.toLowerCase();
    const prenom = livreur.user?.prenom?.toLowerCase() || '';
    const nom = livreur.user?.nom?.toLowerCase() || '';
    const email = livreur.user?.email?.toLowerCase() || '';
    const telephone = livreur.user?.telephone || '';
    
    return (
      prenom.includes(searchLower) ||
      nom.includes(searchLower) ||
      `${prenom} ${nom}`.includes(searchLower) ||
      email.includes(searchLower) ||
      telephone.includes(searchTerm)
    );
  });

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
              {codePromo.status === "actif" ? "Actif" : 
               codePromo.status === "inactif" ? "Inactif" : "Expiré"}
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
                    {codePromo.utilisations_actuelles || 0}
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
                        width: `${((codePromo.utilisations_actuelles || 0) / codePromo.max_utilisations) * 100}%`,
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
                            {livreur.user?.telephone || "Tél non renseigné"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Utilisations: {livreur.pivot?.utilisations || 0}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Ajouter des livreurs au code promo
              </h3>
              <button
                onClick={() => {
                  setIsAddLivreursModalOpen(false);
                  setSelectedLivreurs([]);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="mb-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un livreur (nom, prénom, email, téléphone)..."
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Liste des livreurs */}
            {loadingLivreurs ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : errorLivreurs ? (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{errorLivreurs}</p>
                <button
                  onClick={fetchLivreursDisponibles}
                  className="mt-2 text-sm text-red-600 hover:text-red-500"
                >
                  Réessayer
                </button>
              </div>
            ) : livreursDisponibles.length === 0 ? (
              <div className="py-8 text-center">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Aucun livreur disponible à ajouter
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tous les livreurs sont déjà associés à ce code promo
                </p>
              </div>
            ) : (
              <>
                {/* Sélection tout */}
                {filteredLivreurs.length > 0 && (
                  <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={
                          filteredLivreurs.length > 0 &&
                          selectedLivreurs.length === filteredLivreurs.length
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Tout sélectionner
                      </span>
                    </label>
                    <span className="text-sm text-gray-500">
                      {selectedLivreurs.length} sélectionné(s)
                    </span>
                  </div>
                )}

                {/* Liste des livreurs */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredLivreurs.length > 0 ? (
                    filteredLivreurs.map((livreur) => (
                      <label
                        key={livreur.id}
                        className="flex cursor-pointer items-center p-3 border rounded-md hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={selectedLivreurs.includes(livreur.id)}
                          onChange={() => handleToggleLivreur(livreur.id)}
                        />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {livreur.user?.prenom} {livreur.user?.nom}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:space-x-4">
                            <p className="text-xs text-gray-500">
                              Email: {livreur.user?.email || "Non renseigné"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Tél: {livreur.user?.telephone || "Non renseigné"}
                            </p>
                          </div>
                          {livreur.wilaya && (
                            <p className="text-xs text-gray-500">
                              Wilaya: {typeof livreur.wilaya === 'object' ? livreur.wilaya.nom : livreur.wilaya}
                            </p>
                          )}
                        </div>
                        {livreur.desactiver === true && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            Inactif
                          </span>
                        )}
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Aucun livreur ne correspond à votre recherche
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3 mt-6">
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
                disabled={selectedLivreurs.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                Ajouter {selectedLivreurs.length > 0 && `(${selectedLivreurs.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodePromoDetails;