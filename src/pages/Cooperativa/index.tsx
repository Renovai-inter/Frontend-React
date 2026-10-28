import "./style.css"
import { useEffect, useState } from "react"
import Botao from "../../components/Botao"
import Header from "../../components/Header"
import FormularioEdicao from "../../components/FormularioEdicao"
import type { CampoFormulario, ValoresFormulario } from "../../types/FormularioEdicao/FormularioEdicaoProps"
import {
    atualizar as atualizarCooperativa,
    buscarPorId as buscarCooperativa,
    type CooperativaResponse,
} from "../../services/cooperativaService"
import { atualizar as atualizarEndereco } from "../../services/enderecoService"
import { lerSessao } from "../../utils/armazenamentoSessao"
import { mascaraCep } from "../../utils/validators"
import type { Contato } from "../../types/Cooperativa/CooperativaTypes"
import Toast from "../../components/Toast"
import { useToast } from "../../hooks/useToast"

const CONTATOS: Contato[] = ["WHATSAPP", "TELEFONE", "EMAIL"]

const CAMPOS_COOPERATIVA: CampoFormulario[] = [
    { nome: "nome", rotulo: "Nome", obrigatorio: true, placeholder: "Nome da cooperativa" },
    { nome: "descricao", rotulo: "Descrição", placeholder: "Sobre a cooperativa" },
    { nome: "horarioFuncionamento", rotulo: "Horário de funcionamento", placeholder: "Seg a Sex, 8h às 17h" },
    {
        nome: "contatoPreferencial",
        rotulo: "Contato preferencial",
        placeholder: "WHATSAPP, TELEFONE ou EMAIL",
        mascara: (v) => v.toUpperCase(),
        validar: (v) => (CONTATOS.includes(v as Contato) ? undefined : "Use WHATSAPP, TELEFONE ou EMAIL."),
    },
    { nome: "imagemUrl", rotulo: "Logo", tipo: "imagem" },
]

const CAMPOS_ENDERECO: CampoFormulario[] = [
    {
        nome: "cep",
        rotulo: "CEP",
        obrigatorio: true,
        placeholder: "00000-000",
        mascara: mascaraCep,
        validar: (v) => (/^\d{5}-\d{3}$/.test(v) ? undefined : "CEP inválido."),
    },
    { nome: "logradouro", rotulo: "Logradouro", obrigatorio: true, placeholder: "Rua, avenida..." },
    { nome: "numero", rotulo: "Número", obrigatorio: true },
    { nome: "complemento", rotulo: "Complemento" },
    { nome: "bairro", rotulo: "Bairro", obrigatorio: true },
    { nome: "cidade", rotulo: "Cidade", obrigatorio: true },
]

function Cooperativa() {
    const toast = useToast()
    const cooperativaId = lerSessao("renovai_cooperativaId")

    const [cooperativa, setCooperativa] = useState<CooperativaResponse | null>(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)
    const [editando, setEditando] = useState<"cooperativa" | "endereco" | null>(null)

    useEffect(() => {
        if (!cooperativaId) {
            setErro("Sessão sem cooperativa identificada. Faça login novamente.")
            setCarregando(false)
            return
        }

        let cancelado = false
        buscarCooperativa(cooperativaId)
            .then((dados) => {
                if (!cancelado) setCooperativa(dados)
            })
            .catch(() => {
                if (!cancelado) setErro("Não foi possível carregar os dados da cooperativa.")
            })
            .finally(() => {
                if (!cancelado) setCarregando(false)
            })

        return () => {
            cancelado = true
        }
    }, [cooperativaId])

    async function salvarCooperativa(valores: ValoresFormulario) {
        if (!cooperativaId || !cooperativa) return

        const atualizada = await atualizarCooperativa(cooperativaId, {
            nome: valores.nome,
            descricao: valores.descricao,
            numeroCooperados: cooperativa.numeroCooperados,
            horarioFuncionamento: valores.horarioFuncionamento,
            imagemUrl: valores.imagemUrl, // "" remove a imagem
            contatoPreferencial: valores.contatoPreferencial as Contato,
        })
        setCooperativa(atualizada)
        toast.mostrar("Dados da cooperativa atualizados.")
    }

    async function salvarEndereco(valores: ValoresFormulario) {
        if (!cooperativa?.endereco) return

        const atualizado = await atualizarEndereco(cooperativa.endereco.enderecoId, {
            cep: valores.cep,
            logradouro: valores.logradouro,
            numero: valores.numero,
            complemento: valores.complemento || undefined,
            bairro: valores.bairro,
            cidade: valores.cidade,
        })
        setCooperativa({ ...cooperativa, cidade: atualizado.cidade, endereco: atualizado })
        toast.mostrar("Endereço atualizado.")
    }

    if (carregando) return <p className="cooperativa__estado">Carregando...</p>
    if (erro || !cooperativa) return <p className="cooperativa__estado cooperativa__estado--erro">{erro}</p>

    const camposCooperativa: { rotulo: string; valor: string }[] = [
        { rotulo: "Nome da cooperativa", valor: cooperativa.nome },
        { rotulo: "Contato preferencial", valor: cooperativa.contatoPreferencial },
        { rotulo: "Horário de funcionamento", valor: cooperativa.horarioFuncionamento },
        { rotulo: "Número de cooperados", valor: String(cooperativa.numeroCooperados ?? "") },
        { rotulo: "Descrição", valor: cooperativa.descricao },
    ]

    const { endereco } = cooperativa

    const camposEndereco: { rotulo: string; valor: string }[] = [
        { rotulo: "CEP", valor: endereco?.cep ?? "" },
        { rotulo: "Logradouro", valor: endereco?.logradouro ?? "" },
        { rotulo: "Número", valor: endereco?.numero ?? "" },
        { rotulo: "Complemento", valor: endereco?.complemento ?? "" },
        { rotulo: "Bairro", valor: endereco?.bairro ?? "" },
        { rotulo: "Cidade", valor: endereco?.cidade ?? "" },
    ]

    return (
        <div className="cooperativa">
            <Toast mensagem={toast.mensagem} chave={toast.chave} onFechar={toast.fechar} />
            <Header titulo="Minha cooperativa" subtitulo="Gerencie os dados e o endereço da cooperativa" />

            <section className="cooperativa__topo">
                <div className="cooperativa__foto">
                    {cooperativa.imagemUrl
                        ? <img src={cooperativa.imagemUrl} alt={`Logo de ${cooperativa.nome}`} />
                        : <span>{cooperativa.nome?.trim().charAt(0).toUpperCase()}</span>}
                </div>
                <Botao onClick={() => setEditando("cooperativa")}>Editar cooperativa</Botao>
            </section>

            <div className="cooperativa__campos">
                {camposCooperativa.map(({ rotulo, valor }) => (
                    <div
                        className={`cooperativa__campo${rotulo === "Descrição" ? " cooperativa__campo--largo" : ""}`}
                        key={rotulo}
                    >
                        <span className="cooperativa__rotulo">{rotulo}</span>
                        <div className="cooperativa__valor">{valor || "—"}</div>
                    </div>
                ))}
            </div>

            <section className="cooperativa__secao">
                <h2 className="cooperativa__secao-titulo">Endereço</h2>
                {endereco && <Botao onClick={() => setEditando("endereco")}>Editar endereço</Botao>}
            </section>

            {endereco ? (
                <div className="cooperativa__campos">
                    {camposEndereco.map(({ rotulo, valor }) => (
                        <div className="cooperativa__campo" key={rotulo}>
                            <span className="cooperativa__rotulo">{rotulo}</span>
                            <div className="cooperativa__valor">{valor || "—"}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="cooperativa__estado">Esta cooperativa ainda não tem endereço cadastrado.</p>
            )}

            <FormularioEdicao
                aberto={editando === "cooperativa"}
                titulo="Editar cooperativa"
                campos={CAMPOS_COOPERATIVA}
                valoresIniciais={{
                    nome: cooperativa.nome,
                    descricao: cooperativa.descricao,
                    horarioFuncionamento: cooperativa.horarioFuncionamento,
                    contatoPreferencial: cooperativa.contatoPreferencial,
                    imagemUrl: cooperativa.imagemUrl,
                }}
                onSalvar={salvarCooperativa}
                onFechar={() => setEditando(null)}
            />

            <FormularioEdicao
                aberto={editando === "endereco"}
                titulo="Editar endereço"
                campos={CAMPOS_ENDERECO}
                valoresIniciais={{
                    cep: endereco?.cep,
                    logradouro: endereco?.logradouro,
                    numero: endereco?.numero,
                    complemento: endereco?.complemento,
                    bairro: endereco?.bairro,
                    cidade: endereco?.cidade,
                }}
                onSalvar={salvarEndereco}
                onFechar={() => setEditando(null)}
            />
        </div>
    )
}

export default Cooperativa
