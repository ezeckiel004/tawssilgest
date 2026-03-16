// src/pages/Manager/Comptabilite.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaBoxes,
  FaTruck,
  FaDownload,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaShoppingBag,
  FaRoad,
  FaFileExport,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getBilanComptable,
  exportBilan,
  getStatistiquesMensuelles,
  formatMontant,
  formatNombre,
  getTendanceColor,
  getTendanceIcon,
} from "../../services/manager";

const COLORS = {
  en_attente: "#9CA3AF",
  prise_en_charge_ramassage: "#3B82F6",
  ramasse: "#6366F1",
  en_transit: "#F59E0B",
  prise_en_charge_livraison: "#F97316",
  livre: "#10B981",
  annule: "#EF4444",
};

const Comptabilite = () => {
  const [stats, setStats] = useState(null);
  const [statsMensuelles, setStatsMensuelles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMensuel, setLoadingMensuel] = useState(false);
  const [period, setPeriod] = useState("mois");
  const [anneeGraphique, setAnneeGraphique] = useState(new Date().getFullYear());
  const [customDate, setCustomDate] = useState({
    debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    fin: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, [period, customDate]);

  useEffect(() => {
    fetchStatistiquesMensuelles();
  }, [anneeGraphique]);

  const fetchData = async () => {
    try {
      setLoading(true);

      let params = { periode: period };

      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      }

      const response = await getBilanComptable(params);
      setStats(response.data.data);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistiquesMensuelles = async () => {
    try {
      setLoadingMensuel(true);
      const response = await getStatistiquesMensuelles(anneeGraphique);
      setStatsMensuelles(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement stats mensuelles:", error);
    } finally {
      setLoadingMensuel(false);
    }
  };

  const handleExport = async (format = "excel") => {
    try {
      let params = {
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

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    evolution,
    subValue,
    suffix = "",
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {evolution !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm ${getTendanceColor(
              evolution
            )}`}
          >
            <span>{getTendanceIcon(evolution)}</span>
            <span>{Math.abs(evolution)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {suffix}
      </p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bilan financier
          </h1>
          <p className="text-gray-600">
            {stats?.periode?.libelle || "Sélectionnez une période"}
          </p>
          {stats?.gestionnaire && (
            <p className="text-sm font-medium text-primary-600 mt-1">
              Wilaya : {stats.gestionnaire.wilaya_nom} (
              {stats.gestionnaire.wilaya_id})
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {/* Filtres de période */}
          <button
            onClick={() => setPeriod("jour")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === "jour"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Jour
          </button>
          <button
            onClick={() => setPeriod("semaine")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === "semaine"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setPeriod("mois")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === "mois"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setPeriod("annee")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === "annee"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Année
          </button>
          <button
            onClick={() => setPeriod("personnalise")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === "personnalise"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Perso
          </button>

          {/* Boutons d'export */}
          <button
            onClick={() => handleExport("excel")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            title="Exporter en Excel"
          >
            <FaFileExport />
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            title="Exporter en PDF"
          >
            <FaDownload />
          </button>
        </div>
      </div>

      {/* Période personnalisée */}
      {period === "personnalise" && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date début
              </label>
              <input
                type="date"
                value={customDate.debut}
                onChange={(e) =>
                  setCustomDate({ ...customDate, debut: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date fin
              </label>
              <input
                type="date"
                value={customDate.fin}
                onChange={(e) =>
                  setCustomDate({ ...customDate, fin: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={fetchData}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}

      {stats && (
        <>
          {/* Cartes principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Chiffre d'affaires total"
              value={formatMontant(stats.finances?.chiffre_affaires_total)}
              icon={FaMoneyBillWave}
              color="bg-green-500"
            />
            <StatCard
              title="Valeur des colis"
              value={formatMontant(stats.finances?.valeur_colis)}
              icon={FaShoppingBag}
              color="bg-blue-500"
            />
            <StatCard
              title="Revenus livraisons"
              value={formatMontant(stats.finances?.revenus_livraisons)}
              icon={FaTruck}
              color="bg-purple-500"
            />
            <StatCard
              title="Revenus navettes"
              value={formatMontant(stats.finances?.revenus_navettes)}
              icon={FaRoad}
              color="bg-orange-500"
            />
          </div>

          {/* Indicateurs de performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaCheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taux de succès</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.livraisons?.taux_succès || 0}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Livraisons réussies</span>
                <span className="font-medium text-green-600">
                  {formatNombre(stats.livraisons?.terminées)}
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
                    {stats.livraisons?.duree_moyenne_livraison || 0}h
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Livraisons en cours</span>
                <span className="font-medium text-yellow-600">
                  {formatNombre(stats.livraisons?.en_cours)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaSpinner className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Activité</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.performances?.livraisons_par_jour || 0}/jour
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Évolution</span>
                <span
                  className={`font-medium ${getTendanceColor(
                    stats.performances?.evolution_activite
                  )}`}
                >
                  {getTendanceIcon(stats.performances?.evolution_activite)}{" "}
                  {Math.abs(stats.performances?.evolution_activite || 0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Détail des colis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaBoxes className="text-primary-600" />
                Statistiques des colis
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Nombre total de colis</span>
                  <span className="font-semibold text-lg">
                    {formatNombre(stats.colis?.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    Valeur moyenne par colis
                  </span>
                  <span className="font-semibold text-lg">
                    {formatMontant(stats.colis?.valeur_moyenne)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Poids total</span>
                  <span className="font-semibold text-lg">
                    {stats.colis?.poids_total || 0} kg
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Colis avec prix</span>
                  <span className="font-semibold text-lg">
                    {formatNombre(stats.colis?.avec_prix)}
                  </span>
                </div>
              </div>
            </div>

            {/* Détail des livraisons */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaTruck className="text-primary-600" />
                Statistiques des livraisons
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    Nombre total de livraisons
                  </span>
                  <span className="font-semibold text-lg">
                    {formatNombre(stats.livraisons?.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Livraisons terminées</span>
                  <span className="font-semibold text-green-600">
                    {formatNombre(stats.livraisons?.terminees)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Livraisons en cours</span>
                  <span className="font-semibold text-yellow-600">
                    {formatNombre(stats.livraisons?.en_cours)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Prix moyen de livraison</span>
                  <span className="font-semibold text-lg">
                    {formatMontant(stats.livraisons?.prix_moyen)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Répartition des statuts et des revenus */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Répartition des statuts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Répartition des livraisons par statut
              </h2>
              <div className="space-y-3">
                {stats.statuts_livraisons &&
                  Object.entries(stats.statuts_livraisons).map(
                    ([statut, data]) => {
                      const total = stats.livraisons?.total || 1;
                      const pourcentage = ((data.count / total) * 100).toFixed(
                        1
                      );
                      return (
                        <div key={statut}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">
                              {statut.replace(/_/g, " ")}
                            </span>
                            <span className="font-medium">
                              {formatNombre(data.count)} ({pourcentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${pourcentage}%`,
                                backgroundColor: COLORS[statut] || "#9CA3AF",
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    }
                  )}
              </div>
            </div>

            {/* Répartition des revenus */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Répartition des revenus
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Colis</span>
                    <span className="font-semibold">
                      {formatMontant(stats.finances?.repartition?.colis?.montant)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${stats.finances?.repartition?.colis?.pourcentage || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Livraisons</span>
                    <span className="font-semibold">
                      {formatMontant(
                        stats.finances?.repartition?.livraisons?.montant
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${stats.finances?.repartition?.livraisons?.pourcentage || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Navettes</span>
                    <span className="font-semibold">
                      {formatMontant(
                        stats.finances?.repartition?.navettes?.montant
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${stats.finances?.repartition?.navettes?.pourcentage || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatMontant(stats.finances?.chiffre_affaires_total)}
                    </span>
                  </div>
                </div>
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                {[2023, 2024, 2025].map((annee) => (
                  <option key={annee} value={annee}>
                    {annee}
                  </option>
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
                    formatter={(value) => formatMontant(value)}
                    labelFormatter={(label) => `Mois: ${label}`}
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
    </div>
  );
};

export default Comptabilite;