import './style.css'
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nome from '../../assets/nome_renovai.svg'
import SenhaInput from '../../components/SenhaInput';
import CabecaNimo from '../../assets/cabeca_nimo.png'
import { useAuth } from "../../hooks/useAuth";

function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const { entrar, status, erro, limparErro } = useAuth();
  const loading = status === "autenticando";

  // Erro de uma tentativa anterior não deve aparecer ao voltar para a tela
  useEffect(() => {
    limparErro();
  }, [limparErro]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // E-mail é normalizado; a senha vai exatamente como digitada (nunca é alterada)
    const sucesso = await entrar(email.trim(), senha);
    if (sucesso) navigate("/home");
  }

  return (
    <div className="login">
      <section className="login__container">
        <div className="login__header">
          <img src={Nome} alt="Logo Renovai" className="nome__img" />
          <p>Entre na sua conta de administrador para continuar.</p>
        </div>
        <form className="login__form" onSubmit={handleLogin}>
          <div className="login__field">
            <label htmlFor="email"> E-mail </label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="login__field">
            <label htmlFor="senha"> Senha </label>
            <SenhaInput
              id="senha"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoFocus
              required
            />


          </div>
          <div className='login__utils'>
            <button type="button" onClick={() => navigate("/redefinir-senha", { state: { email } })}>Esqueci a senha</button>
            <button type="button" onClick={() => navigate("/cadastro-usuario")}>Não possui login? Cadastre-se</button>
          </div>

          {erro && <p className="login__erro" role="alert">{erro}</p>}

          <button className='login__send' type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
      <section className="login__sidespace">
        <img src={CabecaNimo} alt="Nimo, mascote da Renovai" className="login__nimo" />
      </section>
    </div>
  );
}

export default Login
