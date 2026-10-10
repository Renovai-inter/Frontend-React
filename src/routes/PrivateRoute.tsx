import { Navigate, Outlet } from "react-router-dom";
import { lerSessao } from "../utils/armazenamentoSessao";

function PrivateRoute() {
    const token = lerSessao("renovai_token");

    return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;