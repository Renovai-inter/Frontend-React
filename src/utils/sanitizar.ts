/**
 * Sanitização de entradas de formulário (defesa em profundidade contra XSS).
 *
 * O React já escapa o que é renderizado, e o projeto não usa dangerouslySetInnerHTML.
 * Mesmo assim, o texto digitado é limpo ANTES de ir para a API, para que HTML/script
 * não fique guardado no banco e acabe interpretado por outro cliente (app mobile, e-mail, BI).
 *
 * Diferença para validação (validators.ts): validar rejeita o dado errado; sanitizar limpa o dado.
 */

// Tags HTML de verdade: "<" seguido de letra, "/" ou "!" (não pega comparações como "5 < 10")
const TAGS_HTML = /<\/?[a-zA-Z!][^>]*>/g;
// Caracteres de controle, exceto tab (\t), quebra de linha (\n) e retorno (\r)
const CARACTERES_CONTROLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Remove tags HTML e caracteres de controle e normaliza os espaços. */
export function sanitizarTexto(valor: string): string {
    return valor
        .replace(TAGS_HTML, "")
        .replace(CARACTERES_CONTROLE, "")
        .replace(/[ \t]+/g, " ")
        .trim();
}

/** Aplica sanitizarTexto em todos os campos de um objeto, exceto os listados em `ignorar`. */
export function sanitizarCampos<T extends Record<string, string>>(
    campos: T,
    ignorar: ReadonlyArray<keyof T> = []
): T {
    const resultado = { ...campos };
    for (const chave of Object.keys(resultado) as Array<keyof T>) {
        if (ignorar.includes(chave)) continue;
        resultado[chave] = sanitizarTexto(resultado[chave]) as T[keyof T];
    }
    return resultado;
}
