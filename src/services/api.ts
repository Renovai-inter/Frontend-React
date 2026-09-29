import axios, { type AxiosError } from "axios";

const PROD_API_URL = "https://spring-api-2t71.onrender.com/api";
const LOCAL_API_URL = "http://localhost:8080/api";

const api = axios.create({
    baseURL: PROD_API_URL,
});

const fallbackApi = axios.create({
    baseURL: LOCAL_API_URL,
});

// Injeta o token em todas as requisições autenticadas
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("renovai_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Fallback: se der erro de rede (servidor de produção fora do ar) e estivermos em dev,
// tenta a mesma requisição contra a API local
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const isNetworkError = error.code === "ERR_NETWORK";
        const alreadyRetried = (error.config as any)?._retriedFallback;

        if (isNetworkError && import.meta.env.DEV && !alreadyRetried) {
            const retryConfig = {
                ...error.config,
                baseURL: LOCAL_API_URL, // sobrescreve explicitamente o baseURL original
                _retriedFallback: true,
            };
            return fallbackApi.request(retryConfig as any);
        }

        return Promise.reject(error);
    }
);

// Se o token expirar/for inválido, desloga e manda pro login
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("renovai_token");
            localStorage.removeItem("renovai_role");
            localStorage.removeItem("renovai_email");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;