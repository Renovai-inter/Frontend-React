import api from "./api";

export interface EstoqueRequest {
    cooperativaId: string;
    materialId: string;
    quantidadeKg: number;
}

export interface EstoqueResponse {
    estoqueId: string;
    cooperativaId: string;
    cooperativaNome: string;
    materialId: string;
    materialCategoria: string;
    quantidadeKg: number;
    dataAtualizacao: string;
}

export interface AtualizarQuantidadeEstoqueRequest {
    novaQuantidadeKg: number;
    motivo?: string;
}

// GET /estoques
export async function listar(): Promise<EstoqueResponse[]> {
    const response = await api.get<EstoqueResponse[]>("/estoques");
    return response.data;
}

// GET /estoques/{id}
export async function buscarPorId(id: string): Promise<EstoqueResponse> {
    const response = await api.get<EstoqueResponse>(`/estoques/${id}`);
    return response.data;
}

// GET /estoques/por-cooperativa/{cooperativaId} 
export async function listarPorCooperativa(cooperativaId: string): Promise<EstoqueResponse[]> {
    const response = await api.get<EstoqueResponse[]>(`/estoques/por-cooperativa/${cooperativaId}`);
    return response.data;
}

// GET /estoques/disponiveis/por-cooperativa/{cooperativaId}
export async function listarDisponiveisPorCooperativa(cooperativaId: string): Promise<EstoqueResponse[]> {
    const response = await api.get<EstoqueResponse[]>(
        `/estoques/disponiveis/por-cooperativa/${cooperativaId}`
    );
    return response.data;
}

// POST /estoques
export async function criar(data: EstoqueRequest): Promise<EstoqueResponse> {
    const response = await api.post<EstoqueResponse>("/estoques", data);
    return response.data;
}

// PUT /estoques/{id}
export async function atualizar(id: string, data: EstoqueRequest): Promise<EstoqueResponse> {
    const response = await api.put<EstoqueResponse>(`/estoques/${id}`, data);
    return response.data;
}

// PATCH /estoques/{id}/quantidade
export async function atualizarQuantidade(
    id: string,
    data: AtualizarQuantidadeEstoqueRequest
): Promise<EstoqueResponse> {
    const response = await api.patch<EstoqueResponse>(`/estoques/${id}/quantidade`, data);
    return response.data;
}

// DELETE /estoques/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/estoques/${id}`);
}
