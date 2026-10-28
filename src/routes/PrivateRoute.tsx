import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function PrivateRoute() {
    const { autenticado } = useAuth();

    return autenticado ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;
