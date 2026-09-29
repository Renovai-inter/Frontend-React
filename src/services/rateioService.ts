import api from "./api";

export interface RateioGeralRequest {
    gestorId: string;
    cooperativaId: string;
    dataInicio: string;
    dataFim: string;
}

export interface RateioProporcionalRequest {
    gestorId: string;
    cooperativaId: string;
    dataInicio: string;
    dataFim: string;
}

export interface ResultadoRateioIndividualResponse {
    funcionarioId: string;
    funcionarioNome: string;
    cargo: string;
    isGestor: boolean;
    valorRateio: number;
    quantidadeColetas: number;
    quantidadeTriagens: number;
    percentualParticipacao: number;
}

export interface RateioRealizadoResponse {
    rateioId: string;
    gestorId: string;
    gestorNome: string;
    cooperativaId: string;
    cooperativaNome: string;
    tipoRateio: string;
    dataRateio: string;
    valorTotalVendas: number;
    valorTotalDistribuido: number;
    quantidadePessoas: number;
    distribuicao: ResultadoRateioIndividualResponse[];
}

export interface RateioDetalheResponse {
    rateioId: string;
    gestorId: string;
    gestorNome: string;
    cooperativaId: string;
    cooperativaNome: string;
    tipoRateio: string;
    dataRateio: string;
    valorTotalDistribuido: number;
    funcionarios: ResultadoRateioIndividualResponse[];
}

export interface RateioListaResponse {
    rateioId: string;
    gestorNome: string;
    cooperativaNome: string;
    tipoRateio: string;
    dataRateio: string;
    quantidadePessoas: number;
    valorTotalDistribuido: number;
}

export interface RateioFuncionarioResponse {
    rateioFuncionarioId: string;
    rateioId: string;
    dataRateio: string;
    tipoRateio: string;
    funcionarioId: string;
    funcionarioNome: string;
    valorRateio: number;
    cooperativaNome: string;
}

// GET /rateios/por-cooperativa/{cooperativaId}
export async function listarPorCooperativa(cooperativaId: string): Promise<RateioListaResponse[]> {
    const response = await api.get<RateioListaResponse[]>(`/rateios/por-cooperativa/${cooperativaId}`);
    return response.data;
}

// GET /rateios/{id}
export async function buscarPorId(id: string): Promise<RateioDetalheResponse> {
    const response = await api.get<RateioDetalheResponse>(`/rateios/${id}`);
    return response.data;
}

// GET /rateios/{id}/distribuicao 
export async function listarDistribuicao(id: string): Promise<RateioFuncionarioResponse[]> {
    const response = await api.get<RateioFuncionarioResponse[]>(`/rateios/${id}/distribuicao`);
    return response.data;
}

// POST /rateios/executar-geral
export async function executarRateioGeral(data: RateioGeralRequest): Promise<RateioRealizadoResponse> {
    const response = await api.post<RateioRealizadoResponse>("/rateios/executar-geral", data);
    return response.data;
}

// POST /rateios/executar-proporcional
export async function executarRateioProporcional(
    data: RateioProporcionalRequest
): Promise<RateioRealizadoResponse> {
    const response = await api.post<RateioRealizadoResponse>("/rateios/executar-proporcional", data);
    return response.data;
}
