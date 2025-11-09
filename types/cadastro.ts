// Tipos compartilhados para o fluxo de cadastro

export interface DadosPessoais {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  sexo: 'MASCULINO' | 'FEMININO' | 'OUTRO' | '';
  altura: string;
  peso: string;
}

export interface Credenciais {
  username: string;
  password: string;
  confirmPassword?: string; // Apenas para validação no frontend
}

export interface Endereco {
  logradouro: string;
  bairro: string;
  cep: string;
  numero: string;
  complemento: string;
  cidade: string;
  uf: string;
}

export interface CadastroCompleto {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  credenciais: {
    username: string;
    password: string;
  };
  telefone: string;
  dataNascimento: string; // Formato: YYYY-MM-DD
  sexo: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  altura: number;
  peso: number;
  endereco: Endereco;
}

// Parâmetros de navegação
export type CadastroStackParamList = {
  CadastroDadosPessoais: undefined;
  CadastroCredenciais: {
    dadosPessoais: DadosPessoais;
  };
  CadastroEndereco: {
    dadosPessoais: DadosPessoais;
    credenciais: {
      username: string;
      password: string;
    };
  };
  Login: undefined;
  Cadastro: undefined;
};