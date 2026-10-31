import type { CardProps } from "../../types/CardProps/CardProps.tsx"
import "./style.css"

function formatarNumero(valor: number | string) {
    return typeof valor === "number"
        ? valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : valor
}

function Card({ title, bigNumber, subtitle, labelBigNumber, icon, className }: CardProps) {
    return (
        <article className={className ? `card ${className}` : "card"}>
            <header className="card__header">
                <h2 className="card__title">{title}</h2>
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

            {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </article>
    )
}

export default Card
