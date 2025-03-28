import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

const AuthGuard = () => {
    const { accessToken } = useAuthStore();

    if (accessToken) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;

};

export default AuthGuard;
