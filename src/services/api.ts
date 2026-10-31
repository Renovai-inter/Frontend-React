
import axios, { type AxiosError } from "axios";
import { redirecionarParaErro } from "../utils/erroNavegacao";
import { lerSessao } from "../utils/armazenamentoSessao";

const API_URL = "http://ad0d8c99545a84713891def8a28f1d46-c7cd4a13dc3dd2e8.elb.us-east-1.amazonaws.com/api";
const API_URL_FALLBACK = "https://spring-api-2t71.onrender.com/api";

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

// Fallback automático caso a API principal não responda
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ mensagem?: string; message?: string }>) => {
        const config = error.config;

        if (!config) {
            return Promise.reject(error);
        }

        const falhaDeConexao = !error.response;
        const jaTentouFallback = config.baseURL === API_URL_FALLBACK;

        if (falhaDeConexao && !jaTentouFallback) {
            config.baseURL = API_URL_FALLBACK;

            return api.request(config);
        }

        const status = error.response?.status;
        const logado = !!lerSessao("renovai_token");
        const rotaDeAuth = config.url?.startsWith("/auth/");
        const cancelada = error.code === "ERR_CANCELED";

        const deveRedirecionar = status === undefined || status === 401;

        if (logado && !rotaDeAuth && !cancelada && deveRedirecionar) {
            redirecionarParaErro({
                status,
                mensagem:
                    error.response?.data?.mensagem ??
                    error.response?.data?.message,
            });
        }

        return Promise.reject(error);
    }
);

export default api;
