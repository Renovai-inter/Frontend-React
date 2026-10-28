export type AutorMensagem = "usuario" | "bot"

export interface MensagemChat {
    id: number
    autor: AutorMensagem
    texto: string
    /** Mensagem de falha na chamada: exibida com destaque. */
    erro?: boolean
}
