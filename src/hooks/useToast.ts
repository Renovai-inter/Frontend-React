import { useCallback, useState } from "react"
import type { UseToastResultado } from "../types/Toast/ToastTypes"

/** Controla o aviso de sucesso: `mostrar("Salvo!")` exibe o <Toast />, `fechar()` esconde. */
export function useToast(): UseToastResultado {
    const [aviso, setAviso] = useState<{ mensagem: string; chave: number } | null>(null)

    // useCallback: identidade estável, para poder usar `fechar` como dependência do useEffect do <Toast />
    // sem reiniciar o temporizador a cada render da página.
    const mostrar = useCallback((mensagem: string) => {
        setAviso((atual) => ({ mensagem, chave: (atual?.chave ?? 0) + 1 }))
    }, [])
    const fechar = useCallback(() => setAviso(null), [])

    return { mensagem: aviso?.mensagem ?? null, chave: aviso?.chave ?? 0, mostrar, fechar }
}
