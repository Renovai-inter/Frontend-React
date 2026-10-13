import type { UsuarioAtualizadoResponse } from "../services/usuarioService"

const EVENTO_PERFIL_ATUALIZADO = "renovai:perfil-atualizado"

// A página de perfil avisa; quem exibe os dados do usuário (ex.: Aside) reage sem nova chamada à API.
export function notificarPerfilAtualizado(dados: UsuarioAtualizadoResponse) {
    window.dispatchEvent(new CustomEvent<UsuarioAtualizadoResponse>(EVENTO_PERFIL_ATUALIZADO, { detail: dados }))
}

// Retorna a função que cancela a inscrição (use como cleanup do useEffect).
export function aoPerfilAtualizado(callback: (dados: UsuarioAtualizadoResponse) => void) {
    const handler = (event: Event) => callback((event as CustomEvent<UsuarioAtualizadoResponse>).detail)
    window.addEventListener(EVENTO_PERFIL_ATUALIZADO, handler)
    return () => window.removeEventListener(EVENTO_PERFIL_ATUALIZADO, handler)
}
