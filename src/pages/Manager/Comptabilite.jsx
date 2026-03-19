// src/pages/Manager/Comptabilite.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaBoxes,
  FaTruck,
  FaDownload,
  FaShoppingBag,
  FaRoad,
  FaFileExport,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaUserTie,
  FaCalendarAlt,
  FaPercentage,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getBilanComptable,
  getMesGains,
  getStatistiquesMensuelles,
  exportBilan,
  formatMontant,
  formatNombre,
  getTendanceColor,
  getTendanceIcon,
  traduireStatut,
  getCouleurStatut,
} from "../../services/manager";
import * as managerService from "../../services/manager";

// Service pour les gains (à ajouter dans manager.js)
const gainService = {
  getMesGains: async (params) => {
    const response = await managerService.api.get('/manager/gains', { params });
    return response.data;
  },
  getGainsEnAttente: async () => {
    const response = await managerService.api.get('/manager/gains/en-attente');
    return response.data;
  },
  demanderPaiement: async (gainId) => {
    const response = await managerService.api.post(`/manager/gains/demander/${gainId}`);
    return response.data;
  },
  demanderPaiementMultiple: async (gainIds) => {
    const response = await managerService.api.post('/manager/gains/demander-multiple', { gain_ids: gainIds });
    return response.data;
  }
};

const Comptabilite = () => {
  const [bilan, setBilan] = useState(null);
  const [mesGains, setMesGains] = useState(null);
  const [statsMensuelles, setStatsMensuelles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGains, setLoadingGains] = useState(false);
  const [loadingMensuel, setLoadingMensuel] = useState(false);
  const [period, setPeriod] = useState("mois");
  const [anneeGraphique, setAnneeGraphique] = useState(new Date().getFullYear());
  const [ongletActif, setOngletActif] = useState("bilan"); // 'bilan' ou 'gains'
  const [selectedGains, setSelectedGains] = useState([]);
  const [showDemandeModal, setShowDemandeModal] = useState(false);
  const [customDate, setCustomDate] = useState({
    debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    fin: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchBilan();
  }, [period, customDate]);

  useEffect(() => {
    if (ongletActif === "gains") {
      fetchMesGains();
    }
  }, [ongletActif, period, customDate]);

  useEffect(() => {
    fetchStatistiquesMensuelles();
  }, [anneeGraphique]);

  const fetchBilan = async () => {
    try {
      setLoading(true);
      const params = { periode: period };
      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      }
      const response = await getBilanComptable(params);
      setBilan(response.data);
    } catch (error) {
      console.error("❌ Erreur chargement bilan:", error);
      toast.error("Erreur lors du chargement du bilan");
    } finally {
      setLoading(false);
    }
  };

  const fetchMesGains = async () => {
    try {
      setLoadingGains(true);
      const params = { periode: period };
      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      }
      const response = await gainService.getMesGains(params);
      setMesGains(response.data);
    } catch (error) {
      console.error("❌ Erreur chargement gains:", error);
      toast.error("Erreur lors du chargement des gains");
    } finally {
      setLoadingGains(false);
    }
  };

  const fetchStatistiquesMensuelles = async () => {
    try {
      setLoadingMensuel(true);
      const response = await getStatistiquesMensuelles(anneeGraphique);
      setStatsMensuelles(response.data || []);
    } catch (error) {
      console.error("❌ Erreur chargement stats mensuelles:", error);
    } finally {
      setLoadingMensuel(false);
    }
  };

  const handleExport = async (format = "excel") => {
    try {
      const params = {
        periode: period,
        format,
      };
      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      }
      await exportBilan(params);
      toast.success("Bilan exporté avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  // ==================== GESTION DES GAINS ====================

  const handleSelectAll = () => {
    const gainsEnAttente = mesGains?.gains?.filter(g => g.status === 'en_attente') || [];
    if (selectedGains.length === gainsEnAttente.length) {
      setSelectedGains([]);
    } else {
      setSelectedGains(gainsEnAttente.map(g => g.id));
    }
  };

  const handleSelectGain = (gainId) => {
    if (selectedGains.includes(gainId)) {
      setSelectedGains(selectedGains.filter(id => id !== gainId));
    } else {
      setSelectedGains([...selectedGains, gainId]);
    }
  };

  const handleDemanderPaiement = async (gainId) => {
    try {
      const response = await gainService.demanderPaiement(gainId);
      toast.success(response.message || "Demande envoyée avec succès");
      fetchMesGains(); // Rafraîchir la liste
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la demande");
    }
  };

  const handleDemanderMultiple = async () => {
    if (selectedGains.length === 0) {
      toast.error("Veuillez sélectionner au moins un gain");
      return;
    }
    setShowDemandeModal(true);
  };

  const confirmerDemandeMultiple = async () => {
    try {
      const response = await gainService.demanderPaiementMultiple(selectedGains);
      toast.success(response.message || `${selectedGains.length} demande(s) envoyée(s)`);
      setSelectedGains([]);
      setShowDemandeModal(false);
      fetchMesGains(); // Rafraîchir la liste
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la demande");
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  );

  if (loading && ongletActif === "bilan") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const gainsEnAttente = mesGains?.gains?.filter(g => g.status === 'en_attente') || [];
  const montantSelectionne = mesGains?.gains
    ?.filter(g => selectedGains.includes(g.id))
    .reduce((sum, g) => sum + g.montant_commission, 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Espace Gestionnaire</h1>
        {bilan?.gestionnaire && (
          <p className="text-gray-600 mt-1">
            Wilaya : {bilan.gestionnaire.wilaya_nom} ({bilan.gestionnaire.wilaya_id})
          </p>
        )}
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setOngletActif("bilan")}
          className={`px-4 py-2 text-sm font-medium transition ${
            ongletActif === "bilan"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Bilan financier
        </button>
        <button
          onClick={() => setOngletActif("gains")}
          className={`px-4 py-2 text-sm font-medium transition ${
            ongletActif === "gains"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Mes gains
        </button>
      </div>

      {/* Filtres de période */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {["jour", "semaine", "mois", "annee", "personnalise"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  period === p
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p === "jour" && "Jour"}
                {p === "semaine" && "Semaine"}
                {p === "mois" && "Mois"}
                {p === "annee" && "Année"}
                {p === "personnalise" && "Personnalisé"}
              </button>
            ))}
          </div>

          {period === "personnalise" && (
            <div className="flex items-center gap-4 ml-auto">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Début</label>
                <input
                  type="date"
                  value={customDate.debut}
                  onChange={(e) => setCustomDate({ ...customDate, debut: e.target.value })}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fin</label>
                <input
                  type="date"
                  value={customDate.fin}
                  onChange={(e) => setCustomDate({ ...customDate, fin: e.target.value })}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleExport("excel")}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              title="Exporter en Excel"
            >
              <FaFileExport />
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              title="Exporter en PDF"
            >
              <FaDownload />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu selon l'onglet */}
      {ongletActif === "bilan" && bilan && (
        <>
          {/* Cartes principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Chiffre d'affaires"
              value={formatMontant(bilan.finances?.chiffre_affaires_total)}
              icon={FaMoneyBillWave}
              color="bg-green-500"
              subValue={`${formatNombre(bilan.livraisons?.total)} livraisons`}
            />
            <StatCard
              title="Valeur des colis"
              value={formatMontant(bilan.finances?.valeur_colis)}
              icon={FaShoppingBag}
              color="bg-blue-500"
              subValue={`${formatNombre(bilan.colis?.total)} colis`}
            />
            <StatCard
              title="Revenus livraisons"
              value={formatMontant(bilan.finances?.revenus_livraisons)}
              icon={FaTruck}
              color="bg-purple-500"
              subValue={`Moy. ${formatMontant(bilan.livraisons?.prix_moyen)}`}
            />
            <StatCard
              title="Revenus navettes"
              value={formatMontant(bilan.finances?.revenus_navettes)}
              icon={FaRoad}
              color="bg-orange-500"
              subValue={`${formatNombre(bilan.navettes?.total)} navettes`}
            />
          </div>

          {/* Indicateurs de performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taux de succès</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bilan.livraisons?.taux_succes || 0}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Livraisons réussies</span>
                <span className="font-medium text-green-600">
                  {formatNombre(bilan.livraisons?.terminees)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaClock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Délai moyen</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bilan.livraisons?.duree_moyenne_livraison || 0}h
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Livraisons en cours</span>
                <span className="font-medium text-yellow-600">
                  {formatNombre(bilan.livraisons?.en_cours)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaChartLine className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Activité</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bilan.performances?.livraisons_par_jour || 0}/jour
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Évolution</span>
                <span
                  className={`font-medium ${getTendanceColor(
                    bilan.performances?.evolution_activite
                  )}`}
                >
                  {getTendanceIcon(bilan.performances?.evolution_activite)}{" "}
                  {Math.abs(bilan.performances?.evolution_activite || 0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Graphique d'évolution mensuelle */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Évolution mensuelle
              </h2>
              <select
                value={anneeGraphique}
                onChange={(e) => setAnneeGraphique(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {[2023, 2024, 2025, 2026].map((annee) => (
                  <option key={annee} value={annee}>{annee}</option>
                ))}
              </select>
            </div>

            {loadingMensuel ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statsMensuelles}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "chiffre_affaires") return formatMontant(value);
                      return value;
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="chiffre_affaires"
                    name="Chiffre d'affaires"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="livraisons"
                    name="Livraisons"
                    stroke="#6366F1"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}

      {ongletActif === "gains" && (
        <div className="space-y-6">
          {loadingGains ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : mesGains ? (
            <>
              {/* Cartes résumé des gains */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">Total gains</p>
                  <p className="text-2xl font-bold">{formatMontant(mesGains.stats?.total_gains)}</p>
                </div>
                <div className="bg-yellow-100 rounded-lg shadow p-4">
                  <p className="text-sm text-yellow-800 mb-1">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatMontant(mesGains.stats?.en_attente)}
                  </p>
                  <p className="text-xs text-yellow-700">{mesGains.stats?.nb_en_attente} gains</p>
                </div>
                <div className="bg-blue-100 rounded-lg shadow p-4">
                  <p className="text-sm text-blue-800 mb-1">Demandes envoyées</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatMontant(mesGains.stats?.demande_envoyee)}
                  </p>
                  <p className="text-xs text-blue-700">{mesGains.stats?.nb_demandes} gains</p>
                </div>
                <div className="bg-green-100 rounded-lg shadow p-4">
                  <p className="text-sm text-green-800 mb-1">Payés</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatMontant(mesGains.stats?.paye)}
                  </p>
                </div>
              </div>

              {/* Actions pour gains en attente */}
              {gainsEnAttente.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {gainsEnAttente.length} gain(s) disponible(s) ({formatMontant(mesGains.stats?.en_attente)})
                    </p>
                    <p className="text-sm text-gray-600">
                      Vous pouvez demander le paiement de vos gains
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      {selectedGains.length === gainsEnAttente.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                    <button
                      onClick={handleDemanderMultiple}
                      disabled={selectedGains.length === 0}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      Demander le paiement ({selectedGains.length})
                    </button>
                  </div>
                </div>
              )}

              {/* Tableau des gains */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Historique des gains</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          {gainsEnAttente.length > 0 && (
                            <input
                              type="checkbox"
                              checked={selectedGains.length === gainsEnAttente.length && gainsEnAttente.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-primary-600"
                            />
                          )}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livraison</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mesGains.gains?.map((gain) => (
                        <tr key={gain.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            {gain.status === 'en_attente' && (
                              <input
                                type="checkbox"
                                checked={selectedGains.includes(gain.id)}
                                onChange={() => handleSelectGain(gain.id)}
                                className="rounded border-gray-300 text-primary-600"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(gain.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            #{gain.livraison_id?.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              gain.wilaya_type === 'depart' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {gain.wilaya_type === 'depart' ? 'Départ' : 'Arrivée'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatMontant(gain.montant_commission)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {gain.pourcentage_applique}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCouleurStatut(gain.status)}`}>
                              {traduireStatut(gain.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {gain.status === 'en_attente' && (
                              <button
                                onClick={() => handleDemanderPaiement(gain.id)}
                                className="text-sm text-primary-600 hover:text-primary-800"
                              >
                                Demander
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal de confirmation pour demande multiple */}
              {showDemandeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-bold mb-4">Confirmer la demande</h3>
                    <p className="mb-4">
                      Vous allez demander le paiement de <span className="font-bold">{selectedGains.length}</span> gain(s) 
                      pour un total de <span className="font-bold text-green-600">{formatMontant(montantSelectionne)}</span>.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      L'admin sera notifié par email. Vous recevrez une confirmation dès que le paiement sera effectué.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowDemandeModal(false)}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={confirmerDemandeMultiple}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Confirmer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comptabilite;