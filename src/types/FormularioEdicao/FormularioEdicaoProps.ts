export interface CampoFormulario {
    nome: string
    rotulo: string
    /** "imagem" abre o seletor de arquivos do computador; o valor vira um data URL. */
    tipo?: "text" | "date" | "email" | "url" | "password" | "imagem" | "selecao"
    /** Opções do tipo "selecao". Abre um dropdown com as opções.*/
    opcoes?: { valor: string; rotulo: string }[]
    placeholder?: string
    obrigatorio?: boolean
    /** Formata o texto enquanto o usuário digita (ex.: mascaraCpf). */
    mascara?: (valor: string) => string
    /** Retorna a mensagem de erro, ou undefined se o valor for válido. */
    validar?: (valor: string) => string | undefined
}

export type ValoresFormulario = Record<string, string>

export interface FormularioEdicaoProps {
    aberto: boolean
    titulo: string
    campos: CampoFormulario[]
    /** Dados já existentes; campos sem valor começam em branco. */
    valoresIniciais: Partial<Record<string, string | null>>
    onSalvar: (valores: ValoresFormulario) => Promise<void>
    onFechar: () => void
    textoSalvar?: string
}
