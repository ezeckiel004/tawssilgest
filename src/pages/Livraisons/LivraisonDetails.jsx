import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  getLivraisonById,
  updateLivraisonStatus,
} from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import UpdateStatusModal from "./UpdateStatusModal";
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
        {/* En-tête */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Livraison #{livraison.code_pin}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Créée le {formatDate(livraison.created_at)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={getStatusBadgeClass(livraison.status)}>
              {getStatusLabel(livraison.status)}
            </span>
            {/* <button
              onClick={() => setIsStatusModalOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Changer statut
            </button> */}
          </div>
        </div>

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

            {/* Adresse de dépôt */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                Adresse de dépôt
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
                      Coordonnées: {demande.lat_delivery},{" "}
                      {demande.lng_delivery}
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

            {/* Livreurs */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Livreur ramasseur
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {livreurRamasseur ? (
                  <>
                    <p>
                      {livreurRamasseur.prenom} {livreurRamasseur.nom}
                    </p>
                    <p className="text-xs text-gray-500">
                      {livreurRamasseur.telephone}
                    </p>
                  </>
                ) : (
                  <span className="text-gray-400">Non assigné</span>
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Livreur distributeur
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {livreurDistributeur ? (
                  <>
                    <p>
                      {livreurDistributeur.prenom} {livreurDistributeur.nom}
                    </p>
                    <p className="text-xs text-gray-500">
                      {livreurDistributeur.telephone}
                    </p>
                  </>
                ) : (
                  <span className="text-gray-400">Non assigné</span>
                )}
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
    </div>
  );
};

export default LivraisonDetails;
