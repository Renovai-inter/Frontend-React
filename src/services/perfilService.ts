import api from "./api";

export interface PerfilRequest {
    empresaId?: string;
    cooperativaId?: string;
    enderecoId?: string;
    email: string;
    cnpj: string;
}

export interface PerfilResponse {
    perfilId: string;
    email: string;
    cnpj: string;
    estaAtivo: boolean;
    dataCriacao: string;
    empresaId: string | null;
    empresaNome: string | null;
    cooperativaId: string | null;
    cooperativaNome: string | null;
}

// GET /perfis
export async function listar(): Promise<PerfilResponse[]> {
    const response = await api.get<PerfilResponse[]>("/perfis");
    return response.data;
}

// GET /perfis/ativos
export async function listarAtivos(): Promise<PerfilResponse[]> {
    const response = await api.get<PerfilResponse[]>("/perfis/ativos");
    return response.data;
}

// GET /perfis/{id}
export async function buscarPorId(id: string): Promise<PerfilResponse> {
    const response = await api.get<PerfilResponse>(`/perfis/${id}`);
    return response.data;
}

// POST /perfis — requer ADMIN_SITE
export async function criar(data: PerfilRequest): Promise<PerfilResponse> {
    const response = await api.post<PerfilResponse>("/perfis", data);
    return response.data;
}

// PUT /perfis/{id} — requer ADMIN_SITE ou ADMIN_COOPERATIVA
export async function atualizar(id: string, data: PerfilRequest): Promise<PerfilResponse> {
    const response = await api.put<PerfilResponse>(`/perfis/${id}`, data);
    return response.data;
}

// PUT /perfis/{id}/desativar
export async function desativar(id: string): Promise<PerfilResponse> {
    const response = await api.put<PerfilResponse>(`/perfis/${id}/desativar`);
    return response.data;
}

// DELETE /perfis/{id} — requer ADMIN_SITE
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/perfis/${id}`);
}
