export interface LinhaPedido {
    negociacaoId: string
    pedidoId: string
    empresa: string
    status: string
    valorTotal: number
    dataInicio: string
    dataFechamento: string
    itens: string
}

export interface MensagemChat {
    mensagemId: string
    autor: "empresa" | "cooperativa"
    remetente: string
    texto: string
    tipo: string
    dataEnvio: string
}

export interface EstadoChat {
    pedido: LinhaPedido | null
    mensagens: MensagemChat[]
    carregando: boolean
    erro: string | null
}
