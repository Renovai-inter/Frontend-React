import "./style.css"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "../../components/Header"
import Card from "../../components/Card"
import AcaoRapida from "../../components/AcaoRapida"
import DynamicTable, { type DynamicTableColumn } from "../../components/DynamicTable"
import GraficoBarras from "../../components/GraficoBarras"
import { lerSessao } from "../../utils/armazenamentoSessao"
import { buscarPorId as buscarCooperativa } from "../../services/cooperativaService"
import { listarPorCooperativa as listarColetas, type ColetaResponse } from "../../services/coletaService"
import { listarPorCooperativa as listarEstoque, listarDisponiveisPorCooperativa } from "../../services/estoqueService"
import { listarPorCooperativa as listarTriagens } from "../../services/triagemService"
import { listarPorCooperativaEStatus as listarFuncionarios } from "../../services/funcionarioService"

// Mesmos status que o back-end considera "em aberto" para triagem
const STATUS_TRIAGEM_PENDENTE = ["PENDENTE", "EM_ANDAMENTO", "Em triagem"]
const QUANTIDADE_ULTIMAS_COLETAS = 5

interface LinhaColeta {
    id: string
    cooperado: string
    material: string
    peso: string
    status: string
}

const COLUNAS_COLETAS: DynamicTableColumn<LinhaColeta>[] = [
    { key: "id", label: "ID" },
    { key: "cooperado", label: "Cooperado" },
    { key: "material", label: "Material" },
    { key: "peso", label: "Peso" },
    { key: "status", label: "Status" },
]

interface Resumo {
    nomeCooperativa: string
    coletasNoMes: number
    estoqueDisponivelKg: number
    cooperadosAtivos: number
    triagensPendentes: number
    ultimasColetas: LinhaColeta[]
    estoquePorMaterial: { rotulo: string; valor: number }[]
}

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
        Promise.all([
            buscarCooperativa(cooperativaId),
            listarColetas(cooperativaId),
            listarEstoque(cooperativaId),
            listarDisponiveisPorCooperativa(cooperativaId),
            listarTriagens(cooperativaId),
            listarFuncionarios(cooperativaId, "ATIVO"),
        ])
            .then(([cooperativa, coletas, estoque, disponiveis, triagens, ativos]) => {
                if (cancelado) return

                // A coleta não traz o material; ele vem da triagem ligada a ela
                const materialPorColeta = new Map<string, string>()
                triagens.forEach((t) => {
                    if (!materialPorColeta.has(t.coletaId)) materialPorColeta.set(t.coletaId, t.materialCategoria)
                })

                const ordenadas: ColetaResponse[] = [...coletas].sort(
                    (a, b) => new Date(b.dataColeta).getTime() - new Date(a.dataColeta).getTime()
                )

                const porMaterial = new Map<string, number>()
                estoque.forEach((e) => {
                    porMaterial.set(e.materialCategoria, (porMaterial.get(e.materialCategoria) ?? 0) + e.quantidadeKg)
                })

                setResumo({
                    nomeCooperativa: cooperativa.nome,
                    coletasNoMes: coletas.filter((c) => ehDoMesAtual(c.dataColeta)).length,
                    estoqueDisponivelKg: disponiveis.reduce((soma, e) => soma + e.quantidadeKg, 0),
                    cooperadosAtivos: ativos.length,
                    triagensPendentes: triagens.filter((t) => STATUS_TRIAGEM_PENDENTE.includes(t.statusAtual)).length,
                    ultimasColetas: ordenadas.slice(0, QUANTIDADE_ULTIMAS_COLETAS).map((c) => ({
                        id: c.coletaId.slice(0, 8),
                        cooperado: c.cooperadoNome,
                        material: materialPorColeta.get(c.coletaId) ?? "—",
                        peso: `${c.quantidadeKg.toLocaleString("pt-BR")}kg`,
                        status: c.statusAtual,
                    })),
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
            <Header titulo="Visão geral" subtitulo={`Resumo da Cooperativa ${resumo.nomeCooperativa}`} />

            <section className="home-page__cards">
                <Card title="Coletas no mês" bigNumber={resumo.coletasNoMes} subtitle="atualizado agora" />
                <Card
                    title="Estoque total"
                    bigNumber={`${resumo.estoqueDisponivelKg.toLocaleString("pt-BR")} kg`}
                    subtitle="disponível para venda"
                />
                <Card title="Cooperados ativos" bigNumber={resumo.cooperadosAtivos} subtitle="na cooperativa" />
                <Card title="Triagens pendentes" bigNumber={resumo.triagensPendentes} subtitle="aguardando separação" />
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
                    data={resumo.ultimasColetas}
                    rowKey={(linha) => linha.id}
                    emptyMessage="Nenhuma coleta registrada."
                />
                <GraficoBarras
                    titulo="Estoque por Material"
                    subtitulo="Quantidade em estoque"
                    rotuloTotal="Total em estoque"
                    dados={resumo.estoquePorMaterial}
                />
            </section>
        </div>
    )
}

export default Home
