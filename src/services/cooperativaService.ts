import api from "./api";

export interface CooperativaRequest {
    nome: string;
    descricao?: string;
    numeroCooperados?: number;
    horarioFuncionamento?: string;
    imagemUrl?: string;
    contatoPreferencial?: "WHATSAPP" | "TELEFONE" | "EMAIL";
    enderecoId?: string;
}

export interface CooperativaResponse {
    cooperativaId: string;
    nome: string;
    descricao: string;
    numeroCooperados: number;
    horarioFuncionamento: string;
    imagemUrl: string;
    contatoPreferencial: string;
    cidade: string;
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

export interface CooperativaPerfilPublicoResponse {
    cooperativaId: string;
    nome: string;
    descricao: string;
    imagemUrl: string;
    contatoPreferencial: string;
    horarioFuncionamento: string;
    cidade: string;
    mediaAvaliacoes: number;
    totalAvaliacoes: number;
    materiaisDisponiveis: EstoqueResponse[];
}

// GET /cooperativas
export async function listar(): Promise<CooperativaResponse[]> {
    const response = await api.get<CooperativaResponse[]>("/cooperativas");
    return response.data;
}

// GET /cooperativas/{id}
export async function buscarPorId(id: string): Promise<CooperativaResponse> {
    const response = await api.get<CooperativaResponse>(`/cooperativas/${id}`);
    return response.data;
}

// GET /cooperativas/por-nome/{nome}
export async function buscarPorNome(nome: string): Promise<CooperativaResponse[]> {
    const response = await api.get<CooperativaResponse[]>(`/cooperativas/por-nome/${nome}`);
    return response.data;
}

// GET /cooperativas/buscar
export async function buscarComFiltros(params: {
    categoriaId?: string;
    cidade?: string;
    quantidadeMin?: number;
}): Promise<CooperativaResponse[]> {
    const response = await api.get<CooperativaResponse[]>("/cooperativas/buscar", { params });
    return response.data;
}

// GET /cooperativas/{id}/perfil-publico 
export async function buscarPerfilPublico(id: string): Promise<CooperativaPerfilPublicoResponse> {
    const response = await api.get<CooperativaPerfilPublicoResponse>(`/cooperativas/${id}/perfil-publico`);
    return response.data;
}

// POST /cooperativas
export async function criar(data: CooperativaRequest): Promise<CooperativaResponse> {
    const response = await api.post<CooperativaResponse>("/cooperativas", data);
    return response.data;
}

// PUT /cooperativas/{id}
export async function atualizar(id: string, data: CooperativaRequest): Promise<CooperativaResponse> {
    const response = await api.put<CooperativaResponse>(`/cooperativas/${id}`, data);
    return response.data;
}

// DELETE /cooperativas/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/cooperativas/${id}`);
}
