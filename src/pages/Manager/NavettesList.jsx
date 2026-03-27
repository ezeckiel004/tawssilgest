// src/pages/Manager/NavettesList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import navetteService from "../../services/manager/navetteService";
import { formatDate } from "../../services/manager";
import {
  FaPlus,
  FaTruck,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBoxes,
  FaSearch,
  FaFilter,
  FaSync,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaArrowRight,
  FaEye,
  FaTrash,
  FaPlay,
  FaStop,
  FaBan,
} from "react-icons/fa";

const NavettesList = () => {
  const navigate = useNavigate();
  const [navettes, setNavettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    date_debut: "",
    date_fin: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchNavettes();
  }, [filters, currentPage]);

  const fetchNavettes = async () => {
    try {
      setLoading(true);
      const response = await navetteService.getAllNavettes({
        ...filters,
        page: currentPage,
        per_page: 10,
      });

      const data = response.data?.data || response.data || response;

      if (data.data) {
        setNavettes(data.data);
        setCurrentPage(data.current_page || 1);
        setLastPage(data.last_page || 1);
        setTotal(data.total || 0);
      } else if (Array.isArray(data)) {
        setNavettes(data);
        setLastPage(1);
        setTotal(data.length);
      } else {
        setNavettes([]);
      }
    } catch (error) {
      console.error("Erreur chargement navettes:", error);
      toast.error("Erreur lors du chargement des navettes");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ status: "", date_debut: "", date_fin: "", search: "" });
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette navette ?"))
      return;

    try {
      await navetteService.deleteNavette(id);
      toast.success("Navette supprimée avec succès");
      fetchNavettes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleDemarrer = async (id) => {
    try {
      await navetteService.demarrerNavette(id);
      toast.success("Navette démarrée");
      fetchNavettes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du démarrage");
    }
  };

  const handleTerminer = async (id) => {
    if (!window.confirm("Confirmez-vous la fin de la navette ?")) return;

    try {
      await navetteService.terminerNavette(id);
      toast.success("Navette terminée");
      fetchNavettes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la terminaison");
    }
  };

  const handleAnnuler = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette navette ?"))
      return;

    try {
      await navetteService.annulerNavette(id);
      toast.success("Navette annulée");
      fetchNavettes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      planifiee: {
        color: "bg-blue-100 text-blue-800",
        icon: FaClock,
        label: "Planifiée",
      },
      en_cours: {
        color: "bg-yellow-100 text-yellow-800",
        icon: FaSpinner,
        label: "En cours",
      },
      terminee: {
        color: "bg-green-100 text-green-800",
        icon: FaCheckCircle,
        label: "Terminée",
      },
      annulee: {
        color: "bg-red-100 text-red-800",
        icon: FaTimesCircle,
        label: "Annulée",
      },
    };
    return badges[status] || badges.planifiee;
  };

  const getProgressBarColor = (status, taux) => {
    if (status === "terminee") return "bg-green-600";
    if (status === "annulee") return "bg-red-600";
    if (status === "en_cours") return "bg-yellow-600";
    if (taux >= 90) return "bg-green-600";
    if (taux >= 70) return "bg-blue-600";
    return "bg-primary-600";
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Navettes</h1>
          <p className="text-gray-600">Gérez les navettes de votre wilaya</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/navettes/create")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <FaPlus /> Nouvelle navette
          </button>
          <button
            onClick={fetchNavettes}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <FaSync className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Rechercher par référence..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Tous les statuts</option>
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              name="date_debut"
              placeholder="Date début"
              value={filters.date_debut}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <input
              type="date"
              name="date_fin"
              placeholder="Date fin"
              value={filters.date_fin}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <FaFilter /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trajet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date départ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Livraisons
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Taux
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {navettes.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        Aucune navette trouvée
                      </td>
                    </tr>
                  ) : (
                    navettes.map((navette) => {
                      const status = getStatusBadge(navette.status);
                      const StatusIcon = status.icon;
                      const nbLivraisons = navette.nb_livraisons || navette.livraisons?.length || 0;
                      const taux = navette.taux_remplissage || 0;
                      const transitCodes = navette.wilayas_transit || [];

                      return (
                        <tr key={navette.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-primary-600">
                              {navette.reference}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm">
                              <span>{navette.wilaya_depart_id}</span>
                              <FaArrowRight className="text-gray-400 text-xs" />
                              {transitCodes.map((code, i) => (
                                <React.Fragment key={i}>
                                  <span className="text-gray-600">{code}</span>
                                  <FaArrowRight className="text-gray-400 text-xs" />
                                </React.Fragment>
                              ))}
                              <span>{navette.wilaya_arrivee_id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-gray-400" />
                              <span className="text-sm">
                                {formatDate(navette.date_depart)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${status.color}`}
                            >
                              <StatusIcon className="w-3 h-3" /> {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-1">
                              <FaBoxes className="text-gray-400" />
                              <span className="font-medium">{nbLivraisons}</span>
                              <span className="text-gray-500">/{navette.capacite_max}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressBarColor(
                                    navette.status,
                                    taux
                                  )}`}
                                  style={{ width: `${taux}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium">
                                {Math.round(taux)}%
                              </span>
                            </div>
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/navettes/${navette.id}`)}
                                className="text-primary-600 hover:text-primary-900"
                                title="Voir détails"
                              >
                                <FaEye />
                              </button>
                              {navette.status === "planifiee" && (
                                <>
                                  <button
                                    onClick={() => handleDemarrer(navette.id)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Démarrer"
                                  >
                                    <FaPlay />
                                  </button>
                                  <button
                                    onClick={() => handleAnnuler(navette.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Annuler"
                                  >
                                    <FaBan />
                                  </button>
                                </>
                              )}
                              {navette.status === "en_cours" && (
                                <>
                                  <button
                                    onClick={() => handleTerminer(navette.id)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Terminer"
                                  >
                                    <FaStop />
                                  </button>
                                  <button
                                    onClick={() => handleAnnuler(navette.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Annuler"
                                  >
                                    <FaBan />
                                  </button>
                                </>
                              )}
                              {(navette.status === "planifiee" ||
                                navette.status === "annulee") && (
                                <button
                                  onClick={() => handleDelete(navette.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Supprimer"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                           </td>
                         </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {lastPage} (total: {total} navettes)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                  disabled={currentPage === lastPage}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NavettesList;