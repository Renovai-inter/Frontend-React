export type TomPessoa = "gestor" | "cooperado" | "motorista"

export interface PessoaOrganograma {
    id: string
    nome: string
    cargo: string
    tom: TomPessoa
    /** Pessoas afastadas ou inativas aparecem esmaecidas. */
    ativa: boolean
}

export interface OrganogramaProps {
    nomeCooperativa: string
    imagemCooperativa?: string | null
    gestores: PessoaOrganograma[]
    equipe: PessoaOrganograma[]
}
