import api from "./api";

export interface FuncionarioRequest {
    usuarioId: string;
    cargoId: string;
    cooperativaId: string;
}

export interface FuncionarioResponse {
    funcionarioId: string;
    usuarioId: string;
    usuarioNome: string;
    cargoId: string;
    cargo: string;
    cooperativaId: string;
    cooperativaNome: string;
    estaAtivo: boolean;
    statusFuncionario: "ATIVO" | "AFASTADO" | "INATIVO";
}

export interface PreCadastroRequest {
    nome: string;
    cpf: string;
    senhaTemporaria: string;
    cargoId?: string;
    cooperativaId: string;
}

export interface PreCadastroIncompletoResponse {
    funcionarioId: string;
    usuarioId: string;
    usuarioNome: string;
    cpf: string;
    cooperativaId: string;
    cooperativaNome: string;
    cargoAtribuido: string;
    temEmailCompleto: boolean;
    dataAdmissao: string;
}

// GET /funcionarios
export async function listarTodos(): Promise<FuncionarioResponse[]> {
    const response = await api.get<FuncionarioResponse[]>("/funcionarios");
    return response.data;
}

// GET /funcionarios/ativos
export async function listarAtivos(): Promise<FuncionarioResponse[]> {
    const response = await api.get<FuncionarioResponse[]>("/funcionarios/ativos");
    return response.data;
}

// GET /funcionarios/por-cargo/{cargo}
export async function listarPorCargo(cargo: string): Promise<FuncionarioResponse[]> {
    const response = await api.get<FuncionarioResponse[]>(`/funcionarios/por-cargo/${cargo}`);
    return response.data;
}

// GET /funcionarios/por-cooperativa/{cooperativaId}
export async function listarPorCooperativa(cooperativaId: string): Promise<FuncionarioResponse[]> {
    const response = await api.get<FuncionarioResponse[]>(`/funcionarios/por-cooperativa/${cooperativaId}`);
    return response.data;
}

// GET /funcionarios/motoristas/por-cooperativa/{cooperativaId} 
export async function listarMotoristasPorCooperativa(cooperativaId: string): Promise<FuncionarioResponse[]> {
    const response = await api.get<FuncionarioResponse[]>(
        `/funcionarios/motoristas/por-cooperativa/${cooperativaId}`
    );
    return response.data;
}

// GET /funcionarios/por-cooperativa/{cooperativaId}/por-status/{status}
export async function listarPorCooperativaEStatus(
    cooperativaId: string,
    status: string
): Promise<FuncionarioResponse[]> {
    const response = await api.get<FuncionarioResponse[]>(
        `/funcionarios/por-cooperativa/${cooperativaId}/por-status/${status}`
    );
    return response.data;
}

// GET /funcionarios/pre-cadastro/incompletos
export async function listarComPreCadastroIncompleto(): Promise<PreCadastroIncompletoResponse[]> {
    const response = await api.get<PreCadastroIncompletoResponse[]>("/funcionarios/pre-cadastro/incompletos");
    return response.data;
}

// GET /funcionarios/pre-cadastro/incompletos/por-cooperativa/{cooperativaId}
export async function listarComPreCadastroIncompletoByCooperativa(
    cooperativaId: string
): Promise<PreCadastroIncompletoResponse[]> {
    const response = await api.get<PreCadastroIncompletoResponse[]>(
        `/funcionarios/pre-cadastro/incompletos/por-cooperativa/${cooperativaId}`
    );
    return response.data;
}

// GET /funcionarios/{id}
export async function buscarPorId(id: string): Promise<FuncionarioResponse> {
    const response = await api.get<FuncionarioResponse>(`/funcionarios/${id}`);
    return response.data;
}

// GET /funcionarios/por-usuario/{userId}
export async function buscarPorUserId(userId: string): Promise<FuncionarioResponse>{
    const response = await api.get<FuncionarioResponse>(`/fucionarios/por-usuario/${userId}`);
    return response.data;
}

// POST /funcionarios
export async function criar(data: FuncionarioRequest): Promise<FuncionarioResponse> {
    const response = await api.post<FuncionarioResponse>("/funcionarios", data);
    return response.data;
}

// POST /funcionarios/pre-cadastro 
export async function preCadastro(data: PreCadastroRequest): Promise<FuncionarioResponse> {
    const response = await api.post<FuncionarioResponse>("/funcionarios/pre-cadastro", data);
    return response.data;
}

// PUT /funcionarios/{id}/cargo/{cargoId}
export async function atualizarCargo(id: string, cargoId: string): Promise<FuncionarioResponse> {
    const response = await api.put<FuncionarioResponse>(`/funcionarios/${id}/cargo/${cargoId}`);
    return response.data;
}

// PUT /funcionarios/{id}/desativar
export async function desativar(id: string): Promise<FuncionarioResponse> {
    const response = await api.put<FuncionarioResponse>(`/funcionarios/${id}/desativar`);
    return response.data;
}

// PUT /funcionarios/{id}/afastar
export async function afastar(id: string): Promise<FuncionarioResponse> {
    const response = await api.put<FuncionarioResponse>(`/funcionarios/${id}/afastar`);
    return response.data;
}

// PUT /funcionarios/{id}/reativar
export async function reativar(id: string): Promise<FuncionarioResponse> {
    const response = await api.put<FuncionarioResponse>(`/funcionarios/${id}/reativar`);
    return response.data;
}

// DELETE /funcionarios/{id}
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/funcionarios/${id}`);
}
