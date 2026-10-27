import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Botao from "../../components/Botao"
import type { ErroInfo } from "../../utils/erroNavegacao"
import { useAuth } from "../../hooks/useAuth"
import "./style.css"
import NimoChorando from "../../assets/nimo_chorando.png"
import type { TextoErro } from "../../types/Error/ErrorTypes"

const TEXTOS_POR_STATUS: Record<number, TextoErro> = {
    401: {
        titulo: "Sessão inválida",
        descricao: "Sua sessão expirou ou você não está autenticado. Saia da conta e entre novamente.",
    },
    403: {
        titulo: "Acesso negado",
        descricao: "Você não tem permissão para acessar este conteúdo.",
    },
    404: {
        titulo: "Página não encontrada",
        descricao: "O endereço que você tentou acessar não existe ou foi removido.",
    },
    500: {
        titulo: "Erro no servidor",
        descricao: "Algo deu errado do nosso lado. Tente novamente em alguns instantes.",
    },
}

const TEXTO_SEM_CONEXAO: TextoErro = {
    titulo: "Sem conexão",
    descricao: "Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.",
}

const TEXTO_PADRAO: TextoErro = {
    titulo: "Ops! Algo deu errado",
    descricao: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
}

function obterTexto({ status, mensagem }: ErroInfo): TextoErro {
    if (status === undefined) return mensagem ? { ...TEXTO_SEM_CONEXAO } : TEXTO_PADRAO
    if (TEXTOS_POR_STATUS[status]) return TEXTOS_POR_STATUS[status]
    if (status >= 500) return TEXTOS_POR_STATUS[500]
    return mensagem ? { titulo: TEXTO_PADRAO.titulo, descricao: mensagem } : TEXTO_PADRAO
}

function ErrorPage() {
    const navigate = useNavigate()
    const { sair } = useAuth()
    const location = useLocation()
    const [saindo, setSaindo] = useState(false)

    const erro = (location.state as ErroInfo | null) ?? {}
    const { titulo, descricao } = obterTexto(erro)

    async function handleSair() {
        setSaindo(true)
        await sair()
        navigate("/login", { replace: true })
    }

    return (
        <div className="error-page">
            <div className="error-page__conteudo">
                {/* Imagem do erro: adicionar o <img> aqui dentro depois */}
                <img src={NimoChorando} alt="Nimo Chorando" className='error-page__imagem' />


                {erro.status !== undefined && (
                    <span className="error-page__status">{erro.status}</span>
                )}
                <h1 className="error-page__titulo">{titulo}</h1>
                <p className="error-page__descricao">{descricao}</p>

                <div className="error-page__acoes">
                    <Botao
                        variante="secundario"
                        ativo={!saindo}
                        onClick={() => navigate("/home", { replace: true })}
                    >
                        Voltar
                    </Botao>
                    <Botao ativo={!saindo} onClick={handleSair}>
                        {saindo ? "Saindo..." : "Sair"}
                    </Botao>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage
