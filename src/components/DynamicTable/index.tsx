import type { ReactNode } from "react"
import "./style.css"

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
    /** Mostra a coluna "Excluir". Também é exibida automaticamente se `onDelete` for informado. */
    isDeletable?: boolean
    /** Mostra a coluna "Editar". Também é exibida automaticamente se `onEdit` for informado. */
    isEditable?: boolean
    onEdit?: (row: T) => void
    onDelete?: (row: T) => void
    /** Define a chave única da linha (ex.: row => row.id). Por padrão usa o índice. */
    rowKey?: (row: T, index: number) => string | number
    emptyMessage?: string
}

function formatarCelula(valor: unknown): ReactNode {
    if (valor === null || valor === undefined || valor === "") return "—"
    if (typeof valor === "boolean") return valor ? "Sim" : "Não"
    return String(valor)
}

function DynamicTable<T>({
    titulo,
    acaoTitulo,
    columns,
    data,
    isDeletable = false,
    isEditable = false,
    onEdit,
    onDelete,
    rowKey,
    emptyMessage = "Nenhum registro encontrado.",
}: DynamicTableProps<T>) {
    const mostrarExcluir = isDeletable || !!onDelete
    const mostrarEditar = isEditable || !!onEdit
    const totalColunas =
        columns.length + (mostrarExcluir ? 1 : 0) + (mostrarEditar ? 1 : 0)

    return (
        <section className="dynamic-table-container">
            {(titulo || acaoTitulo) && (
                <div className="dynamic-table__header">
                    {titulo && <h3 className="dynamic-table__title">{titulo}</h3>}
                    {acaoTitulo}
                </div>
            )}

            <div className={titulo ? "dynamic-table" : "dynamic-table dynamic-table--no-title"}>
                <table>
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th scope="col" key={String(column.key)}>
                                    {column.label}
                                </th>
                            ))}
                            {mostrarEditar && (
                                <th scope="col" className="dynamic-table__actions">
                                    <span className="sr-only">Editar</span>
                                </th>
                            )}
                            {mostrarExcluir && (
                                <th scope="col" className="dynamic-table__actions">
                                    <span className="sr-only">Excluir</span>
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td className="dynamic-table__empty" colSpan={totalColunas || 1}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr key={rowKey ? rowKey(row, index) : index}>
                                    {columns.map((column) => (
                                        <td key={String(column.key)}>
                                            {column.render
                                                ? column.render(row)
                                                : formatarCelula(row[column.key])}
                                        </td>
                                    ))}

                                    {mostrarEditar && (
                                        <td className="dynamic-table__actions">
                                            <button
                                                type="button"
                                                className="dynamic-table__action dynamic-table__action--edit"
                                                onClick={() => onEdit?.(row)}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    )}

                                    {mostrarExcluir && (
                                        <td className="dynamic-table__actions">
                                            <button
                                                type="button"
                                                className="dynamic-table__action dynamic-table__action--delete"
                                                onClick={() => onDelete?.(row)}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default DynamicTable
