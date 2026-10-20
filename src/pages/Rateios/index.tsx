import "./style.css"
import "../../components/FormularioEdicao/style.css"
import { useCallback, useEffect, useMemo, useState } from "react"
import Header from "../../components/Header"
import Botao from "../../components/Botao"
import Card from "../../components/Card"
import DynamicTable, { type DynamicTableColumn } from "../../components/DynamicTable"
import { lerSessao } from "../../utils/armazenamentoSessao"
import { formatarDecimal } from "../../utils/formatadores"
import {
    buscarPorId,
    executarRateioGeral,
    executarRateioProporcional,
    listarPorCooperativa as listarRateios,
    type RateioDetalheResponse,
    type RateioListaResponse,
} from "../../services/rateioService"
import { listarPorCooperativa as listarFuncionarios } from "../../services/funcionarioService"
import { listarPorCooperativa as listarColetas } from "../../services/coletaService"
import { listarLancamentosPorMes, type LancamentoDespesaResponse } from "../../services/despesaService"
import { calcularTotalAcumulado, calcularTotalLiquido } from "../../services/functionEProceduresService"

type TipoRateio = "GERAL" | "PROPORCIONAL"

interface Participante {
    funcionarioId: string
    nome: string
    kg: number
}

const ROTULO_TIPO: Record<TipoRateio, string> = {
    GERAL: "Geral (partes iguais)",
    PROPORCIONAL: "Proporcional ao peso coletado",
}

const formatarMoeda = (valor: number) => `R$ ${formatarDecimal(valor)}`
const formatarData = (data: string) => (data ? new Date(data).toLocaleDateString("pt-BR") : "—")
const iniciais = (nome: string) =>
    nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join("")

function rotuloTipoHistorico(tipo: string) {
    const normalizado = tipo?.toUpperCase()
    if (normalizado?.includes("PROPORCIONAL")) return "Proporcional"
    if (normalizado?.includes("GERAL")) return "Geral"
    return tipo || "—"
}

// Limites do mês corrente no formato LocalDateTime que a API espera
function periodoDoMes(referencia: Date) {
    const ano = referencia.getFullYear()
    const mes = referencia.getMonth()
    const pad = (n: number) => String(n).padStart(2, "0")
    const ultimoDia = new Date(ano, mes + 1, 0).getDate()
    return {
        inicio: `${ano}-${pad(mes + 1)}-01T00:00:00`,
        fim: `${ano}-${pad(mes + 1)}-${pad(ultimoDia)}T23:59:59`,
        mesReferencia: `${ano}-${pad(mes + 1)}-01`,
        rotulo: referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        ano,
        mes,
    }
}

// Distribui 100% entre os participantes conforme o tipo, fechando a soma em 100 (centésimos)
function calcularPercentuais(participantes: Participante[], tipo: TipoRateio): Record<string, number> {
    const totalKg = participantes.reduce((soma, p) => soma + p.kg, 0)
    const usarPeso = tipo === "PROPORCIONAL" && totalKg > 0
    const percentuais: Record<string, number> = {}
    let acumulado = 0
    participantes.forEach((p, i) => {
        const bruto = usarPeso ? (p.kg / totalKg) * 100 : 100 / participantes.length
        const valor = i === participantes.length - 1 ? Math.round((100 - acumulado) * 100) / 100 : Math.round(bruto * 100) / 100
        percentuais[p.funcionarioId] = valor
        acumulado += valor
    })
    return percentuais
}

function Rateios() {
    const cooperativaId = lerSessao("renovai_cooperativaId")
    const gestorId = lerSessao("renovai_funcionarioId")
    const periodo = useMemo(() => periodoDoMes(new Date()), [])

    const [historico, setHistorico] = useState<RateioListaResponse[]>([])
    const [participantes, setParticipantes] = useState<Participante[]>([])
    const [lancamentos, setLancamentos] = useState<LancamentoDespesaResponse[]>([])
    const [totalAcumulado, setTotalAcumulado] = useState(0)
    const [totalLiquido, setTotalLiquido] = useState(0)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)

    const [tipo, setTipo] = useState<TipoRateio>("PROPORCIONAL")
    const [percentuais, setPercentuais] = useState<Record<string, number>>({})
    const [personalizado, setPersonalizado] = useState(false)
    const [fechando, setFechando] = useState(false)
    const [erroFechamento, setErroFechamento] = useState<string | null>(null)

    const [detalhe, setDetalhe] = useState<RateioDetalheResponse | null>(null)
    const [carregandoDetalhe, setCarregandoDetalhe] = useState(false)
    const [erroDetalhe, setErroDetalhe] = useState<string | null>(null)

    const carregar = useCallback(
        async (cancelado: () => boolean = () => false) => {
            if (!cooperativaId) {
                setErro("Sessão sem cooperativa identificada. Faça login novamente.")
                setCarregando(false)
                return
            }

            const intervalo = { cooperativaId, dataInicio: periodo.inicio, dataFim: periodo.fim }
            const [rateios, funcionarios, coletas, despesas, acumulado, liquido] = await Promise.allSettled([
                listarRateios(cooperativaId),
                listarFuncionarios(cooperativaId),
                listarColetas(cooperativaId),
                listarLancamentosPorMes(cooperativaId, periodo.mesReferencia),
                calcularTotalAcumulado(intervalo),
                calcularTotalLiquido(intervalo),
            ])
            if (cancelado()) return

            if (rateios.status === "rejected") {
                setErro("Não foi possível carregar os rateios.")
                setCarregando(false)
                return
            }

            setHistorico(
                [...rateios.value].sort((a, b) => new Date(b.dataRateio).getTime() - new Date(a.dataRateio).getTime())
            )

            // Peso coletado no mês por cooperado (a coleta só traz o nome do cooperado)
            const kgPorNome = new Map<string, number>()
            if (coletas.status === "fulfilled") {
                coletas.value.forEach((c) => {
                    const data = new Date(c.dataColeta)
                    if (data.getFullYear() !== periodo.ano || data.getMonth() !== periodo.mes) return
                    kgPorNome.set(c.cooperadoNome, (kgPorNome.get(c.cooperadoNome) ?? 0) + (c.quantidadeKg ?? 0))
                })
            }
            setParticipantes(
                (funcionarios.status === "fulfilled" ? funcionarios.value : [])
                    .filter((f) => f.estaAtivo)
                    .map((f) => ({
                        funcionarioId: f.funcionarioId,
                        nome: f.usuarioNome,
                        kg: kgPorNome.get(f.usuarioNome) ?? 0,
                    }))
            )
            setLancamentos(despesas.status === "fulfilled" ? despesas.value : [])
            setTotalAcumulado(acumulado.status === "fulfilled" ? acumulado.value : 0)
            setTotalLiquido(liquido.status === "fulfilled" ? liquido.value : 0)
            setCarregando(false)
        },
        [cooperativaId, periodo]
    )

    useEffect(() => {
        let cancelado = false
        carregar(() => cancelado)
        return () => {
            cancelado = true
        }
    }, [carregar])

    // Recalcula os percentuais sempre que muda o tipo ou a lista de participantes
    useEffect(() => {
        setPercentuais(calcularPercentuais(participantes, tipo))
        setPersonalizado(false)
    }, [participantes, tipo])

    // Esc fecha o popup de detalhes
    useEffect(() => {
        if (!detalhe && !erroDetalhe) return
        function aoTeclar(event: KeyboardEvent) {
            if (event.key === "Escape") fecharDetalhe()
        }
        document.addEventListener("keydown", aoTeclar)
        return () => document.removeEventListener("keydown", aoTeclar)
    }, [detalhe, erroDetalhe])

    function fecharDetalhe() {
        setDetalhe(null)
        setErroDetalhe(null)
    }

    async function abrirDetalhe(rateioId: string) {
        setCarregandoDetalhe(true)
        setErroDetalhe(null)
        try {
            setDetalhe(await buscarPorId(rateioId))
        } catch {
            setErroDetalhe("Não foi possível carregar os detalhes do rateio.")
        } finally {
            setCarregandoDetalhe(false)
        }
    }

    function alterarPercentual(funcionarioId: string, texto: string) {
        const valor = Math.min(100, Math.max(0, Number(texto.replace(",", ".")) || 0))
        setPercentuais((atual) => ({ ...atual, [funcionarioId]: valor }))
        setPersonalizado(true)
    }

    function restaurarPercentuais() {
        setPercentuais(calcularPercentuais(participantes, tipo))
        setPersonalizado(false)
    }

    const somaPercentuais = participantes.reduce((soma, p) => soma + (percentuais[p.funcionarioId] ?? 0), 0)
    const somaValida = Math.abs(somaPercentuais - 100) < 0.01
    const jaFechadoNoMes = historico.some((r) => {
        const data = new Date(r.dataRateio)
        return data.getFullYear() === periodo.ano && data.getMonth() === periodo.mes
    })

    async function fecharRateio() {
        if (!cooperativaId || !gestorId) {
            setErroFechamento("Sessão sem gestor identificado. Faça login novamente.")
            return
        }
        setFechando(true)
        setErroFechamento(null)
        try {
            const dados = { gestorId, cooperativaId, dataInicio: periodo.inicio, dataFim: periodo.fim }
            if (tipo === "GERAL") await executarRateioGeral(dados)
            else await executarRateioProporcional(dados)
            await carregar()
        } catch {
            setErroFechamento("Não foi possível fechar o rateio. Tente novamente.")
        } finally {
            setFechando(false)
        }
    }

    const totalDespesas = lancamentos.reduce((soma, l) => soma + l.valor, 0)
    const percentualLiquido = totalAcumulado > 0 ? Math.min(100, (totalLiquido / totalAcumulado) * 100) : 0
    const totalDistribuido = historico.reduce((soma, r) => soma + r.valorTotalDistribuido, 0)
    const ultimo = historico[0]

    const colunas: DynamicTableColumn<RateioListaResponse>[] = [
        { key: "dataRateio", label: "Data", render: (r) => formatarData(r.dataRateio) },
        { key: "tipoRateio", label: "Tipo", render: (r) => rotuloTipoHistorico(r.tipoRateio) },
        { key: "gestorNome", label: "Gestor" },
        { key: "quantidadePessoas", label: "Pessoas" },
        {
            key: "valorTotalDistribuido",
            label: "Total distribuído",
            render: (r) => formatarMoeda(r.valorTotalDistribuido),
        },
        {
            key: "rateioId",
            label: "Distribuição",
            render: (r) => (
                <button type="button" className="rateios__detalhes-botao" onClick={() => abrirDetalhe(r.rateioId)}>
                    Ver detalhes
                </button>
            ),
        },
    ]

    if (carregando) return <p className="rateios__estado">Carregando...</p>
    if (erro) return <p className="rateios__estado rateios__estado--erro">{erro}</p>

    return (
        <div className="rateios">
            <Header titulo="Rateios" subtitulo="Acompanhe e feche os rateios da cooperativa" />

            <div className="rateios__informativo">
                <Card title="Rateios realizados" bigNumber={`${historico.length}`} subtitle="soma de todos os rateios registrados" />
                <Card title="Total distribuído" bigNumber={formatarMoeda(totalDistribuido)} subtitle="soma de tudo que já foi repassado" />
                <Card
                    title="Último rateio"
                    bigNumber={ultimo ? formatarMoeda(ultimo.valorTotalDistribuido) : "—"}
                    subtitle={ultimo ? `realizado em ${formatarData(ultimo.dataRateio)}` : "nenhum rateio realizado ainda"}
                />
            </div>

            <section className="rateios__aberto" aria-labelledby="rateio-aberto-titulo">
                <header className="rateios__aberto-topo">
                    <div>
                        <h2 id="rateio-aberto-titulo" className="rateios__aberto-titulo">
                            Rateio de {periodo.rotulo}
                        </h2>
                        <p className="rateios__aberto-subtitulo">Distribuição prevista com base nos dados do mês corrente</p>
                    </div>
                    <span className={`rateios__selo ${jaFechadoNoMes ? "rateios__selo--fechado" : ""}`}>
                        {jaFechadoNoMes ? "Fechado" : "Aberto"}
                    </span>
                </header>

                <div className="rateios__campo">
                    <label htmlFor="rateio-tipo">Tipo de rateio</label>
                    <select
                        id="rateio-tipo"
                        className="rateios__entrada"
                        value={tipo}
                        disabled={jaFechadoNoMes || fechando}
                        onChange={(e) => setTipo(e.target.value as TipoRateio)}
                    >
                        {(Object.keys(ROTULO_TIPO) as TipoRateio[]).map((t) => (
                            <option key={t} value={t}>
                                {ROTULO_TIPO[t]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="rateios__acumulado">
                    <div className="rateios__acumulado-linha">
                        <span>Valor acumulado</span>
                        <strong>{formatarMoeda(totalAcumulado)}</strong>
                    </div>
                    <div
                        className="rateios__barra"
                        role="progressbar"
                        aria-label="Valor líquido sobre o acumulado"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(percentualLiquido)}
                    >
                        <div className="rateios__barra-preenchimento" style={{ width: `${percentualLiquido}%` }} />
                    </div>
                    <p className="rateios__acumulado-nota">
                        Líquido a distribuir: <strong>{formatarMoeda(totalLiquido)}</strong> (após {formatarMoeda(totalDespesas)} em despesas)
                    </p>
                </div>

                <div className="rateios__distribuicao">
                    <div className="rateios__distribuicao-topo">
                        <h3>Distribuição por cooperado</h3>
                        {personalizado && (
                            <button type="button" className="rateios__link" onClick={restaurarPercentuais}>
                                Restaurar cálculo automático
                            </button>
                        )}
                    </div>

                    {participantes.length === 0 ? (
                        <p className="rateios__vazio">Nenhum cooperado ativo na cooperativa.</p>
                    ) : (
                        <table className="rateios__tabela">
                            <thead>
                                <tr>
                                    <th scope="col">Cooperado</th>
                                    <th scope="col">Peso no mês</th>
                                    <th scope="col">%</th>
                                    <th scope="col">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participantes.map((p) => {
                                    const percentual = percentuais[p.funcionarioId] ?? 0
                                    return (
                                        <tr key={p.funcionarioId}>
                                            <td>
                                                <div className="rateios__pessoa">
                                                    <span className="rateios__avatar" aria-hidden="true">
                                                        {iniciais(p.nome)}
                                                    </span>
                                                    {p.nome}
                                                </div>
                                            </td>
                                            <td className="rateios__peso">{formatarDecimal(p.kg)} kg</td>
                                            <td>
                                                <div className="rateios__percentual">
                                                    <div className="rateios__mini-barra" aria-hidden="true">
                                                        <div style={{ width: `${percentual}%` }} />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        className="rateios__entrada rateios__entrada--pequena"
                                                        min={0}
                                                        max={100}
                                                        step={0.01}
                                                        aria-label={`Percentual de ${p.nome}`}
                                                        value={percentual}
                                                        disabled={jaFechadoNoMes || fechando}
                                                        onChange={(e) => alterarPercentual(p.funcionarioId, e.target.value)}
                                                    />
                                                    <span>%</span>
                                                </div>
                                            </td>
                                            <td className="rateios__valor">{formatarMoeda((totalLiquido * percentual) / 100)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2}>Total</td>
                                    <td className={somaValida ? "" : "rateios__soma--invalida"}>{formatarDecimal(somaPercentuais)}%</td>
                                    <td className="rateios__valor">{formatarMoeda((totalLiquido * somaPercentuais) / 100)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                    {!somaValida && participantes.length > 0 && (
                        <p className="rateios__aviso rateios__aviso--erro">Os percentuais precisam somar 100% para fechar o rateio.</p>
                    )}
                </div>

                <div className="rateios__despesas">
                    <h3>Despesas do mês</h3>
                    {lancamentos.length === 0 ? (
                        <p className="rateios__vazio">Nenhuma despesa lançada neste mês.</p>
                    ) : (
                        <div className="rateios__despesas-grade">
                            {lancamentos.map((l) => (
                                <div className="rateios__campo" key={l.lancamentoId}>
                                    <label>{l.despesaNome}</label>
                                    <output className="rateios__entrada">{formatarMoeda(l.valor)}</output>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {personalizado && (
                    <p className="rateios__aviso">
                        Atenção: o servidor ainda calcula o rateio pelo tipo selecionado e não recebe percentuais personalizados. O
                        fechamento usará o cálculo automático.
                    </p>
                )}
                {jaFechadoNoMes && <p className="rateios__aviso">O rateio deste mês já foi realizado e consta no histórico abaixo.</p>}
                {erroFechamento && <p className="rateios__aviso rateios__aviso--erro">{erroFechamento}</p>}

                <Botao
                    className="rateios__fechar"
                    ativo={!jaFechadoNoMes && !fechando && somaValida && participantes.length > 0}
                    onClick={fecharRateio}
                >
                    {fechando ? "Fechando..." : "Fechar rateio"}
                </Botao>
            </section>

            <DynamicTable
                titulo="Histórico de rateios"
                columns={colunas}
                data={historico}
                rowKey={(r) => r.rateioId}
                emptyMessage="Nenhum rateio registrado."
            />

            {(detalhe || erroDetalhe || carregandoDetalhe) && (
                <div
                    className="formulario-edicao__overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) fecharDetalhe()
                    }}
                >
                    <div className="formulario-edicao rateios__popup" role="dialog" aria-modal="true" aria-labelledby="rateio-detalhe-titulo">
                        <h2 id="rateio-detalhe-titulo" className="formulario-edicao__titulo">
                            Distribuição do rateio
                        </h2>

                        {carregandoDetalhe && <p className="rateios__vazio">Carregando...</p>}
                        {erroDetalhe && <p className="rateios__aviso rateios__aviso--erro">{erroDetalhe}</p>}
                        {detalhe && (
                            <>
                                <p className="rateios__vazio">
                                    {rotuloTipoHistorico(detalhe.tipoRateio)} · {formatarData(detalhe.dataRateio)} · gestor {detalhe.gestorNome}
                                </p>
                                <ul className="rateios__detalhe-lista">
                                    {detalhe.funcionarios.map((f) => (
                                        <li key={f.funcionarioId} className="rateios__detalhe-item">
                                            <div>
                                                <strong>{f.funcionarioNome}</strong>
                                                <span>
                                                    {f.cargo} · {formatarDecimal(f.percentualParticipacao)}%
                                                </span>
                                            </div>
                                            <strong>{formatarMoeda(f.valorRateio)}</strong>
                                        </li>
                                    ))}
                                </ul>
                                <p className="rateios__detalhe-total">
                                    Total distribuído: <strong>{formatarMoeda(detalhe.valorTotalDistribuido)}</strong>
                                </p>
                            </>
                        )}

                        <div className="formulario-edicao__acoes">
                            <Botao onClick={fecharDetalhe}>Fechar</Botao>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Rateios
