export interface LinhaEstoque {
    estoqueId: string
    materialId: string
    material: string
    quantidadeKg: number
    precoSugerido: number | null
    valorTotal: number | null
    disponivel: boolean
    atualizadoEm: string
}
