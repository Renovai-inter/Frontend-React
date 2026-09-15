import api from "./api";

export interface LoginRequest {
    email: string;
    senha: string;
}

export interface LoginResponse {
    token: string;
    tipo: string;
    email: string;
    role: string;
}

const dadosFicticios: LoginResponse = {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    tipo: "Bearer",
    email: "maria@novaesperanca.coop.br",
    role: "admin"
};

export async function login(data: LoginRequest): Promise<LoginResponse> {
    //const response = await api.post<LoginResponse>("/auth/login", data);
    //return response.data;

    // Simulando uma resposta de login bem-sucedida, enquanto o backend não está rodando 
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(dadosFicticios);
        }, 1000);   
    });
};