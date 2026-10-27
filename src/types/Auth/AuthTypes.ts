/** Dados da sessão do usuário logado (espelham as chaves guardadas em sessionStorage). */
export interface SessaoUsuario {
    token: string
    role: string
    email: string
    usuarioId: string
    cooperativaId: string | null
    funcionarioId: string | null
}

/** Ciclo de vida da autenticação. */
export type StatusAuth = "deslogado" | "autenticando" | "autenticado" | "erro"

export interface AuthState {
    status: StatusAuth
    sessao: SessaoUsuario | null
    erro: string | null
}

/** Todas as ações possíveis do reducer de autenticação (union discriminada pelo campo `type`). */
export type AuthAction =
    | { type: "LOGIN_INICIADO" }
    | { type: "LOGIN_SUCESSO"; payload: SessaoUsuario }
    | { type: "LOGIN_ERRO"; payload: string }
    | { type: "LIMPAR_ERRO" }
    | { type: "LOGOUT" }

export interface AuthContextValue {
    status: StatusAuth
    sessao: SessaoUsuario | null
    erro: string | null
    autenticado: boolean
    /** Faz login na API e guarda a sessão. Retorna true em caso de sucesso. */
    entrar: (email: string, senha: string) => Promise<boolean>
    /** Registra uma sessão já obtida (ex.: depois do cadastro da cooperativa). */
    iniciarSessao: (sessao: SessaoUsuario) => void
    /** Faz logout na API e limpa a sessão local. */
    sair: () => Promise<void>
    limparErro: () => void
}
