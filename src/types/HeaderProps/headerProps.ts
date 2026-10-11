import type { ReactNode } from "react";

export interface HeaderProps {
    titulo?: string;
    subtitulo?: string;
    /** Conteúdo alinhado à direita do cabeçalho (ex.: botões de ação). */
    acoes?: ReactNode;
}
