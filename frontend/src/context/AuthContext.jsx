
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Add this at the top - after imports
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  // Check for existing auth on app start
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      console.log("🔍 AuthProvider - Checking auth:", { token, userData });

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          console.log("✅ AuthProvider - User restored:", parsedUser);
        } catch (error) {
          console.error("❌ AuthProvider - Error parsing user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    console.log("🔍 AuthContext - Login attempt:", email);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password }
      );

      const { token, user: userData } = response.data;
      console.log("✅ AuthContext - Login successful:", userData);

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
     
      setUser(userData);

      return { 
        success: true,
        user: userData
      };
    } catch (error) {
      console.error("❌ AuthContext - Login failed:", error);
      const errorMessage = error.response?.data?.message || "Login failed";
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name, email, password
      });

      return {
        success: true,
        message: "Registration successful! Please login.",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    console.log("🔍 AuthContext - Logging out");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};