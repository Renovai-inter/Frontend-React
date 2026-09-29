import api from "./api";

export interface UsuarioRequest {
    nome: string;
    cpf: string;
    email?: string;
    senha: string;
    dataNascimento?: string;
    imagemUrl?: string;
}

export interface UsuarioResponse {
    usuarioId: string;
    nome: string;
    cpf: string;
    dataNascimento: string;
    imagemUrl: string;
    ultimoAcesso: string;
}

export interface ValidarPrimeiroAcessoRequest {
    cpf: string;
    senha: string;
}

export interface PrimeiroAcessoResponse {
    primeiroAcesso: boolean;
    mensagem: string;
}

export interface CompletarCadastroRequest {
    cpf: string;
    email: string;
    novaSenha: string;
}

export interface AlterarSenhaRequest {
    senhaAtual: string;
    novaSenha: string;
}

// GET /usuarios
export async function listar(): Promise<UsuarioResponse[]> {
    const response = await api.get<UsuarioResponse[]>("/usuarios");
    return response.data;
}

// GET /usuarios/{id}
export async function buscarPorId(id: string): Promise<UsuarioResponse> {
    const response = await api.get<UsuarioResponse>(`/usuarios/${id}`);
    return response.data;
}

// POST /usuarios
export async function criar(data: UsuarioRequest): Promise<UsuarioResponse> {
    const response = await api.post<UsuarioResponse>("/usuarios", data);
    return response.data;
}

// POST /usuarios/validar-primeiro-acesso
export async function validarPrimeiroAcesso(
    data: ValidarPrimeiroAcessoRequest
): Promise<PrimeiroAcessoResponse> {
    const response = await api.post<PrimeiroAcessoResponse>("/usuarios/validar-primeiro-acesso", data);
    return response.data;
}

// PUT /usuarios/{id}/completar-cadastro
export async function completarCadastro(
    id: string,
    data: CompletarCadastroRequest
): Promise<UsuarioResponse> {
    const response = await api.put<UsuarioResponse>(`/usuarios/${id}/completar-cadastro`, data);
    return response.data;
}

// PUT /usuarios/{id}
export async function atualizar(id: string, data: UsuarioRequest): Promise<UsuarioResponse> {
    const response = await api.put<UsuarioResponse>(`/usuarios/${id}`, data);
    return response.data;
}

// PUT /usuarios/{id}/alterar-senha
export async function alterarSenha(id: string, data: AlterarSenhaRequest): Promise<void> {
    await api.put<void>(`/usuarios/${id}/alterar-senha`, data);
}

// DELETE /usuarios/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/usuarios/${id}`);
}
