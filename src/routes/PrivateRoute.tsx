import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute() {
    const token = localStorage.getItem("renovai_token");

    return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;