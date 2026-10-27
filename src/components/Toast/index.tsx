import "./style.css"
import { useEffect } from "react"
import type { ToastProps } from "../../types/Toast/ToastTypes"

/**
 * Aviso temporário de resultado de uma operação (sucesso por padrão).
 * A região com aria-live fica sempre montada: só o conteúdo entra e sai, o que faz
 * o leitor de tela anunciar a mensagem quando ela aparece.
 */
function Toast({ mensagem, chave = 0, tipo = "sucesso", onFechar, duracaoMs = 5000 }: ToastProps) {
    useEffect(() => {
        if (!mensagem) return
        const temporizador = window.setTimeout(onFechar, duracaoMs)
        return () => window.clearTimeout(temporizador)
    }, [mensagem, chave, duracaoMs, onFechar])

    return (
        <div
            className="toast-regiao"
            role={tipo === "erro" ? "alert" : "status"}
            aria-live={tipo === "erro" ? "assertive" : "polite"}
            aria-atomic="true"
        >
            {mensagem && (
                <div key={chave} className={`toast toast--${tipo}`}>
                    <span className="toast__texto">{mensagem}</span>
                    <button type="button" className="toast__fechar" onClick={onFechar} aria-label="Fechar aviso">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default Toast
