import "./style.css"
import { useRef, type KeyboardEvent } from "react"
import type { AbasProps } from "../../types/AbasProps/AbasProps"

/**
 * Abas no padrão WAI-ARIA "Tabs":
 *  - só a aba ativa entra na ordem de Tab (roving tabindex); as outras são alcançadas pelas setas;
 *  - ← e → trocam de aba (com volta ao fim/início), Home e End vão para a primeira e a última;
 *  - cada aba aponta para o painel que controla (aria-controls).
 */
function Abas<T extends string>({ opcoes, ativa, onChange, idBase, rotulo }: AbasProps<T>) {
    const botoes = useRef<Record<string, HTMLButtonElement | null>>({})

    function aoTeclar(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
        const total = opcoes.length
        let destino = -1
        if (evento.key === "ArrowRight") destino = (indice + 1) % total
        else if (evento.key === "ArrowLeft") destino = (indice - 1 + total) % total
        else if (evento.key === "Home") destino = 0
        else if (evento.key === "End") destino = total - 1
        if (destino < 0) return

        evento.preventDefault()
        const alvo = opcoes[destino]
        onChange(alvo.valor)
        botoes.current[alvo.valor]?.focus()
    }

    return (
        <div className="abas" role="tablist" aria-label={rotulo}>
            {opcoes.map((opcao, indice) => {
                const selecionada = opcao.valor === ativa
                return (
                    <button
                        key={opcao.valor}
                        ref={(no) => {
                            botoes.current[opcao.valor] = no
                        }}
                        id={`${idBase}-aba-${opcao.valor}`}
                        type="button"
                        role="tab"
                        aria-selected={selecionada}
                        aria-controls={`${idBase}-painel`}
                        tabIndex={selecionada ? 0 : -1}
                        className={`abas__aba${selecionada ? " abas__aba--ativa" : ""}`}
                        onClick={() => onChange(opcao.valor)}
                        onKeyDown={(evento) => aoTeclar(evento, indice)}
                    >
                        {opcao.rotulo}
                    </button>
                )
            })}
        </div>
    )
}

export default Abas
