import type { NavigateFunction } from "react-router-dom";

export interface ErroInfo {
    /** status HTTP; ausente quando não houve resposta (ex: servidor fora do ar) */
    status?: number;
    /** mensagem vinda da API*/
    mensagem?: string;
}

// Permite que código fora do React (ex: interceptor do axios) navegue sem recarregar a página
let navegar: NavigateFunction | null = null;

export function registrarNavegacao(fn: NavigateFunction | null) {
    navegar = fn;
}

export function redirecionarParaErro(erro: ErroInfo) {
    if (window.location.pathname === "/error") return;

    if (navegar) {
        navegar("/error", { replace: true, state: erro });
    } else {
        window.location.assign("/error");
    }
}
