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
import LoadingSpinner from "./components/Common/LoadingSpinner";

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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="livraisons">
              <Route index element={<LivraisonsList />} />
              <Route path=":id" element={<LivraisonDetails />} />
            </Route>

            <Route path="livreurs">
              <Route index element={<LivreursList />} />
              <Route path=":id" element={<LivreurDetails />} />
            </Route>

            <Route path="codes-promo">
              <Route index element={<CodesPromoList />} />
              <Route path="nouveau" element={<CodePromoForm />} />
              <Route path=":id" element={<CodePromoDetails />} />
              <Route path=":id/edit" element={<CodePromoForm />} />
            </Route>

            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
