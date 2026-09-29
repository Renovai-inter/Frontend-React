import api from "./api";

export interface PedidoRequest {
    empresaId: string;
    observacao?: string;
}

export interface PedidoResponse {
    pedidoId: string;
    empresaId: string;
    empresaNome: string;
    dataPedido: string;
    dataConclusao: string | null;
    statusAtual: string;
    valorTotal: number;
    observacao: string;
}

export interface ItemRequest {
    pedidoId: string;
    materialId: string;
    quantidadeKg: number;
    precoUnitario?: number;
}

export interface ItemResponse {
    itemId: string;
    pedidoId: string;
    materialId: string;
    materialCategoria: string;
    quantidadeKg: number;
    precoUnitario: number;
}

export interface PedidoCooperativaRequest {
    pedidoId: string;
    cooperativaId: string;
    statusId: string;
}

export interface PedidoCooperativaResponse {
    pedidoCooperativaId: string;
    pedidoId: string;
    cooperativaId: string;
    cooperativaNome: string;
    statusAtual: string;
}

// GET /pedidos
export async function listar(): Promise<PedidoResponse[]> {
    const response = await api.get<PedidoResponse[]>("/pedidos");
    return response.data;
}

// GET /pedidos/{id} 
export async function buscarPorId(id: string): Promise<PedidoResponse> {
    const response = await api.get<PedidoResponse>(`/pedidos/${id}`);
    return response.data;
}

// GET /pedidos/por-empresa/{empresaId} 
export async function listarPorEmpresa(empresaId: string): Promise<PedidoResponse[]> {
    const response = await api.get<PedidoResponse[]>(`/pedidos/por-empresa/${empresaId}`);
    return response.data;
}

// POST /pedidos
export async function criar(data: PedidoRequest): Promise<PedidoResponse> {
    const response = await api.post<PedidoResponse>("/pedidos", data);
    return response.data;
}

// DELETE /pedidos/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/pedidos/${id}`);
}

// GET /pedidos/{pedidoId}/itens
export async function listarItens(pedidoId: string): Promise<ItemResponse[]> {
    const response = await api.get<ItemResponse[]>(`/pedidos/${pedidoId}/itens`);
    return response.data;
}

// POST /pedidos/itens
export async function adicionarItem(data: ItemRequest): Promise<ItemResponse> {
    const response = await api.post<ItemResponse>("/pedidos/itens", data);
    return response.data;
}

// DELETE /pedidos/itens/{itemId}
export async function removerItem(itemId: string): Promise<void> {
    await api.delete<void>(`/pedidos/itens/${itemId}`);
}

// GET /pedidos/por-cooperativa/{cooperativaId}
export async function listarPorCooperativa(cooperativaId: string): Promise<PedidoCooperativaResponse[]> {
    const response = await api.get<PedidoCooperativaResponse[]>(`/pedidos/por-cooperativa/${cooperativaId}`);
    return response.data;
}

// POST /pedidos/cooperativa
export async function vincularCooperativa(
    data: PedidoCooperativaRequest
): Promise<PedidoCooperativaResponse> {
    const response = await api.post<PedidoCooperativaResponse>("/pedidos/cooperativa", data);
    return response.data;
}

// PUT /pedidos/cooperativa/{id}/status/{statusId}
export async function atualizarStatus(id: string, statusId: string): Promise<PedidoCooperativaResponse> {
    const response = await api.put<PedidoCooperativaResponse>(
        `/pedidos/cooperativa/${id}/status/${statusId}`
    );
    return response.data;
}
