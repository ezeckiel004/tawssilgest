import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user || response.data);
    } catch (error) {
      console.error("Failed to load user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      toast.success("Connexion réussie");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Erreur de connexion";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Déconnexion réussie");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isManager: user?.role === "gestionnaire",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
