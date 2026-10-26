import './style.css'
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Nome from '../../assets/nome_renovai.svg'
import SenhaInput from "../../components/SenhaInput";
import type { CadastroLocationState } from "../../types/Cadastro/CadastroCredenciais";
import { isCpfValido, isEmailValido, mascaraCpf } from "../../utils/validators";

interface FormUsuario {
  nomeResponsavel: string;
  cpfResponsavel: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

type Erros = Partial<Record<keyof FormUsuario, string>>;

function validar(form: FormUsuario): Erros {
  const erros: Erros = {};

  if (!form.nomeResponsavel.trim()) erros.nomeResponsavel = "Nome do responsável é obrigatório.";
  else if (form.nomeResponsavel.trim().length > 255) erros.nomeResponsavel = "Nome deve ter no máximo 255 caracteres.";

  if (!form.cpfResponsavel) erros.cpfResponsavel = "CPF é obrigatório.";
  else if (!isCpfValido(form.cpfResponsavel)) erros.cpfResponsavel = "CPF inválido (use 000.000.000-00).";

  if (!form.email.trim()) erros.email = "E-mail é obrigatório.";
  else if (!isEmailValido(form.email.trim())) erros.email = "E-mail inválido.";
  else if (form.email.trim().length > 255) erros.email = "E-mail deve ter no máximo 255 caracteres.";

  if (!form.senha) erros.senha = "Senha é obrigatória.";
  else if (form.senha.length < 6) erros.senha = "Senha deve ter no mínimo 6 caracteres.";
  else if (new TextEncoder().encode(form.senha).length > 72) erros.senha = "Senha deve ter até 72 bytes.";

  if (!form.confirmarSenha) erros.confirmarSenha = "Confirme a senha.";
  else if (form.confirmarSenha !== form.senha) erros.confirmarSenha = "As senhas não conferem.";

  return erros;
}

function CadastroUsuario() {
  const navigate = useNavigate();
  const location = useLocation();
  // Se o usuário voltou da tela 2, os dados já digitados são recuperados.
  const salvo = (location.state as CadastroLocationState | null)?.credenciais;

  const [form, setForm] = useState<FormUsuario>({
    nomeResponsavel: salvo?.nomeResponsavel ?? "",
    cpfResponsavel: salvo?.cpfResponsavel ?? "",
    email: salvo?.email ?? "",
    senha: salvo?.senha ?? "",
    confirmarSenha: salvo?.senha ?? "",
  });
  const [erros, setErros] = useState<Erros>({});

  const handleChange = (campo: keyof FormUsuario) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const bruto = event.target.value;
      const valor = campo === "cpfResponsavel" ? mascaraCpf(bruto) : bruto;
      setForm((atual) => ({ ...atual, [campo]: valor }));
      setErros((atual) => ({ ...atual, [campo]: undefined }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errosEncontrados = validar(form);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    // Não chama a API: apenas guarda os dados e segue para a tela da cooperativa.
    navigate("/cadastro-cooperativa", {
      state: {
        credenciais: {
          nomeResponsavel: form.nomeResponsavel.trim(),
          cpfResponsavel: form.cpfResponsavel,
          email: form.email.trim(),
          senha: form.senha,
        },
      },
    });
  };

  return (
    <div className="cadastro-usuario">
      <section className="cadastro-usuario__container">
        <div className="cadastro-usuario__header">
          <img src={Nome} alt="Logo Renovai" className="nome__img" />
          <p>Etapa 1 de 2 · Crie o acesso de administrador da cooperativa.</p>
        </div>
        <form className="cadastro-usuario__form" onSubmit={handleSubmit} noValidate>
          <div className="cadastro-usuario__field">
            <label htmlFor="nomeResponsavel"> Nome do responsável </label>
            <input
              id="nomeResponsavel"
              type="text"
              placeholder="Digite seu nome completo"
              value={form.nomeResponsavel}
              onChange={handleChange("nomeResponsavel")}
              aria-invalid={!!erros.nomeResponsavel}
              autoComplete="name"
            />
            {erros.nomeResponsavel && (
              <span className="cadastro-usuario__erro">{erros.nomeResponsavel}</span>
            )}
          </div>

          <div className="cadastro-usuario__field">
            <label htmlFor="cpfResponsavel"> CPF </label>
            <input
              id="cpfResponsavel"
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              maxLength={14}
              value={form.cpfResponsavel}
              onChange={handleChange("cpfResponsavel")}
              aria-invalid={!!erros.cpfResponsavel}
            />
            {erros.cpfResponsavel && (
              <span className="cadastro-usuario__erro">{erros.cpfResponsavel}</span>
            )}
          </div>

          <div className="cadastro-usuario__field">
            <label htmlFor="email"> E-mail </label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={form.email}
              onChange={handleChange("email")}
              aria-invalid={!!erros.email}
              autoComplete="email"
            />
            {erros.email && <span className="cadastro-usuario__erro">{erros.email}</span>}
          </div>

          <div className="cadastro-usuario__field">
            <label htmlFor="senha"> Senha </label>
            <SenhaInput
              id="senha"
              placeholder="Mínimo 6 caracteres"
              value={form.senha}
              onChange={handleChange("senha")}
              aria-invalid={!!erros.senha}
              autoComplete="new-password"
            />
            {erros.senha && <span className="cadastro-usuario__erro">{erros.senha}</span>}
          </div>

          <div className="cadastro-usuario__field">
            <label htmlFor="confirmarSenha"> Confirmar senha </label>
            <SenhaInput
              id="confirmarSenha"
              placeholder="Repita a senha"
              value={form.confirmarSenha}
              onChange={handleChange("confirmarSenha")}
              aria-invalid={!!erros.confirmarSenha}
              autoComplete="new-password"
            />
            {erros.confirmarSenha && (
              <span className="cadastro-usuario__erro">{erros.confirmarSenha}</span>
            )}
          </div>

          <div className="cadastro-usuario__utils">
            <button type="button" onClick={() => navigate("/login")}>
              Já possui login? Entrar
            </button>
          </div>

          <button className="cadastro-usuario__send" type="submit">
            Continuar
          </button>
        </form>
      </section>
      <section className="cadastro-usuario__sidespace">

      </section>
    </div>
  );
}

export default CadastroUsuario
