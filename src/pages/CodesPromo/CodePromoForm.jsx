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
      // Transformer les chaînes vides en null
      return originalValue === "" ? null : value;
    })
    .positive("Doit être positif")
    .integer("Doit être un nombre entier"),
  date_debut: yup.string().nullable(),
  date_fin: yup
    .string()
    .nullable()
    .test(
      "is-after-start",
      "La date de fin doit être après la date de début",
      function (value) {
        const { date_debut } = this.parent;
        if (!date_debut || !value) return true;
        return new Date(value) > new Date(date_debut);
      },
    ),
  status: yup.string().oneOf(["actif", "inactif", "expire"]).default("actif"),
});

const CodePromoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "percentage",
      status: "actif",
      min_commande: null,
      max_utilisations: null,
    },
  });

  const watchType = watch("type");

  useEffect(() => {
    if (isEditing) {
      fetchCodePromo();
    }
  }, [id]);

  const fetchCodePromo = async () => {
    try {
      const response = await getCodePromoById(id);
      const data = response.data.data;

      // Remplir le formulaire
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          setValue(key, data[key]);
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

            {/* Dates */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="date_debut"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date de début
                </label>
                <input
                  type="date"
                  id="date_debut"
                  {...register("date_debut")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.date_debut && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.date_debut.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="date_fin"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date de fin
                </label>
                <input
                  type="date"
                  id="date_fin"
                  {...register("date_fin")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.date_fin && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.date_fin.message}
                  </p>
                )}
              </div>
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