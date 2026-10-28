import "./style.css"

/** Fallback exibido pelo <Suspense> enquanto o código de uma página é baixado. */
function PaginaCarregando() {
    return (
        <div className="pagina-carregando" role="status" aria-live="polite">
            <span className="pagina-carregando__spinner" aria-hidden="true" />
            <p>Carregando página...</p>
        </div>
    )
}

export default PaginaCarregando
