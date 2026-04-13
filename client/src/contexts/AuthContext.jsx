import { createContext, useContext, useEffect, useState } from "react";
import http from "../api/http";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("board_studio_token");
    const rawUser = localStorage.getItem("board_studio_user");
    return {
      token,
      user: rawUser ? JSON.parse(rawUser) : null
    };
  });

  const persist = (payload) => {
    localStorage.setItem("board_studio_token", payload.token);
    localStorage.setItem("board_studio_user", JSON.stringify(payload.user));
    setAuth(payload);
  };

  const login = async (credentials) => {
    const { data } = await http.post("/login", credentials);
    persist(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await http.post("/register", payload);
    persist(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("board_studio_token");
    localStorage.removeItem("board_studio_user");
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
