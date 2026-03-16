import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { getLivreurs, addLivreursToCodePromo } from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import toast from "react-hot-toast";

const AddLivreursModal = ({ isOpen, onClose, codePromoId, onSuccess }) => {
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLivreurs, setSelectedLivreurs] = useState([]);
  const [error, setError] = useState(null);

  // Charger la liste des livreurs disponibles
  useEffect(() => {
    if (isOpen) {
      fetchLivreurs();
    }
  }, [isOpen]);

  // Réinitialiser la sélection quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSelectedLivreurs([]);
      setSearchTerm("");
      setError(null);
    }
  }, [isOpen]);

  const fetchLivreurs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLivreurs();
      console.log("Livreurs reçus:", response.data);

      // Adapter selon la structure de votre API
      if (response.data?.success && response.data?.data) {
        if (Array.isArray(response.data.data)) {
          setLivreurs(response.data.data);
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          setLivreurs(response.data.data.data);
        } else {
          setLivreurs([]);
        }
      } else if (Array.isArray(response.data)) {
        setLivreurs(response.data);
      } else {
        setLivreurs([]);
      }
    } catch (err) {
      console.error("Erreur chargement livreurs:", err);
      setError("Impossible de charger la liste des livreurs");
      toast.error("Erreur de chargement des livreurs");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLivreur = (livreurId) => {
    setSelectedLivreurs((prev) =>
      prev.includes(livreurId)
        ? prev.filter((id) => id !== livreurId)
        : [...prev, livreurId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLivreurs.length === filteredLivreurs.length) {
      setSelectedLivreurs([]);
    } else {
      setSelectedLivreurs(filteredLivreurs.map((l) => l.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedLivreurs.length === 0) {
      toast.error("Veuillez sélectionner au moins un livreur");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Ajout des livreurs:", selectedLivreurs);
      await addLivreursToCodePromo(codePromoId, selectedLivreurs);
      toast.success(`${selectedLivreurs.length} livreur(s) ajouté(s) avec succès`);
      onSuccess?.(); // Callback pour rafraîchir les données
      onClose(); // Fermer la modal
    } catch (err) {
      console.error("Erreur ajout livreurs:", err);
      // Le toast est déjà géré par l'intercepteur
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrer les livreurs par recherche
  const filteredLivreurs = livreurs.filter((livreur) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      livreur.nom?.toLowerCase().includes(searchLower) ||
      livreur.prenom?.toLowerCase().includes(searchLower) ||
      livreur.email?.toLowerCase().includes(searchLower) ||
      livreur.telephone?.includes(searchTerm)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* En-tête */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Ajouter des livreurs au code promo
              </h3>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Corps */}
          <div className="px-6 py-4">
            {/* Barre de recherche */}
            <div className="mb-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un livreur (nom, email, téléphone)..."
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Liste des livreurs */}
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchLivreurs}
                  className="mt-2 text-sm text-red-600 hover:text-red-500"
                >
                  Réessayer
                </button>
              </div>
            ) : filteredLivreurs.length === 0 ? (
              <div className="py-8 text-center">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm
                    ? "Aucun livreur ne correspond à votre recherche"
                    : "Aucun livreur disponible"}
                </p>
              </div>
            ) : (
              <>
                {/* Sélection tout */}
                <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={
                        filteredLivreurs.length > 0 &&
                        selectedLivreurs.length === filteredLivreurs.length
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Tout sélectionner
                    </span>
                  </label>
                  <span className="text-sm text-gray-500">
                    {selectedLivreurs.length} sélectionné(s)
                  </span>
                </div>

                {/* Liste des livreurs avec checkboxes */}
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {filteredLivreurs.map((livreur) => (
                    <label
                      key={livreur.id}
                      className="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLivreurs.includes(livreur.id)}
                        onChange={() => handleToggleLivreur(livreur.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {livreur.prenom} {livreur.nom}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:space-x-4">
                          <p className="text-xs text-gray-500">
                            Email: {livreur.email || "Non renseigné"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Tél: {livreur.telephone || "Non renseigné"}
                          </p>
                        </div>
                        {livreur.wilaya && (
                          <p className="text-xs text-gray-500">
                            Wilaya: {livreur.wilaya.nom || livreur.wilaya}
                          </p>
                        )}
                      </div>
                      {livreur.actif === false && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          Inactif
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pied */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || selectedLivreurs.length === 0}
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Ajout en cours...
                  </>
                ) : (
                  `Ajouter ${selectedLivreurs.length} livreur(s)`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLivreursModal;