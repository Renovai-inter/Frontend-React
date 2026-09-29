import api from "./api";

export interface FavoritoRequest {
    empresaId: string;
    cooperativaId: string;
}

export interface FavoritoResponse {
    favoritoId: string;
    empresaId: string;
    cooperativaId: string;
    cooperativaNome: string;
    cooperativaImagem: string;
    dataCriacao: string;
}

// GET /favoritos/por-empresa/{empresaId} 
export async function listarPorEmpresa(empresaId: string): Promise<FavoritoResponse[]> {
    const response = await api.get<FavoritoResponse[]>(`/favoritos/por-empresa/${empresaId}`);
    return response.data;
}

// POST /favoritos 
export async function favoritar(data: FavoritoRequest): Promise<FavoritoResponse> {
    const response = await api.post<FavoritoResponse>("/favoritos", data);
    return response.data;
}

// DELETE /favoritos/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/favoritos/${id}`);
}

// DELETE /favoritos/por-empresa-cooperativa?empresaId=&cooperativaId=
export async function desfavoritar(empresaId: string, cooperativaId: string): Promise<void> {
    await api.delete<void>("/favoritos/por-empresa-cooperativa", {
        params: { empresaId, cooperativaId },
    });
}
