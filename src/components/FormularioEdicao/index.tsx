import "./style.css"
import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react"
import axios from "axios"
import Botao from "../Botao"
import { arquivoParaDataUrl } from "../../utils/imagem"
import { sanitizarTexto } from "../../utils/sanitizar"
import type {
    CampoFormulario,
    FormularioEdicaoProps,
    ValoresFormulario,
} from "../../types/FormularioEdicao/FormularioEdicaoProps"

type Erros = Record<string, string | undefined>

function validarCampos(campos: CampoFormulario[], valores: ValoresFormulario): Erros {
    const erros: Erros = {}
    for (const campo of campos) {
        const valor = valores[campo.nome].trim()
        if (!valor) {
            if (campo.obrigatorio) erros[campo.nome] = `${campo.rotulo} é obrigatório.`
            continue
        }
        const erro = campo.validar?.(valor)
        if (erro) erros[campo.nome] = erro
    }
    return erros
}

function mensagemDeErro(err: unknown): string {
    if (axios.isAxiosError(err)) {
        return err.response?.data?.message ?? err.response?.data?.erro ?? "Não foi possível salvar as alterações."
    }
    return "Não foi possível conectar ao servidor. Tente novamente."
}

function Dialog({
    titulo,
    campos,
    valoresIniciais,
    onSalvar,
    onFechar,
    textoSalvar = "Salvar alterações",
}: Omit<FormularioEdicaoProps, "aberto">) {
    const idBase = useId()
    const [valores, setValores] = useState<ValoresFormulario>(() =>
        Object.fromEntries(campos.map((c) => [c.nome, valoresIniciais[c.nome] ?? ""]))
    )
    const [erros, setErros] = useState<Erros>({})
    const [erroGeral, setErroGeral] = useState<string | null>(null)
    const [salvando, setSalvando] = useState(false)

    // Esc fecha o dialog (exceto durante o envio)
    useEffect(() => {
        function aoTeclar(event: KeyboardEvent) {
            if (event.key === "Escape" && !salvando) onFechar()
        }
        document.addEventListener("keydown", aoTeclar)
        return () => document.removeEventListener("keydown", aoTeclar)
    }, [onFechar, salvando])

    const handleChange = (campo: CampoFormulario) => (event: ChangeEvent<HTMLInputElement>) => {
        const valor = campo.mascara ? campo.mascara(event.target.value) : event.target.value
        setValores((atual) => ({ ...atual, [campo.nome]: valor }))
        setErros((atual) => ({ ...atual, [campo.nome]: undefined }))
    }

    const handleImagem = (campo: CampoFormulario) => async (event: ChangeEvent<HTMLInputElement>) => {
        const arquivo = event.target.files?.[0]
        event.target.value = "" // permite escolher o mesmo arquivo de novo
        if (!arquivo) return
        try {
            const dataUrl = await arquivoParaDataUrl(arquivo)
            setValores((atual) => ({ ...atual, [campo.nome]: dataUrl }))
            setErros((atual) => ({ ...atual, [campo.nome]: undefined }))
        } catch (err) {
            const mensagem = err instanceof Error ? err.message : "Não foi possível ler a imagem."
            setErros((atual) => ({ ...atual, [campo.nome]: mensagem }))
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const encontrados = validarCampos(campos, valores)
        setErros(encontrados)
        if (Object.keys(encontrados).length > 0) return

        setSalvando(true)
        setErroGeral(null)
        try {
            const limpos = Object.fromEntries(
                // Imagem (data URL em base64) passa direto; os demais campos de texto são sanitizados
                Object.entries(valores).map(([chave, valor]) => [
                    chave,
                    valor.startsWith("data:image/") ? valor.trim() : sanitizarTexto(valor),
                ])
            )
            await onSalvar(limpos)
            onFechar()
        } catch (err) {
            setErroGeral(mensagemDeErro(err))
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div
            className="formulario-edicao__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !salvando) onFechar()
            }}
        >
            <div
                className="formulario-edicao"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${idBase}-titulo`}
            >
                <h2 id={`${idBase}-titulo`} className="formulario-edicao__titulo">{titulo}</h2>

                <form className="formulario-edicao__form" onSubmit={handleSubmit} noValidate>
                    {campos.map((campo, indice) => {
                        const id = `${idBase}-${campo.nome}`
                        if (campo.tipo === "imagem") {
                            const imagem = valores[campo.nome]
                            return (
                                <div className="formulario-edicao__campo" key={campo.nome}>
                                    <span className="formulario-edicao__rotulo">{campo.rotulo}</span>
                                    <div className="formulario-edicao__imagem">
                                        <div className="formulario-edicao__previa">
                                            {imagem ? <img src={imagem} alt="Prévia" /> : <span>Sem foto</span>}
                                        </div>
                                        <div className="formulario-edicao__imagem-acoes">
                                            <label htmlFor={id} className="botao botao--secundario">
                                                Escolher imagem
                                            </label>
                                            <input
                                                id={id}
                                                type="file"
                                                accept="image/*"
                                                className="formulario-edicao__arquivo"
                                                onChange={handleImagem(campo)}
                                            />
                                            {imagem && (
                                                <button
                                                    type="button"
                                                    className="formulario-edicao__remover"
                                                    onClick={() => setValores((atual) => ({ ...atual, [campo.nome]: "" }))}
                                                >
                                                    Remover
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {erros[campo.nome] && (
                                        <span className="formulario-edicao__erro">{erros[campo.nome]}</span>
                                    )}
                                </div>
                            )
                        }
                        if (campo.tipo === "selecao") {
                            return (
                                <div className="formulario-edicao__campo" key={campo.nome}>
                                    <label htmlFor={id}>{campo.rotulo}</label>
                                    <select
                                        id={id}
                                        value={valores[campo.nome]}
                                        onChange={(event) => {
                                            const valor = event.target.value
                                            setValores((atual) => ({ ...atual, [campo.nome]: valor }))
                                            setErros((atual) => ({ ...atual, [campo.nome]: undefined }))
                                        }}
                                        aria-invalid={!!erros[campo.nome]}
                                    >
                                        {campo.opcoes?.map((opcao) => (
                                            <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>
                                        ))}
                                    </select>
                                    {erros[campo.nome] && (
                                        <span className="formulario-edicao__erro">{erros[campo.nome]}</span>
                                    )}
                                </div>
                            )
                        }
                        return (
                            <div className="formulario-edicao__campo" key={campo.nome}>
                                <label htmlFor={id}>{campo.rotulo}</label>
                                <input
                                    id={id}
                                    type={campo.tipo ?? "text"}
                                    placeholder={campo.placeholder}
                                    value={valores[campo.nome]}
                                    onChange={handleChange(campo)}
                                    aria-invalid={!!erros[campo.nome]}
                                    autoFocus={indice === 0}
                                    autoComplete={campo.tipo === "password" ? "new-password" : undefined}
                                />
                                {erros[campo.nome] && (
                                    <span className="formulario-edicao__erro">{erros[campo.nome]}</span>
                                )}
                            </div>
                        )
                    })}

                    {erroGeral && <p className="formulario-edicao__erro-geral">{erroGeral}</p>}

                    <div className="formulario-edicao__acoes">
                        <Botao variante="secundario" onClick={onFechar} ativo={!salvando}>
                            Cancelar
                        </Botao>
                        <Botao type="submit" ativo={!salvando}>
                            {salvando ? "Salvando..." : textoSalvar}
                        </Botao>
                    </div>
                </form>
            </div>
        </div>
    )
}
function FormularioEdicao({ aberto, ...props }: FormularioEdicaoProps) {
    if (!aberto) return null
    return <Dialog {...props} />
}

export default FormularioEdicao
