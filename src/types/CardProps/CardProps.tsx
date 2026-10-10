import type { ReactNode } from "react"

export interface CardProps {
    title: string
    bigNumber: number | string
    labelBigNumber?: string
    labelInfo?: string
    /** passar o icone ai, da pra ser svg */
    icon?: ReactNode
    className?: string
}
