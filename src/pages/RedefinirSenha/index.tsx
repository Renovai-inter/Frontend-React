import "../Login/style.css"
import "./style.css"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import Nome from "../../assets/nome_renovai.svg"
import SenhaInput from "../../components/SenhaInput"
import { esqueciSenha, redefinirSenha, verificarCodigo } from "../../services/authService"
import type { Etapa } from "../../types/RedefinirSenha/RedefinirSenhaTypes"

const TAMANHO_MINIMO = 6
const REGEX_EMAIL = /^\S+@\S+\.\S+$/
const INTERVALO_REENVIO_SEGUNDOS = 30

const SUBTITULO: Record<Etapa, string> = {
    email: "Informe o e-mail da sua conta para receber um código de verificação.",
    codigo: "Digite o código de 6 dígitos que enviamos para o seu e-mail.",
    senha: "Código confirmado. Defina uma nova senha para a sua conta.",
    concluido: "Tudo certo!",
}

// A API devolve "mensagem" (GlobalExceptionHandler) em todos os erros:
// 404 = e-mail sem conta; 422 = código errado/expirado ou falha/ausência de configuração do envio de e-mail;
// 400 = e-mail ou código em formato inválido.
function mensagemDeErro(err: unknown, padrao: string): string {
    if (axios.isAxiosError(err)) {
        if (!err.response) {
            return err.code === "ECONNABORTED"
                ? "O servidor demorou para responder. Aguarde um instante e tente novamente."
                : "Não foi possível conectar ao servidor. Tente novamente."
        }
        const { status, data } = err.response
        if (status === 404 && !data?.mensagem) return "Não existe conta com este e-mail."
        if (status >= 500) return data?.mensagem ?? "Erro no servidor. Tente novamente em alguns minutos."
        return data?.mensagem ?? data?.message ?? padrao
    }
    return padrao
}

function RedefinirSenha() {
    const navigate = useNavigate()
    const location = useLocation()

    const [etapa, setEtapa] = useState<Etapa>("email")
    const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? "")
    const [codigo, setCodigo] = useState("")
    const [novaSenha, setNovaSenha] = useState("")
    const [confirmacao, setConfirmacao] = useState("")
    const [erro, setErro] = useState<string | null>(null)
    const [aviso, setAviso] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [espera, setEspera] = useState(0)

    // Contagem regressiva para liberar o "Reenviar código" (evita pedidos repetidos ao Apps Script, que tem cota diária)
    useEffect(() => {
        if (espera <= 0) return
        const id = setTimeout(() => setEspera((s) => s - 1), 1000)
        return () => clearTimeout(id)
    }, [espera])

    async function executar(acao: () => Promise<void>, erroPadrao: string) {
        setLoading(true)
        setErro(null)
        setAviso(null)
        try {
            await acao()
        } catch (err) {
            setErro(mensagemDeErro(err, erroPadrao))
        } finally {
            setLoading(false)
        }
    }

    function enviarCodigo(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!REGEX_EMAIL.test(email.trim())) {
            setErro("E-mail inválido.")
            return
        }
        // 204 = e-mail enviado de verdade (o back só responde sucesso depois de enviar).
        // 404 = sem conta com esse e-mail; 422 = envio não configurado/falhou. Nesses casos ficamos nesta etapa.
        executar(async () => {
            await esqueciSenha({ email: email.trim() })
            setCodigo("")
            setEspera(INTERVALO_REENVIO_SEGUNDOS)
            setEtapa("codigo")
        }, "Não foi possível enviar o código.")
    }

    function reenviarCodigo() {
        executar(async () => {
            await esqueciSenha({ email: email.trim() })
            setCodigo("")
            setEspera(INTERVALO_REENVIO_SEGUNDOS)
            setAviso("Enviamos um novo código. O anterior deixou de valer.")
        }, "Não foi possível reenviar o código.")
    }

    function conferirCodigo(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        executar(async () => {
            await verificarCodigo({ email: email.trim(), codigo })
            setEtapa("senha")
        }, "Código inválido ou expirado. Solicite um novo código.")
    }

    function salvarSenha(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (novaSenha.length < TAMANHO_MINIMO) {
            setErro(`A senha deve ter no mínimo ${TAMANHO_MINIMO} caracteres.`)
            return
        }
        if (novaSenha !== confirmacao) {
            setErro("As senhas não coincidem.")
            return
        }
        executar(async () => {
            await redefinirSenha({ email: email.trim(), token: codigo, novaSenha })
            setEtapa("concluido")
            setTimeout(() => navigate("/login"), 2500)
        }, "Não foi possível redefinir a senha. Solicite um novo código.")
    }

    return (
        <main className="login">
            <section className="login__container">
                <div className="login__header">
                    <img src={Nome} alt="Logo Renovai" className="nome__img" />
                    <h1 className="sr-only">Redefinir senha</h1>
                    <p>{SUBTITULO[etapa]}</p>
                </div>

                {etapa === "email" && (
                    <form className="login__form" onSubmit={enviarCodigo} noValidate>
                        <div className="login__field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoFocus
                            />
                        </div>

                        {erro && <p className="login__erro" role="alert">{erro}</p>}

                        <button className="login__send" type="submit" disabled={loading}>
                            {loading ? "Enviando e-mail..." : "Enviar código"}
                        </button>
                        <Link to="/login" className="redefinir__voltar">Voltar para o login</Link>
                    </form>
                )}

                {etapa === "codigo" && (
                    <form className="login__form" onSubmit={conferirCodigo}>
                        <p className="redefinir__nota">
                            Enviamos um código para <strong>{email}</strong>. Ele chega em instantes e vale por 15 minutos.
                            Confira também a caixa de spam.
                        </p>
                        <div className="login__field">
                            <label htmlFor="codigo">Código de verificação</label>
                            <input
                                id="codigo"
                                className="redefinir__codigo"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                placeholder="000000"
                                value={codigo}
                                onChange={(event) => setCodigo(event.target.value.replace(/\D/g, ""))}
                                autoFocus
                            />
                        </div>

                        {erro && <p className="login__erro" role="alert">{erro}</p>}
                        {aviso && <p className="login__sucesso" role="status">{aviso}</p>}

                        <button className="login__send" type="submit" disabled={loading || codigo.length !== 6}>
                            {loading ? "Verificando..." : "Confirmar código"}
                        </button>
                        <div className="redefinir__links">
                            <button type="button" onClick={reenviarCodigo} disabled={loading || espera > 0}>
                                {espera > 0 ? `Reenviar código (${espera}s)` : "Reenviar código"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setErro(null)
                                    setAviso(null)
                                    setEtapa("email")
                                }}
                            >
                                Trocar e-mail
                            </button>
                        </div>
                    </form>
                )}

                {etapa === "senha" && (
                    <form className="login__form" onSubmit={salvarSenha}>
                        <div className="login__field">
                            <label htmlFor="novaSenha">Nova senha</label>
                            <SenhaInput
                                id="novaSenha"
                                placeholder="Digite a nova senha"
                                autoComplete="new-password"
                                value={novaSenha}
                                onChange={(event) => setNovaSenha(event.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                        <div className="login__field">
                            <label htmlFor="confirmacao">Confirmar nova senha</label>
                            <SenhaInput
                                id="confirmacao"
                                placeholder="Repita a nova senha"
                                autoComplete="new-password"
                                value={confirmacao}
                                onChange={(event) => setConfirmacao(event.target.value)}
                                required
                            />
                        </div>

                        {erro && <p className="login__erro" role="alert">{erro}</p>}

                        <button className="login__send" type="submit" disabled={loading}>
                            {loading ? "Salvando..." : "Redefinir senha"}
                        </button>
                    </form>
                )}

                {etapa === "concluido" && (
                    <div className="login__form">
                        <p className="login__sucesso" role="status">
                            Senha redefinida com sucesso! Redirecionando para o login...
                        </p>
                        <Link to="/login" className="redefinir__voltar">Ir para o login agora</Link>
                    </div>
                )}
            </section>
            <section className="login__sidespace" />
        </main>
    )
}

export default RedefinirSenha
