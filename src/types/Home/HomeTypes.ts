export interface LinhaColeta {
    id: string
    cooperado: string
    material: string
    peso: string
    status: string
}

export interface Resumo {
    nomeCooperativa: string
    coletasNoMes: number | null
    estoqueDisponivelKg: number | null
    cooperadosAtivos: number | null
    triagensPendentes: number | null
    ultimasColetas: LinhaColeta[] | null
    estoquePorMaterial: { rotulo: string; valor: number }[]
}
