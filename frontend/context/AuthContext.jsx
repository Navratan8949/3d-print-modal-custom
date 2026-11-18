"use client";

import { createContext, useContext, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
} from "@/store/authSlice";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();

  const {
    user,
    accessToken,
    isAuthenticated,
    isAdmin,
    isLoaded,
    status,
    error,
  } = useSelector((state) => state.auth);

  const login = useCallback(
    async (email, password) => {
      const res = await dispatch(loginUser({ email, password })).unwrap();
      return res;
    },
    [dispatch]
  );

  const register = useCallback(
    async (userData) => {
      const res = await dispatch(registerUser(userData)).unwrap();
      return res;
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutUser()).unwrap();
  }, [dispatch]);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await dispatch(fetchCurrentUser()).unwrap();
      return profile;
    } catch {
      return null;
    }
  }, [dispatch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: accessToken,
        accessToken,
        isLoaded,
        isAuthenticated,
        isAdmin,
        status,
        error,
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
    throw new Error("useAuth must be used within an AuthProvider wrapped in ReduxProvider");
  }
  return context;
}

export default AuthContext;
