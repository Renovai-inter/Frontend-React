import api from "./api";

export interface StatusRequest {
    referencia: string;
    statusAtual: string;
}

export interface StatusResponse {
    statusId: string;
    referencia: string;
    statusAtual: string;
    dataAtualizacao: string;
}

// GET /status
export async function listar(): Promise<StatusResponse[]> {
    const response = await api.get<StatusResponse[]>("/status");
    return response.data;
}

// GET /status/{id}
export async function buscarPorId(id: string): Promise<StatusResponse> {
    const response = await api.get<StatusResponse>(`/status/${id}`);
    return response.data;
}

// GET /status/por-referencia/{referencia} (PEDIDO, TRIAGEM, COLETA, NEGOCIACAO...)
export async function listarPorReferencia(referencia: string): Promise<StatusResponse[]> {
    const response = await api.get<StatusResponse[]>(`/status/por-referencia/${referencia}`);
    return response.data;
}

// POST /status — requer ADMIN_SITE ou ADMIN_COOPERATIVA
export async function criar(data: StatusRequest): Promise<StatusResponse> {
    const response = await api.post<StatusResponse>("/status", data);
    return response.data;
}

// PUT /status/{id} — requer ADMIN_SITE ou ADMIN_COOPERATIVA
export async function atualizar(id: string, data: StatusRequest): Promise<StatusResponse> {
    const response = await api.put<StatusResponse>(`/status/${id}`, data);
    return response.data;
}

// DELETE /status/{id} — requer ADMIN_SITE
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/status/${id}`);
}
