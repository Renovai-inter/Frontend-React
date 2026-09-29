import api from "./api";

export interface EmpresaRequest {
    nome: string;
    descricao?: string;
    materialId?: string;
    imagemUrl?: string;
}

export interface EmpresaResponse {
    empresaId: string;
    nome: string;
    descricao: string;
    materialId: string;
    materialCategoria: string;
    imagemUrl: string;
}

export interface EmpresaDashboardResponse {
    totalPedidosEnviados: number;
    totalPedidosAceitos: number;
    valorTotalNegociado: number;
    totalCooperativasFavoritadas: number;
}

// GET /empresas
export async function listar(): Promise<EmpresaResponse[]> {
    const response = await api.get<EmpresaResponse[]>("/empresas");
    return response.data;
}

// GET /empresas/{id}
export async function buscarPorId(id: string): Promise<EmpresaResponse> {
    const response = await api.get<EmpresaResponse>(`/empresas/${id}`);
    return response.data;
}

// GET /empresas/por-nome/{nome}
export async function buscarPorNome(nome: string): Promise<EmpresaResponse[]> {
    const response = await api.get<EmpresaResponse[]>(`/empresas/por-nome/${nome}`);
    return response.data;
}

// GET /empresas/{id}/dashboard 
export async function buscarDashboard(id: string): Promise<EmpresaDashboardResponse> {
    const response = await api.get<EmpresaDashboardResponse>(`/empresas/${id}/dashboard`);
    return response.data;
}

// POST /empresas
export async function criar(data: EmpresaRequest): Promise<EmpresaResponse> {
    const response = await api.post<EmpresaResponse>("/empresas", data);
    return response.data;
}

// PUT /empresas/{id}
export async function atualizar(id: string, data: EmpresaRequest): Promise<EmpresaResponse> {
    const response = await api.put<EmpresaResponse>(`/empresas/${id}`, data);
    return response.data;
}

// DELETE /empresas/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/empresas/${id}`);
}
