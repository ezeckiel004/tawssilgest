// src/pages/Manager/CashDelivery.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaPaperPlane,
  FaInbox,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaMoneyBillWave,
  FaUserFriends,
  FaExchangeAlt,
  FaSpinner,
  FaEye,
  FaTrash
} from "react-icons/fa";
import {
  getGestionnairesDisponibles,
  envoyerDemandeCOD,
  getDemandesEnvoyeesCOD,
  getDemandesRecuesCOD,
  getStatistiquesCOD,
  accepterDemandeCOD,
  refuserDemandeCOD,
  annulerDemandeCOD,
  formatMontant,
  formatDate,
  traduireStatutCOD,
  getCouleurStatutCOD
} from "../../services/manager";

const CashDelivery = () => {
  const [activeTab, setActiveTab] = useState("envoyer");
  const [gestionnaires, setGestionnaires] = useState([]);
  const [demandesEnvoyees, setDemandesEnvoyees] = useState([]);
  const [demandesRecues, setDemandesRecues] = useState([]);
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingGestionnaires, setLoadingGestionnaires] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Formulaire d'envoi
  const [formData, setFormData] = useState({
    destinataire_id: "",
    montant: "",
    motif: ""
  });

  // Chargement initial
  useEffect(() => {
    fetchGestionnaires();
    fetchDemandesEnvoyees();
    fetchDemandesRecues();
    fetchStatistiques();
  }, []);

  const fetchGestionnaires = async () => {
    setLoadingGestionnaires(true);
    try {
      const response = await getGestionnairesDisponibles();
      setGestionnaires(response.data || []);
    } catch (error) {
      console.error("Erreur chargement gestionnaires:", error);
      toast.error("Erreur lors du chargement des gestionnaires");
    } finally {
      setLoadingGestionnaires(false);
    }
  };

  const fetchDemandesEnvoyees = async () => {
    try {
      const response = await getDemandesEnvoyeesCOD();
      setDemandesEnvoyees(response.data || []);
    } catch (error) {
      console.error("Erreur chargement demandes envoyées:", error);
    }
  };

  const fetchDemandesRecues = async () => {
    try {
      const response = await getDemandesRecuesCOD();
      setDemandesRecues(response.data || []);
    } catch (error) {
      console.error("Erreur chargement demandes reçues:", error);
    }
  };

  const fetchStatistiques = async () => {
    try {
      const response = await getStatistiquesCOD();
      setStatistiques(response.data);
    } catch (error) {
      console.error("Erreur chargement statistiques:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.destinataire_id) {
      toast.error("Veuillez sélectionner un destinataire");
      return;
    }
    
    if (!formData.montant || parseFloat(formData.montant) < 100) {
      toast.error("Le montant minimum est de 100 DA");
      return;
    }
    
    if (parseFloat(formData.montant) > 10000000) {
      toast.error("Le montant maximum est de 10 000 000 DA");
      return;
    }
    
    setSubmitting(true);
    try {
      await envoyerDemandeCOD({
        destinataire_id: formData.destinataire_id,
        montant: parseFloat(formData.montant),
        motif: formData.motif || null
      });
      
      toast.success("Demande envoyée avec succès");
      setFormData({ destinataire_id: "", montant: "", motif: "" });
      fetchDemandesEnvoyees();
      fetchStatistiques();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccepter = async (id) => {
    try {
      await accepterDemandeCOD(id);
      toast.success("Demande acceptée");
      fetchDemandesRecues();
      fetchDemandesEnvoyees();
      fetchStatistiques();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'acceptation");
    }
  };

  const handleRefuser = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir refuser cette demande ?")) return;
    
    try {
      await refuserDemandeCOD(id);
      toast.success("Demande refusée");
      fetchDemandesRecues();
      fetchDemandesEnvoyees();
      fetchStatistiques();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du refus");
    }
  };

  const handleAnnuler = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette demande ?")) return;
    
    try {
      await annulerDemandeCOD(id);
      toast.success("Demande annulée");
      fetchDemandesEnvoyees();
      fetchDemandesRecues();
      fetchStatistiques();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  const openDetailsModal = (demande, type) => {
    setSelectedDemande({ ...demande, type });
    setShowDetailsModal(true);
  };

  // Composant carte statistique
  const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{title}</p>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
  );

  // Composant tableau des demandes
  const DemandesTable = ({ demandes, type, onAccepter, onRefuser, onAnnuler, onViewDetails }) => {
    if (demandes.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <FaInbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucune demande {type === 'envoyees' ? 'envoyée' : 'reçue'}</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {type === 'envoyees' ? 'Destinataire' : 'Expéditeur'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demandes.map((demande) => (
                <tr key={demande.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(demande.created_at, true)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {demande.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {type === 'envoyees' ? (
                      <div>
                        <span className="font-medium">{demande.destinataire?.user?.prenom} {demande.destinataire?.user?.nom}</span>
                        <span className="block text-xs text-gray-500">{demande.destinataire?.wilaya_nom}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium">{demande.expediteur?.user?.prenom} {demande.expediteur?.user?.nom}</span>
                        <span className="block text-xs text-gray-500">{demande.expediteur?.wilaya_nom}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {formatMontant(demande.montant)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCouleurStatutCOD(demande.status)}`}>
                      {traduireStatutCOD(demande.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => onViewDetails(demande, type)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir détails"
                    >
                      <FaEye />
                    </button>
                    
                    {type === 'recues' && demande.status === 'en_attente' && (
                      <>
                        <button
                          onClick={() => onAccepter(demande.id)}
                          className="text-green-600 hover:text-green-800 ml-2"
                          title="Accepter"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          onClick={() => onRefuser(demande.id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                          title="Refuser"
                        >
                          <FaTimesCircle />
                        </button>
                      </>
                    )}
                    
                    {type === 'envoyees' && demande.status === 'en_attente' && (
                      <button
                        onClick={() => onAnnuler(demande.id)}
                        className="text-gray-600 hover:text-gray-800 ml-2"
                        title="Annuler"
                      >
                        <FaBan />
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cash On Delivery (COD)</h1>
        <p className="text-gray-600 mt-1">Transfert d'argent entre gestionnaires</p>
      </div>

      {/* Statistiques */}
      {statistiques && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total envoyé"
            value={formatMontant(statistiques.envoyes?.montant_total || 0)}
            icon={FaPaperPlane}
            color="bg-blue-500"
            subValue={`${statistiques.envoyes?.acceptes || 0} transactions acceptées`}
          />
          <StatCard
            title="Total reçu"
            value={formatMontant(statistiques.recus?.montant_total || 0)}
            icon={FaInbox}
            color="bg-green-500"
            subValue={`${statistiques.recus?.acceptes || 0} transactions reçues`}
          />
          <StatCard
            title="Demandes en attente"
            value={(statistiques.envoyes?.en_attente || 0) + (statistiques.recus?.en_attente || 0)}
            icon={FaExchangeAlt}
            color="bg-yellow-500"
            subValue={`Envoyées: ${statistiques.envoyes?.en_attente || 0} | Reçues: ${statistiques.recus?.en_attente || 0}`}
          />
          <StatCard
            title="Gestionnaires disponibles"
            value={gestionnaires.length}
            icon={FaUserFriends}
            color="bg-purple-500"
          />
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("envoyer")}
          className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
            activeTab === "envoyer"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaPaperPlane className="w-4 h-4" />
          Envoyer
        </button>
        <button
          onClick={() => setActiveTab("envoyees")}
          className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
            activeTab === "envoyees"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaPaperPlane className="w-4 h-4" />
          Demandes envoyées
        </button>
        <button
          onClick={() => setActiveTab("recues")}
          className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
            activeTab === "recues"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaInbox className="w-4 h-4" />
          Demandes reçues
        </button>
      </div>

      {/* Formulaire d'envoi */}
      {activeTab === "envoyer" && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouveau transfert</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinataire *
              </label>
              <select
                name="destinataire_id"
                value={formData.destinataire_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                disabled={loadingGestionnaires}
              >
                <option value="">Sélectionner un gestionnaire</option>
                {gestionnaires.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.nom} - {g.wilaya_nom} ({g.wilaya_id})
                  </option>
                ))}
              </select>
              {loadingGestionnaires && (
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <FaSpinner className="animate-spin" />
                  Chargement des gestionnaires...
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (DA) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">DA</span>
                <input
                  type="number"
                  name="montant"
                  value={formData.montant}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="100"
                  max="10000000"
                  step="1000"
                  required
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum: 100 DA | Maximum: 10 000 000 DA</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif (optionnel)
              </label>
              <textarea
                name="motif"
                value={formData.motif}
                onChange={handleInputChange}
                rows="3"
                placeholder="Raison du transfert..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Envoyer la demande
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Demandes envoyées */}
      {activeTab === "envoyees" && (
        <DemandesTable
          demandes={demandesEnvoyees}
          type="envoyees"
          onAccepter={handleAccepter}
          onRefuser={handleRefuser}
          onAnnuler={handleAnnuler}
          onViewDetails={openDetailsModal}
        />
      )}

      {/* Demandes reçues */}
      {activeTab === "recues" && (
        <DemandesTable
          demandes={demandesRecues}
          type="recues"
          onAccepter={handleAccepter}
          onRefuser={handleRefuser}
          onAnnuler={handleAnnuler}
          onViewDetails={openDetailsModal}
        />
      )}

      {/* Modal détails */}
      {showDetailsModal && selectedDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Détails de la demande</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Référence:</span>
                <span className="font-mono font-medium">{selectedDemande.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{formatDate(selectedDemande.created_at, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {selectedDemande.type === 'envoyees' ? 'Destinataire:' : 'Expéditeur:'}
                </span>
                <span className="font-medium">
                  {selectedDemande.type === 'envoyees' 
                    ? `${selectedDemande.destinataire?.user?.prenom} ${selectedDemande.destinataire?.user?.nom}`
                    : `${selectedDemande.expediteur?.user?.prenom} ${selectedDemande.expediteur?.user?.nom}`
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wilaya:</span>
                <span>
                  {selectedDemande.type === 'envoyees' 
                    ? selectedDemande.destinataire?.wilaya_nom
                    : selectedDemande.expediteur?.wilaya_nom
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant:</span>
                <span className="text-green-600 font-bold">{formatMontant(selectedDemande.montant)}</span>
              </div>
              {selectedDemande.motif && (
                <div>
                  <span className="text-gray-600">Motif:</span>
                  <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{selectedDemande.motif}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Statut:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCouleurStatutCOD(selectedDemande.status)}`}>
                  {traduireStatutCOD(selectedDemande.status)}
                </span>
              </div>
              {selectedDemande.date_reponse && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date de réponse:</span>
                  <span>{formatDate(selectedDemande.date_reponse, true)}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashDelivery;