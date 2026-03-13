import React, { useEffect, useState } from "react";
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { getDashboardStats } from "../../services/manager";
import StatCard from "../../components/Common/StatCard";
import DeliveryChart from "../../components/Charts/DeliveryChart";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setStats(response.data.data);
    } catch (err) {
      setError("Erreur lors du chargement des statistiques");
      toast.error("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!stats) return null;

  const statCards = [
    {
      title: "Total Livraisons",
      value: stats.stats.total_livraisons,
      icon: TruckIcon,
      color: "bg-blue-500",
    },
    {
      title: "En attente",
      value: stats.stats.livraisons_en_attente,
      icon: ClockIcon,
      color: "bg-yellow-500",
    },
    {
      title: "En cours",
      value: stats.stats.livraisons_en_cours,
      icon: TruckIcon,
      color: "bg-orange-500",
    },
    {
      title: "Terminées",
      value: stats.stats.livraisons_terminees,
      icon: CheckCircleIcon,
      color: "bg-green-500",
    },
    {
      title: "Annulées",
      value: stats.stats.livraisons_annulees,
      icon: XCircleIcon,
      color: "bg-red-500",
    },
    {
      title: "Livreurs",
      value: stats.stats.total_livreurs,
      icon: UserGroupIcon,
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Tableau de bord - Wilaya {stats.wilaya_nom}
      </h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Évolution des livraisons */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Évolution des livraisons (7 derniers jours)
        </h2>
        <div className="bg-white rounded-lg shadow p-6">
          <DeliveryChart data={stats.evolution} />
        </div>
      </div>

      {/* Demandes d'adhésion */}
      {stats.stats.demandes_adhesion_attente > 0 && (
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ClockIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {stats.stats.demandes_adhesion_attente} demande(s) d'adhésion en
                attente
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
