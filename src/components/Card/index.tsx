import type { CardProps } from "../../types/CardProps"
import "./style.css"

function Card({title, bigNumber, labelBigNumber, labelInfo}: CardProps) {
    return (
        <div className="card">
            <div className="sectionHeader">
                <p className="title">{title}</p>
                <div className="icon">

                </div>
            </div>     
            <div className="sectionBigNumber">
                <span className="bigNumber">{bigNumber}</span>
                {labelBigNumber && <span className="labelBigNumber">{labelBigNumber}</span>}
            </div>
            <p className="labelInfo">{labelInfo}</p>
        </div>
    )
}

export default Card