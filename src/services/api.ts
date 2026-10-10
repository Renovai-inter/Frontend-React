import axios, { type AxiosError } from "axios";
import { redirecionarParaErro } from "../utils/erroNavegacao";
import { lerSessao } from "../utils/armazenamentoSessao";

const API_URL = "https://spring-api-2t71.onrender.com/api";

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

// Com o usuário logado, erros 401/403/404/5xx (ou sem resposta do servidor) levam para a página de erro.
// Rotas /auth/* ficam de fora: login, cadastro etc. tratam o próprio erro no formulário.
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
        const status = error.response?.status;
        const logado = !!lerSessao("renovai_token");
        const rotaDeAuth = error.config?.url?.startsWith("/auth/");
        const cancelada = error.code === "ERR_CANCELED";
        const deveRedirecionar =
            status === undefined || status === 401 || status === 403 || status === 404 || status >= 500;

        if (logado && !rotaDeAuth && !cancelada && deveRedirecionar) {
            redirecionarParaErro({ status, mensagem: error.response?.data?.message });
        }
        return Promise.reject(error);
    }
);

export default api;