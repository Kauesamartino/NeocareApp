import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DadosPessoais, Credenciais } from './cadastro';

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  CadastroDadosPessoais: undefined;
  CadastroCredenciais: { dadosPessoais: DadosPessoais };
  CadastroEndereco: {
    dadosPessoais: DadosPessoais;
    credenciais: Credenciais;
  };
  Home: undefined;
  Perfil: undefined;
  Medicao: undefined;
};

export type AppNavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;

export type AppRouteProp<T extends keyof RootStackParamList> =
  RouteProp<RootStackParamList, T>;
