// Cliente HTTP com axios para comunicação com a API local
import axios from 'axios';
import { AppError, mapApiError, ErrorType } from '../utils/errorUtils';
import { cleanCPF } from '../utils/cpfUtils';
import { formatCEP, validateCEP } from '../utils/formatUtils';
import { User } from '../contexts/AuthContext';

const BASE_URL = 'https://neocare-api.onrender.com';

// Configurar instância do axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

let onSessionExpired: (() => void | Promise<void>) | null = null;
let isHandlingSessionExpired = false;

export const setSessionExpiredHandler = (handler: (() => void | Promise<void>) | null) => {
  onSessionExpired = handler;
};

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
  async (error) => {
    console.error('❌ Erro na resposta:', error.response?.status, error.response?.data || error.message);

    const status = error.response?.status;
    const url = String(error.config?.url || '');
    const isAuthRoute = url.includes('/api/auth/login');

    if (status === 401 && !isAuthRoute && onSessionExpired && !isHandlingSessionExpired) {
      isHandlingSessionExpired = true;
      try {
        await onSessionExpired();
      } catch (sessionError) {
        console.error('❌ Erro ao processar sessão expirada:', sessionError);
      } finally {
        isHandlingSessionExpired = false;
      }
    }

    return Promise.reject(error);
  }
);

type LoginResponse = {
  token: string;
  username: string;
  roles: string[];
};

type UserProfileResponse = {
  id?: number;
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
    // Em modo de testes aceitamos CPF aleatório, mantendo apenas tamanho mínimo esperado
    if (userData.cpf && cleanCPF(userData.cpf).length !== 11) {
      throw new AppError('CPF deve conter 11 dígitos', ErrorType.CPF_INVALID);
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
    // Em modo de testes aceitamos CPF aleatório, mantendo apenas tamanho mínimo esperado
    if (body.cpf && cleanCPF(body.cpf).length !== 11) {
      throw new AppError('CPF deve conter 11 dígitos', ErrorType.CPF_INVALID);
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

// ─── Tipos de medição ──────────────────────────────────────────

export type MedicaoEstresseInput = {
  idUsuario: number;
  idDispositivo: number;
  tipoMedicao: 'MEDICAO_ESTRESSE';
  variacaoFrequenciaCardiaca: number;
  condutividadePele: number;
};

export type MedicaoVitalInput = {
  idUsuario: number;
  idDispositivo: number;
  tipoMedicao: 'MEDICAO_VITAL';
  batimentosPorMinuto: number;
  oxigenacaoSangue: number;
  pressaoSistolica: number;
  pressaoDiastolica: number;
};

export type MedicaoOutput = {
  id: number;
  nomeUsuario: string;
  dataMedicao: string;
  tipoMedicao: string;
  dispositivo: { id: number; tipoDispositivo: string; enderecoDisp: string; ativo: boolean };
};

export type MedicaoEstresseOutput = {
  variacaoFrequenciaCardiaca: number;
  condutividadePele: number;
  medicaoOutDto: MedicaoOutput;
};

export type MedicaoVitalOutput = {
  batimentosPorMinuto: number;
  oxigenacaoSangue: number;
  pressaoSistolica: number;
  pressaoDiastolica: number;
  medicaoOutDto: MedicaoOutput;
};

export type MedicaoVitalHistoricoOutput = {
  id: number;
  idUsuario: number;
  idDispositivo: number;
  dataMedicao: string;
  tipoMedicao: string;
  batimentosPorMinuto: number;
  oxigenacaoSangue: number;
  pressaoSistolica: number;
  pressaoDiastolica: number;
};

export type MedicaoEstresseHistoricoOutput = {
  id: number;
  idUsuario: number;
  idDispositivo: number;
  dataMedicao: string;
  tipoMedicao: string;
  variacaoFrequenciaCardiaca: number;
  condutividadePele: number;
};

export type AlertaOutput = {
  id: number;
  usuarioId: number;
  medicaoId: number;
  tipoAlerta: string;
  valorDetectado: string;
  severidade: string;
  mensagem: string;
  dataNotificacao: string;
};

export type DispositivoOutput = {
  id: number;
  usuarioId: number;
  tipoDispositivo: string;
  enderecoDisp: string;
  ativo: boolean;
};

export async function apiPostMedicaoEstresse(
  data: MedicaoEstresseInput,
): Promise<MedicaoEstresseOutput> {
  try {
    const response = await api.post('/medicoes/medicao_estresse', data);
    return response.data;
  } catch (error: any) {
    throw mapApiError(error);
  }
}

export async function apiPostMedicaoVital(
  data: MedicaoVitalInput,
): Promise<MedicaoVitalOutput> {
  try {
    const response = await api.post('/medicoes/medicao_vital', data);
    return response.data;
  } catch (error: any) {
    throw mapApiError(error);
  }
}

export async function apiGetMedicoesVitaisByUserId(
  usuarioId: number,
  token: string,
): Promise<MedicaoVitalHistoricoOutput[]> {
  try {
    const response = await api.get(`/medicoes/vitais/usuario/${usuarioId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw mapApiError(error);
  }
}

export async function apiGetMedicoesEstresseByUserId(
  usuarioId: number,
  token: string,
): Promise<MedicaoEstresseHistoricoOutput[]> {
  try {
    const response = await api.get(`/medicoes/estresse/usuario/${usuarioId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw mapApiError(error);
  }
}

export async function apiGetAlertasByUserId(
  usuarioId: number,
  token: string,
): Promise<AlertaOutput[]> {
  try {
    const response = await api.get(`/api/alertas/usuario/${usuarioId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw mapApiError(error);
  }
}

export async function apiGetDispositivosByUserId(
  usuarioId: number,
  token: string,
): Promise<DispositivoOutput[]> {
  try {
    const response = await api.get(`/api/dispositivos/usuario/${usuarioId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw mapApiError(error);
  }
}

// Exportar tipos também
export type { LoginResponse, UserProfileResponse, UpdateUserRequest };

export default {
  apiLogin,
  apiRegisterUser,
  apiGetUserByUsername,
  apiUpdateUser,
  apiPostMedicaoEstresse,
  apiPostMedicaoVital,
  apiGetMedicoesVitaisByUserId,
  apiGetMedicoesEstresseByUserId,
  apiGetAlertasByUserId,
  apiGetDispositivosByUserId,
};
