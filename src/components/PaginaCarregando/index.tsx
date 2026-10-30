import "./style.css"
import "../../pages/Login/style.css"

type Tipo = "login" | "pagina" | "home" | "coletas" | "cooperativa" | "estoque" | "funcionarios" | "perfil" | "rotas" | "rateios" | "pedidos" | "triagens" | "mensagens" | "detalhe"

const classes: Partial<Record<Tipo, string>> = {
    home: "home-page", coletas: "coletas", cooperativa: "cooperativa", estoque: "estoque",
    funcionarios: "funcionarios", perfil: "perfil", rotas: "rotas", rateios: "rateios",
    pedidos: "pedidos", triagens: "triagens",
}

function Linha({ className = "" }: { className?: string }) {
    return <span className={`skeleton-linha ${className}`} />
}

function Tabela() {
    return (
        <div className="skeleton-tabela">
            <Linha className="skeleton-tabela__titulo" />
            {[0, 1, 2, 3].map((row) => (
                <div className="skeleton-tabela__linha" key={row}>
                    {[0, 1, 2, 3].map((cell) => <Linha key={cell} />)}
                </div>
            ))}
        </div>
    )
}

function Campos({ quantidade }: { quantidade: number }) {
    return (
        <div className="skeleton-campos">
            {Array.from({ length: quantidade }, (_, i) => (
                <div className="skeleton-campo" key={i}><Linha className="skeleton-campo__rotulo" /><Linha className="skeleton-campo__valor" /></div>
            ))}
        </div>
    )
}

function PaginaCarregando({ tipo = "pagina" }: { tipo?: Tipo }) {
    if (tipo === "login") {
        return (
            <main className="login" role="status">
                <span className="sr-only">Carregando página de login...</span>
                <section className="login__container" aria-hidden="true">
                    <div className="login__header skeleton-login__header">
                        <Linha className="skeleton-login__logo" />
                        <Linha className="skeleton-login__descricao" />
                    </div>
                    <div className="login__form">
                        {[0, 1].map((i) => <div className="login__field" key={i}><Linha className="skeleton-login__rotulo" /><Linha className="skeleton-login__entrada" /></div>)}
                        <div className="login__utils"><Linha className="skeleton-login__link" /><Linha className="skeleton-login__link" /></div>
                        <Linha className="login__send skeleton-login__enviar" />
                    </div>
                </section>
                <div className="login__sidespace" aria-hidden="true" />
            </main>
        )
    }

    if (tipo === "mensagens" || tipo === "detalhe") {
        return (
            <div className={`skeleton-${tipo}`} role="status">
                <span className="sr-only">Carregando conteúdo...</span>
                <div aria-hidden="true">
                    {[0, 1, 2].map((i) => <div className={`skeleton-${tipo}__item`} key={i}><Linha /><Linha /></div>)}
                </div>
            </div>
        )
    }

    const perfil = tipo === "perfil" || tipo === "cooperativa"
    const cards = !perfil && tipo !== "funcionarios" && tipo !== "pagina"
    const cardsClasse = tipo === "home" ? "home-page__cards" : tipo === "estoque" ? "estoque__cards" : `${tipo}__informativo`

    return (
        <div className={`${classes[tipo] ?? ""} skeleton-pagina`} role="status">
            <span className="sr-only">Carregando conteúdo...</span>
            <div className="skeleton-pagina__conteudo" aria-hidden="true">
                <div className="skeleton-cabecalho"><div><Linha className="skeleton-cabecalho__titulo" /><Linha className="skeleton-cabecalho__subtitulo" /></div>{["estoque", "rotas", "funcionarios"].includes(tipo) && <Linha className="skeleton-botao" />}</div>
                {perfil && <>
                    <div className="skeleton-perfil__topo"><Linha className="skeleton-perfil__foto" />{tipo === "perfil" && <div className="skeleton-perfil__identidade"><Linha /><Linha /></div>}<Linha className="skeleton-botao" /></div>
                    <Campos quantidade={tipo === "perfil" ? 6 : 5} />
                    {tipo === "cooperativa" && <><Linha className="skeleton-secao" /><Campos quantidade={6} /></>}
                </>}
                {cards && <div className={cardsClasse}>
                    {Array.from({ length: tipo === "home" ? 4 : 3 }, (_, i) => <div className="skeleton-card" key={i}><Linha /><Linha /><Linha /></div>)}
                </div>}
                {tipo === "home" && <div className="skeleton-acoes"><Linha className="skeleton-secao" /><div>{[0, 1, 2, 3, 4].map((i) => <Linha key={i} />)}</div></div>}
                {tipo === "rotas" && <div className="skeleton-rotas"><div><Linha /><Linha /><Linha /></div><div><Linha /><Linha /></div></div>}
                {tipo === "rateios" && <div className="skeleton-rateio"><Linha /><Linha /><Linha /><Linha /></div>}
                {tipo === "funcionarios" && <><div className="skeleton-abas"><Linha /><Linha /></div><div className="skeleton-organograma"><Linha /><Linha /><div><Linha /><Linha /><Linha /></div></div></>}
                {!perfil && tipo !== "rotas" && tipo !== "funcionarios" && <Tabela />}
            </div>
        </div>
    )
}

export default PaginaCarregando
