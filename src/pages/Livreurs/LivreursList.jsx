// ==================== PROJET MANAGER ====================
// src/pages/Livreurs/LivreursList.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, PowerIcon } from "@heroicons/react/24/outline";
import { 
  getLivreurs, 
  toggleLivreurActivation, 
  formatDate,
} from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import toast from "react-hot-toast";

const LivreursList = () => {
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("tous"); // 'tous', 'natif', 'assigne'
  const [stats, setStats] = useState({
    total: 0,
    natifs: 0,
    assignes: 0,
    actifs: 0,
    inactifs: 0
  });

  useEffect(() => {
    fetchLivreurs();
  }, [filter]);

  const fetchLivreurs = async () => {
    try {
      setLoading(true);
      
      // Appel API pour récupérer tous les livreurs (natifs + assignés)
      const response = await getLivreurs();
      
      console.log("Réponse API livreurs:", response.data);
      
      let livreursData = [];
      
      // Adaptation selon la structure de l'API
      if (Array.isArray(response.data)) {
        livreursData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        livreursData = response.data.data;
      } else if (response.data?.livreurs && Array.isArray(response.data.livreurs)) {
        livreursData = response.data.livreurs;
      } else {
        const possibleArray = Object.values(response.data).find((val) => Array.isArray(val));
        if (possibleArray) {
          livreursData = possibleArray;
        } else {
          console.error("Structure de réponse inattendue:", response.data);
          livreursData = [];
        }
      }
      
      // Appliquer le filtre si nécessaire
      let filteredData = livreursData;
      if (filter === "natif") {
        filteredData = livreursData.filter(l => l.origine === 'natif');
      } else if (filter === "assigne") {
        filteredData = livreursData.filter(l => l.origine === 'assigne');
      }
      
      setLivreurs(filteredData);
      
      // Calculer les statistiques sur tous les livreurs (avant filtrage)
      const total = livreursData.length;
      const natifs = livreursData.filter(l => l.origine === 'natif').length;
      const assignes = livreursData.filter(l => l.origine === 'assigne').length;
      const actifs = livreursData.filter(l => !l.desactiver).length;
      const inactifs = livreursData.filter(l => l.desactiver).length;
      
      setStats({ total, natifs, assignes, actifs, inactifs });
      
    } catch (err) {
      console.error("Erreur fetchLivreurs:", err);
      setError("Erreur lors du chargement des livreurs");
      toast.error("Impossible de charger les livreurs");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivation = async (id, currentStatus) => {
    if (!id) {
      toast.error("ID du livreur invalide");
      return;
    }
    
    try {
      await toggleLivreurActivation(id);
      toast.success(
        `Livreur ${currentStatus ? "activé" : "désactivé"} avec succès`,
      );
      fetchLivreurs(); // Recharger la liste
    } catch (err) {
      console.error("Erreur toggleActivation:", err);
      toast.error("Erreur lors de la modification");
    }
  };

  const getStatusBadge = (desactiver) => {
    return desactiver
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";
  };

  const getOrigineBadge = (origine) => {
    if (origine === 'natif') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Natif
        </span>
      );
    } else if (origine === 'assigne') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Assigné
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Inconnu
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Livreurs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste des livreurs disponibles dans votre wilaya
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Natif de la wilaya</p>
          <p className="text-2xl font-bold text-green-600">{stats.natifs}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Assignés</p>
          <p className="text-2xl font-bold text-blue-600">{stats.assignes}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{stats.actifs}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Inactifs</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactifs}</p>
        </div>
      </div>

      {/* Filtres par origine */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setFilter("tous")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            filter === "tous"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tous les livreurs
        </button>
        <button
          onClick={() => setFilter("natif")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            filter === "natif"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Natifs
        </button>
        <button
          onClick={() => setFilter("assigne")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            filter === "assigne"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Assignés
        </button>
      </div>

      {/* Tableau des livreurs */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Nom
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Téléphone
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Origine
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Wilaya native
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Statut
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date inscription
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {livreurs.length > 0 ? (
                    livreurs.map((livreur) => (
                      <tr key={livreur.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {livreur.user?.prenom} {livreur.user?.nom}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {livreur.user?.email || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {livreur.user?.telephone || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`capitalize ${
                              livreur.type === "distributeur"
                                ? "text-blue-600 font-medium"
                                : "text-green-600 font-medium"
                            }`}
                          >
                            {livreur.type === "distributeur" ? "Distributeur" : "Ramasseur"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {getOrigineBadge(livreur.origine)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {livreur.wilaya_id || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(livreur.desactiver)}`}
                          >
                            {livreur.desactiver ? "Inactif" : "Actif"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(livreur.created_at)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/livreurs/${livreur.id}`}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                              title="Voir détails"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() =>
                                handleToggleActivation(
                                  livreur.id,
                                  livreur.desactiver,
                                )
                              }
                              className={`inline-flex items-center ${
                                livreur.desactiver
                                  ? "text-green-600 hover:text-green-900"
                                  : "text-red-600 hover:text-red-900"
                              }`}
                              title={livreur.desactiver ? "Activer" : "Désactiver"}
                            >
                              <PowerIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-gray-500">
                        {filter === "natif" && "Aucun livreur natif trouvé"}
                        {filter === "assigne" && "Aucun livreur assigné trouvé"}
                        {filter === "tous" && "Aucun livreur trouvé"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Légende</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Natif
            </span>
            <span className="text-gray-600">- Livreur appartenant à votre wilaya</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Assigné
            </span>
            <span className="text-gray-600">- Livreur assigné temporairement à votre wilaya</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivreursList;