export function formatarDecimal(valor: number): string {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

//uso esse aqui na visão geral e em lugares onde vou mostrar os valores retornados que passem de 2 casas decimais