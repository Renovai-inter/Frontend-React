export interface AbaOpcao<T extends string = string> {
    valor: T
    rotulo: string
}

export interface AbasProps<T extends string = string> {
    opcoes: AbaOpcao<T>[]
    ativa: T
    onChange: (valor: T) => void
}
