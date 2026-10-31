import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { NOME_DO_SISTEMA, TITULOS_POR_ROTA } from "../../types/Acessibilidade/RotaTitulo"

function tituloDaRota(pathname: string): string {
    // "/pedidos/123" usa o título de "/pedidos"
    const base = "/" + (pathname.split("/")[1] ?? "")
    return TITULOS_POR_ROTA[base] ?? "Página não encontrada"
}

/**
 * Numa SPA a página nunca recarrega, então o leitor de tela não percebe que a tela mudou
 * e o título da aba ficaria sempre igual (WCAG 2.4.2). Este componente:
 *  1. atualiza o <title> a cada rota;
 *  2. anuncia o nome da nova tela numa região aria-live (exceto no primeiro carregamento).
 */
function AcessibilidadeRota() {
    const { pathname } = useLocation()
    const primeiraRenderizacao = useRef(true)
    const [anuncio, setAnuncio] = useState("")

    useEffect(() => {
        const titulo = tituloDaRota(pathname)
        document.title = `${titulo} | ${NOME_DO_SISTEMA}`

        if (primeiraRenderizacao.current) {
            primeiraRenderizacao.current = false
            return
        }
        setAnuncio(`Página ${titulo}`)
    }, [pathname])

    return (
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {anuncio}
        </div>
    )
}

export default AcessibilidadeRota
