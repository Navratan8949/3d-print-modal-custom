"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load auth state from localStorage on initial render
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("prime3d_token");
      const storedUser = localStorage.getItem("prime3d_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Background verification
        authAPI
          .getMe()
          .then((res) => {
            if (res && res.user) {
              setUser(res.user);
              localStorage.setItem("prime3d_user", JSON.stringify(res.user));
            }
          })
          .catch(() => {
            // If token expired or invalid, clear
            logout();
          });
      }
    } catch (err) {
      console.warn("Failed to read user session from storage:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("prime3d_token", res.token);
      localStorage.setItem("prime3d_user", JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("prime3d_token", res.token);
      localStorage.setItem("prime3d_user", JSON.stringify(res.user));
    }
    return res;
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("prime3d_token");
      localStorage.removeItem("prime3d_user");
    } catch (err) {
      console.warn("Error clearing localStorage:", err);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem("prime3d_user", JSON.stringify(res.user));
      }
      return res?.user;
    } catch {
      return null;
    }
  };

  const isAdmin = Boolean(
    user && (user.role === "admin" || user.role === "super_admin")
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoaded,
        isAuthenticated: Boolean(user && token),
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

