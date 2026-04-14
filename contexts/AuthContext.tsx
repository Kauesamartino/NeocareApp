import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogin, apiRegisterUser, apiGetUserByUsername, apiUpdateUser, setSessionExpiredHandler, UpdateUserRequest } from '../services/api';
import { AppError, ErrorType } from '../utils/errorUtils';

export interface User {
  id: number;
  username: string;
  nome: string;
  sobrenome?: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  sexo?: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  altura?: number;
  peso?: number;
  cpf?: string;
  endereco?: {
    logradouro: string;
    bairro: string;
    cep: string;
    numero: string;
    complemento: string;
    cidade: string;
    uf: string;
  };
  ativo?: boolean;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (userData: UpdateUserRequest) => Promise<boolean>;
}

export interface RegisterData {
  username?: string;
  password?: string;
  nome: string;
  sobrenome?: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  sexo?: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  altura?: number;
  peso?: number;
  cpf?: string;
  endereco?: {
    logradouro: string;
    bairro: string;
    cep: string;
    numero: string;
    complemento: string;
    cidade: string;
    uf: string;
  };
  credenciais?: {
    username: string;
    password: string;
  };
}

const STORAGE_KEYS = {
  USER_TOKEN: '@neocare_user_token',
  USER_DATA: '@neocare_user_data',
  USERNAME: '@neocare_username',
  REMEMBER_ME: '@neocare_remember_me',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const saveUserData = async (userData: User, token: string) => {
    try {
      if (!userData.username) {
        console.error('❌ Erro: tentativa de salvar usuário sem username');
        console.log('🔍 Dados do usuário:', userData);
        throw new Error('Username é obrigatório para salvar dados do usuário');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, userData.username);
      console.log('✅ Dados do usuário salvos no AsyncStorage');
      console.log('🔑 Username salvo:', userData.username);
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
    }
  };

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

  const clearUserData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USERNAME,
        STORAGE_KEYS.REMEMBER_ME,
      ]);
      console.log('✅ Dados do usuário removidos do AsyncStorage');
    } catch (error) {
      console.error('❌ Erro ao limpar dados do usuário:', error);
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!token || token.length < 10) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro na validação do token:', error);
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const data = await apiLogin(username, password);

      const { token, username: returnedUsername, roles } = data;

      if (!token) {
        console.error('❌ Login falhou: token não retornado', data);
        return false;
      }

      const userData: User = {
        id: 0,
        username: returnedUsername || username,
        nome: returnedUsername || username,
        email: '',
        telefone: '',
        dataNascimento: '',
        roles: roles,
      };

      const userProfile = await apiGetUserByUsername(userData.username, token);
      userData.id = Number(userProfile.id ?? 0);
      userData.nome = userProfile.nome;
      userData.sobrenome = userProfile.sobrenome;
      userData.email = userProfile.email;
      userData.telefone = userProfile.telefone;
      userData.dataNascimento = userProfile.dataNascimento;
      userData.sexo = userProfile.sexo;
      userData.altura = userProfile.altura;
      userData.peso = userProfile.peso;
      userData.cpf = userProfile.cpf;
      userData.endereco = userProfile.endereco;
      userData.ativo = userProfile.ativo;

      await saveUserData(userData, token);

      setUser(userData);
      setIsAuthenticated(true);

      console.log('✅ Login realizado com sucesso (API)');
      console.log('📱 Token salvo:', token.substring(0, 20) + '...');
      console.log('👤 Username salvo:', userData.username);
      console.log('🔍 Verificando armazenamento...');
      
      const { token: savedToken } = await loadUserData();
      console.log('✅ Token verificado no AsyncStorage:', savedToken ? 'OK' : 'ERRO');
      
      return true;
    } catch (error) {
      console.error('❌ Erro no login (API):', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      await clearUserData();
      setUser(null);
      setIsAuthenticated(false);

      console.log('🔍 Debug register - dados recebidos:', {
        hasUsername: !!userData.username,
        hasCredenciais: !!(userData as any).credenciais,
        username: userData.username,
        usernameFromCredenciais: (userData as any).credenciais?.username,
        nome: userData.nome,
        email: userData.email
      });

      const resp = await apiRegisterUser(userData);

      if (resp) {
        const finalUsername = userData.username || (userData as any).credenciais?.username || userData.email || userData.nome || 'user' + Date.now();
        
        console.log('✅ Cadastro realizado com sucesso na API');
        console.log('👤 Username registrado:', finalUsername);
        console.log('📧 Email registrado:', userData.email);
        console.log('🔄 Usuário deve fazer login para acessar o sistema');
        
        return true;
      } else {
        console.error('❌ Cadastro falhou (API): resposta inesperada', resp);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no cadastro (API):', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      await clearUserData();

      setUser(null);
      setIsAuthenticated(false);

      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthState = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const { user: savedUser, token } = await loadUserData();

      if (savedUser && token) {
        const isTokenValid = await validateToken(token);

        if (isTokenValid) {
          if (savedUser && (!savedUser.username || savedUser.username === savedUser.nome)) {
            console.log('🔄 Migrando usuário - corrigindo username');
            console.log('🔍 Antes:', { id: savedUser.id, username: savedUser.username, nome: savedUser.nome });

            if (savedUser.id) {
              const storedUsername = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
              if (!storedUsername) {
                await clearUserData();
                return;
              }
              savedUser.username = storedUsername;
              await saveUserData(savedUser, token);
              console.log('✅ Username corrigido para', savedUser.username);
            }
          }

          if (!savedUser.id || Number(savedUser.id) <= 0) {
            try {
              const profile = await apiGetUserByUsername(savedUser.username, token);
              savedUser.id = Number(profile.id ?? 0);
              await saveUserData(savedUser, token);
            } catch (profileError) {
              console.error('❌ Não foi possível recuperar ID do usuário:', profileError);
            }
          }

          setUser(savedUser);
          setIsAuthenticated(true);
          console.log('✅ Usuário autenticado automaticamente');
          console.log('🔍 Debug - Dados do usuário carregados:', {
            id: savedUser?.id,
            username: savedUser?.username,
            nome: savedUser?.nome
          });
        } else {
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

  const refreshUserProfile = async (): Promise<void> => {
    try {
      console.log('🔍 Debug refreshUserProfile - Verificando usuário:', {
        hasUser: !!user,
        username: user?.username,
        id: user?.id,
        nome: user?.nome
      });

      if (!user?.username || !user?.id) {
        console.log('⚠️ Não é possível buscar perfil: usuário não autenticado');
        console.log('🔍 Motivo:', {
          hasUsername: !!user?.username,
          hasId: !!user?.id,
          user: user
        });
        return;
      }

      const { token } = await loadUserData();

      if (!token) {
        console.log('⚠️ Token não encontrado, não é possível buscar perfil');
        return;
      }

      setIsLoading(true);

      const userProfile = await apiGetUserByUsername(user.username, token);

      const updatedUser: User = {
        id: Number(userProfile.id ?? user.id),
        username: user.username,
        nome: userProfile.nome,
        sobrenome: userProfile.sobrenome,
        email: userProfile.email,
        telefone: userProfile.telefone,
        dataNascimento: userProfile.dataNascimento,
        sexo: userProfile.sexo,
        altura: userProfile.altura,
        peso: userProfile.peso,
        cpf: userProfile.cpf,
        endereco: userProfile.endereco,
        ativo: userProfile.ativo,
        roles: user.roles,
      };

      await saveUserData(updatedUser, token);

      setUser(updatedUser);

      console.log('✅ Perfil do usuário atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao buscar dados do perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: UpdateUserRequest): Promise<boolean> => {
    try {
      console.log('🔍 Debug updateUserProfile - Verificando usuário:', {
        hasUser: !!user,
        username: user?.username,
        id: user?.id,
        nome: user?.nome
      });

      if (!user?.username || Number(user?.id) <= 0) {
        console.log('⚠️ Não é possível atualizar perfil: usuário não autenticado');
        console.log('🔍 Motivo:', {
          hasUsername: !!user?.username,
          hasId: !!user?.id,
          user: user
        });
        return false;
      }

      const { token } = await loadUserData();

      if (!token) {
        console.log('⚠️ Token não encontrado, não é possível atualizar perfil');
        return false;
      }

      setIsLoading(true);

      const updatedProfile = await apiUpdateUser(userData, token);

      const updatedUser: User = {
        id: user.id,
        username: user.username,
        nome: updatedProfile.nome,
        sobrenome: updatedProfile.sobrenome,
        email: updatedProfile.email,
        telefone: updatedProfile.telefone,
        dataNascimento: updatedProfile.dataNascimento,
        sexo: updatedProfile.sexo,
        altura: updatedProfile.altura,
        peso: updatedProfile.peso,
        cpf: updatedProfile.cpf,
        endereco: updatedProfile.endereco,
        ativo: updatedProfile.ativo,
        roles: user.roles,
      };

      await saveUserData(updatedUser, token);

      setUser(updatedUser);

      console.log('✅ Perfil do usuário atualizado com sucesso');
      console.log('📱 Dados atualizados salvos:', {
        id: updatedUser.id,
        username: updatedUser.username,
        nome: updatedUser.nome,
        sobrenome: updatedUser.sobrenome,
        email: updatedUser.email
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar dados do perfil:', error);

      if (error instanceof AppError && error.type === ErrorType.CPF_INVALID) {
        console.error('❌ CPF inválido detectado:', error.message);
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const migrateOldUserData = async () => {
    try {
      console.log('🔄 Verificando necessidade de migração...');
      await debugAuthStorage();

      const { user: savedUser, token } = await loadUserData();

      if (savedUser && !savedUser.username) {
        console.log('🔄 Detectado usuário sem username, iniciando migração...');

        if (savedUser.id) {
          const storedUsername = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
          if (!storedUsername) {
            await clearUserData();
            return;
          }
          savedUser.username = storedUsername;
          await saveUserData(savedUser, token || '');
          console.log('✅ Usuário migrado com username:', savedUser.username);
          console.log('🔍 Migração: username restaurado para', savedUser.username);

          console.log('📋 Verificando dados após migração:');
          await debugAuthStorage();
        } else {
          console.log('⚠️ Usuário sem ID, limpando dados...');
          await clearUserData();
        }
      } else {
        console.log('✅ Usuário já possui username, migração desnecessária');
      }
    } catch (error) {
      console.error('❌ Erro na migração de dados:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await migrateOldUserData();
      await checkAuthState();
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(async () => {
      await logout();
      console.log('⚠️ Sessão expirada. Faça login novamente.');
    });

    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthState,
    refreshUserProfile,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const setRememberMe = async (remember: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(remember));
  } catch (error) {
    console.error('❌ Erro ao salvar preferência "Lembrar de mim":', error);
  }
};

export const getRememberMe = async (): Promise<boolean> => {
  try {
    const remember = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    return remember ? JSON.parse(remember) : false;
  } catch (error) {
    console.error('❌ Erro ao verificar preferência "Lembrar de mim":', error);
    return false;
  }
};

export const forceLogout = async (): Promise<void> => {
  try {
    console.log('🚨 Executando logout forçado...');
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.USER_TOKEN,
      STORAGE_KEYS.USERNAME,
      STORAGE_KEYS.REMEMBER_ME,
    ]);
    console.log('✅ Todos os dados de autenticação foram limpos');
    console.log('🔄 Por favor, faça login novamente');
  } catch (error) {
    console.error('❌ Erro no logout forçado:', error);
  }
};

export const fixUsername = async (): Promise<void> => {
  try {
    console.log('🔧 Tentando corrigir username...');

    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);

    if (userData) {
      const user = JSON.parse(userData);
      console.log('👤 Usuário atual:', { id: user.id, username: user.username, nome: user.nome });

      if (user.id && (!user.username || user.username.trim().length === 0)) {
        const storedUsername = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
        if (!storedUsername) {
          return;
        }
        console.log('🔄 Corrigindo username para valor persistido');
        user.username = storedUsername;

        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, user.username);

        console.log('✅ Username corrigido com sucesso!');
        console.log('🔄 Recarregue o app para aplicar as mudanças');
      } else {
        console.log('✅ Username já está correto');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao corrigir username:', error);
  }
};

export const debugAuthStorage = async (): Promise<void> => {
  try {
    console.log('\n🔍 === DEBUG: Verificando dados de autenticação ===');

    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
    const rememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);

    const parsedUser = userData ? JSON.parse(userData) : null;

    console.log('📱 Dados do usuário:', parsedUser);
    if (parsedUser) {
      console.log('   - ID:', parsedUser.id);
      console.log('   - Username:', parsedUser.username);
      console.log('   - Nome:', parsedUser.nome);
      console.log('   - Email:', parsedUser.email);
    }
    console.log('🔑 Token salvo:', token ? token.substring(0, 30) + '...' : 'Não encontrado');
    console.log('� Token completo length:', token ? token.length : 0);
    console.log('�👤 Username separado:', username || 'Não encontrado');
    console.log('💾 Lembrar de mim:', rememberMe ? JSON.parse(rememberMe) : 'Não definido');

    if (parsedUser && !parsedUser.username) {
      console.log('⚠️ ATENÇÃO: Usuário sem username detectado - precisa migração!');
    }

    if (token && token.startsWith('token_')) {
      console.log('⚠️ ATENÇÃO: Token temporário detectado - precisa fazer login real!');
    }

    console.log('=== Fim do Debug de Autenticação ===\n');
  } catch (error) {
    console.error('❌ Erro no debug de autenticação:', error);
  }
};