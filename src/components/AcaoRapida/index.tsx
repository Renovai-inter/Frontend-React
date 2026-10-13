import type { AcaoRapidaProps } from "../../types/AcaoRapidaProps/AcaoRapidaProps"
import "./style.css"

function AcaoRapida({ children, className, type = "button", ...rest }: AcaoRapidaProps) {
    return (
        <button type={type} className={className ? `acao-rapida ${className}` : "acao-rapida"} {...rest}>
            {children}
        </button>
    )
}

export default AcaoRapida
