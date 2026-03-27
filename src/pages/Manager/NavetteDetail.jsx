// src/pages/Manager/NavetteDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import navetteService from "../../services/manager/navetteService";
import { formatMontant, formatDate } from "../../services/manager";
import api from "../../services/api";
import {
  FaArrowLeft,
  FaArrowRight,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBuilding,
  FaBoxes,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaPlay,
  FaStop,
  FaBan,
  FaTruck,
  FaMoneyBillWave,
  FaUsers,
  FaUserTie,
  FaRoad,
  FaGasPump,
  FaEye,
} from "react-icons/fa";

const NavetteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [navette, setNavette] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalGains, setTotalGains] = useState(0);

  useEffect(() => {
    fetchNavette();
  }, [id]);

  const fetchNavette = async () => {
    try {
      setLoading(true);
      const response = await navetteService.getNavetteById(id);
      const navetteData = response.data;
      
      // Calculer le total des gains à partir des gains existants
      let total = 0;
      if (navetteData.gains && Array.isArray(navetteData.gains)) {
        total = navetteData.gains.reduce((sum, gain) => sum + (parseFloat(gain.montant_commission) || 0), 0);
      }
      setTotalGains(total);
      
      // Formater les livraisons pour afficher les références correctement
      if (navetteData.livraisons && Array.isArray(navetteData.livraisons)) {
        navetteData.livraisons = navetteData.livraisons.map(livraison => ({
          ...livraison,
          reference: livraison.demande_livraison?.reference || 
                     livraison.reference || 
                     `LIV-${livraison.id?.substring(0, 8) || '0000'}`,
          prix: livraison.demande_livraison?.colis?.colis_prix || 
                livraison.demande_livraison?.prix || 
                livraison.colis?.colis_prix || 0,
          client_nom: livraison.client?.user?.nom || 
                      livraison.client?.nom || 
                      'Client inconnu',
          client_prenom: livraison.client?.user?.prenom || '',
          destination: livraison.demande_livraison?.addresse_delivery || 'Non spécifiée'
        }));
      }
      
      setNavette(navetteData);
    } catch (error) {
      console.error("Erreur chargement navette:", error);
      toast.error("Erreur lors du chargement de la navette");
      navigate("/navettes");
    } finally {
      setLoading(false);
    }
  };

  const handleDemarrer = async () => {
    try {
      await navetteService.demarrerNavette(id);
      toast.success("Navette démarrée");
      fetchNavette();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du démarrage");
    }
  };

  const handleTerminer = async () => {
    if (!window.confirm("Confirmez-vous la fin de la navette ?")) return;
    try {
      await navetteService.terminerNavette(id);
      toast.success("Navette terminée");
      fetchNavette();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la terminaison");
    }
  };

  const handleAnnuler = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette navette ?")) return;
    try {
      await navetteService.annulerNavette(id);
      toast.success("Navette annulée");
      fetchNavette();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      planifiee: { color: "bg-blue-100 text-blue-800", icon: FaClock, label: "Planifiée" },
      en_cours: { color: "bg-yellow-100 text-yellow-800", icon: FaSpinner, label: "En cours" },
      terminee: { color: "bg-green-100 text-green-800", icon: FaCheckCircle, label: "Terminée" },
      annulee: { color: "bg-red-100 text-red-800", icon: FaTimesCircle, label: "Annulée" },
    };
    return badges[status] || badges.planifiee;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!navette) return null;

  const status = getStatusBadge(navette.status);
  const StatusIcon = status.icon;
  const nbLivraisons = navette.nb_livraisons || navette.livraisons?.length || 0;
  const transitCodes = navette.wilayas_transit || [];
  const totalEstime = (navette.prix_base || 0) + (nbLivraisons * (navette.prix_par_livraison || 0));

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/navettes")}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
      >
        <FaArrowLeft /> Retour aux navettes
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Navette {navette.reference}
          </h1>
          <p className="text-gray-600">
            Créée le {formatDate(navette.created_at, true)}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${status.color}`}
        >
          <StatusIcon className="w-4 h-4" /> {status.label}
        </span>
      </div>

      {/* Actions */}
      {navette.status === "planifiee" && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-3">
          <button
            onClick={handleDemarrer}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            <FaPlay /> Démarrer
          </button>
          <button
            onClick={handleAnnuler}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FaBan /> Annuler
          </button>
        </div>
      )}

      {navette.status === "en_cours" && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-3">
          <button
            onClick={handleTerminer}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FaStop /> Terminer
          </button>
          <button
            onClick={handleAnnuler}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FaBan /> Annuler
          </button>
        </div>
      )}

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary-600" /> Trajet
          </h2>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaMapMarkerAlt className="text-blue-600" />
              </div>
              <div className="font-semibold">{navette.wilaya_depart_id}</div>
              <div className="text-xs text-gray-500">Départ</div>
              <div className="text-xs text-gray-400">{navette.heure_depart}</div>
            </div>
            {transitCodes.length > 0 && (
              <>
                {transitCodes.map((code, idx) => (
                  <React.Fragment key={idx}>
                    <FaArrowRight className="text-gray-400" />
                    <div className="text-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FaMapMarkerAlt className="text-purple-600" />
                      </div>
                      <div className="font-semibold">{code}</div>
                      <div className="text-xs text-gray-500">Transit</div>
                    </div>
                  </React.Fragment>
                ))}
              </>
            )}
            <FaArrowRight className="text-gray-400" />
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaMapMarkerAlt className="text-green-600" />
              </div>
              <div className="font-semibold">{navette.wilaya_arrivee_id}</div>
              <div className="text-xs text-gray-500">Arrivée</div>
              <div className="text-xs text-gray-400">{navette.heure_arrivee}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaMoneyBillWave className="text-primary-600" /> Finances
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">Total gains</span>
              <span className="font-semibold text-green-600 text-lg">
                {formatMontant(totalGains)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total estimé navette</span>
              <span className="font-semibold text-blue-600">
                {formatMontant(totalEstime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Livraisons</span>
              <span className="font-semibold">{nbLivraisons}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Capacité</span>
              <span>
                {nbLivraisons}/{navette.capacite_max}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prix de base</span>
              <span>{formatMontant(navette.prix_base)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prix par livraison</span>
              <span>{formatMontant(navette.prix_par_livraison)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Livraisons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaBoxes className="text-primary-600" /> Livraisons ({nbLivraisons})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
               </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {navette.livraisons?.length > 0 ? (
                navette.livraisons.map((livraison) => (
                  <tr key={livraison.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                      {livraison.reference || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {livraison.client_prenom} {livraison.client_nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {livraison.destination || 'Non spécifiée'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatMontant(livraison.prix)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        livraison.status === 'livre' 
                          ? 'bg-green-100 text-green-800'
                          : livraison.status === 'annule'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {livraison.status === 'livre' ? 'Livré' :
                         livraison.status === 'annule' ? 'Annulé' :
                         livraison.status === 'en_attente' ? 'En attente' :
                         'En cours'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    Aucune livraison dans cette navette
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Répartition des gains (si disponible) */}
      {navette.repartition && navette.repartition.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUsers className="text-primary-600" /> Répartition des gains
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navette.repartition.map((acteur, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${acteur.type === 'gestionnaire' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {acteur.type === 'gestionnaire' ? (
                      <FaUserTie className="text-blue-600" />
                    ) : (
                      <FaBuilding className="text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{acteur.nom}</p>
                    <p className="text-xs text-gray-500">
                      {acteur.type === 'gestionnaire' 
                        ? `Gestionnaire wilaya ${acteur.wilaya}`
                        : 'Hub logistique'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Part</span>
                    <span className="text-lg font-bold text-green-600">{acteur.part}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    du prix de chaque livraison
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavetteDetail;