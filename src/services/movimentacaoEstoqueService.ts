import api from "./api";

export interface MovimentacaoEstoqueResponse {
    movimentacaoId: string;
    estoqueId: string;
    cooperativaId: string;
    cooperativaNome: string;
    materialId: string;
    materialCategoria: string;
    triagemId: string | null;
    itemId: string | null;
    quantidadeKg: number;
    tipoMovimentacao: "ENTRADA" | "SAIDA";
    dataMovimentacao: string;
}

// GET /movimentacoes-estoque/por-cooperativa/{cooperativaId}
export async function listarPorCooperativa(cooperativaId: string): Promise<MovimentacaoEstoqueResponse[]> {
    const response = await api.get<MovimentacaoEstoqueResponse[]>(
        `/movimentacoes-estoque/por-cooperativa/${cooperativaId}`
    );
    return response.data;
}

// GET /movimentacoes-estoque/por-cooperativa/{cooperativaId}/periodo?inicio=&fim=
export async function listarPorCooperativaEPeriodo(
    cooperativaId: string,
    inicio: string,
    fim: string
): Promise<MovimentacaoEstoqueResponse[]> {
    const response = await api.get<MovimentacaoEstoqueResponse[]>(
        `/movimentacoes-estoque/por-cooperativa/${cooperativaId}/periodo`,
        { params: { inicio, fim } }
    );
    return response.data;
}

// GET /movimentacoes-estoque/por-cooperativa/{cooperativaId}/entradas
export async function listarEntradas(cooperativaId: string): Promise<MovimentacaoEstoqueResponse[]> {
    const response = await api.get<MovimentacaoEstoqueResponse[]>(
        `/movimentacoes-estoque/por-cooperativa/${cooperativaId}/entradas`
    );
    return response.data;
}

// GET /movimentacoes-estoque/por-cooperativa/{cooperativaId}/saidas
export async function listarSaidas(cooperativaId: string): Promise<MovimentacaoEstoqueResponse[]> {
    const response = await api.get<MovimentacaoEstoqueResponse[]>(
        `/movimentacoes-estoque/por-cooperativa/${cooperativaId}/saidas`
    );
    return response.data;
}

// GET /movimentacoes-estoque/por-estoque/{estoqueId}
export async function listarPorEstoque(estoqueId: string): Promise<MovimentacaoEstoqueResponse[]> {
    const response = await api.get<MovimentacaoEstoqueResponse[]>(
        `/movimentacoes-estoque/por-estoque/${estoqueId}`
    );
    return response.data;
}

// GET /movimentacoes-estoque/{id}
export async function buscarPorId(id: string): Promise<MovimentacaoEstoqueResponse> {
    const response = await api.get<MovimentacaoEstoqueResponse>(`/movimentacoes-estoque/${id}`);
    return response.data;
}
