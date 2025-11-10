// Cliente HTTP com axios para comunicação com a API local
import axios from 'axios';
import { AppError, mapApiError, ErrorType } from '../utils/errorUtils';
import { validateCPF } from '../utils/cpfUtils';
import { formatCEP, validateCEP } from '../utils/formatUtils';
import { User } from '../contexts/AuthContext';

const BASE_URL = 'https://neocare-api.onrender.com';

// Configurar instância do axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para logs de requisições
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para logs de respostas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

type LoginResponse = {
  token: string;
  username: string;
  roles: string[];
};

type UserProfileResponse = {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  sexo: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  altura: number;
  peso: number;
  endereco: {
    logradouro: string;
    bairro: string;
    cep: string;
    numero: string;
    complemento: string;
    cidade: string;
    uf: string;
  };
  ativo: boolean;
};

type UpdateUserRequest = {
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  email: string;
  dataNascimento: string;
  sexo: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  altura: number;
  peso: number;
  endereco: {
    logradouro: string;
    bairro: string;
    cep: string;
    numero: string;
    complemento: string;
    cidade: string;
    uf: string;
  };
};

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  } catch (error: any) {
    const appError = mapApiError(error);
    throw appError;
  }
}

export async function apiGetUserByUsername(username: string, token: string): Promise<User> {
  try {
    const response = await api.get(`/usuarios/username/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    const appError = mapApiError(error);
    throw appError;
  }
}

export async function apiUpdateUser(userData: UpdateUserRequest, token: string): Promise<UserProfileResponse> {
  try {
    // Validar CPF se fornecido
    if (userData.cpf && !validateCPF(userData.cpf)) {
      throw new AppError('CPF inválido', ErrorType.CPF_INVALID);
    }

    // Validar e formatar CEP se fornecido
    if (userData.endereco?.cep) {
      if (!validateCEP(userData.endereco.cep)) {
        throw new AppError('CEP inválido', ErrorType.VALIDATION_ERROR);
      }
      // Formatar CEP no padrão XXXXX-XXX
      userData.endereco.cep = formatCEP(userData.endereco.cep);
    }

    const response = await api.put('/usuarios', userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    // Se já é um AppError (como erro de validação), propaga
    if (error instanceof AppError) {
      throw error;
    }
    
    // Caso contrário, mapeia o erro da API
    const appError = mapApiError(error);
    throw appError;
  }
}

export async function apiRegisterUser(body: any): Promise<any> {
  try {
    // Validar e formatar dados antes de enviar
    if (body.cpf && !validateCPF(body.cpf)) {
      throw new AppError('CPF inválido', ErrorType.CPF_INVALID);
    }

    if (body.endereco?.cep) {
      if (!validateCEP(body.endereco.cep)) {
        throw new AppError('CEP inválido', ErrorType.VALIDATION_ERROR);
      }
      // Formatar CEP no padrão XXXXX-XXX
      body.endereco.cep = formatCEP(body.endereco.cep);
    }

    const response = await api.post('/usuarios', body);
    return response.data;
  } catch (error: any) {
    // Se já é um AppError (como erro de validação), propaga
    if (error instanceof AppError) {
      throw error;
    }
    
    const appError = mapApiError(error);
    throw appError;
  }
}

// Exportar tipos também
export type { LoginResponse, UserProfileResponse, UpdateUserRequest };

export default {
  apiLogin,
  apiRegisterUser,
  apiGetUserByUsername,
  apiUpdateUser,
};
