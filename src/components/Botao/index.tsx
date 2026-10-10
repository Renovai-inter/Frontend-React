import type { BotaoProps } from "../../types/BotaoProps/BotaoProps.ts"
import "./style.css"

function Botao({
    ativo = true,
    variante = "primario",
    type = "button",
    className,
    children,
    ...rest
}: BotaoProps) {
    const classes = ["botao", `botao--${variante}`, className].filter(Boolean).join(" ")

    return (
        <button type={type} className={classes} disabled={!ativo} {...rest}>
            {children}
        </button>
    )
}

export default Botao
