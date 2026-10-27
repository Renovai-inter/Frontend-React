import type { AuthAction, AuthState, SessaoUsuario } from "../types/Auth/AuthTypes"
import { lerSessao } from "../utils/armazenamentoSessao"

/** Reconstrói a sessão a partir do sessionStorage (mantém o login ao recarregar a aba). */
export function lerSessaoSalva(): SessaoUsuario | null {
    const token = lerSessao("renovai_token")
    const usuarioId = lerSessao("renovai_userId")
    if (!token || !usuarioId) return null

    return {
        token,
        usuarioId,
        role: lerSessao("renovai_role") ?? "",
        email: lerSessao("renovai_email") ?? "",
        cooperativaId: lerSessao("renovai_cooperativaId"),
        funcionarioId: lerSessao("renovai_funcionarioId"),
    }
}

export function estadoInicial(): AuthState {
    const sessao = lerSessaoSalva()
    return { status: sessao ? "autenticado" : "deslogado", sessao, erro: null }
}

/** Reducer puro: o switch é exaustivo, então esquecer uma ação nova gera erro de compilação. */
export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "LOGIN_INICIADO":
            return { ...state, status: "autenticando", erro: null }
        case "LOGIN_SUCESSO":
            return { status: "autenticado", sessao: action.payload, erro: null }
        case "LOGIN_ERRO":
            return { status: "erro", sessao: null, erro: action.payload }
        case "LIMPAR_ERRO":
            return state.erro ? { ...state, status: "deslogado", erro: null } : state
        case "LOGOUT":
            return { status: "deslogado", sessao: null, erro: null }
        default: {
            const _exaustivo: never = action
            return _exaustivo
        }
    }
}
