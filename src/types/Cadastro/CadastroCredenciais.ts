
export interface CadastroCredenciais {
    nomeResponsavel: string;
    cpfResponsavel: string;
    email: string;
    senha: string;
}

export interface CadastroLocationState {
    credenciais?: CadastroCredenciais;
}
