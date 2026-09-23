import './style.css'

interface DynamicTableProps<T> {
    titulo: string;
    columns: {
        key: keyof T;
        label: string;
    }[];
    data: T[];
    isDeletable: boolean;
    isEditable: boolean;
}

function DynamicTable<T>(tabelaProps: DynamicTableProps<T>) {
    return (
        <div className="dinamic-table-container">

            <h3 className="titulo">
                {tabelaProps.titulo}
            </h3>

            <div className="dinamic-table">
                <table>
                    <thead>
                        <tr>
                            {tabelaProps.columns.map((column) => (
                                <th key={String(column.key)}>
                                    {column.label}
                                </th>
                            ))}

                            {tabelaProps.isDeletable && (
                                <th className="acoes-tabela"></th>
                            )}

                            {tabelaProps.isEditable && (
                                <th className="acoes-tabela"></th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {tabelaProps.data.map((row, index) => (
                            <tr key={index}>
                                {tabelaProps.columns.map((column) => (
                                    <td key={String(column.key)}>
                                        {String(row[column.key])}
                                    </td>
                                ))}

                                {tabelaProps.isDeletable && (
                                    <td className="acoes-tabela">
                                        Excluir
                                    </td>
                                )}

                                {tabelaProps.isEditable && (
                                    <td className="acoes-tabela">
                                        Editar
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default DynamicTable