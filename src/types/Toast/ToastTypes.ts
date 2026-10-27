export type TipoToast = "sucesso" | "erro"

export interface ToastProps {
    /** Texto exibido. `null` esconde o aviso. */
    mensagem: string | null
    /** Muda a cada novo aviso, para reiniciar o tempo mesmo quando o texto se repete. */
    chave?: number
    tipo?: TipoToast
    onFechar: () => void
    /** Tempo até sumir sozinho, em milissegundos. */
    duracaoMs?: number
}

export interface UseToastResultado {
    mensagem: string | null
    chave: number
    mostrar: (mensagem: string) => void
    fechar: () => void
}
