import "./style.css"
import type { AbasProps } from "../../types/AbasProps/AbasProps"

function Abas<T extends string>({ opcoes, ativa, onChange }: AbasProps<T>) {
    return (
        <div className="abas" role="tablist">
            {opcoes.map((opcao) => (
                <button
                    key={opcao.valor}
                    type="button"
                    role="tab"
                    aria-selected={opcao.valor === ativa}
                    className={`abas__aba${opcao.valor === ativa ? " abas__aba--ativa" : ""}`}
                    onClick={() => onChange(opcao.valor)}
                >
                    {opcao.rotulo}
                </button>
            ))}
        </div>
    )
}

export default Abas
