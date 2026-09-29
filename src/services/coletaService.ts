import api from "./api";

export interface ColetaRequest {
    cooperadoId: string;
    statusId?: string;
    origem?: string;
    quantidadeKg?: number;
    imagemUrl?: string;
    tipoColeta?: "EXTERNA" | "ENTREGA";
    rotaId?: string;
}

export interface ColetaResponse {
    coletaId: string;
    cooperadoId: string;
    cooperadoNome: string;
    statusAtual: string;
    quantidadeKg: number;
    dataColeta: string;
    tipoColeta: string;
    imagemUrl: string;
    rotaId: string | null;
}

export interface AtualizarStatusColetaRequest {
    statusId: string;
}

// GET /coletas
export async function listar(): Promise<ColetaResponse[]> {
    const response = await api.get<ColetaResponse[]>("/coletas");
    return response.data;
}

// GET /coletas/{id}
export async function buscarPorId(id: string): Promise<ColetaResponse> {
    const response = await api.get<ColetaResponse>(`/coletas/${id}`);
    return response.data;
}

// GET /coletas/por-cooperado/{cooperadoId} 
export async function listarPorCooperado(cooperadoId: string): Promise<ColetaResponse[]> {
    const response = await api.get<ColetaResponse[]>(`/coletas/por-cooperado/${cooperadoId}`);
    return response.data;
}

// GET /coletas/por-cooperativa/{cooperativaId}
export async function listarPorCooperativa(cooperativaId: string): Promise<ColetaResponse[]> {
    const response = await api.get<ColetaResponse[]>(`/coletas/por-cooperativa/${cooperativaId}`);
    return response.data;
}

// GET /coletas/por-cooperativa/{cooperativaId}/tipo/{tipoColeta}
export async function listarPorCooperativaETipo(
    cooperativaId: string,
    tipoColeta: string
): Promise<ColetaResponse[]> {
    const response = await api.get<ColetaResponse[]>(
        `/coletas/por-cooperativa/${cooperativaId}/tipo/${tipoColeta}`
    );
    return response.data;
}

// GET /coletas/por-cooperativa/{cooperativaId}/status/{status}
export async function listarPorCooperativaEStatus(
    cooperativaId: string,
    status: string
): Promise<ColetaResponse[]> {
    const response = await api.get<ColetaResponse[]>(
        `/coletas/por-cooperativa/${cooperativaId}/status/${status}`
    );
    return response.data;
}

// GET /coletas/por-rota/{rotaId}
export async function listarPorRota(rotaId: string): Promise<ColetaResponse[]> {
    const response = await api.get<ColetaResponse[]>(`/coletas/por-rota/${rotaId}`);
    return response.data;
}

// POST /coletas
export async function criar(data: ColetaRequest): Promise<ColetaResponse> {
    const response = await api.post<ColetaResponse>("/coletas", data);
    return response.data;
}

// PUT /coletas/{id}
export async function atualizar(id: string, data: ColetaRequest): Promise<ColetaResponse> {
    const response = await api.put<ColetaResponse>(`/coletas/${id}`, data);
    return response.data;
}

// PATCH /coletas/{id}/status
export async function atualizarStatus(
    id: string,
    data: AtualizarStatusColetaRequest
): Promise<ColetaResponse> {
    const response = await api.patch<ColetaResponse>(`/coletas/${id}/status`, data);
    return response.data;
}

// DELETE /coletas/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/coletas/${id}`);
}
