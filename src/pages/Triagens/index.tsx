import "./style.css"
import "../../components/FormularioEdicao/style.css"
import { useCallback, useEffect, useMemo, useState } from "react"
import Header from "../../components/Header"
import Botao from "../../components/Botao"
import Card from "../../components/Card"
import DynamicTable, { type DynamicTableColumn } from "../../components/DynamicTable"
import { lerSessao } from "../../utils/armazenamentoSessao"
import { formatarDecimal } from "../../utils/formatadores"
import { useApi } from "../../hooks/useApi"
import { listarPorCooperativa as listarTriagens, type TriagemResponse } from "../../services/triagemService"

interface LinhaTriagem {
    triagemId: string
    material: string
    equipe: string
    status: string
    quantidadeKg: number
    rejeitoKg: number
    dataTriagem: string
    cooperados: string[]
}

const formatarData = (data: string) => (data ? new Date(data).toLocaleDateString("pt-BR") : "—")

function Triagens() {
    const cooperativaId = lerSessao("renovai_cooperativaId")
    const [verCooperados, setVerCooperados] = useState<LinhaTriagem | null>(null)

    // useCallback: o useApi refaz a chamada sempre que a função muda; com a identidade presa ao
    // cooperativaId, a busca só roda de novo quando a cooperativa muda (e não a cada render).
    const buscarTriagens = useCallback(
        (signal: AbortSignal) => listarTriagens(cooperativaId as string, signal),
        [cooperativaId]
    )
    const { dados: triagens, loading: carregando, erro: erroApi } = useApi<TriagemResponse[]>(
        cooperativaId ? buscarTriagens : null,
        "Não foi possível carregar as triagens."
    )
    const erro = cooperativaId ? erroApi : "Sessão sem cooperativa identificada. Faça login novamente."

    // useMemo: ordenar e mapear a lista é o trabalho mais caro da página; só refaz quando `triagens` muda
    // (abrir/fechar o popup de cooperados re-renderiza a página sem recalcular a lista).
    const linhas = useMemo<LinhaTriagem[]>(
        () =>
            [...(triagens ?? [])]
                .sort((a, b) => new Date(b.dataTriagem).getTime() - new Date(a.dataTriagem).getTime())
                .map((t) => ({
                    triagemId: t.triagemId,
                    material: t.materialCategoria,
                    equipe: t.equipeNome,
                    status: t.statusAtual,
                    quantidadeKg: t.quantidadeKg,
                    rejeitoKg: t.quantidadeRejeitoKg ?? 0,
                    dataTriagem: t.dataTriagem,
                    cooperados: t.cooperadosNomes ?? [],
                })),
        [triagens]
    )

    // Esc fecha o popup de cooperados
    useEffect(() => {
        if (!verCooperados) return
        function aoTeclar(event: KeyboardEvent) {
            if (event.key === "Escape") setVerCooperados(null)
        }
        document.addEventListener("keydown", aoTeclar)
        return () => document.removeEventListener("keydown", aoTeclar)
    }, [verCooperados])

    const colunas: DynamicTableColumn<LinhaTriagem>[] = [
        { key: "material", label: "Material" },
        { key: "equipe", label: "Equipe" },
        { key: "status", label: "Status" },
        {
            key: "quantidadeKg",
            label: "Quantidade (kg)",
            render: (l) => `${formatarDecimal(l.quantidadeKg)} kg`,
        },
        {
            key: "rejeitoKg",
            label: "Rejeito (kg)",
            render: (l) => `${formatarDecimal(l.rejeitoKg)} kg`,
        },
        {
            key: "dataTriagem",
            label: "Data",
            render: (l) => formatarData(l.dataTriagem),
        },
        {
            key: "cooperados",
            label: "Cooperados",
            render: (l) => (
                <button type="button" className="triagens__cooperados-botao" onClick={() => setVerCooperados(l)}>
                    Cooperados
                </button>
            ),
        },
    ]

    if (carregando) return <p className="triagens__estado" role="status">Carregando...</p>
    if (erro) return <p className="triagens__estado triagens__estado--erro" role="alert">{erro}</p>

    const totalTriagens = linhas.length
    const totalTriadoKg = linhas.reduce((soma, l) => soma + l.quantidadeKg, 0)
    const totalRejeitoKg = linhas.reduce((soma, l) => soma + l.rejeitoKg, 0)

    return (
        <div className="triagens">
            <Header titulo="Triagens" subtitulo="Acompanhe as triagens realizadas pela cooperativa" />

            <div className="triagens__informativo">
                <Card title="Triagens" bigNumber={`${totalTriagens}`} subtitle="soma de todas as triagens registradas" />
                <Card title="Material triado" bigNumber={`${formatarDecimal(totalTriadoKg)} kg`} subtitle="soma da quantidade triada" />
                <Card title="Rejeito" bigNumber={`${formatarDecimal(totalRejeitoKg)} kg`} subtitle="soma do rejeito gerado" />
            </div>

            <DynamicTable
                titulo="Todas as triagens"
                columns={colunas}
                data={linhas}
                rowKey={(l) => l.triagemId}
                emptyMessage="Nenhuma triagem registrada."
            />

            {verCooperados && (
                <div
                    className="formulario-edicao__overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setVerCooperados(null)
                    }}
                >
                    <div
                        className="formulario-edicao"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="triagens-cooperados-titulo"
                    >
                        <h2 id="triagens-cooperados-titulo" className="formulario-edicao__titulo">
                            Cooperados da triagem
                        </h2>

                        {verCooperados.cooperados.length === 0 ? (
                            <p className="triagens__popup-vazio">Nenhum cooperado registrado para esta triagem.</p>
                        ) : (
                            <ul className="triagens__cooperados-lista">
                                {verCooperados.cooperados.map((nome, i) => (
                                    <li key={`${nome}-${i}`} className="triagens__cooperado">
                                        {nome}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="formulario-edicao__acoes">
                            <Botao onClick={() => setVerCooperados(null)}>Fechar</Botao>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Triagens
