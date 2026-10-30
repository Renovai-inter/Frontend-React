import axios, { type AxiosError } from "axios";
import { redirecionarParaErro } from "../utils/erroNavegacao";
import { lerSessao } from "../utils/armazenamentoSessao";

const API_URL = "http://ad0d8c99545a84713891def8a28f1d46-c7cd4a13dc3dd2e8.elb.us-east-1.amazonaws.com/api";
// https://spring-api-2t71.onrender.com/api

const api = axios.create({
    baseURL: API_URL,
});

// Injeta o token em todas as requisições autenticadas
api.interceptors.request.use((config) => {
    const token = lerSessao("renovai_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Com o usuário logado, só 401 (sessão inválida) e falha de conexão levam para a página de erro.
// 403/404/5xx de uma chamada isolada não derrubam a navegação: quem chamou trata o erro (ex.: bloco
// indisponível na Home). Rotas /auth/* ficam de fora: login, cadastro etc. tratam o próprio erro no formulário.
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ mensagem?: string; message?: string }>) => {
        const status = error.response?.status;
        const logado = !!lerSessao("renovai_token");
        const rotaDeAuth = error.config?.url?.startsWith("/auth/");
        const cancelada = error.code === "ERR_CANCELED";
        const deveRedirecionar = status === undefined || status === 401;

        if (logado && !rotaDeAuth && !cancelada && deveRedirecionar) {
            redirecionarParaErro({
                status,
                // A API devolve "mensagem" (GlobalExceptionHandler)
                mensagem: error.response?.data?.mensagem ?? error.response?.data?.message,
            });
        }
        return Promise.reject(error);
    }
);

export default api;