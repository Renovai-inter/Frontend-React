import PaginaCarregando from "../../components/PaginaCarregando"
import "./style.css"
import { useEffect, useState } from "react"
import Botao from "../../components/Botao"
import Header from "../../components/Header"
import FormularioEdicao from "../../components/FormularioEdicao"
import type { CampoFormulario, ValoresFormulario } from "../../types/FormularioEdicao/FormularioEdicaoProps"
import { atualizarPerfil, buscarPorId, type UsuarioResponse } from "../../services/usuarioService"
import { lerSessao } from "../../utils/armazenamentoSessao"
import { notificarPerfilAtualizado } from "../../utils/eventosPerfil"
import { isCpfValido, mascaraCpf } from "../../utils/validators"
import Toast from "../../components/Toast"
import { useToast } from "../../hooks/useToast"

// Campos do usuário que podem ser alterados nesta página
const CAMPOS_USUARIO: CampoFormulario[] = [
    { nome: "nome", rotulo: "Nome", obrigatorio: true, placeholder: "Seu nome completo" },
    {
        nome: "cpf",
        rotulo: "CPF",
        obrigatorio: true,
        placeholder: "000.000.000-00",
        mascara: mascaraCpf,
        validar: (v) => (isCpfValido(v) ? undefined : "CPF inválido."),
    },
    { nome: "dataNascimento", rotulo: "Data de nascimento", tipo: "date" },
    { nome: "imagemUrl", rotulo: "Foto", tipo: "imagem" },
]

// "2000-05-17" -> "17/05/2000" (sem passar por Date, para não deslocar o fuso)
function formatarData(data?: string | null): string {
    if (!data) return "—"
    const [ano, mes, dia] = data.slice(0, 10).split("-")
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}

function formatarDataHora(data?: string | null): string {
    if (!data) return "—"
    const d = new Date(data)
    return Number.isNaN(d.getTime()) ? data : d.toLocaleString("pt-BR")
}

function PerfilUsuario() {
    const toast = useToast()
    const email = lerSessao("renovai_email")
    const usuarioId = lerSessao("renovai_userId")

    const [usuario, setUsuario] = useState<UsuarioResponse | null>(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)
    const [editando, setEditando] = useState(false)

    useEffect(() => {
        if (!usuarioId) {
            setErro("Sessão sem usuário identificado. Faça login novamente.")
            setCarregando(false)
            return
        }

        let cancelado = false
        buscarPorId(usuarioId)
            .then((dados) => {
                if (!cancelado) setUsuario(dados)
            })
            .catch(() => {
                if (!cancelado) setErro("Não foi possível carregar os dados do usuário.")
            })
            .finally(() => {
                if (!cancelado) setCarregando(false)
            })

        return () => {
            cancelado = true
        }
    }, [usuarioId])

    async function salvar(valores: ValoresFormulario) {
        if (!usuarioId || !usuario) return

        const atualizado = await atualizarPerfil(usuarioId, {
            nome: valores.nome,
            cpf: valores.cpf,
            dataNascimento: valores.dataNascimento || undefined,
            imagemUrl: valores.imagemUrl, // "" remove a foto
        })
        setUsuario({ ...usuario, ...atualizado })
        notificarPerfilAtualizado(atualizado)
        toast.mostrar("Perfil atualizado com sucesso.")
    }

    if (carregando) return <PaginaCarregando tipo="perfil" />
    if (erro || !usuario) return <p className="perfil__estado perfil__estado--erro" role="alert">{erro}</p>

    const papel = lerSessao("renovai_role")

    const campos: { rotulo: string; valor: string }[] = [
        { rotulo: "Nome completo", valor: usuario.nome },
        { rotulo: "CPF", valor: usuario.cpf },
        { rotulo: "Data de nascimento", valor: formatarData(usuario.dataNascimento) },
        { rotulo: "E-mail", valor: usuario.email || email || "" },
        { rotulo: "Perfil de acesso", valor: papel ?? "" },
        { rotulo: "Último acesso", valor: formatarDataHora(usuario.ultimoAcesso) },
    ]

    return (
        <div className="perfil">
            <Toast mensagem={toast.mensagem} chave={toast.chave} onFechar={toast.fechar} />
            <Header titulo="Meu perfil" subtitulo="Gerencie seus dados pessoais e de acesso" />

            <section className="perfil__topo">
                <div className="perfil__foto">
                    {usuario.imagemUrl
                        ? <img src={usuario.imagemUrl} alt={`Foto de ${usuario.nome}`} />
                        : <span>{usuario.nome?.trim().charAt(0).toUpperCase()}</span>}
                </div>
                <div className="perfil__identidade">
                    <h2 className="perfil__nome">{usuario.nome}</h2>
                    <p className="perfil__subtitulo">{usuario.email || email || "—"}</p>
                </div>
                <Botao onClick={() => setEditando(true)}>Editar usuário</Botao>
            </section>

            <div className="perfil__campos">
                {campos.map(({ rotulo, valor }) => (
                    <div className="perfil__campo" key={rotulo}>
                        <span className="perfil__rotulo">{rotulo}</span>
                        <div className="perfil__valor">{valor || "—"}</div>
                    </div>
                ))}
            </div>

            <FormularioEdicao
                aberto={editando}
                titulo="Editar usuário"
                campos={CAMPOS_USUARIO}
                valoresIniciais={{
                    nome: usuario.nome,
                    cpf: usuario.cpf,
                    dataNascimento: usuario.dataNascimento?.slice(0, 10),
                    imagemUrl: usuario.imagemUrl,
                }}
                onSalvar={salvar}
                onFechar={() => setEditando(false)}
            />
        </div>
    )
}

export default PerfilUsuario
