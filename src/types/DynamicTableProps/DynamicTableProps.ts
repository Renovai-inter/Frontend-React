import type { ReactNode } from "react"

export interface DynamicTableColumn<T> {
    key: keyof T
    label: string
    /** Renderização customizada da célula (ex.: badge de status, data formatada). */
    render?: (row: T) => ReactNode
}

export interface DynamicTableProps<T> {
    titulo?: string
    /** Conteúdo alinhado à direita do título (ex.: link "Ver todas"). */
    acaoTitulo?: ReactNode
    columns: DynamicTableColumn<T>[]
    data: T[]
    isDeletable?: boolean
    isEditable?: boolean
    onEdit?: (row: T) => void
    onDelete?: (row: T) => void
    rowKey?: (row: T, index: number) => string | number
    emptyMessage?: string
}
