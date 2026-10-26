import './style.css'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nome from '../../assets/nome_renovai.svg'
import { login } from "../../services/authService";
import { buscarPorUserId } from "../../services/funcionarioService";
import axios from 'axios'
import { removerSessao, salvarSessao } from "../../utils/armazenamentoSessao";
import SenhaInput from '../../components/SenhaInput';

function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      const response = await login({ email, senha });
      salvarSessao("renovai_token", response.token);
      salvarSessao("renovai_role", response.role);
      salvarSessao("renovai_email", response.email);
      salvarSessao("renovai_userId", response.usuarioId);

      // O token já está salvo, então a chamada autenticada abaixo funciona.
      try {
        const funcionario = await buscarPorUserId(response.usuarioId);
        salvarSessao("renovai_cooperativaId", funcionario.cooperativaId);
        salvarSessao("renovai_funcionarioId", funcionario.funcionarioId);
      } catch {
        removerSessao("renovai_cooperativaId");
        removerSessao("renovai_funcionarioId");
      }

      navigate("/home");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const mensagem =
          err.response?.data?.message ??
          err.response?.data?.erro ??
          "E-mail ou senha inválidos. ";
        setErro(mensagem);
      } else {
        setErro("Não foi possível conectar ao servidor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
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

          {erro && <p className="login__erro">{erro}</p>}

          <button className='login__send' type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
      <section className="login__sidespace">

      </section>
    </div>
  );
}

export default Login
