import type { GraficoBarrasProps } from "../../types/GraficoBarrasProps/GraficoBarrasProps"
import "./style.css"
import { formatarDecimal } from "../../utils/formatadores"

function GraficoBarras({
    titulo,
    subtitulo,
    dados,
    unidade = "kg",
    rotuloTotal,
    className,
}: GraficoBarrasProps) {
    const maior = Math.max(...dados.map((d) => d.valor), 0)
    const total = dados.reduce((soma, d) => soma + d.valor, 0)
    const formatar = (valor: number) => `${formatarDecimal(valor)}${unidade}`

    return (
        <article className={className ? `grafico-barras ${className}` : "grafico-barras"}>
            <header className="grafico-barras__header">
                <h3 className="grafico-barras__titulo">{titulo}</h3>
                {subtitulo && <p className="grafico-barras__subtitulo">{subtitulo}</p>}
            </header>

            {dados.length === 0 ? (
                <p className="grafico-barras__vazio">Nenhum dado para exibir.</p>
            ) : (
                <ul className="grafico-barras__colunas">
                    {dados.map(({ rotulo, valor }) => (
                        <li className="grafico-barras__coluna" key={rotulo}>
                            <div className="grafico-barras__area">
                                <div
                                    className="grafico-barras__barra"
                                    style={{ height: `${maior > 0 ? (valor / maior) * 100 : 0}%` }}
                                />
                            </div>
                            <span className="grafico-barras__rotulo">{rotulo}</span>
                            <span className="grafico-barras__valor">{formatar(valor)}</span>
                        </li>
                    ))}
                </ul>
            )}

            {rotuloTotal && (
                <footer className="grafico-barras__total">
                    <span>{rotuloTotal}</span>
                    <strong>{formatar(total)}</strong>
                </footer>
            )}
        </article>
    )
}

export default GraficoBarras
