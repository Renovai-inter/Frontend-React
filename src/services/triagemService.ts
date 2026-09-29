import api from "./api";

export interface TriagemRequest {
    equipeId: string;
    coletaId: string;
    materialId: string;
    statusId?: string;
    quantidadeKg: number;
    quantidadeRejeitoKg?: number;
    imagemUrl?: string;
}

export interface TriagemResponse {
    triagemId: string;
    equipeId: string;
    equipeNome: string;
    coletaId: string;
    materialId: string;
    materialCategoria: string;
    statusAtual: string;
    quantidadeKg: number;
    quantidadeRejeitoKg: number;
    dataTriagem: string;
    imagemUrl: string;
    cooperadosNomes: string[];
}

export interface AtualizarStatusTriagemRequest {
    statusId: string;
}

export interface ConcluirTriagemRequest {
    quantidadeFinalKg: number;
    observacao?: string;
}

// GET /triagens
export async function listar(): Promise<TriagemResponse[]> {
    const response = await api.get<TriagemResponse[]>("/triagens");
    return response.data;
}

// GET /triagens/{id}
export async function buscarPorId(id: string): Promise<TriagemResponse> {
    const response = await api.get<TriagemResponse>(`/triagens/${id}`);
    return response.data;
}

// GET /triagens/por-coleta/{coletaId}
export async function listarPorColeta(coletaId: string): Promise<TriagemResponse[]> {
    const response = await api.get<TriagemResponse[]>(`/triagens/por-coleta/${coletaId}`);
    return response.data;
}

// GET /triagens/por-cooperativa/{cooperativaId}
export async function listarPorCooperativa(cooperativaId: string): Promise<TriagemResponse[]> {
    const response = await api.get<TriagemResponse[]>(`/triagens/por-cooperativa/${cooperativaId}`);
    return response.data;
}

// GET /triagens/por-cooperativa/{cooperativaId}/status/{status}
export async function listarPorCooperativaEStatus(
    cooperativaId: string,
    status: string
): Promise<TriagemResponse[]> {
    const response = await api.get<TriagemResponse[]>(
        `/triagens/por-cooperativa/${cooperativaId}/status/${status}`
    );
    return response.data;
}

// GET /triagens/por-cooperado/{cooperadoId}
export async function listarPorCooperado(cooperadoId: string): Promise<TriagemResponse[]> {
    const response = await api.get<TriagemResponse[]>(`/triagens/por-cooperado/${cooperadoId}`);
    return response.data;
}

// GET /triagens/abertas/por-cooperado/{cooperadoId} 
export async function listarAbertasPorCooperado(cooperadoId: string): Promise<TriagemResponse[]> {
    const response = await api.get<TriagemResponse[]>(`/triagens/abertas/por-cooperado/${cooperadoId}`);
    return response.data;
}

// POST /triagens
export async function criar(data: TriagemRequest): Promise<TriagemResponse> {
    const response = await api.post<TriagemResponse>("/triagens", data);
    return response.data;
}

// PUT /triagens/{id}
export async function atualizar(id: string, data: TriagemRequest): Promise<TriagemResponse> {
    const response = await api.put<TriagemResponse>(`/triagens/${id}`, data);
    return response.data;
}

// PATCH /triagens/{id}/status
export async function atualizarStatus(
    id: string,
    data: AtualizarStatusTriagemRequest
): Promise<TriagemResponse> {
    const response = await api.patch<TriagemResponse>(`/triagens/${id}/status`, data);
    return response.data;
}

// PATCH /triagens/{id}/concluir 
export async function concluir(id: string, data: ConcluirTriagemRequest): Promise<TriagemResponse> {
    const response = await api.patch<TriagemResponse>(`/triagens/${id}/concluir`, data);
    return response.data;
}

// DELETE /triagens/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/triagens/${id}`);
}
