import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
const GuestRoute = ({ children }) => {
  const { user, checking } = useContext(AuthContext);

  if (checking) return <div>Loading...</div>;

  return user ? <Navigate to="/chat" /> : children;
};

export default GuestRoute;
