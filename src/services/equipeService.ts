import api from "./api";

export interface EquipeRequest {
    gestorId: string;
    nome: string;
    estaAtiva?: boolean;
}

export interface EquipeResponse {
    equipeId: string;
    cooperativaId: string;
    cooperativaNome: string;
    gestorId: string;
    gestorNome: string;
    nome: string;
    estaAtiva: boolean;
    dataCriacao: string;
}

// GET /equipes
export async function listar(): Promise<EquipeResponse[]> {
    const response = await api.get<EquipeResponse[]>("/equipes");
    return response.data;
}

// GET /equipes/ativas
export async function listarAtivas(): Promise<EquipeResponse[]> {
    const response = await api.get<EquipeResponse[]>("/equipes/ativas");
    return response.data;
}

// GET /equipes/por-cooperativa/{cooperativaId}
export async function listarPorCooperativa(cooperativaId: string): Promise<EquipeResponse[]> {
    const response = await api.get<EquipeResponse[]>(`/equipes/por-cooperativa/${cooperativaId}`);
    return response.data;
}

// GET /equipes/{id}
export async function buscarPorId(id: string): Promise<EquipeResponse> {
    const response = await api.get<EquipeResponse>(`/equipes/${id}`);
    return response.data;
}

// POST /equipes
export async function criar(data: EquipeRequest): Promise<EquipeResponse> {
    const response = await api.post<EquipeResponse>("/equipes", data);
    return response.data;
}

// PUT /equipes/{id}
export async function atualizar(id: string, data: EquipeRequest): Promise<EquipeResponse> {
    const response = await api.put<EquipeResponse>(`/equipes/${id}`, data);
    return response.data;
}

// DELETE /equipes/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/equipes/${id}`);
}
