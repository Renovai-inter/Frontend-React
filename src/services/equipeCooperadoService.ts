import api from "./api";

export interface EquipeCooperadoRequest {
    equipeId: string;
    cooperadoId: string;
}

export interface EquipeCooperadoResponse {
    equipeCooperadoId: string;
    equipeId: string;
    equipeNome: string;
    cooperadoId: string;
    cooperadoNome: string;
}

// GET /equipes-cooperados
export async function listarTodos(): Promise<EquipeCooperadoResponse[]> {
    const response = await api.get<EquipeCooperadoResponse[]>("/equipes-cooperados");
    return response.data;
}

// GET /equipes-cooperados/por-equipe/{equipeId}
export async function listarPorEquipe(equipeId: string): Promise<EquipeCooperadoResponse[]> {
    const response = await api.get<EquipeCooperadoResponse[]>(`/equipes-cooperados/por-equipe/${equipeId}`);
    return response.data;
}

// GET /equipes-cooperados/por-cooperado/{cooperadoId}
export async function listarPorCooperado(cooperadoId: string): Promise<EquipeCooperadoResponse[]> {
    const response = await api.get<EquipeCooperadoResponse[]>(
        `/equipes-cooperados/por-cooperado/${cooperadoId}`
    );
    return response.data;
}

// GET /equipes-cooperados/{id}
export async function buscarPorId(id: string): Promise<EquipeCooperadoResponse> {
    const response = await api.get<EquipeCooperadoResponse>(`/equipes-cooperados/${id}`);
    return response.data;
}

// POST /equipes-cooperados
export async function adicionar(data: EquipeCooperadoRequest): Promise<EquipeCooperadoResponse> {
    const response = await api.post<EquipeCooperadoResponse>("/equipes-cooperados", data);
    return response.data;
}

// DELETE /equipes-cooperados/{id}
export async function remover(id: string): Promise<void> {
    await api.delete<void>(`/equipes-cooperados/${id}`);
}

// DELETE /equipes-cooperados/remover-por-equipe-cooperado?equipeId=&cooperadoId=
export async function removerPorEquipeECooperado(equipeId: string, cooperadoId: string): Promise<void> {
    await api.delete<void>("/equipes-cooperados/remover-por-equipe-cooperado", {
        params: { equipeId, cooperadoId },
    });
}
