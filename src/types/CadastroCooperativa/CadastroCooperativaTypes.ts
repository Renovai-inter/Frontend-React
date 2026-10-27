export interface FormCooperativa {
  nome: string;
  descricao: string;
  numeroCooperados: string;
  horarioFuncionamento: string;
  contatoPreferencial: "" | "WHATSAPP" | "TELEFONE" | "EMAIL";
  cnpj: string;
  imagemUrl: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
}

export type ErrosFormCooperativa = Partial<Record<keyof FormCooperativa, string>>;
