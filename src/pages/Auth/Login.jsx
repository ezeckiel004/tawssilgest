// src/pages/Auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon 
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Précharger l'image
  useEffect(() => {
    const img = new Image();
    img.src = "/algerbg.jpg";
    img.onload = () => setImageLoaded(true);
  }, []);

  // Mettre à jour l'année si nécessaire
  useEffect(() => {
    const interval = setInterval(() => {
      const newYear = new Date().getFullYear();
      if (newYear !== currentYear) {
        setCurrentYear(newYear);
      }
    }, 60000); // Vérifier chaque minute

    return () => clearInterval(interval);
  }, [currentYear]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    }
  };

  // Remplir automatiquement les champs de démo
  const fillDemoCredentials = () => {
    setFormData({
      email: "gestionnaire.alger@example.com",
      password: "password",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8 sm:py-12">
      {/* Image de fond avec overlay sombre */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url(${imageLoaded ? '/algerbg.jpg' : 'none'})`,
          opacity: imageLoaded ? 1 : 0
        }}
      />
      
      {/* Overlay sombre avec dégradé */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/95 to-gray-800/95" />
      
      {/* Effet de lumière subtil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/5 via-transparent to-transparent" />
      
      {/* Particules animées */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 my-auto">
        {/* Carte de connexion */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">
          
          {/* Logo / Titre */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 mb-3 shadow-lg shadow-primary-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Tawssil Manager
            </h2>
            <p className="text-sm text-gray-300">
              Espace gestionnaire de wilaya
            </p>
          </div>

          {/* Formulaire */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-3">
              {/* Champ Email */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Adresse email"
                />
              </div>

              {/* Champ Mot de passe avec œil */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 pl-10 pr-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Mot de passe"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-primary-400 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-primary-400 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Options supplémentaires */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-white/5 border border-white/20 rounded text-primary-500 focus:ring-primary-500 focus:ring-offset-0 focus:ring-1"
                />
                <span className="ml-2 text-gray-300">Se souvenir</span>
              </label>
              <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
                Mot de passe oublié?
              </a>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary-500/30 text-sm font-medium"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <ArrowRightIcon className="h-4 w-4 text-primary-200 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="flex-1 text-center">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </span>
            </button>
          </form>

          {/* Informations de démo */}
          <div className="mt-5 p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400 mb-2 flex items-center">
              <span className="mr-1">🔐</span> Identifiants de démonstration
            </p>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-gray-300">
                  <span className="text-primary-400 font-medium">Email:</span>{" "}
                  <span className="text-gray-300">gestionnaire.alger@example.com</span>
                </p>
                <p className="text-xs text-gray-300">
                  <span className="text-primary-400 font-medium">Mot de passe:</span>{" "}
                  <span className="text-gray-300">password</span>
                </p>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full transition-colors whitespace-nowrap ml-2"
              >
                Remplir
              </button>
            </div>
          </div>

          {/* Footer - avec année dynamique */}
          <p className="mt-4 text-center text-xs text-gray-500">
            © {currentYear} Tawssil. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;