// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import LivraisonsList from "./pages/Livraisons/LivraisonsList";
import LivraisonDetails from "./pages/Livraisons/LivraisonDetails";
import LivreursList from "./pages/Livreurs/LivreursList";
import LivreurDetails from "./pages/Livreurs/LivreurDetails";
import CodesPromoList from "./pages/CodesPromo/CodesPromoList";
import CodePromoForm from "./pages/CodesPromo/CodePromoForm";
import CodePromoDetails from "./pages/CodesPromo/CodePromoDetails";
import Profile from "./pages/Profile/Profile";
import Comptabilite from "./pages/Manager/Comptabilite"; // Import du composant comptabilité
import LoadingSpinner from "./components/Common/LoadingSpinner";
import NavettesList from "./pages/Manager/NavettesList";
import NavetteCreate from "./pages/Manager/NavetteCreate";
import NavetteDetail from "./pages/Manager/NavetteDetail";

// Composant pour les routes privées (vérifie l'authentification et le rôle manager)
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isManager, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isManager) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// Composant principal de l'application
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Configuration des notifications toast */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />

        <Routes>
          {/* Route publique - Login */}
          <Route path="/login" element={<Login />} />

          {/* Route pour les accès non autorisés */}
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                  <p className="text-xl text-gray-700 mb-4">
                    Accès non autorisé
                  </p>
                  <p className="text-gray-500 mb-8">
                    Vous n'avez pas les droits nécessaires pour accéder à cette
                    page.
                  </p>
                  <a
                    href="/login"
                    className="text-primary-600 hover:text-primary-800 underline"
                  >
                    Retour à la page de connexion
                  </a>
                </div>
              </div>
            }
          />

          {/* Routes protégées - Accessibles uniquement aux managers authentifiés */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Redirection par défaut vers le dashboard */}
            <Route index element={<Navigate to="/dashboard" />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Gestion des livraisons */}
            <Route path="livraisons">
              <Route index element={<LivraisonsList />} />
              <Route path=":id" element={<LivraisonDetails />} />
            </Route>

            {/* Gestion des livreurs */}
            <Route path="livreurs">
              <Route index element={<LivreursList />} />
              <Route path=":id" element={<LivreurDetails />} />
            </Route>

            {/* Gestion des codes promo */}
            <Route path="codes-promo">
              <Route index element={<CodesPromoList />} />
              <Route path="nouveau" element={<CodePromoForm />} />
              <Route path=":id" element={<CodePromoDetails />} />
              <Route path=":id/edit" element={<CodePromoForm />} />
            </Route>

            <Route path="navettes">
              <Route index element={<NavettesList />} />
              <Route path="create" element={<NavetteCreate />} />
              <Route path=":id" element={<NavetteDetail />} />
            </Route>

            {/* NOUVELLE ROUTE - Comptabilité */}
            <Route path="comptabilite" element={<Comptabilite />} />

            {/* Profil utilisateur */}
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Route 404 - Page non trouvée */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-700 mb-4">Page non trouvée</p>
                  <p className="text-gray-500 mb-8">
                    La page que vous recherchez n'existe pas.
                  </p>
                  <a
                    href="/dashboard"
                    className="text-primary-600 hover:text-primary-800 underline"
                  >
                    Retour au tableau de bord
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
