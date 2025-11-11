import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // verify cookie on mount
  useEffect(() => {
    axios
      .get("https://chatgpt-iet7.onrender.com/api/auth/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, checking }}>
      {children}
    </AuthContext.Provider>
  );
};

