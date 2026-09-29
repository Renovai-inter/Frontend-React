import api from "./api";

export interface MaterialRequest {
    categoriaId: string;
    cooperativaId?: string;
    precoSugerido?: number;
    estaDisponivel?: boolean;
}

export interface MaterialResponse {
    materialId: string;
    categoriaId: string;
    categoriaNome: string;
    precoSugerido: number;
    estaDisponivel: boolean;
    cooperativaId: string;
    imagemUrl: string;
}

// GET /materiais
export async function listar(): Promise<MaterialResponse[]> {
    const response = await api.get<MaterialResponse[]>("/materiais");
    return response.data;
}

// GET /materiais/disponiveis
export async function listarDisponiveis(): Promise<MaterialResponse[]> {
    const response = await api.get<MaterialResponse[]>("/materiais/disponiveis");
    return response.data;
}

// GET /materiais/{id}
export async function buscarPorId(id: string): Promise<MaterialResponse> {
    const response = await api.get<MaterialResponse>(`/materiais/${id}`);
    return response.data;
}

// GET /materiais/por-categoria?categoriaId=
export async function buscarPorCategoria(categoriaId?: string): Promise<MaterialResponse[]> {
    const response = await api.get<MaterialResponse[]>("/materiais/por-categoria", {
        params: { categoriaId },
    });
    return response.data;
}

// POST /materiais
export async function criar(data: MaterialRequest): Promise<MaterialResponse> {
    const response = await api.post<MaterialResponse>("/materiais", data);
    return response.data;
}

// PUT /materiais/{id}
export async function atualizar(id: string, data: MaterialRequest): Promise<MaterialResponse> {
    const response = await api.put<MaterialResponse>(`/materiais/${id}`, data);
    return response.data;
}

// DELETE /materiais/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/materiais/${id}`);
}
