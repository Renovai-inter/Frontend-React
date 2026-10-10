import { logout } from "../services/authService";
import { limparSessao } from "./armazenamentoSessao";

// Faz logout na API e limpa a sessão local, mesmo que a API falhe
export async function encerrarSessao() {
    try {
        await logout();
    } catch {
        // mesmo que a API falhe, encerra a sessão local
    } finally {
        limparSessao();
    }
}
