import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                
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
                    </Route>
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                    //dps arrumar aq, n vai para o login, vai para a tela de erro 404, pq o path * pega tudo que não é definido
                />

            </Routes>
        </BrowserRouter>
    );
}
export default AppRoutes;