import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../services/manager";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorAlert from "../../components/Common/ErrorAlert";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Formulaires
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setProfile(response.data.data);
      setFormData({
        nom: response.data.data.user.nom || "",
        prenom: response.data.data.user.prenom || "",
        email: response.data.data.user.email || "",
        telephone: response.data.data.user.telephone || "",
      });
    } catch (err) {
      setError("Erreur lors du chargement du profil");
      toast.error("Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
      fetchProfile(); // Recharger
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await changePassword(passwordData);
      toast.success("Mot de passe changé avec succès");
      setIsChangingPassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (err) {
      toast.error("Erreur lors du changement de mot de passe");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!profile) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mon Profil</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* En-tête avec wilaya */}
        <div className="px-4 py-5 sm:px-6 bg-primary-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-primary-900">
                Gestionnaire - Wilaya {profile.gestionnaire.wilaya_nom}
              </h3>
              <p className="text-sm text-primary-700">
                Code wilaya: {profile.gestionnaire.wilaya_id}
              </p>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Informations personnelles
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Modifier
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  Nom complet
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile.user.prenom} {profile.user.nom}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                  Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile.user.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  Téléphone
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile.user.telephone}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <KeyIcon className="h-4 w-4 mr-1" />
                  Mot de passe
                </dt>
                <dd className="mt-1">
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Changer le mot de passe
                  </button>
                </dd>
              </div>
            </dl>
          )}
        </div>

        {/* Modal de changement de mot de passe */}
        {isChangingPassword && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Changer le mot de passe
              </h3>

              <form onSubmit={handleSubmitPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    name="new_password_confirmation"
                    value={passwordData.new_password_confirmation}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Changer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
