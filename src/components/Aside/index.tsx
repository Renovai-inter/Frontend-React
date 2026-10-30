import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import './style.css'
import Nome from '../../assets/nome_renovai_aside.svg'
import { useAuth } from '../../hooks/useAuth'
import { lerSessao } from '../../utils/armazenamentoSessao'
import { lerPreferencias, salvarPreferencias } from '../../utils/armazenamentoLocal'
import { aoPerfilAtualizado } from '../../utils/eventosPerfil'
import { buscarPorId, type UsuarioResponse } from '../../services/usuarioService'

const CONSULTA_MOBILE = "(max-width: 768px)";

function Aside() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { sair } = useAuth();
    const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
    const [saindo, setSaindo] = useState(false);
    const email = lerSessao("renovai_email") ?? "";
    const [mobile, setMobile] = useState(() => window.matchMedia(CONSULTA_MOBILE).matches);
    // No mobile o menu sempre começa recolhido; no desktop vale a preferência salva
    const [retraido, setRetraido] = useState(() =>
        window.matchMedia(CONSULTA_MOBILE).matches || lerPreferencias().asideRetraido === true
    );

    // Ao entrar na largura mobile recolhe o menu; ao voltar ao desktop restaura a preferência
    useEffect(() => {
        const consulta = window.matchMedia(CONSULTA_MOBILE);
        function aoMudarLargura(e: MediaQueryListEvent) {
            setMobile(e.matches);
            setRetraido(e.matches || lerPreferencias().asideRetraido === true);
        }
        consulta.addEventListener("change", aoMudarLargura);
        return () => consulta.removeEventListener("change", aoMudarLargura);
    }, []);

    // Navegou para outra página: fecha o menu sobreposto
    useEffect(() => {
        if (mobile) setRetraido(true);
    }, [pathname, mobile]);

    function alternarAside() {
        setRetraido((atual) => {
            // No mobile o estado é temporário e não sobrescreve a preferência do desktop
            if (!mobile) salvarPreferencias({ asideRetraido: !atual });
            return !atual;
        });
    }

    // Esc fecha o menu quando ele está sobreposto à página (mobile)
    useEffect(() => {
        if (!mobile || retraido) return;
        function aoTeclar(event: KeyboardEvent) {
            if (event.key === "Escape") setRetraido(true);
        }
        document.addEventListener("keydown", aoTeclar);
        return () => document.removeEventListener("keydown", aoTeclar);
    }, [mobile, retraido]);

    useEffect(() => {
        const usuarioId = lerSessao("renovai_userId");
        if (!usuarioId) return;

        let cancelado = false;
        buscarPorId(usuarioId)
            .then((dados) => {
                if (!cancelado) setUsuario(dados);
            })
            .catch(() => {
                // mantém o fallback (e-mail salvo no login) se a busca falhar
            });

        // Perfil editado na página /perfil: reflete aqui sem nova chamada à API
        const cancelarInscricao = aoPerfilAtualizado((dados) => {
            setUsuario((atual) => (atual ? { ...atual, ...dados } : atual));
        });

        return () => {
            cancelado = true;
            cancelarInscricao();
        };
    }, []);

    async function handleSignOut() {
        setSaindo(true);
        await sair();
        navigate("/login", { replace: true });
    }

    const nomeExibido = usuario?.nome ?? "Carregando...";
    const inicial = usuario?.nome?.trim().charAt(0).toUpperCase() ?? "";


    const classes = [retraido ? "retraido" : "", mobile ? "mobile" : ""].filter(Boolean).join(" ");

    return (
        <>
            {mobile && !retraido && (
                <button
                    type="button"
                    className="aside__fundo"
                    onClick={alternarAside}
                    aria-label="Fechar menu lateral"
                />
            )}
            <aside className={classes}>
                <section>
                    <div>
                        <button
                            type="button"
                            className="aside__toggle"
                            onClick={alternarAside}
                            aria-expanded={!retraido}
                            aria-label={retraido ? "Expandir menu lateral" : "Retrair menu lateral"}
                            title={retraido ? "Expandir menu lateral" : "Retrair menu lateral"}
                        >
                            <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M9.5 4v16" stroke="currentColor" strokeWidth="1.7" /></svg>
                        </button>
                        <div className="header__aside">
                            <img src={Nome} alt="Logo Renovai" className='nome__img' />
                            <p>Painel Administrativo</p>
                            <hr />
                        </div>
                    </div>
                </section>
                <section>
                    <nav aria-label="Menu principal">
                        <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="visao-geral" to="/home">
                            <svg aria-hidden="true" focusable="false" width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.7" /><rect x="14" y="3" width="7" height="5" rx="1.6" stroke="currentColor" strokeWidth="1.7" /><rect x="14" y="12" width="7" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.7" /><rect x="3" y="16" width="7" height="5" rx="1.6" stroke="currentColor" strokeWidth="1.7" /></svg>
                            <span className="label">Visão Geral</span>
                        </NavLink>
                        <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="cooperativa" to="/cooperativa">
                            <svg aria-hidden="true" focusable="false" width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 21V6.5L12 3l8 3.5V21" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.7" /><path d="M9 10h.01M15 10h.01M12 13h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
                            <span className="label">Cooperativa</span>
                        </NavLink>
                        <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="gestores" to="/funcionarios">
                            <svg aria-hidden="true" focusable="false" width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 20c.7-3.4 3-5.3 5.5-5.3S13.8 16.6 14.5 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="17.2" cy="8.5" r="2.4" stroke="currentColor" strokeWidth="1.6" /><path d="M15.6 14.2c2-.2 3.7 1.2 4.2 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                            <span className="label">Gestores &amp; Cooperados</span>
                        </NavLink>
                        <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="estoque" to="/estoque">
                            <svg aria-hidden="true" focusable="false" width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 8l9-5 9 5-9 5-9-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M3 8v9l9 5 9-5V8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M12 13v9" stroke="currentColor" strokeWidth="1.7" /></svg>
                            <span className="label">Estoque</span>
                        </NavLink>
                        <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="coletas" to="/coletas">
                            <svg aria-hidden="true" focusable="false" width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 12V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6" stroke="currentColor" strokeWidth="1.7" /><path d="M4 12l2.2 6.6A2 2 0 0 0 8.1 20h7.8a2 2 0 0 0 1.9-1.4L20 12" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M4 12h16" stroke="currentColor" strokeWidth="1.7" /></svg>
                            <span className="label">Coletas</span>
                        </NavLink>
                        <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="triagens" to="/triagens">
                            <svg aria-hidden="true" focusable="false" width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" /><rect x="9" y="2.3" width="6" height="3.4" rx="1" fill="currentColor" /><path d="M8.5 12l2.2 2.2L15.5 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="label">Triagens</span>
                        </NavLink>
                        <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="rateios" to="/rateios">
                            <svg aria-hidden="true" focusable="false" width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" stroke="currentColor" strokeWidth="1.7" /><path d="M3 12h18" stroke="currentColor" strokeWidth="1.7" /></svg>
                            <span className="label">Rateios</span>
                        </NavLink>
                        <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="rotas-coleta" to="/rotas-coleta">
                            <svg aria-hidden="true" focusable="false" width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 17l4-10h10l4 10" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M3 17h18v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="7.5" cy="20" r="1.3" fill="currentColor" /><circle cx="16.5" cy="20" r="1.3" fill="currentColor" /></svg>
                            <span className="label">Rotas</span>
                        </NavLink>
                        <NavLink className={({ isActive }) => isActive ? "selected" : ""} data-page="pedidos" to="/pedidos">
                            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2m0 9h.01M9 17h.01M12 16l1 1l3-3" /></g></svg>
                            <span className="label">Pedidos</span>
                        </NavLink>
                    </nav>
                </section>
                <section>
                    <div className='bottom'>
                        <div className="user">
                            <hr />
                            <button
                                className="user-row"
                                type="button"
                                onClick={() => navigate("/perfil")}
                            >
                                <div className="avatar">
                                    {usuario?.imagemUrl
                                        ? <img src={usuario.imagemUrl} alt="" />
                                        : inicial}
                                </div>
                                <div className="txt">
                                    <div className="name">{nomeExibido}</div>
                                    <div className="email">{email}</div>
                                </div>
                            </button>
                        </div>
                        <button className="signout" onClick={handleSignOut} disabled={saindo}>
                            <svg aria-hidden="true" focusable="false" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="label">{saindo ? "Saindo..." : "Sair da conta"}</span>
                        </button>
                    </div>
                </section>
            </aside>
        </>
    )
}
export default Aside