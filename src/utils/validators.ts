/** Mantém apenas os dígitos de um texto. */
export function somenteDigitos(valor: string): string {
    return valor.replace(/\D/g, "");
}

/** 12345678901 -> 123.456.789-01 (formato exigido pela API). */
export function mascaraCpf(valor: string): string {
    const d = somenteDigitos(valor).slice(0, 11);
    return d
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/** 12345678 -> 12345-678 (formato exigido pela API). */
export function mascaraCep(valor: string): string {
    const d = somenteDigitos(valor).slice(0, 8);
    return d.replace(/^(\d{5})(\d)/, "$1-$2");
}

/** Valida o CPF pelos dígitos verificadores (aceita com ou sem máscara). */
export function isCpfValido(cpf: string): boolean {
    const d = somenteDigitos(cpf);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

    const calcularDigito = (base: string, pesoInicial: number) => {
        const soma = base
            .split("")
            .reduce((acc, n, i) => acc + Number(n) * (pesoInicial - i), 0);
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };

    const d1 = calcularDigito(d.slice(0, 9), 10);
    const d2 = calcularDigito(d.slice(0, 10), 11);
    return d1 === Number(d[9]) && d2 === Number(d[10]);
}

export function isEmailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isUrlValida(url: string): boolean {
    try {
        const { protocol } = new URL(url);
        return protocol === "http:" || protocol === "https:";
    } catch {
        return false;
    }
}

/** 12345678000195 -> 12.345.678/0001-95 (formato exigido pela API). */
export function mascaraCnpj(valor: string): string {
    const d = somenteDigitos(valor).slice(0, 14);
    return d
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

/** Valida o CNPJ pelos dígitos verificadores (aceita com ou sem máscara). */
export function isCnpjValido(cnpj: string): boolean {
    const d = somenteDigitos(cnpj);
    if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;

    const calcularDigito = (base: string) => {
        const pesos = base.length === 12
            ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
            : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const soma = base.split("").reduce((acc, n, i) => acc + Number(n) * pesos[i], 0);
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };

    const d1 = calcularDigito(d.slice(0, 12));
    const d2 = calcularDigito(d.slice(0, 13));
    return d1 === Number(d[12]) && d2 === Number(d[13]);
}
