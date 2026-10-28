import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import type { AuthContextValue } from "../types/Auth/AuthTypes"

/** Acesso ao contexto de autenticação. Só funciona dentro de <AuthProvider>. */
export function useAuth(): AuthContextValue {
    const contexto = useContext(AuthContext)
    if (!contexto) {
        throw new Error("useAuth deve ser usado dentro de <AuthProvider>.")
    }
    return contexto
}
