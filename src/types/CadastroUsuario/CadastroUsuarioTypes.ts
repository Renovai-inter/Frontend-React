export interface FormUsuario {
  nomeResponsavel: string;
  cpfResponsavel: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export type ErrosFormUsuario = Partial<Record<keyof FormUsuario, string>>;
