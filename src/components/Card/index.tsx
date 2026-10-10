import type { CardProps } from "../../types/CardProps/CardProps.tsx"
import "./style.css"

function formatarNumero(valor: number | string) {
    return typeof valor === "number" ? valor.toLocaleString("pt-BR") : valor
}

function Card({ title, bigNumber, labelBigNumber, labelInfo, icon, className }: CardProps) {
    return (
        <article className={className ? `card ${className}` : "card"}>
            <header className="card__header">
                <h3 className="card__title">{title}</h3>
                {icon && (
                    <div className="card__icon" aria-hidden="true">
                        {icon}
                    </div>
                )}
            </header>

            <div className="card__big-number-wrapper">
                <span className="card__big-number">{formatarNumero(bigNumber)}</span>
                {labelBigNumber && (
                    <span className="card__big-number-label">{labelBigNumber}</span>
                )}
            </div>

            {labelInfo && <p className="card__info">{labelInfo}</p>}
        </article>
    )
}

export default Card
