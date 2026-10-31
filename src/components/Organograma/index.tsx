import "./style.css"
import type { OrganogramaProps, PessoaOrganograma } from "../../types/OrganogramaProps/OrganogramaProps"

function iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/).filter(Boolean)
    if (partes.length === 0) return "?"
    const primeira = partes[0][0]
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ""
    return (primeira + ultima).toUpperCase()
}

function Nivel({ rotulo, pessoas }: { rotulo: string; pessoas: PessoaOrganograma[] }) {
    if (pessoas.length === 0) return null

    return (
        <div className="organograma__nivel">
            <span className="organograma__linha-vertical" />
            <span className="organograma__rotulo">{rotulo}</span>
            <ul className="organograma__pessoas">
                {pessoas.map((pessoa) => (
                    <li key={pessoa.id}>
                        <div className={`organograma__pessoa${pessoa.ativa ? "" : " organograma__pessoa--inativa"}`}>
                            <span className={`organograma__avatar organograma__avatar--${pessoa.tom}`} aria-hidden="true">
                                {iniciais(pessoa.nome)}
                            </span>
                            <strong>
                                {pessoa.nome}
                                {!pessoa.ativa && <span className="sr-only"> (afastado ou inativo)</span>}
                            </strong>
                            <span>{pessoa.cargo}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function Organograma({ nomeCooperativa, imagemCooperativa, gestores, equipe }: OrganogramaProps) {
    return (
        <div className="organograma">
            <div className="organograma__raiz">
                <span className="organograma__raiz-icone">
                    {imagemCooperativa ? (
                        <img src={imagemCooperativa} alt="" />
                    ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                            <path d="M17 8C8 10 5.9 16.2 3.8 19.8L5.7 21c.7-1.2 1.4-2.3 2.4-3.3 3.8.9 8.2-.3 10-5.9 1.3-3.8.5-7.8.5-7.8s-2.3 1.3-3.6 4z" />
                        </svg>
                    )}
                </span>
                <strong>{nomeCooperativa}</strong>
                <span>Cooperativa</span>
            </div>

            <Nivel rotulo="Gestores" pessoas={gestores} />
            <Nivel rotulo="Equipe" pessoas={equipe} />
        </div>
    )
}

export default Organograma
