import "./style.css"
import { useEffect, useMemo, useState } from "react"
import Header from "../../components/Header"
import Botao from "../../components/Botao"
import Abas from "../../components/Abas"
import Organograma from "../../components/Organograma"
import DynamicTable from "../../components/DynamicTable"
import type { DynamicTableColumn } from "../../types/DynamicTableProps/DynamicTableProps"
import FormularioEdicao from "../../components/FormularioEdicao"
import type { CampoFormulario, ValoresFormulario } from "../../types/FormularioEdicao/FormularioEdicaoProps"
import type { PessoaOrganograma } from "../../types/OrganogramaProps/OrganogramaProps"
import { lerSessao } from "../../utils/armazenamentoSessao"
import { isCpfValido, isEmailValido, mascaraCpf } from "../../utils/validators"
import { buscarPorId as buscarCooperativa, type CooperativaResponse } from "../../services/cooperativaService"
import { listar as listarCargos, type CargoResponse } from "../../services/cargoService"
import {
    afastar,
    desativar,
    listarPorCooperativa,
    preCadastro,
    reativar,
    type FuncionarioResponse,
} from "../../services/funcionarioService"
import type { Visao, Status } from "../../types/Funcionarios/FuncionariosTypes"
import Toast from "../../components/Toast"
import { useToast } from "../../hooks/useToast"

const ROTULO_STATUS: Record<Status, string> = {
    ATIVO: "Ativo",
    AFASTADO: "Afastado",
    INATIVO: "Inativo",
}

const CLASSE_STATUS: Record<Status, string> = {
    ATIVO: "ok",
    AFASTADO: "aviso",
    INATIVO: "off",
}

const COLUNAS: DynamicTableColumn<FuncionarioResponse>[] = [
    { key: "usuarioNome", label: "Nome" },
    { key: "cargo", label: "Cargo" },
    {
        key: "statusFuncionario",
        label: "Status",
        render: (f) => (
            <span className={`funcionarios__badge funcionarios__badge--${CLASSE_STATUS[f.statusFuncionario]}`}>
                {ROTULO_STATUS[f.statusFuncionario]}
            </span>
        ),
    },
]

const CAMPOS_STATUS: CampoFormulario[] = [
    {
        nome: "status",
        rotulo: "Status do funcionário",
        tipo: "selecao",
        opcoes: [
            { valor: "ATIVO", rotulo: "Ativo" },
            { valor: "AFASTADO", rotulo: "Afastado" },
            { valor: "INATIVO", rotulo: "Inativo" },
        ],
    },
]

function montarCamposNovo(cargos: CargoResponse[]): CampoFormulario[] {
    return [
        { nome: "nome", rotulo: "Nome completo", obrigatorio: true, placeholder: "Nome do cooperado" },
        {
            nome: "cpf",
            rotulo: "CPF",
            obrigatorio: true,
            placeholder: "000.000.000-00",
            mascara: mascaraCpf,
            validar: (v) => (isCpfValido(v) ? undefined : "CPF inválido."),
        },
        {
            nome: "email",
            rotulo: "E-mail",
            tipo: "email",
            obrigatorio: true,
            placeholder: "nome@exemplo.com",
            validar: (v) => (isEmailValido(v) ? undefined : "E-mail inválido."),
        },
        {
            nome: "senhaTemporaria",
            rotulo: "Senha temporária (a pessoa troca no primeiro acesso)",
            tipo: "password",
            obrigatorio: true,
            validar: (v) => (v.length >= 6 ? undefined : "A senha deve ter no mínimo 6 caracteres."),
        },
        {
            nome: "cargoId",
            rotulo: "Cargo",
            tipo: "selecao",
            obrigatorio: true,
            opcoes: cargos.map((c) => ({ valor: c.cargoId, rotulo: c.cargo })),
        },
    ]
}

const ehGestor = (cargo: string) => cargo.toLowerCase().includes("gestor")
const ehMotorista = (cargo: string) => cargo.toLowerCase().includes("motorista")

function paraPessoa(f: FuncionarioResponse): PessoaOrganograma {
    return {
        id: f.funcionarioId,
        nome: f.usuarioNome,
        cargo: f.cargo,
        tom: ehGestor(f.cargo) ? "gestor" : ehMotorista(f.cargo) ? "motorista" : "cooperado",
        ativa: f.statusFuncionario === "ATIVO",
    }
}

function Funcionarios() {
    const toast = useToast()
    const cooperativaId = lerSessao("renovai_cooperativaId")

    const [visao, setVisao] = useState<Visao>("organograma")
    const [cooperativa, setCooperativa] = useState<CooperativaResponse | null>(null)
    const [funcionarios, setFuncionarios] = useState<FuncionarioResponse[]>([])
    const [cargos, setCargos] = useState<CargoResponse[]>([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)
    const [editando, setEditando] = useState<FuncionarioResponse | null>(null)
    const [adicionando, setAdicionando] = useState(false)

    useEffect(() => {
        if (!cooperativaId) {
            setErro("Sessão sem cooperativa identificada. Faça login novamente.")
            setCarregando(false)
            return
        }

        let cancelado = false
        Promise.allSettled([buscarCooperativa(cooperativaId), listarPorCooperativa(cooperativaId), listarCargos()])
            .then(([coop, funcs, cargosRes]) => {
                if (cancelado) return
                if (funcs.status === "rejected") {
                    setErro("Não foi possível carregar os funcionários.")
                    return
                }
                setCooperativa(coop.status === "fulfilled" ? coop.value : null)
                setFuncionarios(funcs.value)
                setCargos(cargosRes.status === "fulfilled" ? cargosRes.value : [])
            })
            .finally(() => {
                if (!cancelado) setCarregando(false)
            })

        return () => {
            cancelado = true
        }
    }, [cooperativaId])

    // useMemo: converter e separar a lista inteira em gestores/equipe só precisa refazer quando `funcionarios`
    // muda; trocar de aba ou abrir o popup re-renderiza a página sem recalcular o organograma.
    const { gestores, equipe } = useMemo(() => {
        const pessoas = funcionarios.map(paraPessoa)
        return {
            gestores: pessoas.filter((p) => p.tom === "gestor"),
            equipe: pessoas.filter((p) => p.tom !== "gestor"),
        }
    }, [funcionarios])

    // Cargo pré-selecionado no cadastro: "Cooperado", se existir
    const cargoPadrao = (cargos.find((c) => c.cargo.toLowerCase().includes("cooperado")) ?? cargos[0])?.cargoId ?? ""

    async function salvarStatus(valores: ValoresFormulario) {
        if (!editando) return
        const novo = valores.status as Status
        if (novo === editando.statusFuncionario) return

        const acao = novo === "ATIVO" ? reativar : novo === "AFASTADO" ? afastar : desativar
        const atualizado = await acao(editando.funcionarioId)
        setFuncionarios((atual) => atual.map((f) => (f.funcionarioId === atualizado.funcionarioId ? atualizado : f)))
        toast.mostrar(`Status de ${atualizado.usuarioNome} atualizado.`)
    }

    async function salvarNovo(valores: ValoresFormulario) {
        if (!cooperativaId) return
        const criado = await preCadastro({
            nome: valores.nome,
            cpf: valores.cpf,
            email: valores.email,
            senhaTemporaria: valores.senhaTemporaria,
            cargoId: valores.cargoId,
            cooperativaId,
        })
        setFuncionarios((atual) => [...atual, criado])
        toast.mostrar("Funcionário adicionado com sucesso.")
    }

    if (carregando) return <p className="funcionarios__estado">Carregando...</p>
    if (erro) return <p className="funcionarios__estado funcionarios__estado--erro">{erro}</p>

    return (
        <div className="funcionarios">
            <Toast mensagem={toast.mensagem} chave={toast.chave} onFechar={toast.fechar} />
            <section className="funcionarios__head">
                <Header
                    titulo="Gestores e cooperados"
                    subtitulo={`Pessoas com acesso à ${cooperativa?.nome ?? "cooperativa"}`}
                    acoes={<Botao onClick={() => setAdicionando(true)}>Adicionar funcionário</Botao>}
                />
            </section>

            <Abas<Visao>
                opcoes={[
                    { valor: "organograma", rotulo: "Organograma" },
                    { valor: "lista", rotulo: "Lista" },
                ]}
                ativa={visao}
                onChange={setVisao}
            />

            {visao === "organograma" ? (
                <section className="funcionarios__painel">
                    <Organograma
                        nomeCooperativa={cooperativa?.nome ?? "Cooperativa"}
                        imagemCooperativa={cooperativa?.imagemUrl}
                        gestores={gestores}
                        equipe={equipe}
                    />
                </section>
            ) : (
                <DynamicTable
                    titulo="Funcionários da cooperativa"
                    columns={COLUNAS}
                    data={funcionarios}
                    rowKey={(f) => f.funcionarioId}
                    onEdit={setEditando}
                    emptyMessage="Nenhum funcionário cadastrado."
                />
            )}

            <FormularioEdicao
                aberto={!!editando}
                titulo={editando ? `Editar ${editando.usuarioNome}` : "Editar funcionário"}
                campos={CAMPOS_STATUS}
                valoresIniciais={{ status: editando?.statusFuncionario ?? "ATIVO" }}
                onSalvar={salvarStatus}
                onFechar={() => setEditando(null)}
            />

            <FormularioEdicao
                aberto={adicionando}
                titulo="Adicionar funcionário"
                campos={montarCamposNovo(cargos)}
                valoresIniciais={{ cargoId: cargoPadrao }}
                onSalvar={salvarNovo}
                onFechar={() => setAdicionando(false)}
                textoSalvar="Adicionar"
            />
        </div>
    )
}

export default Funcionarios
