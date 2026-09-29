import api from "./api";

export interface RotaRequest {
    cooperativaId: string;
    nome: string;
    estaAtiva?: boolean;
}

export interface RotaEnderecoRequest {
    rotaId: string;
    enderecoId: string;
    nomeLocal: string;
    tipoLocal?: string;
    ordem: number;
}

export interface RotaEnderecoResponse {
    rotaEnderecoId: string;
    rotaId: string;
    enderecoId: string;
    nomeLocal: string;
    tipoLocal: string;
    ordem: number;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
}

export interface RotaResponse {
    rotaId: string;
    cooperativaId: string;
    cooperativaNome: string;
    nome: string;
    estaAtiva: boolean;
    enderecos: RotaEnderecoResponse[];
}

// GET /rotas/por-cooperativa/{cooperativaId}
export async function listarPorCooperativa(cooperativaId: string): Promise<RotaResponse[]> {
    const response = await api.get<RotaResponse[]>(`/rotas/por-cooperativa/${cooperativaId}`);
    return response.data;
}

// GET /rotas/ativas/por-cooperativa/{cooperativaId}
export async function listarAtivasPorCooperativa(cooperativaId: string): Promise<RotaResponse[]> {
    const response = await api.get<RotaResponse[]>(`/rotas/ativas/por-cooperativa/${cooperativaId}`);
    return response.data;
}

// GET /rotas/{id}
export async function buscarPorId(id: string): Promise<RotaResponse> {
    const response = await api.get<RotaResponse>(`/rotas/${id}`);
    return response.data;
}

// POST /rotas
export async function criar(data: RotaRequest): Promise<RotaResponse> {
    const response = await api.post<RotaResponse>("/rotas", data);
    return response.data;
}

// PUT /rotas/{id}
export async function atualizar(id: string, data: RotaRequest): Promise<RotaResponse> {
    const response = await api.put<RotaResponse>(`/rotas/${id}`, data);
    return response.data;
}

// DELETE /rotas/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/rotas/${id}`);
}

// GET /rotas/{rotaId}/enderecos
export async function listarEnderecos(rotaId: string): Promise<RotaEnderecoResponse[]> {
    const response = await api.get<RotaEnderecoResponse[]>(`/rotas/${rotaId}/enderecos`);
    return response.data;
}

// POST /rotas/enderecos
export async function adicionarEndereco(data: RotaEnderecoRequest): Promise<RotaEnderecoResponse> {
    const response = await api.post<RotaEnderecoResponse>("/rotas/enderecos", data);
    return response.data;
}

// DELETE /rotas/enderecos/{id}
export async function removerEndereco(id: string): Promise<void> {
    await api.delete<void>(`/rotas/enderecos/${id}`);
}
