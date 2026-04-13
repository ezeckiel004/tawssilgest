// src/pages/Livraisons/LivraisonDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import {
  getLivraisonById,
  updateLivraisonStatus,
} from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import UpdateStatusModal from "./UpdateStatusModal";
import AssignLivreurModal from "../../components/Livraisons/AssignLivreurModal";
import {
  formatDate,
  getStatusLabel,
  getStatusBadgeClass,
} from "../../utils/formatters";
import { STATUSES } from "../../utils/constants";
import toast from "react-hot-toast";

const LivraisonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [livraison, setLivraison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignType, setAssignType] = useState(null);

  useEffect(() => {
    fetchLivraison();
  }, [id]);

  const fetchLivraison = async () => {
    try {
      setLoading(true);
      const response = await getLivraisonById(id);
      setLivraison(response.data.data);
    } catch (err) {
      setError("Livraison non trouvée");
      toast.error("Impossible de charger les détails");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await updateLivraisonStatus(id, newStatus);
      setLivraison(response.data.data);
      setIsStatusModalOpen(false);
      toast.success("Statut mis à jour avec succès");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleAssignSuccess = (updatedLivraison) => {
    fetchLivraison();
  };

  const openAssignModal = (type) => {
    setAssignType(type);
    setIsAssignModalOpen(true);
  };

  // Verifier si le gestionnaire peut assigner un livreur selon le statut
  const canAssignLivreur = (status, type) => {
    if (type === "distributeur") {
      return status === "en_transit";
    } else if (type === "ramasseur") {
      return !["ramasse", "livre", "annule"].includes(status);
    }
    return false;
  };

  // Verifier si au moins un type est disponible
  const hasAssignableType = (status) => {
    return canAssignLivreur(status, "ramasseur") || canAssignLivreur(status, "distributeur");
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!livraison) return null;

  const demande = livraison.demande_livraison;
  const colis = demande?.colis;
  const client = livraison.client;
  const destinataire = livraison.destinataire;
  const livreurRamasseur = livraison.livreur_ramasseur;
  const livreurDistributeur = livraison.livreur_distributeur;

  return (
    <div>
      <button
        onClick={() => navigate("/livraisons")}
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Retour aux livraisons
      </button>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* En-tete */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Livraison #{livraison.code_pin}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Créee le {formatDate(livraison.created_at)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={getStatusBadgeClass(livraison.status)}>
              {getStatusLabel(livraison.status)}
            </span>
            
            {/* Bouton Changer statut */}
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Changer statut
            </button>

            {/* NOUVEAU BOUTON : Attribuer un livreur */}
            {hasAssignableType(livraison.status) && (
              <button
                onClick={() => openAssignModal(null)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Attribuer un livreur
              </button>
            )}
          </div>
        </div>

        {/* Section Attribution livreurs - Version Manager */}
        {hasAssignableType(livraison.status) && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <UserPlusIcon className="h-5 w-5 text-indigo-600" />
              Attribution des livreurs
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Livreur ramasseur */}
              <div className="p-4 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">Livreur Ramasseur</p>
                    <p className="text-sm text-gray-600">
                      {livreurRamasseur
                        ? `${livreurRamasseur.prenom || ''} ${livreurRamasseur.nom || ''}`.trim()
                        : "Non attribué"}
                    </p>
                    {livreurRamasseur?.telephone && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <PhoneIcon className="w-3 h-3 mr-1" />
                        {livreurRamasseur.telephone}
                      </p>
                    )}
                  </div>
                  {canAssignLivreur(livraison.status, "ramasseur") && (
                    <button
                      onClick={() => openAssignModal("ramasseur")}
                      className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                    >
                      {livreurRamasseur ? "Changer" : "Attribuer"}
                    </button>
                  )}
                </div>
              </div>

              {/* Livreur distributeur */}
              <div className="p-4 rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">Livreur Distributeur</p>
                    <p className="text-sm text-gray-600">
                      {livreurDistributeur
                        ? `${livreurDistributeur.prenom || ''} ${livreurDistributeur.nom || ''}`.trim()
                        : "Non attribué"}
                    </p>
                    {livreurDistributeur?.telephone && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <PhoneIcon className="w-3 h-3 mr-1" />
                        {livreurDistributeur.telephone}
                      </p>
                    )}
                  </div>
                  {canAssignLivreur(livraison.status, "distributeur") && (
                    <button
                      onClick={() => openAssignModal("distributeur")}
                      className="px-3 py-1 text-sm text-green-600 bg-green-100 rounded hover:bg-green-200"
                    >
                      {livreurDistributeur ? "Changer" : "Attribuer"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Info sur les livreurs disponibles */}
            <div className="p-3 mt-4 text-sm bg-gray-100 rounded-lg">
              <p className="text-gray-600">
                Les livreurs disponibles sont ceux de votre wilaya ainsi que ceux qui vous ont été assignés par l'administrateur.
              </p>
            </div>
          </div>
        )}

        {/* Informations */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            {/* Client */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                Expéditeur (Client)
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <p>
                  {client?.prenom} {client?.nom}
                </p>
                <p className="flex items-center mt-1">
                  <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                  {client?.telephone}
                </p>
                {client?.email && (
                  <p className="flex items-center mt-1">
                    <EnvelopeIcon className="h-3 w-3 mr-1 text-gray-400" />
                    {client?.email}
                  </p>
                )}
              </dd>
            </div>

            {/* Destinataire */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                Destinataire
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <p>
                  {destinataire?.prenom} {destinataire?.nom}
                </p>
                <p className="flex items-center mt-1">
                  <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                  {destinataire?.telephone}
                </p>
                {destinataire?.email && (
                  <p className="flex items-center mt-1">
                    <EnvelopeIcon className="h-3 w-3 mr-1 text-gray-400" />
                    {destinataire?.email}
                  </p>
                )}
              </dd>
            </div>

            {/* Adresse de depot */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                Adresse de depot
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <p>{demande?.addresse_depot}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {demande?.wilaya_depot}, {demande?.commune_depot}
                </p>
                {demande?.lat_depot && demande?.lng_depot && (
                  <p className="text-xs text-gray-400 mt-1">
                    Coordonnées: {demande.lat_depot}, {demande.lng_depot}
                  </p>
                )}
              </dd>
            </div>

            {/* Adresse de livraison */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                Adresse de livraison
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <p>{demande?.addresse_delivery || "Non spécifiée"}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {demande?.wilaya}, {demande?.commune}
                </p>
                {demande?.lat_delivery &&
                  demande?.lng_delivery &&
                  demande?.lat_delivery != 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Coordonnées: {demande.lat_delivery}, {demande.lng_delivery}
                    </p>
                  )}
              </dd>
            </div>

            {/* Colis */}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Colis</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="font-medium">Label:</span>{" "}
                        {colis?.colis_label}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {colis?.colis_type || "Standard"}
                      </p>
                      <p>
                        <span className="font-medium">Poids:</span>{" "}
                        {colis?.poids} kg
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Prix colis:</span>{" "}
                        {colis?.colis_prix} DA
                      </p>
                      <p>
                        <span className="font-medium">Prix livraison:</span>{" "}
                        {demande?.prix} DA
                      </p>
                      <p>
                        <span className="font-medium">Total:</span>{" "}
                        {(colis?.colis_prix || 0) + (demande?.prix || 0)} DA
                      </p>
                    </div>
                  </div>
                  {colis?.colis_photo_url && (
                    <div className="mt-4">
                      <img
                        src={colis.colis_photo_url}
                        alt="Colis"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </dd>
            </div>

            {/* Dates */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Date ramassage
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {livraison.date_ramassage
                  ? formatDate(livraison.date_ramassage)
                  : "Non effectué"}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Date livraison
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {livraison.date_livraison
                  ? formatDate(livraison.date_livraison)
                  : "Non effectuée"}
              </dd>
            </div>

            {/* Bordereau */}
            {livraison.bordereau && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Bordereau</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <p>Numéro: {livraison.bordereau.numero}</p>
                  {livraison.bordereau.photo_reception_url && (
                    <img
                      src={livraison.bordereau.photo_reception_url}
                      alt="Réception"
                      className="h-32 w-32 object-cover rounded-md mt-2"
                    />
                  )}
                </dd>
              </div>
            )}

            {/* Commentaires */}
            {livraison.commentaires?.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Commentaires
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="space-y-2">
                    {livraison.commentaires.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 p-3 rounded-md"
                      >
                        <p className="text-sm">{comment.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Par {comment.livreur} le{" "}
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Modal de mise à jour du statut */}
      <UpdateStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={livraison.status}
        onUpdate={handleStatusUpdate}
      />

      {/* Modal d'assignation des livreurs */}
      <AssignLivreurModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignType(null);
        }}
        livraisonId={id}
        currentStatus={livraison.status}
        onAssignSuccess={handleAssignSuccess}
        initialType={assignType}
      />
    </div>
  );
};

export default LivraisonDetails;