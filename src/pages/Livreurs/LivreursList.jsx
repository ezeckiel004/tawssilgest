import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, PowerIcon } from "@heroicons/react/24/outline";
import { getLivreurs, toggleLivreurActivation } from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import { formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

const LivreursList = () => {
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLivreurs();
  }, []);

  const fetchLivreurs = async () => {
    try {
      setLoading(true);
      const response = await getLivreurs();
      console.log("Réponse API livreurs:", response.data); // Pour déboguer

      // 🔍 ADAPTATION SELON LA STRUCTURE DE VOTRE API
      // Si la réponse est directement un tableau
      if (Array.isArray(response.data)) {
        setLivreurs(response.data);
      }
      // Si la réponse est dans response.data.data
      else if (response.data?.data && Array.isArray(response.data.data)) {
        setLivreurs(response.data.data);
      }
      // Si la réponse a une propriété 'livreurs'
      else if (
        response.data?.livreurs &&
        Array.isArray(response.data.livreurs)
      ) {
        setLivreurs(response.data.livreurs);
      }
      // Sinon, essayer de trouver un tableau dans la réponse
      else {
        const possibleArray = Object.values(response.data).find((val) =>
          Array.isArray(val),
        );
        if (possibleArray) {
          setLivreurs(possibleArray);
        } else {
          console.error("Structure de réponse inattendue:", response.data);
          setLivreurs([]);
        }
      }
    } catch (err) {
      setError("Erreur lors du chargement des livreurs");
      toast.error("Impossible de charger les livreurs");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivation = async (id, currentStatus) => {
    try {
      await toggleLivreurActivation(id);
      toast.success(
        `Livreur ${!currentStatus ? "activé" : "désactivé"} avec succès`,
      );
      fetchLivreurs(); // Recharger la liste
    } catch (err) {
      toast.error("Erreur lors de la modification");
    }
  };

  const getStatusBadge = (desactiver) => {
    return desactiver
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Livreurs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste des livreurs de votre wilaya
          </p>
        </div>
      </div>

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
                      <tr key={livreur.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {livreur.user?.prenom} {livreur.user?.nom}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {livreur.user?.email || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {livreur.user?.telephone}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`capitalize ${
                              livreur.type === "distributeur"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            {livreur.type}
                          </span>
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
                            >
                              <PowerIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-8 text-gray-500"
                      >
                        Aucun livreur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivreursList;
