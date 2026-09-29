import api from "./api";

export interface NegociacaoRequest {
    pedidoId: string;
    cooperativaId: string;
    empresaId: string;
    statusId: string;
    valorTotal?: number;
}

export interface NegociacaoItemRequest {
    negociacaoId: string;
    materialId: string;
    quantidadeKg: number;
    precoUnitario: number;
}

export interface NegociacaoItemResponse {
    negociacaoItemId: string;
    negociacaoId: string;
    materialId: string;
    materialCategoria: string;
    quantidadeKg: number;
    precoUnitario: number;
}

export interface NegociacaoResponse {
    negociacaoId: string;
    pedidoId: string;
    cooperativaId: string;
    cooperativaNome: string;
    empresaId: string;
    empresaNome: string;
    statusAtual: string;
    valorTotal: number;
    dataInicio: string;
    dataFechamento: string | null;
    itens: NegociacaoItemResponse[];
}

export interface NegociacaoMensagemRequest {
    negociacaoId: string;
    remetenteId: string;
    mensagem: string;
    tipoMensagem?: "TEXTO" | "CONTRAPROPOSTA" | "SISTEMA";
}

export interface NegociacaoMensagemResponse {
    mensagemId: string;
    negociacaoId: string;
    remetenteId: string;
    remetenteNome: string;
    mensagem: string;
    tipoMensagem: string;
    dataEnvio: string;
}

export interface ContrapropostaRequest {
    negociacaoId: string;
    valorTotal?: number;
    itens?: NegociacaoItemRequest[];
    observacao?: string;
}

export interface RecusarNegociacaoRequest {
    justificativa: string;
}

export interface FecharNegociacaoRequest {
    valorFinal: number;
    observacao?: string;
}

// GET /negociacoes/por-cooperativa/{cooperativaId} 
export async function listarPorCooperativa(cooperativaId: string): Promise<NegociacaoResponse[]> {
    const response = await api.get<NegociacaoResponse[]>(`/negociacoes/por-cooperativa/${cooperativaId}`);
    return response.data;
}

// GET /negociacoes/por-empresa/{empresaId}
export async function listarPorEmpresa(empresaId: string): Promise<NegociacaoResponse[]> {
    const response = await api.get<NegociacaoResponse[]>(`/negociacoes/por-empresa/${empresaId}`);
    return response.data;
}

// GET /negociacoes/por-pedido/{pedidoId}
export async function listarPorPedido(pedidoId: string): Promise<NegociacaoResponse[]> {
    const response = await api.get<NegociacaoResponse[]>(`/negociacoes/por-pedido/${pedidoId}`);
    return response.data;
}

// GET /negociacoes/por-cooperativa/{cooperativaId}/status/{statusAtual}
export async function listarPorCooperativaEStatus(
    cooperativaId: string,
    statusAtual: string
): Promise<NegociacaoResponse[]> {
    const response = await api.get<NegociacaoResponse[]>(
        `/negociacoes/por-cooperativa/${cooperativaId}/status/${statusAtual}`
    );
    return response.data;
}

// GET /negociacoes/{id} 
export async function buscarPorId(id: string): Promise<NegociacaoResponse> {
    const response = await api.get<NegociacaoResponse>(`/negociacoes/${id}`);
    return response.data;
}

// POST /negociacoes
export async function criar(data: NegociacaoRequest): Promise<NegociacaoResponse> {
    const response = await api.post<NegociacaoResponse>("/negociacoes", data);
    return response.data;
}

// POST /negociacoes/{id}/contraproposta 
export async function enviarContraproposta(
    id: string,
    data: ContrapropostaRequest
): Promise<NegociacaoResponse> {
    const response = await api.post<NegociacaoResponse>(`/negociacoes/${id}/contraproposta`, data);
    return response.data;
}

// PATCH /negociacoes/{id}/recusar 
export async function recusar(id: string, data: RecusarNegociacaoRequest): Promise<NegociacaoResponse> {
    const response = await api.patch<NegociacaoResponse>(`/negociacoes/${id}/recusar`, data);
    return response.data;
}

// PATCH /negociacoes/{id}/fechar 
export async function fechar(id: string, data: FecharNegociacaoRequest): Promise<NegociacaoResponse> {
    const response = await api.patch<NegociacaoResponse>(`/negociacoes/${id}/fechar`, data);
    return response.data;
}

// GET /negociacoes/{id}/mensagens 
export async function listarMensagens(id: string): Promise<NegociacaoMensagemResponse[]> {
    const response = await api.get<NegociacaoMensagemResponse[]>(`/negociacoes/${id}/mensagens`);
    return response.data;
}

// POST /negociacoes/{id}/mensagens
export async function enviarMensagem(
    id: string,
    data: NegociacaoMensagemRequest
): Promise<NegociacaoMensagemResponse> {
    const response = await api.post<NegociacaoMensagemResponse>(`/negociacoes/${id}/mensagens`, data);
    return response.data;
}

// POST /negociacoes/itens
export async function adicionarItem(data: NegociacaoItemRequest): Promise<NegociacaoItemResponse> {
    const response = await api.post<NegociacaoItemResponse>("/negociacoes/itens", data);
    return response.data;
}
