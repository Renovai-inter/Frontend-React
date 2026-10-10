
export interface CadastroCredenciais {
    email: string;
    senha: string;
}

export interface CadastroLocationState {
    credenciais?: CadastroCredenciais;
}
