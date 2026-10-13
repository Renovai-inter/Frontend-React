import type { ReactNode } from "react"

export interface CardProps {
    /** Título do card (exibido em maiúsculas). */
    title: string
    bigNumber: number | string
    /** Frase pequena em verde abaixo do número (ex.: "atualizado agora"). */
    subtitle?: string
    labelBigNumber?: string
    /** passar o icone ai, da pra ser svg */
    icon?: ReactNode
    className?: string
}
