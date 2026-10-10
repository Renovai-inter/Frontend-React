import type { ButtonHTMLAttributes, ReactNode } from "react"

export interface BotaoProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
    ativo?: boolean
    variante?: "primario" | "secundario"
    children: ReactNode
}
