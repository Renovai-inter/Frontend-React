import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Login from "../pages/Login";
import PrivateRoute from "./PrivateRoute";
import Cooperativa from "../pages/Cooperativa";
import Layout from "../pages/Layout";
import Home from "../pages/Home";
import Funcionarios from "../pages/Funcionarios";
import Estoque from "../pages/Estoque";
import Coletas from "../pages/Coletas";
import Triagens from "../pages/Triagens";
import Rateios from "../pages/Rateios";
import RotasColeta from "../pages/RotasColeta";
import CadastroUsuario from "../pages/CadastroUsuario";
import CadastroCooperativa from "../pages/CadastroCooperativa";
import Pedidos from "../pages/Pedidos";
import PerfilUsuario from "../pages/PerfilUsuario";
import ErrorPage from "../pages/Error";
import { registrarNavegacao } from "../utils/erroNavegacao";

// Disponibiliza o navigate para o interceptor do axios, que roda fora do React
function RegistraNavegacao() {
    const navigate = useNavigate();

    useEffect(() => {
        registrarNavegacao(navigate);
        return () => registrarNavegacao(null);
    }, [navigate]);

    return null;
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <RegistraNavegacao />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
                <Route path="/cadastro-cooperativa" element={<CadastroCooperativa />} />
                
                <Route element={<PrivateRoute />}>
                    <Route path="/" element={<Layout />}>
                        <Route path="home" element={<Home />} />
                        <Route path="cooperativa" element={<Cooperativa />} />
                        <Route path="funcionarios" element={<Funcionarios />} />
                        <Route path="estoque" element={<Estoque />} />
                        <Route path="coletas" element={<Coletas />} />
                        <Route path="triagens" element={<Triagens />} />
                        <Route path="rateios" element={<Rateios />} />
                        <Route path="rotas-coleta" element={<RotasColeta />} />
                        <Route path="pedidos" element={<Pedidos />} />
                        <Route path="perfil" element={<PerfilUsuario />}/>
                    </Route>
                    <Route path="/error" element={<ErrorPage />} />
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/error" replace state={{ status: 404 }} />}
                />

            </Routes>
        </BrowserRouter>
    );
}
export default AppRoutes;