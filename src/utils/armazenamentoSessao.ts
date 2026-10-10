
export const CHAVES_SESSAO = [
    "renovai_token",
    "renovai_role",
    "renovai_email",
    "renovai_userId",
    "renovai_cooperativaId",
    "renovai_funcionarioId",
] as const;

export type ChaveSessao = (typeof CHAVES_SESSAO)[number];

export function lerSessao(chave: ChaveSessao): string | null {
    return sessionStorage.getItem(chave);
}

export function salvarSessao(chave: ChaveSessao, valor: string) {
    sessionStorage.setItem(chave, valor);
}

export function removerSessao(chave: ChaveSessao) {
    sessionStorage.removeItem(chave);
}

export function limparSessao() {
    CHAVES_SESSAO.forEach((chave) => sessionStorage.removeItem(chave));
}

// Versões anteriores guardavam o token em localStorage, que sobrevive ao fechamento da aba.
// Remove esses restos para que um login antigo não continue valendo.
CHAVES_SESSAO.forEach((chave) => localStorage.removeItem(chave));
