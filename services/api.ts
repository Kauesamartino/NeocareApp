// Cliente HTTP com axios para comunicação com a API local
import axios from 'axios';

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

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Erro no login';
    throw new Error(`Login failed: ${message}`);
  }
}

export async function apiRegisterUser(body: any): Promise<any> {
  try {
    const response = await api.post('/usuario', body);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Erro no cadastro';
    throw new Error(`Register failed: ${message}`);
  }
}

export default {
  apiLogin,
  apiRegisterUser,
};
