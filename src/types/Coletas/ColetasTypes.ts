import type { TriagemResponse } from "../../services/triagemService"

export interface LinhaColeta {
    coletaId: string
    cooperado: string
    status: string
    quantidadeKg: number
    tipo: string
    dataColeta: string
    rota: string
    materiais: TriagemResponse[]
}
