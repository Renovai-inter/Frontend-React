import "./style.css"
import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import Header from "../../components/Header"
import Card from "../../components/Card"
import Botao from "../../components/Botao"
import DynamicTable, { type DynamicTableColumn } from "../../components/DynamicTable"
import FormularioEdicao from "../../components/FormularioEdicao"
import type { CampoFormulario, ValoresFormulario } from "../../types/FormularioEdicao/FormularioEdicaoProps"
import { lerSessao } from "../../utils/armazenamentoSessao"
import { formatarDecimal } from "../../utils/formatadores"
import {
    atualizarQuantidade,
    criar as criarEstoque,
    listarPorCooperativa as listarEstoque,
    type EstoqueResponse,
} from "../../services/estoqueService"
import {
    atualizar as atualizarMaterial,
    criar as criarMaterial,
    deletar as deletarMaterial,
    listar as listarMateriais,
    type MaterialResponse,
} from "../../services/materialService"
import {
    criar as criarCategoria,
    deletar as deletarCategoria,
    listar as listarCategorias,
    type CategoriaMaterialResponse,
} from "../../services/categoriaMaterialService"

interface LinhaEstoque {
    estoqueId: string
    materialId: string
    material: string
    quantidadeKg: number
    precoSugerido: number | null
    valorTotal: number | null
    disponivel: boolean
    atualizadoEm: string
}

const COLUNAS_ESTOQUE: DynamicTableColumn<LinhaEstoque>[] = [
    { key: "material", label: "Material" },
    {
        key: "quantidadeKg",
        label: "Quantidade (kg)",
        render: (l) => `${formatarDecimal(l.quantidadeKg)} kg`,
    },
    {
        key: "precoSugerido",
        label: "Preço sugerido (R$/kg)",
        render: (l) => (l.precoSugerido === null ? "—" : formatarDecimal(l.precoSugerido)),
    },
    {
        key: "valorTotal",
        label: "Valor estimado (R$)",
        render: (l) => (l.valorTotal === null ? "—" : formatarDecimal(l.valorTotal)),
    },
    {
        key: "disponivel",
        label: "Disponibilidade",
        render: (l) => (
            <span className={`estoque__badge ${l.disponivel ? "estoque__badge--ok" : "estoque__badge--off"}`}>
                {l.disponivel ? "Disponível" : "Indisponível"}
            </span>
        ),
    },
    {
        key: "atualizadoEm",
        label: "Atualizado em",
        render: (l) => (l.atualizadoEm ? new Date(l.atualizadoEm).toLocaleDateString("pt-BR") : "—"),
    },
]

// Aceita "12,5" ou "12.5"; mantém só dígitos e um separador decimal
function mascaraQuantidade(valor: string): string {
    const limpo = valor.replace(/[^\d.,]/g, "").replace(".", ",")
    const [inteiro, ...resto] = limpo.split(",")
    return resto.length ? `${inteiro},${resto.join("")}` : inteiro
}

function paraNumero(valor: string): number {
    return Number(valor.replace(",", "."))
}

const CAMPOS_EDITAR: CampoFormulario[] = [
    {
        nome: "quantidadeKg",
        rotulo: "Nova quantidade em estoque (kg)",
        obrigatorio: true,
        placeholder: "0,00",
        mascara: mascaraQuantidade,
        validar: (v) => (Number.isFinite(paraNumero(v)) && paraNumero(v) >= 0 ? undefined : "Informe uma quantidade válida."),
    },
    {
        nome: "disponibilidade",
        rotulo: "Disponibilidade (com 0 kg o material fica sempre indisponível)",
        tipo: "selecao",
        opcoes: [
            { valor: "disponivel", rotulo: "Disponível" },
            { valor: "indisponivel", rotulo: "Indisponível" },
        ],
    },
]

const validarNumeroNaoNegativo = (v: string) =>
    Number.isFinite(paraNumero(v)) && paraNumero(v) >= 0 ? undefined : "Informe um valor válido."

const normalizarNome = (nome: string) => nome.trim().toLowerCase()

function montarCamposNovo(nomesEmEstoque: Set<string>): CampoFormulario[] {
    return [
        {
            nome: "nome",
            rotulo: "Nome do material",
            obrigatorio: true,
            placeholder: "Ex.: Plástico PET, Papelão, Vidro",
            validar: (v) =>
                v.length > 100
                    ? "Use no máximo 100 caracteres."
                    : nomesEmEstoque.has(normalizarNome(v))
                        ? "Este material já está no estoque."
                        : undefined,
        },
        {
            nome: "quantidadeKg",
            rotulo: "Quantidade em estoque (kg)",
            obrigatorio: true,
            placeholder: "0,00",
            mascara: mascaraQuantidade,
            validar: validarNumeroNaoNegativo,
        },
        {
            nome: "precoSugerido",
            rotulo: "Preço sugerido (R$/kg)",
            placeholder: "0,00",
            mascara: mascaraQuantidade,
            validar: validarNumeroNaoNegativo,
        },
    ]
}

function montarLinhas(estoque: EstoqueResponse[], materiais: MaterialResponse[] | null): LinhaEstoque[] {
    const porId = new Map((materiais ?? []).map((m) => [m.materialId, m]))

    return estoque.map((e) => {
        const material = porId.get(e.materialId)
        const preco = material?.precoSugerido ?? null
        return {
            estoqueId: e.estoqueId,
            materialId: e.materialId,
            material: e.materialCategoria,
            quantidadeKg: e.quantidadeKg,
            precoSugerido: preco,
            valorTotal: preco === null ? null : preco * e.quantidadeKg,
            // Sem o cadastro do material, a disponibilidade vem da quantidade em estoque
            disponivel: (material ? material.estaDisponivel : true) && e.quantidadeKg > 0,
            atualizadoEm: e.dataAtualizacao,
        }
    })
}

function mensagemDeErro(err: unknown): string {
    if (axios.isAxiosError(err)) {
        return err.response?.data?.message ?? err.response?.data?.erro ?? "Não foi possível salvar as alterações."
    }
    return "Não foi possível conectar ao servidor. Tente novamente."
}

function Estoque() {
    const cooperativaId = lerSessao("renovai_cooperativaId")

    const [linhas, setLinhas] = useState<LinhaEstoque[]>([])
    const [materiais, setMateriais] = useState<MaterialResponse[]>([])
    const [categorias, setCategorias] = useState<CategoriaMaterialResponse[]>([])
    const [adicionando, setAdicionando] = useState(false)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)
    const [editando, setEditando] = useState<LinhaEstoque | null>(null)
    const [excluindo, setExcluindo] = useState<LinhaEstoque | null>(null)
    const [excluindoEmAndamento, setExcluindoEmAndamento] = useState(false)
    const [erroExclusao, setErroExclusao] = useState<string | null>(null)

    useEffect(() => {
        if (!cooperativaId) {
            setErro("Sessão sem cooperativa identificada. Faça login novamente.")
            setCarregando(false)
            return
        }

        let cancelado = false
        Promise.allSettled([listarEstoque(cooperativaId), listarMateriais(), listarCategorias()])
            .then(([estoque, mats, cats]) => {
                if (cancelado) return
                if (estoque.status === "rejected") {
                    setErro("Não foi possível carregar o estoque.")
                    return
                }
                const listaMateriais = mats.status === "fulfilled" ? mats.value : null
                setMateriais(listaMateriais ?? [])
                setCategorias(cats.status === "fulfilled" ? cats.value : [])
                setLinhas(montarLinhas(estoque.value, listaMateriais))
            })
            .finally(() => {
                if (!cancelado) setCarregando(false)
            })

        return () => {
            cancelado = true
        }
    }, [cooperativaId])

    // Grava a nova quantidade e a disponibilidade do material (sem quantidade, nunca fica disponível)
    const aplicarQuantidade = useCallback(
        async (linha: LinhaEstoque, novaQuantidadeKg: number, quererDisponivel: boolean, motivo: string) => {
            const atualizado = await atualizarQuantidade(linha.estoqueId, { novaQuantidadeKg, motivo })
            const disponivel = quererDisponivel && novaQuantidadeKg > 0

            const material = materiais.find((m) => m.materialId === linha.materialId)
            let materialAtual = material
            if (material && material.estaDisponivel !== disponivel) {
                materialAtual = await atualizarMaterial(material.materialId, {
                    categoriaId: material.categoriaId,
                    cooperativaId: material.cooperativaId,
                    precoSugerido: material.precoSugerido,
                    estaDisponivel: disponivel,
                })
                setMateriais((atual) => atual.map((m) => (m.materialId === materialAtual!.materialId ? materialAtual! : m)))
            }

            const preco = materialAtual?.precoSugerido ?? linha.precoSugerido
            setLinhas((atual) =>
                atual.map((l) =>
                    l.estoqueId === linha.estoqueId
                        ? {
                            ...l,
                            quantidadeKg: atualizado.quantidadeKg,
                            atualizadoEm: atualizado.dataAtualizacao,
                            precoSugerido: preco,
                            valorTotal: preco === null ? null : preco * atualizado.quantidadeKg,
                            disponivel,
                        }
                        : l
                )
            )
        },
        [materiais]
    )

    async function salvarEdicao(valores: ValoresFormulario) {
        if (!editando) return
        await aplicarQuantidade(
            editando,
            paraNumero(valores.quantidadeKg),
            valores.disponibilidade === "disponivel",
            "Ajuste manual pela tela de estoque"
        )
    }

    async function desfazerCategoria(categoriaId: string) {
        await deletarCategoria(categoriaId).catch(() => undefined)
        setCategorias((atual) => atual.filter((c) => c.categoriaId !== categoriaId))
    }

    // Cria o material (e sua categoria, se o nome for novo) e o registro de estoque com a quantidade inicial
    async function salvarNovoMaterial(valores: ValoresFormulario) {
        if (!cooperativaId) return

        const quantidadeKg = paraNumero(valores.quantidadeKg)

        let categoria = categorias.find((c) => normalizarNome(c.nomeCategoria) === normalizarNome(valores.nome))
        const categoriaCriada = !categoria
        if (!categoria) {
            categoria = await criarCategoria({ nomeCategoria: valores.nome })
            setCategorias((atual) => [...atual, categoria!])
            console.log('categoria criada', categoria)
        }

        let material: MaterialResponse
        try {
            material = await criarMaterial({
                categoriaId: categoria.categoriaId,
                cooperativaId,
                precoSugerido: valores.precoSugerido ? paraNumero(valores.precoSugerido) : undefined,
                estaDisponivel: quantidadeKg > 0,
            })
            console.log('material criado', material)

        } catch (err) {
            if (categoriaCriada) await desfazerCategoria(categoria.categoriaId)
            throw err
        }

        let estoque: EstoqueResponse
        try {
            // O backend pode já ter criado o estoque junto com o material: nesse caso só ajusta a quantidade
            const existentes = await listarEstoque(cooperativaId)
            const existente = existentes.find((e) => e.materialId === material.materialId)
            if (existente) {
                estoque =
                    quantidadeKg === existente.quantidadeKg
                        ? existente
                        : await atualizarQuantidade(existente.estoqueId, {
                            novaQuantidadeKg: quantidadeKg,
                            motivo: "Quantidade inicial",
                        })
            } else {
                estoque = await criarEstoque({ cooperativaId, materialId: material.materialId, quantidadeKg })
            }
            console.log('estoque criado', estoque)
        } catch (err) {
            // Evita deixar material ou categoria órfãos, sem registro de estoque
            await deletarMaterial(material.materialId).catch(() => undefined)
            if (categoriaCriada) await desfazerCategoria(categoria.categoriaId)
            throw err
        }

        setMateriais((atual) => [...atual, material])
        setLinhas((atual) => [...atual, ...montarLinhas([estoque], [material])])
    }

    async function confirmarExclusao() {
        if (!excluindo) return
        setExcluindoEmAndamento(true)
        setErroExclusao(null)
        try {
            await aplicarQuantidade(excluindo, 0, false, "Material removido do estoque")
            setExcluindo(null)
        } catch (err) {
            setErroExclusao(mensagemDeErro(err))
        } finally {
            setExcluindoEmAndamento(false)
        }
    }

    function fecharExclusao() {
        if (excluindoEmAndamento) return
        setExcluindo(null)
        setErroExclusao(null)
    }

    // Fecha o popup de exclusão com Esc
    useEffect(() => {
        if (!excluindo) return
        function aoTeclar(event: KeyboardEvent) {
            if (event.key === "Escape") fecharExclusao()
        }
        document.addEventListener("keydown", aoTeclar)
        return () => document.removeEventListener("keydown", aoTeclar)
    })

    if (carregando) return <p className="estoque__estado">Carregando...</p>
    if (erro) return <p className="estoque__estado estoque__estado--erro">{erro}</p>

    // Nomes que já estão no estoque desta cooperativa não podem ser cadastrados de novo
    const camposNovo = montarCamposNovo(new Set(linhas.map((l) => normalizarNome(l.material ?? ""))))

    const pesoTotal = linhas.reduce((soma, l) => soma + l.quantidadeKg, 0)
    const valorEstimado = linhas.reduce((soma, l) => (l.disponivel ? soma + (l.valorTotal ?? 0) : soma), 0)
    const semDisponibilidade = linhas.filter((l) => !l.disponivel).length

    return (
        <div className="estoque">
            <section className="estoque__head">
                <Header titulo="Estoque" subtitulo="Gerencie os produtos em estoque" />
                <Botao onClick={() => setAdicionando(true)}>Adicionar material</Botao>
            </section>

            <section className="estoque__cards">
                <Card title="Peso total em estoque" bigNumber={`${formatarDecimal(pesoTotal)} kg`} subtitle="soma de todos os materiais" />
                <Card title="Valor estimado" bigNumber={`R$ ${formatarDecimal(valorEstimado)}`} subtitle="com base no preço sugerido" />
                <Card title="Materiais sem disponibilidade" bigNumber={semDisponibilidade} subtitle="indisponíveis para venda" />
            </section>

            <DynamicTable
                titulo="Materiais em estoque"
                columns={COLUNAS_ESTOQUE}
                data={linhas}
                rowKey={(l) => l.estoqueId}
                onEdit={setEditando}
                onDelete={setExcluindo}
                emptyMessage="Nenhum material em estoque."
            />

            <FormularioEdicao
                aberto={!!editando}
                titulo={editando ? `Editar ${editando.material}` : "Editar material"}
                campos={CAMPOS_EDITAR}
                valoresIniciais={{
                    quantidadeKg: editando ? String(editando.quantidadeKg).replace(".", ",") : "",
                    disponibilidade: editando?.disponivel ? "disponivel" : "indisponivel",
                }}
                onSalvar={salvarEdicao}
                onFechar={() => setEditando(null)}
            />

            <FormularioEdicao
                aberto={adicionando}
                titulo="Adicionar material"
                campos={camposNovo}
                valoresIniciais={{}}
                onSalvar={salvarNovoMaterial}
                onFechar={() => setAdicionando(false)}
                textoSalvar="Adicionar"
            />

            {excluindo && (
                <div
                    className="formulario-edicao__overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) fecharExclusao()
                    }}
                >
                    <div className="formulario-edicao estoque__confirmacao" role="alertdialog" aria-modal="true" aria-labelledby="estoque-confirmacao-titulo">
                        <h2 id="estoque-confirmacao-titulo" className="formulario-edicao__titulo">Excluir material</h2>
                        <p className="estoque__confirmacao-texto">
                            Tem certeza que deseja excluir todo o estoque de <strong>{excluindo.material}</strong>?
                            A quantidade será zerada e o material ficará indisponível.
                        </p>

                        {erroExclusao && <p className="formulario-edicao__erro-geral">{erroExclusao}</p>}

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

export default Estoque
