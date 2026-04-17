import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { FaBox } from "react-icons/fa";
import {
  getLivraisons,
  searchLivraisons,
  getLivraisonsByStatus,
} from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import {
  formatDate,
  getStatusBadgeClass,
  getStatusLabel,
} from "../../utils/formatters";
import { STATUSES } from "../../utils/constants";
import toast from "react-hot-toast";

// Fonction pour vérifier si c'est un dépôt client
const isDepotClient = (livraison) => {
  return livraison?.demande_livraison?.depose_au_depot === true;
};

const LivraisonsList = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchLivraisons();
  }, [currentPage, selectedStatus]);

  const fetchLivraisons = async () => {
    try {
      setLoading(true);
      let response;

      if (selectedStatus) {
        response = await getLivraisonsByStatus(selectedStatus, currentPage);
      } else {
        response = await getLivraisons(currentPage);
      }

      setLivraisons(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError("Erreur lors du chargement des livraisons");
      toast.error("Impossible de charger les livraisons");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchLivraisons();
      return;
    }

    try {
      setLoading(true);
      const response = await searchLivraisons(searchTerm);
      setLivraisons(response.data.data);
      setPagination(null);
    } catch (err) {
      toast.error("Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  if (loading && livraisons.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Livraisons</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste des livraisons de votre wilaya
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              <FaBox className="w-3 h-3 mr-1" />
              Dépôt client = colis déposé directement
            </span>
          </p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Rechercher par code PIN, client, téléphone, 'dépôt client'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="absolute inset-y-0 right-0 px-3 flex items-center"
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="sm:w-64">
          <select
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={selectedStatus}
            onChange={handleStatusChange}
          >
            <option value="">Tous les statuts</option>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau des livraisons */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Code PIN / Mode
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Client
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Destinataire
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Statut
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {livraisons.map((livraison) => (
                    <tr key={livraison.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {livraison.code_pin}
                        {isDepotClient(livraison) && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <FaBox className="w-3 h-3 mr-1" />
                            Dépôt client
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {livraison.client?.prenom} {livraison.client?.nom}
                        <br />
                        <span className="text-xs">
                          {livraison.client?.telephone}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {livraison.destinataire?.prenom}{" "}
                        {livraison.destinataire?.nom}
                        <br />
                        <span className="text-xs">
                          {livraison.destinataire?.telephone}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDate(livraison.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={getStatusBadgeClass(livraison.status)}>
                          {getStatusLabel(livraison.status)}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          to={`/livraisons/${livraison.id}`}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                        >
                          <EyeIcon className="h-5 w-5 mr-1" />
                          Détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page{" "}
                <span className="font-medium">{pagination.current_page}</span>{" "}
                sur <span className="font-medium">{pagination.last_page}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => setCurrentPage(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivraisonsList;