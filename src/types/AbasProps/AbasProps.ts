export interface AbaOpcao<T extends string = string> {
    valor: T
    rotulo: string
}

export interface AbasProps<T extends string = string> {
    opcoes: AbaOpcao<T>[]
    ativa: T
    onChange: (valor: T) => void
    /**
     * Prefixo dos ids. A aba recebe `${idBase}-aba-${valor}` e controla o painel `${idBase}-painel`,
     * que a página precisa renderizar com role="tabpanel" e aria-labelledby apontando para a aba ativa.
     */
    idBase: string
    /** Nome da lista de abas lido pelo leitor de tela. */
    rotulo: string
}
