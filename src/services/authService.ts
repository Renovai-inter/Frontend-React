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
    usuarioId: string;
}

export interface EsqueciSenhaRequest {
    email: string;
}

export interface RedefinirSenhaRequest {
    token: string;
    novaSenha: string;
}

// POST /auth/login
export async function login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
}

// POST /auth/logout
export async function logout(): Promise<void> {
    await api.post<void>("/auth/logout");
}

// POST /auth/esqueci-senha 
export async function esqueciSenha(data: EsqueciSenhaRequest): Promise<void> {
    await api.post<void>("/auth/esqueci-senha", data);
}

// POST /auth/redefinir-senha 
export async function redefinirSenha(data: RedefinirSenhaRequest): Promise<void> {
    await api.post<void>("/auth/redefinir-senha", data);
}
