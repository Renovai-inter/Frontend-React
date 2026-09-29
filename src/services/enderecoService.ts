import api from "./api";

export interface EnderecoRequest {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
}

export interface EnderecoResponse {
    enderecoId: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    tipo: string | null;
}

// GET /enderecos
export async function listar(): Promise<EnderecoResponse[]> {
    const response = await api.get<EnderecoResponse[]>("/enderecos");
    return response.data;
}

// GET /enderecos/{id}
export async function buscarPorId(id: string): Promise<EnderecoResponse> {
    const response = await api.get<EnderecoResponse>(`/enderecos/${id}`);
    return response.data;
}

// POST /enderecos
export async function criar(data: EnderecoRequest): Promise<EnderecoResponse> {
    const response = await api.post<EnderecoResponse>("/enderecos", data);
    return response.data;
}

// PUT /enderecos/{id}
export async function atualizar(id: string, data: EnderecoRequest): Promise<EnderecoResponse> {
    const response = await api.put<EnderecoResponse>(`/enderecos/${id}`, data);
    return response.data;
}

// DELETE /enderecos/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/enderecos/${id}`);
}
