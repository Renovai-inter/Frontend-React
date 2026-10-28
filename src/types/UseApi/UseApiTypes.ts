/** Função que faz a chamada HTTP; recebe o signal para que o hook consiga cancelá-la. */
export type Requisicao<T> = (signal: AbortSignal) => Promise<T>

export interface EstadoApi<T> {
    dados: T | null
    loading: boolean
    erro: string | null
}

export interface UseApiResultado<T> extends EstadoApi<T> {
    /** Refaz a requisição (ex.: botão "Tentar novamente"). */
    recarregar: () => void
}
