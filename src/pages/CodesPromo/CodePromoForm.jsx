import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  createCodePromo,
  getCodePromoById,
  updateCodePromo,
  getLivreurs,
} from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import toast from "react-hot-toast";

const schema = yup.object({
  code: yup.string().nullable(),
  description: yup.string().nullable(),
  type: yup
    .string()
    .oneOf(["percentage", "fixed"])
    .required("Le type est requis"),
  valeur: yup
    .number()
    .positive("Doit être positif")
    .required("La valeur est requise"),
  min_commande: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === "" ? null : value;
    })
    .positive("Doit être positif"),
  max_utilisations: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === "" ? null : value;
    })
    .positive("Doit être positif")
    .integer("Doit être un nombre entier"),
  livreurs: yup.array().nullable(),
  status: yup.string().oneOf(["actif", "inactif", "expire"]).default("actif"),
});

const CodePromoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [livreurs, setLivreurs] = useState([]);
  const [loadingLivreurs, setLoadingLivreurs] = useState(false);
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError: setFormError,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "percentage",
      status: "actif",
      min_commande: null,
      max_utilisations: null,
      livreurs: [],
    },
  });

  const watchType = watch("type");

  useEffect(() => {
    fetchLivreurs();
    if (isEditing) {
      fetchCodePromo();
    }
  }, [id]);

  const fetchLivreurs = async () => {
    setLoadingLivreurs(true);
    try {
      const response = await getLivreurs();
      console.log("Livreurs reçus:", response.data);

      // Adapter selon la structure de votre API
      let livreursData = [];
      if (response.data?.success && response.data?.data) {
        if (Array.isArray(response.data.data)) {
          livreursData = response.data.data;
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          livreursData = response.data.data.data;
        }
      } else if (Array.isArray(response.data)) {
        livreursData = response.data;
      }

      setLivreurs(livreursData);
    } catch (err) {
      console.error("Erreur chargement livreurs:", err);
      toast.error("Impossible de charger la liste des livreurs");
    } finally {
      setLoadingLivreurs(false);
    }
  };

  const fetchCodePromo = async () => {
    try {
      const response = await getCodePromoById(id);
      const data = response.data.data;

      // Remplir le formulaire
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          // Pour les livreurs, extraire les IDs
          if (key === "livreurs" && Array.isArray(data[key])) {
            const livreurIds = data[key].map(l => l.id);
            setValue(key, livreurIds);
          } else {
            setValue(key, data[key]);
          }
        }
      });
    } catch (err) {
      setError("Impossible de charger le code promo");
      toast.error("Erreur de chargement");
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await updateCodePromo(id, data);
        toast.success("Code promo modifié avec succès");
      } else {
        await createCodePromo(data);
        toast.success("Code promo créé avec succès");
      }
      navigate("/codes-promo");
    } catch (err) {
      toast.error(
        isEditing
          ? "Erreur lors de la modification"
          : "Erreur lors de la création",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <button
        onClick={() => navigate("/codes-promo")}
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Retour à la liste
      </button>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {isEditing ? "Modifier le code promo" : "Nouveau code promo"}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Code */}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700"
              >
                Code promo (optionnel - laissé vide pour génération auto)
              </label>
              <input
                type="text"
                id="code"
                {...register("code")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Ex: PROMO10"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                {...register("description")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Description du code promo..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Type et valeur */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Type de réduction
                </label>
                <select
                  id="type"
                  {...register("type")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (DA)</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="valeur"
                  className="block text-sm font-medium text-gray-700"
                >
                  Valeur {watchType === "percentage" ? "(%)" : "(DA)"}
                </label>
                <input
                  type="number"
                  id="valeur"
                  step={watchType === "percentage" ? "1" : "0.01"}
                  min="0"
                  {...register("valeur")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.valeur && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.valeur.message}
                  </p>
                )}
              </div>
            </div>

            {/* Commande minimum et utilisations max */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="min_commande"
                  className="block text-sm font-medium text-gray-700"
                >
                  Commande minimum (DA) - optionnel
                </label>
                <input
                  type="number"
                  id="min_commande"
                  step="0.01"
                  min="0"
                  {...register("min_commande")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="0 = pas de minimum"
                />
                {errors.min_commande && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.min_commande.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="max_utilisations"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre maximum d'utilisations - optionnel
                </label>
                <input
                  type="number"
                  id="max_utilisations"
                  min="1"
                  {...register("max_utilisations")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Laisser vide pour illimité"
                />
                {errors.max_utilisations && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.max_utilisations.message}
                  </p>
                )}
              </div>
            </div>

            {/* Sélection des livreurs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Livreurs concernés
              </label>
              {loadingLivreurs ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : livreurs.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Aucun livreur disponible dans votre wilaya
                </p>
              ) : (
                <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {livreurs.map((livreur) => (
                      <label
                        key={livreur.id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          value={livreur.id}
                          {...register("livreurs")}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {livreur.user?.prenom} {livreur.user?.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            {livreur.user?.email} | Tél: {livreur.user?.telephone || "Non renseigné"}
                          </p>
                        </div>
                        {livreur.desactiver === true && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            Inactif
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {errors.livreurs && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.livreurs.message}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Sélectionnez les livreurs qui pourront utiliser ce code promo.
                Laissez vide pour rendre le code accessible à tous les livreurs.
              </p>
            </div>

            {/* Statut */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Statut
              </label>
              <select
                id="status"
                {...register("status")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="expire">Expiré</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/codes-promo")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {loading
                  ? "Enregistrement..."
                  : isEditing
                  ? "Modifier"
                  : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CodePromoForm;