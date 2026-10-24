import "./style.css"
import "../../components/FormularioEdicao/style.css"
import { useEffect, useState } from "react"
import Header from "../../components/Header"
import Botao from "../../components/Botao"
import Card from "../../components/Card"
import FormularioEdicao from "../../components/FormularioEdicao"
import type { CampoFormulario, ValoresFormulario } from "../../types/FormularioEdicao/FormularioEdicaoProps"
import { lerSessao } from "../../utils/armazenamentoSessao"
import {
    adicionarEndereco,
    atualizar,
    criar,
    deletar,
    listarPorCooperativa,
    removerEndereco,
    type RotaEnderecoResponse,
    type RotaResponse,
} from "../../services/rotaService"
import { criar as criarEndereco } from "../../services/enderecoService"

const TIPOS_LOCAL = ["Comércio", "Condomínio", "Instituição", "Destino"]

const CAMPOS_ROTA: CampoFormulario[] = [
    { nome: "nome", rotulo: "Nome da rota", placeholder: "Ex.: Rota Centro – Segunda", obrigatorio: true },
    {
        nome: "situacao",
        rotulo: "Situação",
        tipo: "selecao",
        opcoes: [
            { valor: "ativa", rotulo: "Ativa" },
            { valor: "inativa", rotulo: "Inativa" },
        ],
    },
]

const CAMPOS_PARADA: CampoFormulario[] = [
    { nome: "nomeLocal", rotulo: "Nome do local", placeholder: "Ex.: Mercado Bom Preço", obrigatorio: true },
    {
        nome: "tipoLocal",
        rotulo: "Tipo do local",
        tipo: "selecao",
        opcoes: TIPOS_LOCAL.map((t) => ({ valor: t, rotulo: t })),
    },
    { nome: "logradouro", rotulo: "Rua", obrigatorio: true },
    { nome: "numero", rotulo: "Número", obrigatorio: true },
    { nome: "bairro", rotulo: "Bairro", obrigatorio: true },
    { nome: "cidade", rotulo: "Cidade", obrigatorio: true },
]

const textoParadas = (quantidade: number) => `${quantidade} ${quantidade === 1 ? "parada" : "paradas"}`
const ordenarParadas = (paradas: RotaEnderecoResponse[]) => [...paradas].sort((a, b) => a.ordem - b.ordem)

function RotasColeta() {
    const cooperativaId = lerSessao("renovai_cooperativaId")

    const [rotas, setRotas] = useState<RotaResponse[]>([])
    const [selecionadaId, setSelecionadaId] = useState<string | null>(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)

    const [criandoRota, setCriandoRota] = useState(false)
    const [editandoRota, setEditandoRota] = useState(false)
    const [adicionandoParada, setAdicionandoParada] = useState(false)
    const [excluindo, setExcluindo] = useState(false)
    const [excluindoEmAndamento, setExcluindoEmAndamento] = useState(false)
    const [erroAcao, setErroAcao] = useState<string | null>(null)

    useEffect(() => {
        if (!cooperativaId) {
            setErro("Sessão sem cooperativa identificada. Faça login novamente.")
            setCarregando(false)
            return
        }

        let cancelado = false
        listarPorCooperativa(cooperativaId)
            .then((lista) => {
                if (cancelado) return
                setRotas(lista)
                setSelecionadaId(lista[0]?.rotaId ?? null)
            })
            .catch(() => {
                if (!cancelado) setErro("Não foi possível carregar as rotas.")
            })
            .finally(() => {
                if (!cancelado) setCarregando(false)
            })

        return () => {
            cancelado = true
        }
    }, [cooperativaId])

    // Esc fecha a confirmação de exclusão
    useEffect(() => {
        if (!excluindo) return
        function aoTeclar(event: KeyboardEvent) {
            if (event.key === "Escape" && !excluindoEmAndamento) fecharExclusao()
        }
        document.addEventListener("keydown", aoTeclar)
        return () => document.removeEventListener("keydown", aoTeclar)
    }, [excluindo, excluindoEmAndamento])

    const selecionada = rotas.find((r) => r.rotaId === selecionadaId) ?? null
    const paradasSelecionada = selecionada ? ordenarParadas(selecionada.enderecos) : []

    function substituirRota(atualizada: RotaResponse) {
        setRotas((atual) => atual.map((r) => (r.rotaId === atualizada.rotaId ? atualizada : r)))
    }

    function fecharExclusao() {
        setExcluindo(false)
        setErroAcao(null)
    }

    async function salvarNovaRota(valores: ValoresFormulario) {
        if (!cooperativaId) return
        const criada = await criar({
            cooperativaId,
            nome: valores.nome,
            estaAtiva: valores.situacao !== "inativa",
        })
        setRotas((atual) => [...atual, { ...criada, enderecos: criada.enderecos ?? [] }])
        setSelecionadaId(criada.rotaId)
    }

    async function salvarEdicaoRota(valores: ValoresFormulario) {
        if (!cooperativaId || !selecionada) return
        const atualizada = await atualizar(selecionada.rotaId, {
            cooperativaId,
            nome: valores.nome,
            estaAtiva: valores.situacao === "ativa",
        })
        // A resposta do PUT pode não trazer as paradas; preserva as que já temos
        substituirRota({ ...atualizada, enderecos: atualizada.enderecos ?? selecionada.enderecos })
    }

    async function confirmarExclusao() {
        if (!selecionada) return
        setExcluindoEmAndamento(true)
        setErroAcao(null)
        try {
            await deletar(selecionada.rotaId)
            const restantes = rotas.filter((r) => r.rotaId !== selecionada.rotaId)
            setRotas(restantes)
            setSelecionadaId(restantes[0]?.rotaId ?? null)
            setExcluindo(false)
        } catch {
            setErroAcao("Não foi possível excluir a rota. Tente novamente.")
        } finally {
            setExcluindoEmAndamento(false)
        }
    }

    async function salvarParada(valores: ValoresFormulario) {
        if (!selecionada) return
        const endereco = await criarEndereco({
            logradouro: valores.logradouro,
            numero: valores.numero,
            bairro: valores.bairro,
            cidade: valores.cidade,
        })
        const proximaOrdem = paradasSelecionada.reduce((maior, p) => Math.max(maior, p.ordem), 0) + 1
        const parada = await adicionarEndereco({
            rotaId: selecionada.rotaId,
            enderecoId: endereco.enderecoId,
            nomeLocal: valores.nomeLocal,
            tipoLocal: valores.tipoLocal,
            ordem: proximaOrdem,
        })
        substituirRota({ ...selecionada, enderecos: [...selecionada.enderecos, parada] })
    }

    async function removerParada(parada: RotaEnderecoResponse) {
        if (!selecionada) return
        setErroAcao(null)
        try {
            await removerEndereco(parada.rotaEnderecoId)
            substituirRota({
                ...selecionada,
                enderecos: selecionada.enderecos.filter((p) => p.rotaEnderecoId !== parada.rotaEnderecoId),
            })
        } catch {
            setErroAcao("Não foi possível remover a parada. Tente novamente.")
        }
    }

    if (carregando) return <p className="rotas__estado">Carregando...</p>
    if (erro) return <p className="rotas__estado rotas__estado--erro">{erro}</p>

    const totalAtivas = rotas.filter((r) => r.estaAtiva).length
    const totalParadas = rotas.reduce((soma, r) => soma + r.enderecos.length, 0)

    return (
        <div className="rotas">
            <Header
                titulo="Rotas de Coleta"
                subtitulo="Organize os trajetos e as paradas de cada rota da cooperativa"
                acoes={<Botao onClick={() => setCriandoRota(true)}>+ Nova rota</Botao>}
            />

            <div className="rotas__informativo">
                <Card title="Rotas ativas" bigNumber={`${totalAtivas}`} subtitle="disponíveis para vincular a coletas" />
                <Card title="Total de rotas" bigNumber={`${rotas.length}`} subtitle="ativas e inativas cadastradas" />
                <Card title="Paradas cadastradas" bigNumber={`${totalParadas}`} subtitle="soma das paradas de todas as rotas" />
            </div>

            <div className="rotas__conteudo">
                <section className="rotas__painel rotas__lista" aria-labelledby="rotas-lista-titulo">
                    <h2 id="rotas-lista-titulo" className="rotas__painel-titulo rotas__painel-titulo--pequeno">
                        Todas as rotas
                    </h2>

                    {rotas.length === 0 ? (
                        <p className="rotas__vazio">Nenhuma rota cadastrada.</p>
                    ) : (
                        <ul className="rotas__itens">
                            {rotas.map((r) => (
                                <li key={r.rotaId}>
                                    <button
                                        type="button"
                                        className={`rotas__item ${r.rotaId === selecionadaId ? "rotas__item--ativo" : ""}`}
                                        aria-pressed={r.rotaId === selecionadaId}
                                        onClick={() => {
                                            setSelecionadaId(r.rotaId)
                                            setErroAcao(null)
                                        }}
                                    >
                                        <span className="rotas__item-topo">
                                            <span>{r.nome}</span>
                                            <span className={`rotas__selo ${r.estaAtiva ? "" : "rotas__selo--inativa"}`}>
                                                {r.estaAtiva ? "Ativa" : "Inativa"}
                                            </span>
                                        </span>
                                        <span className="rotas__item-paradas">{textoParadas(r.enderecos.length)}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rotas__painel rotas__detalhe" aria-labelledby="rotas-detalhe-titulo">
                    {!selecionada ? (
                        <p className="rotas__vazio">Selecione ou crie uma rota para ver as paradas.</p>
                    ) : (
                        <>
                            <h2 id="rotas-detalhe-titulo" className="rotas__painel-titulo">
                                {selecionada.nome}
                            </h2>
                            <p className="rotas__detalhe-resumo">
                                {textoParadas(paradasSelecionada.length)} · {selecionada.estaAtiva ? "ativa" : "inativa"} · paradas na
                                ordem de visita
                            </p>

                            <div className="rotas__acoes">
                                <button type="button" className="rotas__link" onClick={() => setExcluindo(true)}>
                                    Excluir rota
                                </button>
                                <Botao variante="secundario" onClick={() => setEditandoRota(true)}>
                                    Editar rota
                                </Botao>
                                <Botao onClick={() => setAdicionandoParada(true)}>+ Adicionar parada</Botao>
                            </div>

                            {erroAcao && !excluindo && <p className="formulario-edicao__erro-geral">{erroAcao}</p>}

                            {paradasSelecionada.length === 0 ? (
                                <p className="rotas__vazio">Esta rota ainda não tem paradas.</p>
                            ) : (
                                <ol className="rotas__paradas">
                                    {paradasSelecionada.map((p, indice) => (
                                        <li key={p.rotaEnderecoId} className="rotas__parada">
                                            <span className="rotas__numero" aria-hidden="true">
                                                {indice + 1}
                                            </span>
                                            <div className="rotas__parada-info">
                                                <div className="rotas__parada-nome">
                                                    <span>{p.nomeLocal}</span>
                                                    {p.tipoLocal && <span className="rotas__tipo">{p.tipoLocal}</span>}
                                                </div>
                                                <span className="rotas__parada-endereco">
                                                    {[`${p.logradouro}, ${p.numero}`, p.bairro, p.cidade].join(" · ")}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="rotas__link"
                                                aria-label={`Remover parada ${p.nomeLocal}`}
                                                onClick={() => removerParada(p)}
                                            >
                                                Remover
                                            </button>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </>
                    )}
                </section>
            </div>

            <FormularioEdicao
                aberto={criandoRota}
                titulo="Nova rota"
                campos={CAMPOS_ROTA}
                valoresIniciais={{ situacao: "ativa" }}
                onSalvar={salvarNovaRota}
                onFechar={() => setCriandoRota(false)}
                textoSalvar="Criar rota"
            />

            <FormularioEdicao
                aberto={editandoRota}
                titulo={selecionada ? `Editar ${selecionada.nome}` : "Editar rota"}
                campos={CAMPOS_ROTA}
                valoresIniciais={{ nome: selecionada?.nome, situacao: selecionada?.estaAtiva ? "ativa" : "inativa" }}
                onSalvar={salvarEdicaoRota}
                onFechar={() => setEditandoRota(false)}
            />

            <FormularioEdicao
                aberto={adicionandoParada}
                titulo="Adicionar parada"
                campos={CAMPOS_PARADA}
                valoresIniciais={{ tipoLocal: TIPOS_LOCAL[0] }}
                onSalvar={salvarParada}
                onFechar={() => setAdicionandoParada(false)}
                textoSalvar="Adicionar"
            />

            {excluindo && selecionada && (
                <div
                    className="formulario-edicao__overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !excluindoEmAndamento) fecharExclusao()
                    }}
                >
                    <div className="formulario-edicao rotas__confirmacao" role="alertdialog" aria-modal="true" aria-labelledby="rotas-confirmacao-titulo">
                        <h2 id="rotas-confirmacao-titulo" className="formulario-edicao__titulo">
                            Excluir rota
                        </h2>
                        <p className="rotas__confirmacao-texto">
                            Tem certeza que deseja excluir a rota <strong>{selecionada.nome}</strong>? As paradas cadastradas nela
                            também serão perdidas.
                        </p>

                        {erroAcao && <p className="formulario-edicao__erro-geral">{erroAcao}</p>}

                        <div className="formulario-edicao__acoes">
                            <Botao variante="secundario" onClick={fecharExclusao} ativo={!excluindoEmAndamento}>
                                Cancelar
                            </Botao>
                            <Botao onClick={confirmarExclusao} ativo={!excluindoEmAndamento}>
                                {excluindoEmAndamento ? "Excluindo..." : "Sim, excluir"}
                            </Botao>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RotasColeta
