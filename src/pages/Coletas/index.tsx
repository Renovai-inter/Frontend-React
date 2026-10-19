import "./style.css"
import "../../components/FormularioEdicao/style.css"
import { useEffect, useState } from "react"
import Header from "../../components/Header"
import Botao from "../../components/Botao"
import DynamicTable, { type DynamicTableColumn } from "../../components/DynamicTable"
import { lerSessao } from "../../utils/armazenamentoSessao"
import { formatarDecimal } from "../../utils/formatadores"
import { listarPorCooperativa as listarColetas } from "../../services/coletaService"
import { listarPorCooperativa as listarRotas } from "../../services/rotaService"
import { listarPorCooperativa as listarTriagens, type TriagemResponse } from "../../services/triagemService"
import Card from "../../components/Card"

interface LinhaColeta {
    coletaId: string
    cooperado: string
    status: string
    quantidadeKg: number
    tipo: string
    dataColeta: string
    rota: string
    materiais: TriagemResponse[]
}

const ROTULO_TIPO: Record<string, string> = {
    EXTERNA: "Externa",
    ENTREGA: "Entrega",
}

const formatarData = (data: string) => (data ? new Date(data).toLocaleDateString("pt-BR") : "—")

function Coletas() {
    const cooperativaId = lerSessao("renovai_cooperativaId")

    const [linhas, setLinhas] = useState<LinhaColeta[]>([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)
    const [verMateriais, setVerMateriais] = useState<LinhaColeta | null>(null)

    useEffect(() => {
        if (!cooperativaId) {
            setErro("Sessão sem cooperativa identificada. Faça login novamente.")
            setCarregando(false)
            return
        }

        let cancelado = false
        Promise.allSettled([listarColetas(cooperativaId), listarRotas(cooperativaId), listarTriagens(cooperativaId)])
            .then(([coletas, rotas, triagens]) => {
                if (cancelado) return
                if (coletas.status === "rejected") {
                    setErro("Não foi possível carregar as coletas.")
                    return
                }

                // Rotas e triagens são complementares: se falharem, a tabela segue sem esses dados
                const nomeRota = new Map(
                    (rotas.status === "fulfilled" ? rotas.value : []).map((r) => [r.rotaId, r.nome])
                )
                // A coleta não traz os materiais; eles vêm das triagens ligadas a ela
                const materiaisPorColeta = new Map<string, TriagemResponse[]>()
                if (triagens.status === "fulfilled") {
                    triagens.value.forEach((t) => {
                        materiaisPorColeta.set(t.coletaId, [...(materiaisPorColeta.get(t.coletaId) ?? []), t])
                    })
                }

                const ordenadas = [...coletas.value].sort(
                    (a, b) => new Date(b.dataColeta).getTime() - new Date(a.dataColeta).getTime()
                )
                setLinhas(
                    ordenadas.map((c) => ({
                        coletaId: c.coletaId,
                        cooperado: c.cooperadoNome,
                        status: c.statusAtual,
                        quantidadeKg: c.quantidadeKg,
                        tipo: ROTULO_TIPO[c.tipoColeta] ?? c.tipoColeta,
                        dataColeta: c.dataColeta,
                        rota: c.rotaId ? nomeRota.get(c.rotaId) ?? "—" : "—",
                        materiais: materiaisPorColeta.get(c.coletaId) ?? [],
                    }))
                )
            })
            .finally(() => {
                if (!cancelado) setCarregando(false)
            })

        return () => {
            cancelado = true
        }
    }, [cooperativaId])

    // Esc fecha o popup de materiais
    useEffect(() => {
        if (!verMateriais) return
        function aoTeclar(event: KeyboardEvent) {
            if (event.key === "Escape") setVerMateriais(null)
        }
        document.addEventListener("keydown", aoTeclar)
        return () => document.removeEventListener("keydown", aoTeclar)
    }, [verMateriais])

    const colunas: DynamicTableColumn<LinhaColeta>[] = [
        { key: "cooperado", label: "Cooperado" },
        { key: "status", label: "Status" },
        {
            key: "quantidadeKg",
            label: "Quantidade (kg)",
            render: (l) => `${formatarDecimal(l.quantidadeKg)} kg`,
        },
        { key: "tipo", label: "Tipo" },
        {
            key: "dataColeta",
            label: "Data",
            render: (l) => formatarData(l.dataColeta),
        },
        { key: "rota", label: "Rota" },
        {
            key: "materiais",
            label: "Materiais",
            render: (l) => (
                <button type="button" className="coletas__materiais-botao" onClick={() => setVerMateriais(l)}>
                    Materiais
                </button>
            ),
        },
    ]

    if (carregando) return <p className="coletas__estado">Carregando...</p>
    if (erro) return <p className="coletas__estado coletas__estado--erro">{erro}</p>

    const totalColetas = linhas.length
    const totalColetasFinalizadas = linhas.filter((l) => l.status === "Coletado").length
    const totalColetasAgendadas = linhas.filter((l) => l.status === "Agendada").length

    return (
        <div className="coletas">
            <Header titulo="Coletas" subtitulo="Acompanhe as coletas realizadas pela cooperativa" />

            <div className="coletas__informativo">
                <Card title="Coletas" bigNumber={`${totalColetas}`} subtitle="soma de todas as coletas registradas" />
                <Card title="Coletas finalizadas" bigNumber={`${totalColetasFinalizadas}`} subtitle="soma de todas as coletas completas" />
                <Card title="Coletas agendadas" bigNumber={`${totalColetasAgendadas}`} subtitle="soma de todas as coletas agendadas" />                
            </div>

            <DynamicTable
                titulo="Todas as coletas"
                columns={colunas}
                data={linhas}
                rowKey={(l) => l.coletaId}
                emptyMessage="Nenhuma coleta registrada."
            />

            {verMateriais && (
                <div
                    className="formulario-edicao__overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setVerMateriais(null)
                    }}
                >
                    <div
                        className="formulario-edicao coletas__popup"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="coletas-materiais-titulo"
                    >
                        <h2 id="coletas-materiais-titulo" className="formulario-edicao__titulo">
                            Materiais da coleta
                        </h2>

                        {verMateriais.materiais.length === 0 ? (
                            <p className="coletas__popup-vazio">Nenhum material registrado para esta coleta.</p>
                        ) : (
                            <ul className="coletas__materiais-lista">
                                {verMateriais.materiais.map((m) => (
                                    <li key={m.triagemId} className="coletas__material">
                                        <strong>{m.materialCategoria}</strong>
                                        <span>Quantidade: {formatarDecimal(m.quantidadeKg)} kg</span>
                                        <span>Rejeito: {formatarDecimal(m.quantidadeRejeitoKg ?? 0)} kg</span>
                                        <span>Status: {m.statusAtual}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="formulario-edicao__acoes">
                            <Botao onClick={() => setVerMateriais(null)}>Fechar</Botao>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Coletas
