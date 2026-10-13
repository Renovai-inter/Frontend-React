export interface DadoGrafico {
    rotulo: string;
    valor: number;
}

export interface GraficoBarrasProps {
    titulo: string;
    /** Texto em verde abaixo do título (ex.: "Quantidade em estoque"). */
    subtitulo?: string;
    dados: DadoGrafico[];
    /** Sufixo exibido junto de cada valor. Padrão: "kg". */
    unidade?: string;
    /** Rótulo da linha de soma no rodapé. Sem ele, o rodapé não é exibido. */
    rotuloTotal?: string;
    className?: string;
}
