import api from "./api";

export interface EmpresaMaterialInteresseRequest {
    empresaId: string;
    categoriaId: string;
}

export interface EmpresaMaterialInteresseResponse {
    empresaMaterialId: string;
    empresaId: string;
    categoriaId: string;
    categoriaNome: string;
}

// GET /empresas-materiais-interesse/por-empresa/{empresaId} — tela 5.6
export async function listarPorEmpresa(empresaId: string): Promise<EmpresaMaterialInteresseResponse[]> {
    const response = await api.get<EmpresaMaterialInteresseResponse[]>(
        `/empresas-materiais-interesse/por-empresa/${empresaId}`
    );
    return response.data;
}

// POST /empresas-materiais-interesse
export async function adicionar(
    data: EmpresaMaterialInteresseRequest
): Promise<EmpresaMaterialInteresseResponse> {
    const response = await api.post<EmpresaMaterialInteresseResponse>(
        "/empresas-materiais-interesse",
        data
    );
    return response.data;
}

// DELETE /empresas-materiais-interesse/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/empresas-materiais-interesse/${id}`);
}

// DELETE /empresas-materiais-interesse/por-empresa-categoria?empresaId=&categoriaId=
export async function removerPorEmpresaCategoria(empresaId: string, categoriaId: string): Promise<void> {
    await api.delete<void>("/empresas-materiais-interesse/por-empresa-categoria", {
        params: { empresaId, categoriaId },
    });
}
