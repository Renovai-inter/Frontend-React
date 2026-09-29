import api from "./api";

export interface CargoRequest {
    cargo: string;
}

export interface CargoResponse {
    cargoId: string;
    cargo: string;
}

// GET /cargos
export async function listar(): Promise<CargoResponse[]> {
    const response = await api.get<CargoResponse[]>("/cargos");
    return response.data;
}

// GET /cargos/{id}
export async function buscarPorId(id: string): Promise<CargoResponse> {
    const response = await api.get<CargoResponse>(`/cargos/${id}`);
    return response.data;
}

// POST /cargos — requer ADMIN_SITE ou ADMIN_COOPERATIVA
export async function criar(data: CargoRequest): Promise<CargoResponse> {
    const response = await api.post<CargoResponse>("/cargos", data);
    return response.data;
}

// PUT /cargos/{id} — requer ADMIN_SITE ou ADMIN_COOPERATIVA
export async function atualizar(id: string, data: CargoRequest): Promise<CargoResponse> {
    const response = await api.put<CargoResponse>(`/cargos/${id}`, data);
    return response.data;
}

// DELETE /cargos/{id} — requer ADMIN_SITE
export async function deletar(id: string): Promise<void> {
    await api.delete<void>(`/cargos/${id}`);
}
