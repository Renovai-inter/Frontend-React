import api from "./api";

export interface CategoriaMaterialRequest {
    categoriaPaiId?: string;
    nomeCategoria: string;
}

export interface CategoriaMaterialResponse {
    categoriaId: string;
    categoriaPaiId: string | null;
    categoriaPaiNome: string | null;
    nomeCategoria: string;
}

export interface CategoriaMaterialArvoreResponse {
    categoriaId: string;
    nomeCategoria: string;
    subcategorias: CategoriaMaterialArvoreResponse[];
}

// GET /categorias-material
export async function listar(): Promise<CategoriaMaterialResponse[]> {
    const response = await api.get<CategoriaMaterialResponse[]>("/categorias-material");
    return response.data;
}

// GET /categorias-material/raiz
export async function listarRaiz(): Promise<CategoriaMaterialResponse[]> {
    const response = await api.get<CategoriaMaterialResponse[]>("/categorias-material/raiz");
    return response.data;
}

// GET /categorias-material/arvore
export async function listarArvore(): Promise<CategoriaMaterialArvoreResponse[]> {
    const response = await api.get<CategoriaMaterialArvoreResponse[]>("/categorias-material/arvore");
    return response.data;
}

// GET /categorias-material/{id}/subcategorias
export async function listarSubcategorias(id: string): Promise<CategoriaMaterialResponse[]> {
    const response = await api.get<CategoriaMaterialResponse[]>(`/categorias-material/${id}/subcategorias`);
    return response.data;
}

// GET /categorias-material/{id}
export async function buscarPorId(id: string): Promise<CategoriaMaterialResponse> {
    const response = await api.get<CategoriaMaterialResponse>(`/categorias-material/${id}`);
    return response.data;
}

// POST /categorias-material
export async function criar(data: CategoriaMaterialRequest): Promise<CategoriaMaterialResponse> {
    const response = await api.post<CategoriaMaterialResponse>("/categorias-material", data);
    return response.data;
}

// PUT /categorias-material/{id}
export async function atualizar(id: string, data: CategoriaMaterialRequest): Promise<CategoriaMaterialResponse> {
    const response = await api.put<CategoriaMaterialResponse>(`/categorias-material/${id}`, data);
    return response.data;
}

// DELETE /categorias-material/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/categorias-material/${id}`);
}
