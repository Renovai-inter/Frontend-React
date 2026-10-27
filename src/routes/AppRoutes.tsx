import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";
import PaginaCarregando from "../components/PaginaCarregando";
import { registrarNavegacao } from "../utils/erroNavegacao";

// Cada página vira um chunk separado: o navegador só baixa o código da tela que o usuário abre.
const Login = lazy(() => import("../pages/Login"));
const Cooperativa = lazy(() => import("../pages/Cooperativa"));
const Layout = lazy(() => import("../pages/Layout"));
const Home = lazy(() => import("../pages/Home"));
const Funcionarios = lazy(() => import("../pages/Funcionarios"));
const Estoque = lazy(() => import("../pages/Estoque"));
const Coletas = lazy(() => import("../pages/Coletas"));
const Triagens = lazy(() => import("../pages/Triagens"));
const Rateios = lazy(() => import("../pages/Rateios"));
const RotasColeta = lazy(() => import("../pages/RotasColeta"));
const RedefinirSenha = lazy(() => import("../pages/RedefinirSenha"));
const CadastroUsuario = lazy(() => import("../pages/CadastroUsuario"));
const CadastroCooperativa = lazy(() => import("../pages/CadastroCooperativa"));
const Pedidos = lazy(() => import("../pages/Pedidos"));
const PerfilUsuario = lazy(() => import("../pages/PerfilUsuario"));
const ErrorPage = lazy(() => import("../pages/Error"));

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
            <Suspense fallback={<PaginaCarregando />}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/redefinir-senha" element={<RedefinirSenha />} />
                <Route path="/cadastro-usuario"element={<CadastroUsuario />} />
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
                        <Route path="pedidos/:negociacaoId" element={<Pedidos />} />
                        <Route path="perfil" element={<PerfilUsuario />}/>
                    </Route>
                    <Route path="/error" element={<ErrorPage />} />
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/error" replace state={{ status: 404 }} />}
                />

            </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
export default AppRoutes;