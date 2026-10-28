import type { FuncionarioResponse } from "../../services/funcionarioService"

export type Visao = "organograma" | "lista"

export type Status = FuncionarioResponse["statusFuncionario"]
