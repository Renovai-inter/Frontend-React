import { logout } from "../services/authService";

const CHAVES_SESSAO = [
    "renovai_token",
    "renovai_role",
    "renovai_email",
    "renovai_userId",
    "renovai_cooperativaId",
    "renovai_funcionarioId",
];

// Faz logout na API e limpa a sessão local, mesmo que a API falhe
export async function encerrarSessao() {
    try {
        await logout();
    } catch {
        // mesmo que a API falhe, encerra a sessão local
    } finally {
        CHAVES_SESSAO.forEach((chave) => localStorage.removeItem(chave));
    }
}
