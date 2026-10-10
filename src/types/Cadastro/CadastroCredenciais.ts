/**
 * Dados da tela 1 (e-mail e senha), guardados no front até a tela 2
 * enviar o cadastro completo para POST /auth/cadastro-cooperativa.
 */
export interface CadastroCredenciais {
    email: string;
    senha: string;
}

/** Formato do state enviado via react-router entre as duas telas. */
export interface CadastroLocationState {
    credenciais?: CadastroCredenciais;
}
