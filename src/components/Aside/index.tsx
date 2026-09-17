import { NavLink } from 'react-router-dom'
import './style.css'
import Nome from '../../assets/nome_renovai_aside.svg'

function Aside() {
    function handleSignOut() {
        localStorage.removeItem("renovai_token");
        localStorage.removeItem("renovai_role");
        localStorage.removeItem("renovai_email");
        window.location.href = "/login";
    }


    return (
        <aside>
            <div className="header__aside">
                <img src={Nome} alt="Logo Renovai" className='nome__img' />
                <p>Painel Administrativo</p>
                <hr />
            </div>
            <nav>
                <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="visao-geral" to="/home">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="9" rx="1.6" stroke="currentColor" stroke-width="1.7" /><rect x="14" y="3" width="7" height="5" rx="1.6" stroke="currentColor" stroke-width="1.7" /><rect x="14" y="12" width="7" height="9" rx="1.6" stroke="currentColor" stroke-width="1.7" /><rect x="3" y="16" width="7" height="5" rx="1.6" stroke="currentColor" stroke-width="1.7" /></svg>
                    Visão Geral
                </NavLink>
                <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="cooperativa" to="/cooperativa">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 21V6.5L12 3l8 3.5V21" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" /><path d="M9 21v-6h6v6" stroke="currentColor" stroke-width="1.7" /><path d="M9 10h.01M15 10h.01M12 13h.01" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" /></svg>
                    Cooperativa
                </NavLink>
                <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="gestores" to="/funcionarios">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.7" /><path d="M3.5 20c.7-3.4 3-5.3 5.5-5.3S13.8 16.6 14.5 20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /><circle cx="17.2" cy="8.5" r="2.4" stroke="currentColor" stroke-width="1.6" /><path d="M15.6 14.2c2-.2 3.7 1.2 4.2 3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
                    Gestores &amp; Cooperados
                </NavLink>
                <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="estoque" to="/estoque">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 8l9-5 9 5-9 5-9-5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" /><path d="M3 8v9l9 5 9-5V8" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" /><path d="M12 13v9" stroke="currentColor" stroke-width="1.7" /></svg>
                    Estoque
                </NavLink>
                <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="coletas" to="/coletas">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 12V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6" stroke="currentColor" stroke-width="1.7" /><path d="M4 12l2.2 6.6A2 2 0 0 0 8.1 20h7.8a2 2 0 0 0 1.9-1.4L20 12" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" /><path d="M4 12h16" stroke="currentColor" stroke-width="1.7" /></svg>
                    Coletas
                </NavLink>
                <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="triagens" to="/triagens">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" stroke-width="1.7" /><rect x="9" y="2.3" width="6" height="3.4" rx="1" fill="currentColor" /><path d="M8.5 12l2.2 2.2L15.5 10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    Triagens
                </NavLink>
                <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="rateios" to="/rateios">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.7" /><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" stroke="currentColor" stroke-width="1.7" /><path d="M3 12h18" stroke="currentColor" stroke-width="1.7" /></svg>
                    Rateios
                </NavLink>
                <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="rotas-coleta" to="/rotas-coleta">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 17l4-10h10l4 10" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" /><path d="M3 17h18v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2Z" stroke="currentColor" stroke-width="1.7" /><circle cx="7.5" cy="20" r="1.3" fill="currentColor" /><circle cx="16.5" cy="20" r="1.3" fill="currentColor" /></svg>
                    Rotas
                </NavLink>
            </nav>
            <div className='bottom'>
                <div className="user">
                    <hr />
                    <div className="user-row">
                        <div className="avatar">M</div>
                        <div className="txt">
                            <div className="name">Maria Souza</div>
                            <div className="email">maria@novaesperanca.coop.br</div>
                        </div>
                    </div>
                </div>
                <button className="signout" onClick={handleSignOut}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /><path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    Sair da conta
                </button>
            </div>
        </aside>
    )
}
export default Aside