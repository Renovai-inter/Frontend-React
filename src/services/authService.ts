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

export interface EnderecoCadastroRequest {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
}

export interface CadastroCooperativaRequest {
    nomeResponsavel: string;
    cpfResponsavel: string;
    nome: string;
    descricao?: string;
    numeroCooperados?: number;
    horarioFuncionamento?: string;
    imagemUrl?: string;
    contatoPreferencial: string;
    email: string;
    cnpj: string;
    senha: string;
    endereco: EnderecoCadastroRequest;
}

export interface CadastroCooperativaResponse {
    cooperativaId: string;
    perfilId: string;
    enderecoId: string;
    email: string;
    role: string;
    usuarioId: string;
    funcionarioId: string;
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

// POST /auth/cadastro-cooperativa (público)
// Cria cooperativa, endereço, perfil institucional e o responsável (usuário + funcionário com cargo Admin)
// em uma única transação.
// Depois do cadastro, faça login com e-mail e senha.
export async function cadastrarCooperativa(
    data: CadastroCooperativaRequest
): Promise<CadastroCooperativaResponse> {
    const response = await api.post<CadastroCooperativaResponse>("/auth/cadastro-cooperativa", data);
    return response.data;
}
