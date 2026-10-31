import { useCallback } from "react"

const SELETOR_FOCAVEL = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",")

const SELETOR_DIALOGO = "[role='dialog'], [role='alertdialog']"

// Último elemento focado FORA de um diálogo. É a "casa" para onde o foco volta ao fechar.
// (Guardado a nível de módulo porque o autoFocus de um campo pode mover o foco para dentro
// do diálogo antes de este hook rodar, e aí document.activeElement já não seria o botão que o abriu.)
let ultimoFocoFora: HTMLElement | null = null
if (typeof document !== "undefined") {
    document.addEventListener("focusin", (evento) => {
        const alvo = evento.target
        if (alvo instanceof HTMLElement && !alvo.closest(SELETOR_DIALOGO)) ultimoFocoFora = alvo
    })
}

/**
 * Gestão de foco de diálogos modais (WCAG 2.4.3 e padrão WAI-ARIA "Dialog (Modal)"):
 *  - ao abrir, leva o foco para dentro do diálogo (se um campo já tiver autoFocus, mantém);
 *  - Tab e Shift+Tab ficam presos dentro do diálogo (o fundo deixa de ser alcançável pelo teclado);
 *  - ao fechar, devolve o foco ao botão que abriu o diálogo.
 *
 * Uso: `const refDialogo = useFocoDialogo()` e `<div role="dialog" ref={refDialogo}>`.
 * É um "ref de callback" porque os diálogos do projeto só existem no DOM enquanto estão abertos:
 * o React chama o callback ao montar e executa a função devolvida (cleanup) ao desmontar.
 */
export function useFocoDialogo() {
    return useCallback((dialogo: HTMLElement | null) => {
        if (!dialogo) return

        const ativo = document.activeElement
        const voltarPara =
            ativo instanceof HTMLElement && !dialogo.contains(ativo) && ativo !== document.body
                ? ativo
                : ultimoFocoFora

        // Elementos escondidos (display:none) não têm retângulos e não entram na ordem de Tab
        const focaveis = () =>
            Array.from(dialogo.querySelectorAll<HTMLElement>(SELETOR_FOCAVEL)).filter(
                (el) => el.getClientRects().length > 0
            )

        // Garante que o próprio diálogo possa receber foco quando não há nenhum controle dentro dele
        if (!dialogo.hasAttribute("tabindex")) dialogo.setAttribute("tabindex", "-1")
        if (!dialogo.contains(document.activeElement)) (focaveis()[0] ?? dialogo).focus()

        function aoTeclar(evento: KeyboardEvent) {
            if (evento.key !== "Tab") return

            const itens = focaveis()
            if (itens.length === 0) {
                evento.preventDefault()
                dialogo!.focus()
                return
            }

            const primeiro = itens[0]
            const ultimo = itens[itens.length - 1]
            const atual = document.activeElement

            if (evento.shiftKey && (atual === primeiro || atual === dialogo)) {
                evento.preventDefault()
                ultimo.focus()
            } else if (!evento.shiftKey && atual === ultimo) {
                evento.preventDefault()
                primeiro.focus()
            }
        }

        dialogo.addEventListener("keydown", aoTeclar)
        return () => {
            dialogo.removeEventListener("keydown", aoTeclar)
            if (voltarPara && document.contains(voltarPara)) voltarPara.focus()
        }
    }, [])
}
