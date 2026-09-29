import api from "./api";

export interface AvaliacaoRequest {
    avaliadorId: string;
    avaliadoId: string;
    pedidoId?: string;
    nota?: number;
    comentario?: string;
}

export interface AvaliacaoResponse {
    avaliacaoId: string;
    avaliadorId: string;
    avaliadoId: string;
    pedidoId: string;
    nota: number;
    comentario: string;
    dataAvaliacao: string;
}

export interface DistribuicaoEstrelas {
    estrelas0: number;
    estrelas1: number;
    estrelas2: number;
    estrelas3: number;
    estrelas4: number;
    estrelas5: number;
}

// GET /avaliacoes?avaliadoId=
export async function listar(avaliadoId?: string): Promise<AvaliacaoResponse[]> {
    const response = await api.get<AvaliacaoResponse[]>("/avaliacoes", { params: { avaliadoId } });
    return response.data;
}

// GET /avaliacoes/{id}
export async function buscarPorId(id: string): Promise<AvaliacaoResponse> {
    const response = await api.get<AvaliacaoResponse>(`/avaliacoes/${id}`);
    return response.data;
}

// GET /avaliacoes/media/{perfilId}
export async function mediaNota(perfilId: string): Promise<number> {
    const response = await api.get<number>(`/avaliacoes/media/${perfilId}`);
    return response.data;
}

// GET /avaliacoes/por-pedido/{pedidoId}
export async function listarPorPedido(pedidoId: string): Promise<AvaliacaoResponse[]> {
    const response = await api.get<AvaliacaoResponse[]>(`/avaliacoes/por-pedido/${pedidoId}`);
    return response.data;
}

// GET /avaliacoes/distribuicao-estrelas/cooperativa/{cooperativaId}
export async function distribuicaoEstrelas(cooperativaId: string): Promise<DistribuicaoEstrelas> {
    const response = await api.get<DistribuicaoEstrelas>(
        `/avaliacoes/distribuicao-estrelas/cooperativa/${cooperativaId}`
    );
    return response.data;
}

// POST /avaliacoes
export async function criar(data: AvaliacaoRequest): Promise<AvaliacaoResponse> {
    const response = await api.post<AvaliacaoResponse>("/avaliacoes", data);
    return response.data;
}

// DELETE /avaliacoes/{id} — requer ADMIN_SITE
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/avaliacoes/${id}`);
}
