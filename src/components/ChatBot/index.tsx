import "./style.css"
import { useEffect, useRef, useState, type FormEvent } from "react"
import ChatLogo from "../../assets/chat_logo.svg"
import NimoBot from "../../assets/nimo_bot.svg"
import { enviarMensagem } from "../../services/chatApi"
import { lerSessao } from "../../utils/armazenamentoSessao"
import type { MensagemChat } from "../../types/ChatBot/ChatBotTypes"

const SAUDACAO =
    "Olá, me chamo Nimo\nEstou aqui para ser seu Chatbot auxiliar. Posso te ajudar com dúvidas sobre o sistema, perguntas sobre as operações entre várias outras coisas. Como posso te ajudar?"

const MENSAGEM_ERRO = "Não consegui responder agora. Tente novamente em instantes."

/**
 * Chatbot flutuante. O histórico e o sessionId ficam no estado do componente: sobrevivem a fechar/abrir
 * o chat (o componente continua montado no Layout) e só reiniciam ao recarregar a página.
 */
function ChatBot() {
    const [aberto, setAberto] = useState(false)
    const [mensagens, setMensagens] = useState<MensagemChat[]>([{ id: 0, autor: "bot", texto: SAUDACAO }])
    const [texto, setTexto] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [sessionId] = useState(() => crypto.randomUUID())
    const proximoId = useRef(1)
    const fimRef = useRef<HTMLDivElement>(null)

    // Mantém a última mensagem visível ao receber mensagens ou ao reabrir o chat
    useEffect(() => {
        if (aberto) fimRef.current?.scrollIntoView({ block: "end" })
    }, [mensagens, enviando, aberto])

    function adicionar(autor: MensagemChat["autor"], conteudo: string, erro = false) {
        setMensagens((atual) => [...atual, { id: proximoId.current++, autor, texto: conteudo, erro }])
    }

    async function enviar(e: FormEvent) {
        e.preventDefault()
        const pergunta = texto.trim()
        if (!pergunta || enviando) return

        adicionar("usuario", pergunta)
        setTexto("")
        setEnviando(true)
        try {
            const { resposta } = await enviarMensagem({
                pergunta,
                cooperativaId: lerSessao("renovai_cooperativaId") ?? "",
                usuarioId: lerSessao("renovai_userId") ?? "",
                sessionId,
            })
            adicionar("bot", resposta)
        } catch {
            adicionar("bot", MENSAGEM_ERRO, true)
        } finally {
            setEnviando(false)
        }
    }

    if (!aberto) {
        return (
            <button type="button" className="chatbot__abrir" onClick={() => setAberto(true)} aria-label="Abrir chat com o Nimo">
                <img src={ChatLogo} alt="" />
            </button>
        )
    }

    return (
        <section className="chatbot" aria-label="Chat com o Nimo">
            <header className="chatbot__topo">
                <img src={NimoBot} alt="" className="chatbot__avatar" />
                <h2 className="chatbot__nome">Nimo</h2>
                <button type="button" className="chatbot__fechar" onClick={() => setAberto(false)} aria-label="Fechar chat">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </header>

            <div className="chatbot__mensagens" role="log" aria-live="polite">
                {mensagens.map((m) => (
                    <p
                        key={m.id}
                        className={`chatbot__mensagem chatbot__mensagem--${m.autor}${m.erro ? " chatbot__mensagem--erro" : ""}`}
                    >
                        {m.texto}
                    </p>
                ))}
                {enviando && <p className="chatbot__mensagem chatbot__mensagem--bot chatbot__digitando">Nimo está digitando...</p>}
                <div ref={fimRef} />
            </div>

            <form className="chatbot__form" onSubmit={enviar}>
                <input
                    type="text"
                    className="chatbot__entrada"
                    placeholder="Escreva sua pergunta..."
                    aria-label="Escreva sua pergunta"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    autoFocus
                />
                <button type="submit" className="chatbot__enviar" disabled={enviando || !texto.trim()} aria-label="Enviar mensagem">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M21 3L3 10.5l7 2.5 2.5 7L21 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                </button>
            </form>
        </section>
    )
}

export default ChatBot
