import axios from "axios";

const api = axios.create({
    baseURL: 
    import.meta.env.VITE_API_URL ??
    "http://localhost:8080/api",
});

// Injeta o token em todas as requisições autenticadas
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("renovai_token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Se o token expirar/for inválido, desloga e manda pro login
api.interceptors.response.use(
    (response) => response,
    (error) => {
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