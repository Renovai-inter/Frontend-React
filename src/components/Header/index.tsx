import './style.css'
import type {HeaderProps} from '../../types/HeaderProps/headerProps'
function Header(headerProps: HeaderProps) {
    return (
        <header className="header">
            <div className="content">
                <h1>{headerProps.titulo}</h1>
                <p>{headerProps.subtitulo}</p>
            </div>
            {headerProps.acoes && <div className="header__acoes">{headerProps.acoes}</div>}
        </header>
    )
}
export default Header