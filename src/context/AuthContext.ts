import { createContext } from "react"
import type { AuthContextValue } from "../types/Auth/AuthTypes"

// null = fora do Provider; o hook useAuth() avisa se isso acontecer
export const AuthContext = createContext<AuthContextValue | null>(null)
