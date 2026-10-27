import "./style.css"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "../../components/Header"
import Card from "../../components/Card"
import AcaoRapida from "../../components/AcaoRapida"
import DynamicTable from "../../components/DynamicTable"
import type { DynamicTableColumn } from "../../types/DynamicTableProps/DynamicTableProps"
import GraficoBarras from "../../components/GraficoBarras"
import { lerSessao } from "../../utils/armazenamentoSessao"
import { formatarDecimal } from "../../utils/formatadores"
import { buscarPorId as buscarCooperativa } from "../../services/cooperativaService"
import { listarPorCooperativa as listarColetas, type ColetaResponse } from "../../services/coletaService"
import {
    listarPorCooperativa as listarEstoque,
    listarDisponiveisPorCooperativa,
    type EstoqueResponse,
} from "../../services/estoqueService"
import { listar as listarMateriais } from "../../services/materialService"
import { listarPorCooperativa as listarTriagens } from "../../services/triagemService"
import { listarPorCooperativaEStatus as listarFuncionarios } from "../../services/funcionarioService"
import type { LinhaColeta, Resumo } from "../../types/Home/HomeTypes"

// Mesmos status que o back-end considera "em aberto" para triagem
const STATUS_TRIAGEM_PENDENTE = ["PENDENTE", "EM_ANDAMENTO", "Em triagem"]
const QUANTIDADE_ULTIMAS_COLETAS = 5

const COLUNAS_COLETAS: DynamicTableColumn<LinhaColeta>[] = [
    { key: "id", label: "ID" },
    { key: "cooperado", label: "Cooperado" },
    { key: "material", label: "Material" },
    { key: "peso", label: "Peso" },
    { key: "status", label: "Status" },
]

// O responsável pela cooperativa é funcionário com cargo "Admin" e não entra na contagem de cooperados
const ehAdministrador = (cargo?: string) => cargo?.trim().toUpperCase() === "ADMIN"

function ehDoMesAtual(data: string): boolean {
    const d = new Date(data)
    const hoje = new Date()
    return d.getFullYear() === hoje.getFullYear() && d.getMonth() === hoje.getMonth()
}

function Home() {
    const navigate = useNavigate()
    const cooperativaId = lerSessao("renovai_cooperativaId")

    const [resumo, setResumo] = useState<Resumo | null>(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        if (!cooperativaId) {
            setErro("Sessão sem cooperativa identificada. Faça login novamente.")
            setCarregando(false)
            return
        }

        let cancelado = false
        Promise.allSettled([
            buscarCooperativa(cooperativaId),
            listarColetas(cooperativaId),
            listarEstoque(cooperativaId),
            listarDisponiveisPorCooperativa(cooperativaId),
            listarTriagens(cooperativaId),
            listarFuncionarios(cooperativaId, "ATIVO"),
            listarMateriais(),
        ])
            .then(([cooperativa, coletas, estoque, disponiveis, triagens, ativos, materiais]) => {
                if (cancelado) return

                // Uma chamada que falha (ex.: 403) não derruba a tela: só aquele bloco fica indisponível
                const resultados = [cooperativa, coletas, estoque, disponiveis, triagens, ativos, materiais]
                if (resultados.every((r) => r.status === "rejected")) {
                    setErro("Não foi possível carregar o resumo da cooperativa.")
                    return
                }

                // A coleta não traz o material; ele vem da triagem ligada a ela
                const materialPorColeta = new Map<string, string>()
                if (triagens.status === "fulfilled") {
                    triagens.value.forEach((t) => {
                        if (!materialPorColeta.has(t.coletaId)) materialPorColeta.set(t.coletaId, t.materialCategoria)
                    })
                }

                const ordenadas: ColetaResponse[] | null =
                    coletas.status === "fulfilled"
                        ? [...coletas.value].sort(
                            (a, b) => new Date(b.dataColeta).getTime() - new Date(a.dataColeta).getTime()
                        )
                        : null

                // Estoque disponível = com quantidade > 0 e material marcado como disponível (mesma regra da
                // página de Estoque). Se o cadastro de materiais não carregar, usa a lista de disponíveis da API.
                let estoqueDisponivel: EstoqueResponse[] | null = null
                if (estoque.status === "fulfilled" && materiais.status === "fulfilled") {
                    const disponivelPorId = new Map(materiais.value.map((m) => [m.materialId, m.estaDisponivel]))
                    estoqueDisponivel = estoque.value.filter(
                        (e) => e.quantidadeKg > 0 && (disponivelPorId.get(e.materialId) ?? true)
                    )
                } else if (disponiveis.status === "fulfilled") {
                    estoqueDisponivel = disponiveis.value
                }

                const porMaterial = new Map<string, number>()
                estoqueDisponivel?.forEach((e) => {
                    porMaterial.set(e.materialCategoria, (porMaterial.get(e.materialCategoria) ?? 0) + e.quantidadeKg)
                })

                setResumo({
                    nomeCooperativa: cooperativa.status === "fulfilled" ? cooperativa.value.nome : "",
                    coletasNoMes:
                        coletas.status === "fulfilled"
                            ? coletas.value.filter((c) => ehDoMesAtual(c.dataColeta)).length
                            : null,
                    estoqueDisponivelKg: estoqueDisponivel
                        ? estoqueDisponivel.reduce((soma, e) => soma + e.quantidadeKg, 0)
                        : null,
                    cooperadosAtivos:
                        ativos.status === "fulfilled"
                            ? ativos.value.filter((f) => !ehAdministrador(f.cargo)).length
                            : null,
                    triagensPendentes:
                        triagens.status === "fulfilled"
                            ? triagens.value.filter((t) => STATUS_TRIAGEM_PENDENTE.includes(t.statusAtual)).length
                            : null,
                    ultimasColetas: ordenadas
                        ? ordenadas.slice(0, QUANTIDADE_ULTIMAS_COLETAS).map((c) => ({
                            id: c.coletaId.slice(0, 8),
                            cooperado: c.cooperadoNome,
                            material: materialPorColeta.get(c.coletaId) ?? "—",
                            peso: `${formatarDecimal(c.quantidadeKg)}kg`,
                            status: c.statusAtual,
                        }))
                        : null,
                    estoquePorMaterial: [...porMaterial].map(([rotulo, valor]) => ({ rotulo, valor })),
                })
            })
            .catch(() => {
                if (!cancelado) setErro("Não foi possível carregar o resumo da cooperativa.")
            })
            .finally(() => {
                if (!cancelado) setCarregando(false)
            })

        return () => {
            cancelado = true
        }
    }, [cooperativaId])

    if (carregando) return <p className="home-page__estado">Carregando...</p>
    if (erro || !resumo) return <p className="home-page__estado home-page__estado--erro">{erro}</p>

    return (
        <div className="home-page">
            <Header
                titulo="Visão geral"
                subtitulo={resumo.nomeCooperativa ? `Resumo da Cooperativa ${resumo.nomeCooperativa}` : "Resumo da cooperativa"}
            />

            <section className="home-page__cards">
                <Card title="Coletas no mês" bigNumber={resumo.coletasNoMes ?? "—"} subtitle="atualizado agora" />
                <Card
                    title="Estoque total"
                    bigNumber={
                        resumo.estoqueDisponivelKg === null
                            ? "—"
                            : `${formatarDecimal(resumo.estoqueDisponivelKg)} kg`
                    }
                    subtitle="disponível para venda"
                />
                <Card title="Cooperados ativos" bigNumber={resumo.cooperadosAtivos ?? "—"} subtitle="na cooperativa" />
                <Card title="Triagens pendentes" bigNumber={resumo.triagensPendentes ?? "—"} subtitle="aguardando separação" />
            </section>

            <section>
                <h2 className="home-page__secao">Ações rápidas</h2>
                <div className="home-page__acoes">
                    <AcaoRapida onClick={() => navigate("/coletas")}>Registrar Coleta</AcaoRapida>
                    <AcaoRapida onClick={() => navigate("/triagens")}>Registrar Triagem</AcaoRapida>
                    <AcaoRapida onClick={() => navigate("/funcionarios")}>Adicionar Pessoa</AcaoRapida>
                    <AcaoRapida onClick={() => navigate("/pedidos")}>Ver Pedidos</AcaoRapida>
                    <AcaoRapida onClick={() => navigate("/rateios")}>Criar Rateio</AcaoRapida>
                </div>
            </section>

            <section className="home-page__detalhes">
                <DynamicTable
                    titulo="Últimas coletas"
                    acaoTitulo={<Link className="home-page__ver-todas" to="/coletas">Ver todas</Link>}
                    columns={COLUNAS_COLETAS}
                    data={resumo.ultimasColetas ?? []}
                    rowKey={(linha) => linha.id}
                    emptyMessage={resumo.ultimasColetas ? "Nenhuma coleta registrada." : "Coletas indisponíveis no momento."}
                />
                <GraficoBarras
                    titulo="Estoque por Material Disponível"
                    subtitulo="Quantidade em estoque"
                    rotuloTotal="Total em estoque"
                    dados={resumo.estoquePorMaterial}
                />
            </section>
        </div>
    )
}

export default Home
