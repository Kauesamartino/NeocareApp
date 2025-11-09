import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogin, apiRegisterUser } from '../services/api';

// Tipos para TypeScript
interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  roles?: string[]; // Roles do usuário retornadas pelo login
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

// Pode ser o objeto completo do requestBody esperado pela API (/usuario)
type RegisterData = any;

// Chaves para AsyncStorage
const STORAGE_KEYS = {
  USER_TOKEN: '@neocare_user_token',
  USER_DATA: '@neocare_user_data',
  REMEMBER_ME: '@neocare_remember_me',
};

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider do contexto
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Função para salvar dados do usuário
  const saveUserData = async (userData: User, token: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      console.log('✅ Dados do usuário salvos no AsyncStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
    }
  };

  // Função para carregar dados do usuário
  const loadUserData = async (): Promise<{ user: User | null; token: string | null }> => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      
      return {
        user: userData ? JSON.parse(userData) : null,
        token: token || null,
      };
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      return { user: null, token: null };
    }
  };

  // Função para limpar dados do usuário
  const clearUserData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.REMEMBER_ME,
      ]);
      console.log('✅ Dados do usuário removidos do AsyncStorage');
    } catch (error) {
      console.error('❌ Erro ao limpar dados do usuário:', error);
    }
  };

  // Simular validação de token (substituir por API real)
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      // Aqui você faria uma chamada para sua API para validar o token
      // Por enquanto, vamos simular uma validação
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o token não está expirado (exemplo simples)
      if (!token || token.length < 10) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro na validação do token:', error);
      return false;
    }
  };

  // Função de login
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Chamar API real
      const data = await apiLogin(username, password);

      // Resposta da API: { token: string, username: string, roles: string[] }
      const { token, username: returnedUsername, roles } = data;

      if (!token) {
        console.error('❌ Login falhou: token não retornado', data);
        return false;
      }

      // Criar objeto de usuário com os dados retornados
      const userData: User = {
        id: returnedUsername, // Usando username como ID
        nome: returnedUsername,
        email: '', // Email não é retornado no login, será preenchido depois se necessário
        telefone: '',
        dataNascimento: '',
        roles: roles, // Salvar roles do usuário
      };

      // Salvar dados no AsyncStorage
      await saveUserData(userData, token);

      // Atualizar estado
      setUser(userData);
      setIsAuthenticated(true);

      console.log('✅ Login realizado com sucesso (API)');
      return true;
    } catch (error) {
      console.error('❌ Erro no login (API):', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de cadastro
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Enviar para a API /usuario
      const resp = await apiRegisterUser(userData);

      // Esperamos algo como { token, user } ou { usuario }
      const token = resp?.token || resp?.accessToken || null;
      const createdUser = resp?.user || resp?.usuario || resp || null;

      if (!token && !createdUser) {
        console.error('❌ Cadastro falhou (API): resposta inesperada', resp);
        return false;
      }

      // Se a API retornou token, salvamos
      if (token) {
        await saveUserData(createdUser, token);
        setUser(createdUser || null);
        setIsAuthenticated(true);
      } else if (createdUser) {
        // API pode não retornar token; salvamos os dados do usuário e continuar autenticado localmente
        await saveUserData(createdUser, `token_${Date.now()}`);
        setUser(createdUser as User);
        setIsAuthenticated(true);
      }

      console.log('✅ Cadastro realizado com sucesso (API)');
      return true;
    } catch (error) {
      console.error('❌ Erro no cadastro (API):', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Limpar dados do AsyncStorage
      await clearUserData();
      
      // Resetar estado
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para verificar estado de autenticação
  const checkAuthState = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Carregar dados do AsyncStorage
      const { user: savedUser, token } = await loadUserData();
      
      if (savedUser && token) {
        // Validar token com a API
        const isTokenValid = await validateToken(token);
        
        if (isTokenValid) {
          // Token válido, usuário autenticado
          setUser(savedUser);
          setIsAuthenticated(true);
          console.log('✅ Usuário autenticado automaticamente');
        } else {
          // Token inválido, limpar dados
          await clearUserData();
          console.log('⚠️ Token inválido, dados limpos');
        }
      } else {
        console.log('ℹ️ Nenhum usuário logado encontrado');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar estado de autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar estado de autenticação ao inicializar
  useEffect(() => {
    checkAuthState();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Função auxiliar para salvar preferência "Lembrar de mim"
export const setRememberMe = async (remember: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(remember));
  } catch (error) {
    console.error('❌ Erro ao salvar preferência "Lembrar de mim":', error);
  }
};

// Função auxiliar para verificar preferência "Lembrar de mim"
export const getRememberMe = async (): Promise<boolean> => {
  try {
    const remember = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    return remember ? JSON.parse(remember) : false;
  } catch (error) {
    console.error('❌ Erro ao verificar preferência "Lembrar de mim":', error);
    return false;
  }
};