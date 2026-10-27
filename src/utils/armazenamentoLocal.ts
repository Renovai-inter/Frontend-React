/**
 * Preferências da interface guardadas em localStorage, com schema versionado.
 *
 * O objeto salvo sempre carrega `_versao`. Se o formato mudar no futuro, basta subir
 * VERSAO_ATUAL e tratar a versão antiga em `migrar()`; dados de outra versão ou corrompidos
 * nunca quebram a aplicação (voltam para os valores padrão).
 */
export const VERSAO_ATUAL = 1;

const CHAVE_PREFERENCIAS = "renovai_preferencias";
// Formato antigo (v0): um valor solto "true"/"false" em uma chave própria
const CHAVE_LEGADA_ASIDE = "renovai_aside_retraido";

export interface PreferenciasUsuario {
    _versao: typeof VERSAO_ATUAL;
    /** null = o usuário nunca escolheu; cada tela aplica o seu padrão. */
    asideRetraido: boolean | null;
}

const PADRAO: PreferenciasUsuario = { _versao: VERSAO_ATUAL, asideRetraido: null };

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/** Converte qualquer versão conhecida para a atual. Retorna null se não reconhecer o formato. */
function migrar(bruto: unknown): PreferenciasUsuario | null {
    if (!ehObjeto(bruto)) return null;

    if (bruto._versao === VERSAO_ATUAL) {
        return {
            _versao: VERSAO_ATUAL,
            asideRetraido: typeof bruto.asideRetraido === "boolean" ? bruto.asideRetraido : null,
        };
    }
    return null; // versão desconhecida: descarta
}

export function lerPreferencias(): PreferenciasUsuario {
    try {
        const texto = localStorage.getItem(CHAVE_PREFERENCIAS);
        if (texto) {
            const migrado = migrar(JSON.parse(texto));
            if (migrado) return migrado;
        }

        // Aproveita o valor do formato antigo uma única vez e já o converte para o novo
        const legado = localStorage.getItem(CHAVE_LEGADA_ASIDE);
        if (legado === "true" || legado === "false") {
            const convertido: PreferenciasUsuario = { _versao: VERSAO_ATUAL, asideRetraido: legado === "true" };
            salvarPreferencias(convertido);
            localStorage.removeItem(CHAVE_LEGADA_ASIDE);
            return convertido;
        }
    } catch {
        // JSON inválido ou localStorage indisponível (modo privado): usa o padrão
    }
    return { ...PADRAO };
}

export function salvarPreferencias(preferencias: Omit<PreferenciasUsuario, "_versao">) {
    try {
        const objeto: PreferenciasUsuario = { ...preferencias, _versao: VERSAO_ATUAL };
        localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(objeto));
    } catch {
        // sem espaço ou bloqueado: a preferência só não persiste
    }
}
