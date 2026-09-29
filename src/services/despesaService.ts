import api from "./api";

export interface DespesaRequest {
    cooperativaId: string;
    nome: string;
    tipoDespesa: "FIXA" | "VARIAVEL";
    estaAtiva?: boolean;
}

export interface DespesaResponse {
    despesaId: string;
    cooperativaId: string;
    cooperativaNome: string;
    nome: string;
    tipoDespesa: string;
    estaAtiva: boolean;
}

export interface LancamentoDespesaRequest {
    despesaId: string;
    valor: number;
    mesReferencia: string; // YYYY-MM-DD
}

export interface LancamentoDespesaResponse {
    lancamentoId: string;
    despesaId: string;
    despesaNome: string;
    tipoDespesa: string;
    valor: number;
    mesReferencia: string;
    dataLancamento: string;
}

export interface TotalDespesasMesResponse {
    mesReferencia: string;
    totalFixas: number;
    totalVariaveis: number;
    totalGeral: number;
}

// GET /despesas/por-cooperativa/{cooperativaId}
export async function listarPorCooperativa(cooperativaId: string): Promise<DespesaResponse[]> {
    const response = await api.get<DespesaResponse[]>(`/despesas/por-cooperativa/${cooperativaId}`);
    return response.data;
}

// GET /despesas/ativas/por-cooperativa/{cooperativaId}
export async function listarAtivasPorCooperativa(cooperativaId: string): Promise<DespesaResponse[]> {
    const response = await api.get<DespesaResponse[]>(
        `/despesas/ativas/por-cooperativa/${cooperativaId}`
    );
    return response.data;
}

// GET /despesas/{id}
export async function buscarPorId(id: string): Promise<DespesaResponse> {
    const response = await api.get<DespesaResponse>(`/despesas/${id}`);
    return response.data;
}

// POST /despesas
export async function criar(data: DespesaRequest): Promise<DespesaResponse> {
    const response = await api.post<DespesaResponse>("/despesas", data);
    return response.data;
}

// PUT /despesas/{id}
export async function atualizar(id: string, data: DespesaRequest): Promise<DespesaResponse> {
    const response = await api.put<DespesaResponse>(`/despesas/${id}`, data);
    return response.data;
}

// DELETE /despesas/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/despesas/${id}`);
}

// GET /despesas/{despesaId}/lancamentos
export async function listarLancamentos(despesaId: string): Promise<LancamentoDespesaResponse[]> {
    const response = await api.get<LancamentoDespesaResponse[]>(`/despesas/${despesaId}/lancamentos`);
    return response.data;
}

// GET /despesas/lancamentos/por-cooperativa/{cooperativaId}/mes/{mesReferencia} 
export async function listarLancamentosPorMes(
    cooperativaId: string,
    mesReferencia: string
): Promise<LancamentoDespesaResponse[]> {
    const response = await api.get<LancamentoDespesaResponse[]>(
        `/despesas/lancamentos/por-cooperativa/${cooperativaId}/mes/${mesReferencia}`
    );
    return response.data;
}

// GET /despesas/lancamentos/total/por-cooperativa/{cooperativaId}/mes/{mesReferencia} 
export async function totalDoMes(
    cooperativaId: string,
    mesReferencia: string
): Promise<TotalDespesasMesResponse> {
    const response = await api.get<TotalDespesasMesResponse>(
        `/despesas/lancamentos/total/por-cooperativa/${cooperativaId}/mes/${mesReferencia}`
    );
    return response.data;
}

// POST /despesas/lancamentos
export async function lancar(data: LancamentoDespesaRequest): Promise<LancamentoDespesaResponse> {
    const response = await api.post<LancamentoDespesaResponse>("/despesas/lancamentos", data);
    return response.data;
}

// DELETE /despesas/lancamentos/{id}
export async function deletarLancamento(id: string): Promise<void> {
    await api.delete<void>(`/despesas/lancamentos/${id}`);
}
