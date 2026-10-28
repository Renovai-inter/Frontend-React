import './style.css'
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios'
import Nome from '../../assets/nome_renovai.svg'
import type { CadastroLocationState } from "../../types/Cadastro/CadastroCredenciais";
import { isCnpjValido, mascaraCep, mascaraCnpj } from "../../utils/validators";
import { sanitizarTexto } from "../../utils/sanitizar";
import { useAuth } from "../../hooks/useAuth";
import { cadastrarCooperativa, login, type CadastroCooperativaResponse } from "../../services/authService";
import type { FormCooperativa, ErrosFormCooperativa } from "../../types/CadastroCooperativa/CadastroCooperativaTypes";

function validar(form: FormCooperativa): ErrosFormCooperativa {
  const erros: ErrosFormCooperativa = {};

  if (!form.nome.trim()) erros.nome = "Nome da cooperativa é obrigatório.";
  else if (form.nome.trim().length > 255) erros.nome = "Nome deve ter no máximo 255 caracteres.";

  if (!form.cnpj) erros.cnpj = "CNPJ é obrigatório.";
  else if (!isCnpjValido(form.cnpj)) erros.cnpj = "CNPJ inválido (use 00.000.000/0000-00).";

  if (!form.contatoPreferencial) erros.contatoPreferencial = "Selecione o contato preferencial.";

  if (form.descricao.length > 4000) erros.descricao = "Descrição deve ter no máximo 4000 caracteres.";

  if (form.numeroCooperados) {
    const n = Number(form.numeroCooperados);
    if (!Number.isInteger(n) || n < 0) {
      erros.numeroCooperados = "Informe um número inteiro maior ou igual a 0.";
    }
  }

  if (form.horarioFuncionamento.length > 100) {
    erros.horarioFuncionamento = "Horário deve ter no máximo 100 caracteres.";
  }

  if (!form.cep) erros.cep = "CEP é obrigatório.";
  else if (!/^\d{5}-\d{3}$/.test(form.cep)) erros.cep = "CEP inválido (use 00000-000).";

  if (!form.logradouro.trim()) erros.logradouro = "Logradouro é obrigatório.";
  else if (form.logradouro.trim().length > 255) erros.logradouro = "Máximo de 255 caracteres.";

  if (!form.numero.trim()) erros.numero = "Número é obrigatório.";
  else if (form.numero.trim().length > 20) erros.numero = "Máximo de 20 caracteres.";

  if (form.complemento.trim().length > 255) erros.complemento = "Máximo de 255 caracteres.";

  if (!form.bairro.trim()) erros.bairro = "Bairro é obrigatório.";
  else if (form.bairro.trim().length > 100) erros.bairro = "Máximo de 100 caracteres.";

  if (!form.cidade.trim()) erros.cidade = "Cidade é obrigatória.";
  else if (form.cidade.trim().length > 100) erros.cidade = "Máximo de 100 caracteres.";

  return erros;
}

function CadastroCooperativa() {
  const navigate = useNavigate();
  const location = useLocation();
  const { iniciarSessao } = useAuth();
  const credenciais = (location.state as CadastroLocationState | null)?.credenciais;

  const [form, setForm] = useState<FormCooperativa>({
    nome: "",
    descricao: "",
    cnpj: "",
    numeroCooperados: "",
    horarioFuncionamento: "",
    contatoPreferencial: "",
    imagemUrl: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
  });
  const [erros, setErros] = useState<ErrosFormCooperativa>({});
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Se o cadastro der certo mas o login falhar, a nova tentativa só refaz o login
  // (cadastrar de novo retornaria "E-mail já cadastrado").
  const cadastrado = useRef<CadastroCooperativaResponse | null>(null);

  // Sem os dados da tela 1 não há como cadastrar: volta para a primeira etapa.
  if (!credenciais?.nomeResponsavel || !credenciais.cpfResponsavel) {
    return <Navigate to="/cadastro-usuario" replace />;
  }

  const handleChange = (campo: keyof FormCooperativa) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const bruto = event.target.value;
      const valor =
        campo === "cep" ? mascaraCep(bruto) : campo === "cnpj" ? mascaraCnpj(bruto) : bruto;
      setForm((atual) => ({ ...atual, [campo]: valor }));
      setErros((atual) => ({ ...atual, [campo]: undefined }));
    };

  const handleCadastro = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errosEncontrados = validar(form);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    setLoading(true);
    setErro(null);
    let passo = "cadastrar a cooperativa";

    try {
      if (!cadastrado.current) {
        setEtapa("Cadastrando...");
        cadastrado.current = await cadastrarCooperativa({
          nome: sanitizarTexto(form.nome),
          descricao: sanitizarTexto(form.descricao) || undefined,
          numeroCooperados: form.numeroCooperados ? Number(form.numeroCooperados) : undefined,
          horarioFuncionamento: sanitizarTexto(form.horarioFuncionamento) || undefined,
          imagemUrl: sanitizarTexto(form.imagemUrl) || undefined,
          contatoPreferencial: form.contatoPreferencial,
          email: credenciais.email,
          cnpj: form.cnpj,
          senha: credenciais.senha,
          nomeResponsavel: credenciais.nomeResponsavel,
          cpfResponsavel: credenciais.cpfResponsavel,
          endereco: {
            cep: form.cep,
            logradouro: sanitizarTexto(form.logradouro),
            numero: sanitizarTexto(form.numero),
            complemento: sanitizarTexto(form.complemento) || undefined,
            bairro: sanitizarTexto(form.bairro),
            cidade: sanitizarTexto(form.cidade),
          },
        });
      }

      passo = "entrar na conta";
      setEtapa("Entrando...");
      const response = await login({ email: credenciais.email, senha: credenciais.senha });
      // O responsável também é funcionário (cargo Admin): o vínculo vem na resposta do cadastro.
      iniciarSessao({
        token: response.token,
        role: response.role,
        email: response.email,
        usuarioId: response.usuarioId,
        cooperativaId: cadastrado.current.cooperativaId,
        funcionarioId: cadastrado.current.funcionarioId,
      });

      navigate("/home", { replace: true });
    } catch (err) {
      let detalhe = "Tente novamente.";
      if (axios.isAxiosError(err)) {
        const dados = err.response?.data;
        // A API devolve "mensagem"; erros de validação (400) trazem os detalhes por campo em "campos".
        const campos = dados?.campos ? Object.values<string>(dados.campos).join(" ") : "";
        detalhe =
          campos ||
          dados?.mensagem ||
          dados?.message ||
          dados?.erro ||
          (err.response ? "Verifique os dados informados." : "Não foi possível conectar ao servidor.");
      } else if (err instanceof Error) {
        detalhe = err.message;
      }
      setErro(`Não foi possível ${passo}. ${detalhe}`);
    } finally {
      setLoading(false);
      setEtapa(null);
    }
  };

  const campoErro = (campo: keyof FormCooperativa) =>
    erros[campo] && <span className="cadastro-cooperativa__erro" id={`${campo}-erro`}>{erros[campo]}</span>;

  return (
    <main className="cadastro-cooperativa">
      <section className="cadastro-cooperativa__container">
        <div className="cadastro-cooperativa__header">
          <img src={Nome} alt="Logo Renovai" className="nome__img" />
          <h1 className="sr-only">Cadastro da cooperativa</h1>
          <p>Etapa 2 de 2 · Cadastre sua cooperativa.</p>
        </div>
        <form className="cadastro-cooperativa__form" onSubmit={handleCadastro} noValidate>
          <p className="cadastro-cooperativa__nota"><span aria-hidden="true">*</span> Campos obrigatórios</p>
          <div className="cadastro-cooperativa__field">
            <label htmlFor="nome"> Nome da cooperativa <span aria-hidden="true"> *</span></label>
            <input
              id="nome"
              type="text"
              placeholder="Digite o nome da cooperativa"
              value={form.nome}
              onChange={handleChange("nome")}
              aria-invalid={!!erros.nome}
              aria-describedby={erros.nome ? "nome-erro" : undefined}
              aria-required="true"
            />
            {campoErro("nome")}
          </div>

          <div className="cadastro-cooperativa__field">
            <label htmlFor="cnpj"> CNPJ <span aria-hidden="true"> *</span></label>
            <input
              id="cnpj"
              type="text"
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              maxLength={18}
              value={form.cnpj}
              onChange={handleChange("cnpj")}
              aria-invalid={!!erros.cnpj}
              aria-describedby={erros.cnpj ? "cnpj-erro" : undefined}
              aria-required="true"
            />
            {campoErro("cnpj")}
          </div>

          <div className="cadastro-cooperativa__field">
            <label htmlFor="descricao"> Descrição </label>
            <textarea
              id="descricao"
              rows={3}
              placeholder="Conte um pouco sobre a cooperativa (opcional)"
              value={form.descricao}
              onChange={handleChange("descricao")}
              aria-invalid={!!erros.descricao}
              aria-describedby={erros.descricao ? "descricao-erro" : undefined}
            />
            {campoErro("descricao")}
          </div>

          <div className="cadastro-cooperativa__row">
            <div className="cadastro-cooperativa__field">
              <label htmlFor="numeroCooperados"> Nº de cooperados </label>
              <input
                id="numeroCooperados"
                type="number"
                min={0}
                step={1}
                placeholder="Ex.: 25"
                value={form.numeroCooperados}
                onChange={handleChange("numeroCooperados")}
                aria-invalid={!!erros.numeroCooperados}
              aria-describedby={erros.numeroCooperados ? "numeroCooperados-erro" : undefined}
              />
              {campoErro("numeroCooperados")}
            </div>
            <div className="cadastro-cooperativa__field">
              <label htmlFor="contatoPreferencial"> Contato preferencial </label>
              <select
                id="contatoPreferencial"
                value={form.contatoPreferencial}
                onChange={handleChange("contatoPreferencial")}
                aria-invalid={!!erros.contatoPreferencial}
              aria-describedby={erros.contatoPreferencial ? "contatoPreferencial-erro" : undefined}
              >
                <option value="">Selecione</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="TELEFONE">Telefone</option>
                <option value="EMAIL">E-mail</option>
              </select>
              {campoErro("contatoPreferencial")}
            </div>
          </div>

          <div className="cadastro-cooperativa__field">
            <label htmlFor="horarioFuncionamento"> Horário de funcionamento </label>
            <input
              id="horarioFuncionamento"
              type="text"
              placeholder="Ex.: Seg a Sex, 8h às 17h"
              maxLength={100}
              value={form.horarioFuncionamento}
              onChange={handleChange("horarioFuncionamento")}
              aria-invalid={!!erros.horarioFuncionamento}
              aria-describedby={erros.horarioFuncionamento ? "horarioFuncionamento-erro" : undefined}
            />
            {campoErro("horarioFuncionamento")}
          </div>

          <h2 className="cadastro-cooperativa__secao">Endereço</h2>

          <div className="cadastro-cooperativa__row">
            <div className="cadastro-cooperativa__field">
              <label htmlFor="cep"> CEP <span aria-hidden="true"> *</span></label>
              <input
                id="cep"
                type="text"
                inputMode="numeric"
                placeholder="00000-000"
                maxLength={9}
                value={form.cep}
                onChange={handleChange("cep")}
                aria-invalid={!!erros.cep}
              aria-describedby={erros.cep ? "cep-erro" : undefined}
              aria-required="true"
                autoComplete="postal-code"
              />
              {campoErro("cep")}
            </div>
            <div className="cadastro-cooperativa__field">
              <label htmlFor="numero"> Número <span aria-hidden="true"> *</span></label>
              <input
                id="numero"
                type="text"
                placeholder="Ex.: 123"
                maxLength={20}
                value={form.numero}
                onChange={handleChange("numero")}
                aria-invalid={!!erros.numero}
              aria-describedby={erros.numero ? "numero-erro" : undefined}
              aria-required="true"
              />
              {campoErro("numero")}
            </div>
          </div>

          <div className="cadastro-cooperativa__field">
            <label htmlFor="logradouro"> Logradouro <span aria-hidden="true"> *</span></label>
            <input
              id="logradouro"
              type="text"
              placeholder="Rua, avenida..."
              value={form.logradouro}
              onChange={handleChange("logradouro")}
              aria-invalid={!!erros.logradouro}
              aria-describedby={erros.logradouro ? "logradouro-erro" : undefined}
              aria-required="true"
              autoComplete="address-line1"
            />
            {campoErro("logradouro")}
          </div>

          <div className="cadastro-cooperativa__field">
            <label htmlFor="complemento"> Complemento </label>
            <input
              id="complemento"
              type="text"
              placeholder="Galpão, sala... (opcional)"
              value={form.complemento}
              onChange={handleChange("complemento")}
              aria-invalid={!!erros.complemento}
              aria-describedby={erros.complemento ? "complemento-erro" : undefined}
            />
            {campoErro("complemento")}
          </div>

          <div className="cadastro-cooperativa__row">
            <div className="cadastro-cooperativa__field">
              <label htmlFor="bairro"> Bairro <span aria-hidden="true"> *</span></label>
              <input
                id="bairro"
                type="text"
                placeholder="Digite o bairro"
                value={form.bairro}
                onChange={handleChange("bairro")}
                aria-invalid={!!erros.bairro}
              aria-describedby={erros.bairro ? "bairro-erro" : undefined}
              aria-required="true"
              />
              {campoErro("bairro")}
            </div>
            <div className="cadastro-cooperativa__field">
              <label htmlFor="cidade"> Cidade <span aria-hidden="true"> *</span></label>
              <input
                id="cidade"
                type="text"
                placeholder="Digite a cidade"
                value={form.cidade}
                onChange={handleChange("cidade")}
                aria-invalid={!!erros.cidade}
              aria-describedby={erros.cidade ? "cidade-erro" : undefined}
              aria-required="true"
                autoComplete="address-level2"
              />
              {campoErro("cidade")}
            </div>
          </div>

          <div className="cadastro-cooperativa__utils">
            <button
              type="button"
              disabled={loading}
              onClick={() => navigate("/cadastro-usuario", { state: { credenciais } })}
            >
              Voltar e editar meus dados
            </button>
          </div>

          {erro && <p className="cadastro-cooperativa__erro-geral" role="alert">{erro}</p>}

          <button className="cadastro-cooperativa__send" type="submit" disabled={loading}>
            {loading ? (etapa ?? "Cadastrando...") : erro ? "Tentar novamente" : "Finalizar cadastro"}
          </button>
        </form>
      </section>
      <section className="cadastro-cooperativa__sidespace">

      </section>
    </main>
  );
}

export default CadastroCooperativa
