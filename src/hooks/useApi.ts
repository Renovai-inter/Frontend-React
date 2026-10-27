import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import type { EstadoApi, Requisicao, UseApiResultado } from "../types/UseApi/UseApiTypes"

function extrairMensagem(err: unknown, padrao: string): string {
    if (axios.isAxiosError(err)) {
        return err.response?.data?.mensagem ?? err.response?.data?.message ?? padrao
    }
    return padrao
}

/**
 * Busca dados com loading, erro e cancelamento automático.
 *
 * - `requisicao` deve ter identidade estável (envolva em useCallback com as dependências da chamada);
 *   quando ela muda, a requisição anterior é abortada e uma nova é feita.
 * - Passe `null` para não buscar (ex.: ainda não há cooperativaId).
 * - Ao desmontar o componente, a chamada em andamento é cancelada via AbortController.
 */
export function useApi<T>(
    requisicao: Requisicao<T> | null,
    mensagemErroPadrao = "Não foi possível carregar os dados."
): UseApiResultado<T> {
    const [estado, setEstado] = useState<EstadoApi<T>>({
        dados: null,
        loading: requisicao !== null,
        erro: null,
    })
    const [tentativa, setTentativa] = useState(0)

    useEffect(() => {
        if (!requisicao) {
            setEstado({ dados: null, loading: false, erro: null })
            return
        }

        const controlador = new AbortController()
        setEstado((atual) => ({ ...atual, loading: true, erro: null }))

        requisicao(controlador.signal)
            .then((dados) => setEstado({ dados, loading: false, erro: null }))
            .catch((err: unknown) => {
                // Cancelamento é esperado (troca de página/parâmetro): não vira erro na tela
                if (controlador.signal.aborted || axios.isCancel(err)) return
                setEstado((atual) => ({
                    ...atual,
                    loading: false,
                    erro: extrairMensagem(err, mensagemErroPadrao),
                }))
            })

        return () => controlador.abort()
    }, [requisicao, mensagemErroPadrao, tentativa])

    // useCallback: identidade estável para quem passar `recarregar` como prop/dependência
    const recarregar = useCallback(() => setTentativa((n) => n + 1), [])

    return { ...estado, recarregar }
}
