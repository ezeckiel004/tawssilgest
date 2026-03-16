import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { getCodesPromo, deleteCodePromo } from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import { formatDate, formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";

const CodesPromoList = () => {
  const [codesPromo, setCodesPromo] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCodesPromo(currentPage);
  }, [currentPage]);

  const fetchCodesPromo = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getCodesPromo(page);
      console.log("Réponse API codes promo:", response.data);

      // Structure de l'API: { success: true, data: { data: [...], current_page: 1, ... } }
      if (response.data?.success && response.data?.data) {
        // Vérifier si response.data.data a une propriété 'data' (pagination Laravel)
        if (response.data.data.data && Array.isArray(response.data.data.data)) {
          // C'est une réponse paginée
          setCodesPromo(response.data.data.data);
          // Sauvegarder les informations de pagination
          const { data, ...paginationInfo } = response.data.data;
          setPagination(paginationInfo);
        } 
        // Si response.data.data est directement un tableau
        else if (Array.isArray(response.data.data)) {
          setCodesPromo(response.data.data);
          setPagination(null);
        }
        // Si response.data.data n'est pas ce qu'on attend
        else {
          console.error("Structure de données inattendue:", response.data.data);
          setCodesPromo([]);
        }
      } else {
        console.error("Structure de réponse inattendue:", response.data);
        setCodesPromo([]);
      }
    } catch (err) {
      console.error("Erreur fetchCodesPromo:", err);
      setError("Erreur lors du chargement des codes promo");
      toast.error("Impossible de charger les codes promo");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (
      !window.confirm(`Êtes-vous sûr de vouloir supprimer le code "${code}" ?`)
    ) {
      return;
    }

    try {
      await deleteCodePromo(id);
      toast.success("Code promo supprimé avec succès");
      fetchCodesPromo(currentPage); // Recharger la liste avec la page courante
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Codes Promo</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez vos codes promo et associez-les à vos livreurs
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/codes-promo/nouveau"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouveau code promo
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {codesPromo.length > 0 ? (
          codesPromo.map((code) => (
            <div
              key={code.id}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="px-4 py-5 sm:p-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TagIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {code.code}
                      </h3>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {code.description || "Aucune description"}
                      </p>
                    </div>
                  </div>
                  <span className={getStatusBadge(code.status)}>
                    {code.status === "actif" ? "Actif" : 
                     code.status === "inactif" ? "Inactif" : "Expiré"}
                  </span>
                </div>

                {/* Détails */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Réduction:</span>
                    <span className="font-medium text-primary-600">
                      {code.type === "percentage"
                        ? `${code.valeur}%`
                        : formatCurrency(code.valeur)}
                    </span>
                  </div>

                  {code.min_commande > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Commande min:</span>
                      <span className="font-medium">
                        {formatCurrency(code.min_commande)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Utilisations:</span>
                    <span className="font-medium">
                      {code.utilisations_actuelles || 0}
                      {code.max_utilisations && ` / ${code.max_utilisations}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Livreurs:</span>
                    <span className="font-medium">
                      {code.livreurs?.length || 0}
                    </span>
                  </div>

                  {code.date_fin && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Valable jusqu'au:</span>
                      <span className="font-medium">
                        {formatDate(code.date_fin)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Barre de progression des utilisations */}
                {code.max_utilisations && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 rounded-full h-2"
                        style={{
                          width: `${((code.utilisations_actuelles || 0) / code.max_utilisations) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex justify-end space-x-3">
                  <Link
                    to={`/codes-promo/${code.id}`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Voir
                  </Link>
                  <Link
                    to={`/codes-promo/${code.id}/edit`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(code.id, code.code)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucun code promo
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre premier code promo.
            </p>
            <div className="mt-6">
              <Link
                to="/codes-promo/nouveau"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouveau code promo
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.last_page}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{pagination.current_page}</span> sur{" "}
                <span className="font-medium">{pagination.last_page}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Pages numbers */}
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => {
                  // Afficher seulement quelques pages pour éviter la surcharge
                  if (
                    page === 1 ||
                    page === pagination.last_page ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return (
                      <span
                        key={page}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Suivant</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodesPromoList;