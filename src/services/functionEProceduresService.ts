import api from "./api";

export interface CalcularRejeitoRequest {
    triagemQuantidadeKg: number;
    coletaId: string;
}

export interface CalcularRateioRequest {
    cooperativaId: string;
    mesReferencia: string; // LocalDateTime ISO
}

export interface CalcularTotalRequest {
    cooperativaId: string;
    dataInicio: string;
    dataFim: string;
}

export interface CalcularTotalCategoriaRequest {
    categoriaId: string;
    dataInicio?: string;
    dataFim?: string;
}

export interface AceitarPedidoCooperativaRequest {
    pedidoCooperativaId: string;
    statusAceitoId: string;
}

export interface FecharNegociacaoProcedureRequest {
    negociacaoId: string;
    aceito: boolean;
}

export interface FecharRateioMensalRequest {
    cooperativaId: string;
    gestorId: string;
    mesReferencia: string;
}

export interface RegistrarMovimentacaoTriagemRequest {
    equipeId: string;
    coletaId: string;
    materialId: string;
    statusId: string;
    quantidadeKg: number;
    quantidadeRejeitoKg?: number;
    dataTriagem?: string;
}

export interface ProcedureResponse {
    sucesso: boolean;
    mensagem: string;
}

// GET /functions/avaliacoes/media/{perfilId}
export async function calcularMediaAvaliacoes(perfilId: string): Promise<number> {
    const response = await api.get<{ mediaAvaliacoes: number }>(`/functions/avaliacoes/media/${perfilId}`);
    return response.data.mediaAvaliacoes;
}

// GET /functions/cooperativas/{cooperativaId}/cooperados
export async function calcularNumeroCooperados(cooperativaId: string): Promise<number> {
    const response = await api.get<{ numeroCooperados: number }>(
        `/functions/cooperativas/${cooperativaId}/cooperados`
    );
    return response.data.numeroCooperados;
}

// POST /functions/coletas/rejeito
export async function calcularQuantidadeRejeitoKg(data: CalcularRejeitoRequest): Promise<number> {
    const response = await api.post<{ quantidadeRejeitoKg: number }>("/functions/coletas/rejeito", data);
    return response.data.quantidadeRejeitoKg;
}

// POST /functions/rateio/automatico
export async function calcularRateioAutomatico(data: CalcularRateioRequest): Promise<number> {
    const response = await api.post<{ valorIndividual: number }>("/functions/rateio/automatico", data);
    return response.data.valorIndividual;
}

// POST /functions/financeiro/acumulado
export async function calcularTotalAcumulado(data: CalcularTotalRequest): Promise<number> {
    const response = await api.post<{ totalAcumulado: number }>("/functions/financeiro/acumulado", data);
    return response.data.totalAcumulado;
}

// POST /functions/financeiro/liquido
export async function calcularTotalLiquido(data: CalcularTotalRequest): Promise<number> {
    const response = await api.post<{ totalLiquido: number }>("/functions/financeiro/liquido", data);
    return response.data.totalLiquido;
}

// POST /functions/categorias/total-kg
export async function calcularTotalKgPorCategoria(data: CalcularTotalCategoriaRequest): Promise<number> {
    const response = await api.post<{ totalKg: number }>("/functions/categorias/total-kg", data);
    return response.data.totalKg;
}

// POST /functions/pedidos/aceitar
export async function aceitarPedidoCooperativa(
    data: AceitarPedidoCooperativaRequest
): Promise<ProcedureResponse> {
    const response = await api.post<ProcedureResponse>("/functions/pedidos/aceitar", data);
    return response.data;
}

// POST /functions/negociacoes/fechar
export async function fecharNegociacao(
    data: FecharNegociacaoProcedureRequest
): Promise<ProcedureResponse> {
    const response = await api.post<ProcedureResponse>("/functions/negociacoes/fechar", data);
    return response.data;
}

// POST /functions/rateios/fechar
export async function fecharRateioMensal(data: FecharRateioMensalRequest): Promise<ProcedureResponse> {
    const response = await api.post<ProcedureResponse>("/functions/rateios/fechar", data);
    return response.data;
}

// POST /functions/triagens/movimentacao
export async function registrarMovimentacaoTriagem(
    data: RegistrarMovimentacaoTriagemRequest
): Promise<ProcedureResponse> {
    const response = await api.post<ProcedureResponse>("/functions/triagens/movimentacao", data);
    return response.data;
}
