import { useCallback, useMemo, useReducer, type ReactNode } from "react"
import axios from "axios"
import { AuthContext } from "./AuthContext"
import { authReducer, estadoInicial } from "./authReducer"
import { login } from "../services/authService"
import { buscarPorUserId } from "../services/funcionarioService"
import { removerSessao, salvarSessao } from "../utils/armazenamentoSessao"
import { encerrarSessao } from "../utils/sessao"
import type { AuthContextValue, SessaoUsuario } from "../types/Auth/AuthTypes"

/** Grava a sessão no sessionStorage: o interceptor do axios e as páginas leem de lá. */
function persistirSessao(sessao: SessaoUsuario) {
    salvarSessao("renovai_token", sessao.token)
    salvarSessao("renovai_role", sessao.role)
    salvarSessao("renovai_email", sessao.email)
    salvarSessao("renovai_userId", sessao.usuarioId)

    if (sessao.cooperativaId) salvarSessao("renovai_cooperativaId", sessao.cooperativaId)
    else removerSessao("renovai_cooperativaId")

    if (sessao.funcionarioId) salvarSessao("renovai_funcionarioId", sessao.funcionarioId)
    else removerSessao("renovai_funcionarioId")
}

function mensagemDeErroLogin(err: unknown): string {
    if (axios.isAxiosError(err) && err.response) {
        return err.response.data?.message ?? err.response.data?.erro ?? "E-mail ou senha inválidos."
    }
    return "Não foi possível conectar ao servidor. Tente novamente."
}

export function AuthProvider({ children }: { children: ReactNode }) {
    // Inicializador preguiçoso: lê o sessionStorage uma única vez
    const [state, dispatch] = useReducer(authReducer, undefined, estadoInicial)

    // useCallback: estas funções vão dentro do value do Context; com identidade estável, os
    // consumidores (Login, Aside, Error) não re-renderizam sem necessidade a cada render do Provider.
    const entrar = useCallback(async (email: string, senha: string) => {
        dispatch({ type: "LOGIN_INICIADO" })
        try {
            const resposta = await login({ email, senha })
            // O token precisa estar salvo antes da próxima chamada, pois o axios o lê do sessionStorage
            salvarSessao("renovai_token", resposta.token)

            let cooperativaId: string | null = null
            let funcionarioId: string | null = null
            try {
                const funcionario = await buscarPorUserId(resposta.usuarioId)
                cooperativaId = funcionario.cooperativaId
                funcionarioId = funcionario.funcionarioId
            } catch {
                // sem vínculo de funcionário: segue logado, as páginas tratam a ausência
            }

            const sessao: SessaoUsuario = {
                token: resposta.token,
                role: resposta.role,
                email: resposta.email,
                usuarioId: resposta.usuarioId,
                cooperativaId,
                funcionarioId,
            }
            persistirSessao(sessao)
            dispatch({ type: "LOGIN_SUCESSO", payload: sessao })
            return true
        } catch (err) {
            removerSessao("renovai_token")
            dispatch({ type: "LOGIN_ERRO", payload: mensagemDeErroLogin(err) })
            return false
        }
    }, [])

    const iniciarSessao = useCallback((sessao: SessaoUsuario) => {
        persistirSessao(sessao)
        dispatch({ type: "LOGIN_SUCESSO", payload: sessao })
    }, [])

    const sair = useCallback(async () => {
        await encerrarSessao() // logout na API + limpa o sessionStorage
        dispatch({ type: "LOGOUT" })
    }, [])

    const limparErro = useCallback(() => dispatch({ type: "LIMPAR_ERRO" }), [])

    // useMemo: o objeto do value só muda quando o estado muda; sem isso, um novo objeto a cada render
    // do Provider forçaria todos os consumidores do Context a re-renderizar.
    const value = useMemo<AuthContextValue>(
        () => ({
            status: state.status,
            sessao: state.sessao,
            erro: state.erro,
            autenticado: state.status === "autenticado",
            entrar,
            iniciarSessao,
            sair,
            limparErro,
        }),
        [state, entrar, iniciarSessao, sair, limparErro]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
