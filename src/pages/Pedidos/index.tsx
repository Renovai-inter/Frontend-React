import "./style.css"
import "../../components/FormularioEdicao/style.css"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Header from "../../components/Header"
import Botao from "../../components/Botao"
import Card from "../../components/Card"
import DynamicTable, { type DynamicTableColumn } from "../../components/DynamicTable"
import { lerSessao } from "../../utils/armazenamentoSessao"
import {
    listarPorCooperativa as listarNegociacoes,
    listarMensagens,
    type NegociacaoResponse,
    type NegociacaoMensagemResponse,
} from "../../services/negociacaoService"
import { buscarPorId as buscarPerfil } from "../../services/perfilService"

interface LinhaPedido {
    negociacaoId: string
    pedidoId: string
    empresa: string
    status: string
    valorTotal: number
    dataInicio: string
    dataFechamento: string
    itens: string
}

interface MensagemChat {
    mensagemId: string
    autor: "empresa" | "cooperativa"
    remetente: string
    texto: string
    tipo: string
    dataEnvio: string
}

interface EstadoChat {
    pedido: LinhaPedido | null
    mensagens: MensagemChat[]
    carregando: boolean
    erro: string | null
}

const CHAT_FECHADO: EstadoChat = { pedido: null, mensagens: [], carregando: false, erro: null }

const formatarData = (data: string | null) => (data ? new Date(data).toLocaleDateString("pt-BR") : "—")
const formatarDataHora = (data: string) =>
    new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
const formatarMoeda = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

const normalizar = (texto: string) =>
    texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const ehConcluido = (status: string) => /conclu|fechad|finaliz/.test(normalizar(status))
const ehRecusado = (status: string) => /recus/.test(normalizar(status))

function classeStatus(status: string) {
    if (ehConcluido(status)) return "pedidos__status--concluido"
    if (ehRecusado(status)) return "pedidos__status--recusado"
    return "pedidos__status--andamento"
}

// Descobre, pelo perfil do remetente, se a mensagem veio da empresa ou da cooperativa
async function identificarAutores(
    mensagens: NegociacaoMensagemResponse[],
    emailSessao: string | null
): Promise<Map<string, "empresa" | "cooperativa">> {
    const ids = [...new Set(mensagens.map((m) => m.remetenteId))]
    const autores = new Map<string, "empresa" | "cooperativa">()

    await Promise.all(
        ids.map(async (id) => {
            try {
                const perfil = await buscarPerfil(id)
                autores.set(id, perfil.empresaId ? "empresa" : "cooperativa")
            } catch {
                // Sem acesso ao perfil: usa o e-mail da sessão como referência da cooperativa
                const doUsuario = mensagens.find((m) => m.remetenteId === id)?.remetenteNome === emailSessao
                autores.set(id, doUsuario ? "cooperativa" : "empresa")
            }
        })
    )
    return autores
}

function Pedidos() {
    const cooperativaId = lerSessao("renovai_cooperativaId")
    const emailSessao = lerSessao("renovai_email")

    const [linhas, setLinhas] = useState<LinhaPedido[]>([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)
    const [chat, setChat] = useState<EstadoChat>(CHAT_FECHADO)

    // O chat é controlado pela URL: /pedidos/:negociacaoId abre a negociação, /pedidos fecha.
    const { negociacaoId } = useParams<{ negociacaoId: string }>()
    const navigate = useNavigate()
    const fecharChat = () => navigate("/pedidos")

    useEffect(() => {
        if (!cooperativaId) {
            setErro("Sessão sem cooperativa identificada. Faça login novamente.")
            setCarregando(false)
            return
        }

        let cancelado = false
        listarNegociacoes(cooperativaId)
            .then((negociacoes: NegociacaoResponse[]) => {
                if (cancelado) return
                const ordenadas = [...negociacoes].sort(
                    (a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime()
                )
                setLinhas(
                    ordenadas.map((n) => ({
                        negociacaoId: n.negociacaoId,
                        pedidoId: n.pedidoId,
                        empresa: n.empresaNome,
                        status: n.statusAtual,
                        valorTotal: n.valorTotal ?? 0,
                        dataInicio: n.dataInicio,
                        dataFechamento: n.dataFechamento ?? "",
                        itens: (n.itens ?? []).map((i) => i.materialCategoria).join(", "),
                    }))
                )
            })
            .catch(() => {
                if (!cancelado) setErro("Não foi possível carregar os pedidos.")
            })
            .finally(() => {
                if (!cancelado) setCarregando(false)
            })

        return () => {
            cancelado = true
        }
    }, [cooperativaId])

    // Esc fecha o chat
    const chatAberto = chat.pedido !== null
    useEffect(() => {
        if (!chatAberto) return
        function aoTeclar(event: KeyboardEvent) {
            if (event.key === "Escape") navigate("/pedidos")
        }
        document.addEventListener("keydown", aoTeclar)
        return () => document.removeEventListener("keydown", aoTeclar)
    }, [chatAberto, navigate])

    // Sincroniza o chat com o parâmetro da rota. A verificação de presença é feita aqui:
    // sem parâmetro o chat fica fechado; com parâmetro que não existe na lista, vai para a página 404.
    useEffect(() => {
        if (!negociacaoId) {
            setChat(CHAT_FECHADO)
            return
        }
        if (carregando || erro) return // espera a lista chegar

        const pedido = linhas.find((l) => l.negociacaoId === negociacaoId)
        if (!pedido) {
            navigate("/error", { replace: true, state: { status: 404, mensagem: "Negociação não encontrada." } })
            return
        }

        let cancelado = false
        setChat({ pedido, mensagens: [], carregando: true, erro: null })

        async function carregarMensagens() {
            try {
                const recebidas = await listarMensagens(pedido!.negociacaoId)
                const autores = await identificarAutores(recebidas, emailSessao)
                if (cancelado) return
                const mensagens: MensagemChat[] = recebidas.map((m) => ({
                    mensagemId: m.mensagemId,
                    autor: autores.get(m.remetenteId) ?? "empresa",
                    remetente: m.remetenteNome,
                    texto: m.mensagem,
                    tipo: m.tipoMensagem,
                    dataEnvio: m.dataEnvio,
                }))
                setChat((atual) => ({ ...atual, mensagens, carregando: false }))
            } catch {
                if (cancelado) return
                setChat((atual) => ({ ...atual, carregando: false, erro: "Não foi possível carregar as mensagens." }))
            }
        }
        void carregarMensagens()

        return () => {
            cancelado = true
        }
    }, [negociacaoId, carregando, erro, linhas, emailSessao, navigate])

    const colunas: DynamicTableColumn<LinhaPedido>[] = [
        { key: "empresa", label: "Empresa" },
        { key: "itens", label: "Materiais" },
        {
            key: "status",
            label: "Status",
            render: (l) => <span className={`pedidos__status ${classeStatus(l.status)}`}>{l.status}</span>,
        },
        {
            key: "valorTotal",
            label: "Valor total",
            render: (l) => formatarMoeda(l.valorTotal),
        },
        {
            key: "dataInicio",
            label: "Recebido em",
            render: (l) => formatarData(l.dataInicio),
        },
        {
            key: "dataFechamento",
            label: "Concluído em",
            render: (l) => formatarData(l.dataFechamento),
        },
        {
            key: "negociacaoId",
            label: "Negociação",
            render: (l) => (
                <button type="button" className="pedidos__chat-botao" onClick={() => navigate(`/pedidos/${l.negociacaoId}`)}>
                    Ver chat
                </button>
            ),
        },
    ]

    if (carregando) return <p className="pedidos__estado">Carregando...</p>
    if (erro) return <p className="pedidos__estado pedidos__estado--erro" role="alert">{erro}</p>

    const totalPedidos = linhas.length
    const totalConcluidos = linhas.filter((l) => ehConcluido(l.status)).length
    const totalAndamento = linhas.filter((l) => !ehConcluido(l.status) && !ehRecusado(l.status)).length

    return (
        <div className="pedidos">
            <Header titulo="Pedidos" subtitulo="Acompanhe os pedidos recebidos e suas negociações" />

            <div className="pedidos__informativo">
                <Card title="Pedidos" bigNumber={`${totalPedidos}`} subtitle="pedidos recebidos pela cooperativa" />
                <Card title="Concluídos" bigNumber={`${totalConcluidos}`} subtitle="pedidos já concluídos" />
                <Card title="Em andamento" bigNumber={`${totalAndamento}`} subtitle="pedidos em negociação" />
            </div>

            <DynamicTable
                titulo="Todos os pedidos"
                columns={colunas}
                data={linhas}
                rowKey={(l) => l.negociacaoId}
                emptyMessage="Nenhum pedido recebido."
            />

            {chat.pedido && (
                <div
                    className="formulario-edicao__overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) fecharChat()
                    }}
                >
                    <div
                        className="formulario-edicao pedidos__chat"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pedidos-chat-titulo"
                    >
                        <h2 id="pedidos-chat-titulo" className="formulario-edicao__titulo">
                            Negociação com {chat.pedido.empresa}
                        </h2>
                        <p className="pedidos__chat-resumo">Total do pedido: {formatarMoeda(chat.pedido.valorTotal)}</p>

                        <div className="pedidos__chat-legenda" aria-hidden="true">
                            <span className="pedidos__chat-legenda-item pedidos__chat-legenda-item--empresa">Empresa</span>
                            <span className="pedidos__chat-legenda-item pedidos__chat-legenda-item--cooperativa">Cooperativa</span>
                        </div>

                        <div className="pedidos__chat-mensagens" role="log" aria-label="Mensagens da negociação">
                            {chat.carregando && <p className="pedidos__chat-vazio">Carregando mensagens...</p>}
                            {chat.erro && (
                                <p className="pedidos__chat-vazio pedidos__estado--erro" role="alert">
                                    {chat.erro}
                                </p>
                            )}
                            {!chat.carregando && !chat.erro && chat.mensagens.length === 0 && (
                                <p className="pedidos__chat-vazio">Nenhuma mensagem nesta negociação.</p>
                            )}
                            {chat.mensagens.map((m) => (
                                <div key={m.mensagemId} className={`pedidos__mensagem pedidos__mensagem--${m.autor}`}>
                                    <span className="pedidos__mensagem-autor">
                                        {m.autor === "empresa" ? "Empresa" : "Cooperativa"}
                                        {m.tipo === "CONTRAPROPOSTA" && " · Contraproposta"}
                                        {m.tipo === "SISTEMA" && " · Sistema"}
                                    </span>
                                    <p className="pedidos__mensagem-texto">{m.texto}</p>
                                    <time className="pedidos__mensagem-data" dateTime={m.dataEnvio}>
                                        {formatarDataHora(m.dataEnvio)}
                                    </time>
                                </div>
                            ))}
                        </div>

                        <p className="pedidos__chat-aviso">Histórico da negociação do pedido da empresa {chat.pedido.empresa}</p>

                        <div className="formulario-edicao__acoes">
                            <Botao onClick={fecharChat}>Fechar</Botao>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Pedidos
