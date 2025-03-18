import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

const DasbboardGuard = () => {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/log-in" replace />;
  }

  return <Outlet />;
};

export default DasbboardGuard;