// src/pages/Manager/Comptabilite.jsx
import React, { useState, useEffect, useCallback } from "react";
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
  FaShip,
  FaCalendarAlt,
  FaEye,
  FaBan,
  FaCheck,
  FaTimes,
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
  formatDate,
  getMesGainsNavette,
  demanderPaiementNavette,
  demanderPaiementMultipleNavette,
  demanderPaiementGain,
  demanderPaiementMultiple
} from "../../services/manager";

const Comptabilite = () => {
  const [bilan, setBilan] = useState(null);
  const [mesGains, setMesGains] = useState(null);
  const [mesGainsNavette, setMesGainsNavette] = useState(null);
  const [statsMensuelles, setStatsMensuelles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGains, setLoadingGains] = useState(false);
  const [loadingGainsNavette, setLoadingGainsNavette] = useState(false);
  const [loadingMensuel, setLoadingMensuel] = useState(false);
  const [period, setPeriod] = useState("mois");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [anneeGraphique, setAnneeGraphique] = useState(new Date().getFullYear());
  const [ongletActif, setOngletActif] = useState("bilan");
  const [selectedGains, setSelectedGains] = useState([]);
  const [selectedGainsNavette, setSelectedGainsNavette] = useState([]);
  const [showDemandeModal, setShowDemandeModal] = useState(false);
  const [showDemandeModalNavette, setShowDemandeModalNavette] = useState(false);
  const [selectedGainDetail, setSelectedGainDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [customDate, setCustomDate] = useState({
    debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    fin: new Date().toISOString().split("T")[0],
  });

  // Générer les options des mois
  const getMonthOptions = () => {
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return months.map((month, index) => ({ value: index + 1, label: month }));
  };

  // Générer les options des années
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
      years.push({ value: year, label: year.toString() });
    }
    return years;
  };

  // Formater une date pour l'API
  const formatDateForApi = (year, month) => {
    const monthStr = month.toString().padStart(2, '0');
    return `${year}-${monthStr}-01`;
  };

  // ==================== FETCH BILAN ====================
  const fetchBilan = useCallback(async () => {
    try {
      setLoading(true);
      let params = { periode: period };
      
      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      } else if (period === "mois") {
        params.date = formatDateForApi(selectedYear, selectedMonth);
      } else if (period === "annee") {
        params.date = `${selectedYear}-01-01`;
      }
      
      const response = await getBilanComptable(params);
      setBilan(response.data);
    } catch (error) {
      console.error("❌ Erreur chargement bilan:", error);
      toast.error("Erreur lors du chargement du bilan");
    } finally {
      setLoading(false);
    }
  }, [period, customDate, selectedMonth, selectedYear]);

  // ==================== FETCH GAINS LIVRAISONS ====================
  const fetchMesGains = useCallback(async () => {
    try {
      setLoadingGains(true);
      let params = { periode: period };
      
      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      } else if (period === "mois") {
        params.date = formatDateForApi(selectedYear, selectedMonth);
      } else if (period === "annee") {
        params.date = `${selectedYear}-01-01`;
      }
      
      const response = await getMesGains(params);
      
      if (response.data?.data) {
        setMesGains(response.data.data);
      } else if (response.data?.gains) {
        setMesGains(response.data);
      } else {
        setMesGains({ gains: [], stats: {} });
      }
    } catch (error) {
      console.error("❌ Erreur chargement gains:", error);
      toast.error("Erreur lors du chargement des gains");
    } finally {
      setLoadingGains(false);
    }
  }, [period, customDate, selectedMonth, selectedYear]);

  // ==================== FETCH GAINS NAVETTES ====================
  const fetchMesGainsNavette = useCallback(async () => {
    try {
      setLoadingGainsNavette(true);
      let params = { periode: period };
      
      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      } else if (period === "mois") {
        params.date = formatDateForApi(selectedYear, selectedMonth);
      } else if (period === "annee") {
        params.date = `${selectedYear}-01-01`;
      }
      
      const response = await getMesGainsNavette(params);
      
      if (response.data?.data) {
        setMesGainsNavette(response.data.data);
      } else if (response.data?.gains) {
        setMesGainsNavette(response.data);
      } else {
        setMesGainsNavette({ gains: [], stats: {} });
      }
    } catch (error) {
      console.error("❌ Erreur chargement gains navette:", error);
      toast.error("Erreur lors du chargement des gains navette");
    } finally {
      setLoadingGainsNavette(false);
    }
  }, [period, customDate, selectedMonth, selectedYear]);

  // ==================== FETCH STATS MENSUELLES ====================
  const fetchStatistiquesMensuelles = useCallback(async () => {
    try {
      setLoadingMensuel(true);
      const response = await getStatistiquesMensuelles(anneeGraphique);
      setStatsMensuelles(response.data || []);
    } catch (error) {
      console.error("❌ Erreur chargement stats mensuelles:", error);
    } finally {
      setLoadingMensuel(false);
    }
  }, [anneeGraphique]);

  // ==================== USE EFFECTS ====================
  useEffect(() => {
    fetchBilan();
  }, [fetchBilan]);

  useEffect(() => {
    if (ongletActif === "gains") {
      fetchMesGains();
    }
    if (ongletActif === "gainsNavette") {
      fetchMesGainsNavette();
    }
  }, [ongletActif, fetchMesGains, fetchMesGainsNavette]);

  useEffect(() => {
    fetchStatistiquesMensuelles();
  }, [fetchStatistiquesMensuelles]);

  // ==================== HANDLE EXPORT ====================
  const handleExport = async (format = "excel") => {
    try {
      const params = {
        periode: period,
        format,
      };
      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      } else if (period === "mois") {
        params.date = formatDateForApi(selectedYear, selectedMonth);
      } else if (period === "annee") {
        params.date = `${selectedYear}-01-01`;
      }
      await exportBilan(params);
      toast.success("Bilan exporté avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  // ==================== GESTION DES GAINS LIVRAISONS ====================
  const handleSelectGain = (gainId) => {
    if (selectedGains.includes(gainId)) {
      setSelectedGains(selectedGains.filter(id => id !== gainId));
    } else {
      setSelectedGains([...selectedGains, gainId]);
    }
  };

  const handleSelectAllGains = () => {
    const gainsEnAttente = mesGains?.gains?.filter(g => g.status === 'en_attente') || [];
    if (selectedGains.length === gainsEnAttente.length && gainsEnAttente.length > 0) {
      setSelectedGains([]);
    } else {
      setSelectedGains(gainsEnAttente.map(g => g.id));
    }
  };

  const handleDemanderPaiementGain = async (gainId) => {
    try {
      const response = await demanderPaiementGain(gainId);
      toast.success(response.message || "Demande envoyée avec succès");
      fetchMesGains();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la demande");
    }
  };

  const handleDemanderMultipleGains = async () => {
    if (selectedGains.length === 0) {
      toast.error("Veuillez sélectionner au moins un gain");
      return;
    }
    setShowDemandeModal(true);
  };

  const confirmerDemandeMultipleGains = async () => {
    try {
      const response = await demanderPaiementMultiple(selectedGains);
      toast.success(response.message || `${selectedGains.length} demande(s) envoyée(s)`);
      setSelectedGains([]);
      setShowDemandeModal(false);
      fetchMesGains();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la demande");
    }
  };

  // ==================== GESTION DES GAINS NAVETTES ====================
  const handleSelectGainNavette = (gainId) => {
    if (selectedGainsNavette.includes(gainId)) {
      setSelectedGainsNavette(selectedGainsNavette.filter(id => id !== gainId));
    } else {
      setSelectedGainsNavette([...selectedGainsNavette, gainId]);
    }
  };

  const handleSelectAllGainsNavette = () => {
    const gainsEnAttente = mesGainsNavette?.gains?.filter(g => g.status === 'en_attente') || [];
    if (selectedGainsNavette.length === gainsEnAttente.length && gainsEnAttente.length > 0) {
      setSelectedGainsNavette([]);
    } else {
      setSelectedGainsNavette(gainsEnAttente.map(g => g.id));
    }
  };

  const handleDemanderPaiementGainNavette = async (gainId) => {
    try {
      const response = await demanderPaiementNavette(gainId);
      toast.success(response.message || "Demande envoyée avec succès");
      fetchMesGainsNavette();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la demande");
    }
  };

  const handleDemanderMultipleGainsNavette = async () => {
    if (selectedGainsNavette.length === 0) {
      toast.error("Veuillez sélectionner au moins un gain");
      return;
    }
    setShowDemandeModalNavette(true);
  };

  const confirmerDemandeMultipleGainsNavette = async () => {
    try {
      const response = await demanderPaiementMultipleNavette(selectedGainsNavette);
      toast.success(response.message || `${selectedGainsNavette.length} demande(s) envoyée(s)`);
      setSelectedGainsNavette([]);
      setShowDemandeModalNavette(false);
      fetchMesGainsNavette();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la demande");
    }
  };

  const openDetailModal = (gain) => {
    setSelectedGainDetail(gain);
    setShowDetailModal(true);
  };

  // ==================== COMPOSANT TABLEAU PRINCIPAL ====================
  const GainsTableRenderer = ({ gains, loading, selected, onSelect, onSelectAll, onDemander, onViewDetails, type }) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (!gains || gains.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Aucun gain {type === 'navette' ? 'de navette' : ''} trouvé pour cette période
        </div>
      );
    }

    // Filtrer pour n'afficher que les gains en attente et demandes envoyées
    const gainsActifs = gains.filter(g => g.status === 'en_attente' || g.status === 'demande_envoyee');
    const gainsEnAttente = gains.filter(g => g.status === 'en_attente');

    if (gainsActifs.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <FaCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
          <p>Tous vos gains {type === 'navette' ? 'de navette' : ''} ont été traités</p>
          <p className="text-sm mt-2">Aucun gain en attente ou en demande pour cette période</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {gainsEnAttente.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selected.length === gainsEnAttente.length && gainsEnAttente.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-primary-600"
                />
                Tout sélectionner ({gainsEnAttente.length})
              </label>
              <span className="text-sm text-gray-500">
                Total: {formatMontant(gainsEnAttente.reduce((sum, g) => sum + (g.montant_commission || 0), 0))}
              </span>
            </div>
            <button
              onClick={() => onDemander()}
              disabled={selected.length === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
            >
              Demander le paiement ({selected.length})
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {gainsEnAttente.length > 0 && (
                  <th className="px-6 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selected.length === gainsEnAttente.length && gainsEnAttente.length > 0}
                      onChange={onSelectAll}
                      className="rounded border-gray-300 text-primary-600"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {type === 'navette' ? 'Navette' : 'Livraison'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type wilaya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gainsActifs.map((gain) => (
                <tr key={gain.id} className="hover:bg-gray-50">
                  {gainsEnAttente.length > 0 && gain.status === 'en_attente' && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(gain.id)}
                        onChange={() => onSelect(gain.id)}
                        className="rounded border-gray-300 text-primary-600"
                      />
                    </td>
                  )}
                  {gainsEnAttente.length > 0 && gain.status !== 'en_attente' && (
                    <td className="px-6 py-4"></td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(gain.created_at, true)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {type === 'navette' 
                      ? (gain.navette_reference || `#${gain.navette_id?.substring(0, 8)}`)
                      : (gain.livraison_reference || `#${gain.livraison_id?.substring(0, 8)}`)
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      gain.wilaya_type === 'depart' 
                        ? 'bg-blue-100 text-blue-800' 
                        : gain.wilaya_type === 'arrivee'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {gain.wilaya_type === 'depart' ? 'Wilaya départ' : gain.wilaya_type === 'arrivee' ? 'Wilaya arrivée' : 'Standard'}
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
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => onViewDetails(gain)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir détails"
                    >
                      <FaEye />
                    </button>
                    {gain.status === 'en_attente' && (
                      <button
                        onClick={() => onDemander(gain.id)}
                        className="text-primary-600 hover:text-primary-800"
                        title="Demander paiement"
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
    );
  };

  // ==================== COMPOSANT HISTORIQUE ====================
  const HistoriqueTable = ({ gains, type }) => {
    const gainsHistorique = gains?.filter(g => g.status === 'paye' || g.status === 'annule') || [];

    if (gainsHistorique.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          <FaClock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun gain {type === 'navette' ? 'de navette' : ''} dans l'historique</p>
          <p className="text-sm mt-1">Les gains payés ou annulés apparaîtront ici</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">Historique des gains {type === 'navette' ? 'de navette' : ''}</h3>
          <p className="text-sm text-gray-500">Gains déjà payés ou annulés</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type wilaya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date traitement</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gainsHistorique.map((gain) => (
                <tr key={gain.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(gain.created_at, true)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {type === 'navette' 
                      ? (gain.navette_reference || `#${gain.navette_id?.substring(0, 8)}`)
                      : (gain.livraison_reference || `#${gain.livraison_id?.substring(0, 8)}`)
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      gain.wilaya_type === 'depart' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {gain.wilaya_type === 'depart' ? 'Wilaya départ' : 'Wilaya arrivée'}
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
                      {gain.status === 'paye' ? (
                        <span className="flex items-center gap-1"><FaCheck className="w-3 h-3" /> Payé</span>
                      ) : (
                        <span className="flex items-center gap-1"><FaTimes className="w-3 h-3" /> Annulé</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {gain.updated_at ? formatDate(gain.updated_at, true) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
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

  const montantSelectionne = mesGains?.gains
    ?.filter(g => selectedGains.includes(g.id))
    .reduce((sum, g) => sum + (g.montant_commission || 0), 0) || 0;
  const montantSelectionneNavette = mesGainsNavette?.gains
    ?.filter(g => selectedGainsNavette.includes(g.id))
    .reduce((sum, g) => sum + (g.montant_commission || 0), 0) || 0;

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
          Gains livraisons
        </button>
        <button
          onClick={() => setOngletActif("gainsNavette")}
          className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
            ongletActif === "gainsNavette"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaShip className="w-4 h-4" />
          Gains navettes
        </button>
      </div>

      {/* Filtres période */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {["mois", "annee", "personnalise"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  period === p
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p === "mois" && "Mois"}
                {p === "annee" && "Année"}
                {p === "personnalise" && "Personnalisé"}
              </button>
            ))}
          </div>

          {period === "mois" && (
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  {getMonthOptions().map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  {getYearOptions().map(year => (
                    <option key={year.value} value={year.value}>{year.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {period === "annee" && (
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  {getYearOptions().map(year => (
                    <option key={year.value} value={year.value}>{year.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

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

      {/* Bilan financier */}
      {ongletActif === "bilan" && bilan && (
        <>
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
                <span className={`font-medium ${getTendanceColor(bilan.performances?.evolution_activite)}`}>
                  {getTendanceIcon(bilan.performances?.evolution_activite)} {Math.abs(bilan.performances?.evolution_activite || 0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Évolution mensuelle</h2>
              <select
                value={anneeGraphique}
                onChange={(e) => setAnneeGraphique(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {getYearOptions().map((annee) => (
                  <option key={annee.value} value={annee.value}>{annee.label}</option>
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
                  <Tooltip formatter={(value, name) => {
                    if (name === "chiffre_affaires") return formatMontant(value);
                    return value;
                  }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="chiffre_affaires" name="Chiffre d'affaires" stroke="#10B981" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="livraisons" name="Livraisons" stroke="#6366F1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}

      {/* Gains livraisons */}
      {ongletActif === "gains" && (
        <div className="space-y-6">
          {loadingGains ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : mesGains ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">Total gains</p>
                  <p className="text-2xl font-bold">{formatMontant(mesGains.stats?.total_gains)}</p>
                </div>
                <div className="bg-yellow-100 rounded-lg shadow p-4">
                  <p className="text-sm text-yellow-800 mb-1">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatMontant(mesGains.stats?.en_attente)}</p>
                  <p className="text-xs text-yellow-700">{mesGains.stats?.nb_en_attente} gains</p>
                </div>
                <div className="bg-blue-100 rounded-lg shadow p-4">
                  <p className="text-sm text-blue-800 mb-1">Demandes envoyées</p>
                  <p className="text-2xl font-bold text-blue-600">{formatMontant(mesGains.stats?.demande_envoyee)}</p>
                  <p className="text-xs text-blue-700">{mesGains.stats?.nb_demandes} gains</p>
                </div>
                <div className="bg-green-100 rounded-lg shadow p-4">
                  <p className="text-sm text-green-800 mb-1">Payés</p>
                  <p className="text-2xl font-bold text-green-600">{formatMontant(mesGains.stats?.paye)}</p>
                </div>
              </div>

              <GainsTableRenderer
                gains={mesGains.gains || []}
                loading={loadingGains}
                selected={selectedGains}
                onSelect={handleSelectGain}
                onSelectAll={handleSelectAllGains}
                onDemander={handleDemanderMultipleGains}
                onViewDetails={openDetailModal}
                type="livraison"
              />

              <HistoriqueTable gains={mesGains.gains} type="livraison" />
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
      )}

      {/* Gains navettes */}
      {ongletActif === "gainsNavette" && (
        <div className="space-y-6">
          {loadingGainsNavette ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : mesGainsNavette ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">Total gains navettes</p>
                  <p className="text-2xl font-bold">{formatMontant(mesGainsNavette.stats?.total_gains)}</p>
                </div>
                <div className="bg-yellow-100 rounded-lg shadow p-4">
                  <p className="text-sm text-yellow-800 mb-1">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatMontant(mesGainsNavette.stats?.en_attente)}</p>
                  <p className="text-xs text-yellow-700">{mesGainsNavette.stats?.nb_en_attente} gains</p>
                </div>
                <div className="bg-blue-100 rounded-lg shadow p-4">
                  <p className="text-sm text-blue-800 mb-1">Demandes envoyées</p>
                  <p className="text-2xl font-bold text-blue-600">{formatMontant(mesGainsNavette.stats?.demande_envoyee)}</p>
                  <p className="text-xs text-blue-700">{mesGainsNavette.stats?.nb_demandes} gains</p>
                </div>
                <div className="bg-green-100 rounded-lg shadow p-4">
                  <p className="text-sm text-green-800 mb-1">Payés</p>
                  <p className="text-2xl font-bold text-green-600">{formatMontant(mesGainsNavette.stats?.paye)}</p>
                </div>
              </div>

              <GainsTableRenderer
                gains={mesGainsNavette.gains || []}
                loading={loadingGainsNavette}
                selected={selectedGainsNavette}
                onSelect={handleSelectGainNavette}
                onSelectAll={handleSelectAllGainsNavette}
                onDemander={handleDemanderMultipleGainsNavette}
                onViewDetails={openDetailModal}
                type="navette"
              />

              <HistoriqueTable gains={mesGainsNavette.gains} type="navette" />
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Aucun gain de navette trouvé
            </div>
          )}
        </div>
      )}

      {/* Modal détails gain */}
      {showDetailModal && selectedGainDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Détails du gain</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Date :</span>
                <span>{formatDate(selectedGainDetail.created_at, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant :</span>
                <span className="text-green-600 font-bold">{formatMontant(selectedGainDetail.montant_commission)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pourcentage :</span>
                <span>{selectedGainDetail.pourcentage_applique}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type wilaya :</span>
                <span>{selectedGainDetail.wilaya_type === 'depart' ? 'Wilaya départ' : 'Wilaya arrivée'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut :</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCouleurStatut(selectedGainDetail.status)}`}>
                  {traduireStatut(selectedGainDetail.status)}
                </span>
              </div>
              {selectedGainDetail.date_demande && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date demande :</span>
                  <span>{formatDate(selectedGainDetail.date_demande, true)}</span>
                </div>
              )}
              {selectedGainDetail.date_paiement && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date paiement :</span>
                  <span>{formatDate(selectedGainDetail.date_paiement, true)}</span>
                </div>
              )}
              {selectedGainDetail.note_admin && (
                <div>
                  <span className="text-gray-600">Note admin :</span>
                  <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{selectedGainDetail.note_admin}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale confirmation gains livraisons */}
      {showDemandeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmer la demande</h3>
            <p className="mb-4">Vous allez demander le paiement de <span className="font-bold">{selectedGains.length}</span> gain(s) pour un total de <span className="font-bold text-green-600">{formatMontant(montantSelectionne)}</span>.</p>
            <p className="text-sm text-gray-500 mb-6">L'admin sera notifié par email. Vous recevrez une confirmation dès que le paiement sera effectué.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDemandeModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Annuler</button>
              <button onClick={confirmerDemandeMultipleGains} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale confirmation gains navettes */}
      {showDemandeModalNavette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmer la demande</h3>
            <p className="mb-4">Vous allez demander le paiement de <span className="font-bold">{selectedGainsNavette.length}</span> gain(s) de navette pour un total de <span className="font-bold text-green-600">{formatMontant(montantSelectionneNavette)}</span>.</p>
            <p className="text-sm text-gray-500 mb-6">L'admin sera notifié par email. Vous recevrez une confirmation dès que le paiement sera effectué.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDemandeModalNavette(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Annuler</button>
              <button onClick={confirmerDemandeMultipleGainsNavette} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comptabilite;