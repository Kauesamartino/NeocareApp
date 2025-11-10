import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogin, apiRegisterUser, apiGetUserByUsername, apiUpdateUser, UpdateUserRequest } from '../services/api';

// Tipos para TypeScript
interface User {
  id: string;
  username: string; // Username usado para login e buscar dados na API
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
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (userData: UpdateUserRequest) => Promise<boolean>;
}

// Pode ser o objeto completo do requestBody esperado pela API (/usuario)
type RegisterData = any;

// Chaves para AsyncStorage
const STORAGE_KEYS = {
  USER_TOKEN: '@neocare_user_token',
  USER_DATA: '@neocare_user_data',
  USERNAME: '@neocare_username',
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
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, userData.username);
      console.log('✅ Dados do usuário salvos no AsyncStorage');
      console.log('🔑 Username salvo:', userData.username);
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
        STORAGE_KEYS.USERNAME,
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
        id: returnedUsername || username, // Usar o username retornado pela API ou o inserido pelo usuário
        username: returnedUsername || username, // Este é o username para login e API
        nome: returnedUsername || username, // Nome temporário, será substituído quando buscar dados completos
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
      console.log('📱 Token e username salvos:', { token: token.substring(0, 20) + '...', username: userData.username });
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
      if (token && createdUser) {
        await saveUserData(createdUser, token);
        setUser(createdUser || null);
        setIsAuthenticated(true);
        console.log('✅ Cadastro realizado com sucesso (API)');
        console.log('📱 Token e dados do usuário salvos:', { 
          token: token.substring(0, 20) + '...', 
          userId: createdUser.id || createdUser.nome 
        });
      } else if (createdUser) {
        // API pode não retornar token; salvamos os dados do usuário e continuar autenticado localmente
        const tempToken = `token_${Date.now()}`;
        await saveUserData(createdUser, tempToken);
        setUser(createdUser as User);
        setIsAuthenticated(true);
        console.log('✅ Cadastro realizado com sucesso (API) - Token temporário gerado');
        console.log('📱 Dados do usuário salvos:', { 
          tempToken: tempToken.substring(0, 20) + '...', 
          userId: createdUser.id || createdUser.nome 
        });
      }

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
          // Migrar usuários antigos que não têm username ou têm username incorreto
          if (savedUser && (!savedUser.username || savedUser.username === savedUser.nome)) {
            console.log('🔄 Migrando usuário - corrigindo username');
            console.log('🔍 Antes:', { id: savedUser.id, username: savedUser.username, nome: savedUser.nome });
            
            if (savedUser.id) {
              savedUser.username = savedUser.id; // ID é o username correto
              await saveUserData(savedUser, token); // Resalvar com username correto
              console.log('✅ Username corrigido de', savedUser.nome, 'para', savedUser.id);
            }
          }
          
          // Token válido, usuário autenticado
          setUser(savedUser);
          setIsAuthenticated(true);
          console.log('✅ Usuário autenticado automaticamente');
          console.log('🔍 Debug - Dados do usuário carregados:', { 
            id: savedUser?.id, 
            username: savedUser?.username, 
            nome: savedUser?.nome 
          });
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

  // Função para buscar dados completos do perfil do usuário
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

      // Carregar token do AsyncStorage
      const { token } = await loadUserData();
      
      if (!token) {
        console.log('⚠️ Token não encontrado, não é possível buscar perfil');
        return;
      }

      setIsLoading(true);
      
      // Buscar dados completos do usuário na API usando o USERNAME
      const userProfile = await apiGetUserByUsername(user.username, token);
      
      // Atualizar dados do usuário mantendo as informações de autenticação
      const updatedUser: User = {
        id: user.id,
        username: user.username, // Manter username original
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
        roles: user.roles, // Manter roles originais
      };

      // Salvar dados atualizados
      await saveUserData(updatedUser, token);
      
      // Atualizar estado
      setUser(updatedUser);
      
      console.log('✅ Perfil do usuário atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao buscar dados do perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar dados do perfil do usuário
  const updateUserProfile = async (userData: UpdateUserRequest): Promise<boolean> => {
    try {
      console.log('🔍 Debug updateUserProfile - Verificando usuário:', { 
        hasUser: !!user, 
        username: user?.username, 
        id: user?.id,
        nome: user?.nome 
      });
      
      if (!user?.username || !user?.id) {
        console.log('⚠️ Não é possível atualizar perfil: usuário não autenticado');
        console.log('🔍 Motivo:', { 
          hasUsername: !!user?.username, 
          hasId: !!user?.id,
          user: user
        });
        return false;
      }

      // Carregar token do AsyncStorage
      const { token } = await loadUserData();
      
      if (!token) {
        console.log('⚠️ Token não encontrado, não é possível atualizar perfil');
        return false;
      }

      setIsLoading(true);
      
      // Atualizar dados do usuário na API
      const updatedProfile = await apiUpdateUser(userData, token);
      
      // Atualizar dados do usuário mantendo as informações de autenticação
      const updatedUser: User = {
        id: user.id,
        username: user.username, // Manter username original
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
        roles: user.roles, // Manter roles originais
      };

      // Salvar dados atualizados
      await saveUserData(updatedUser, token);
      
      // Atualizar estado
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
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para migrar dados antigos de usuários
  const migrateOldUserData = async () => {
    try {
      console.log('🔄 Verificando necessidade de migração...');
      await debugAuthStorage(); // Debug antes da migração
      
      const { user: savedUser, token } = await loadUserData();
      
      if (savedUser && !savedUser.username) {
        console.log('🔄 Detectado usuário sem username, iniciando migração...');
        
        // Usar o ID como username (que é o username real do login)
        if (savedUser.id) {
          savedUser.username = savedUser.id; // ID é o username correto
          await saveUserData(savedUser, token || '');
          console.log('✅ Usuário migrado com username:', savedUser.username);
          console.log('🔍 Migração: id =', savedUser.id, '→ username =', savedUser.username);
          
          // Debug após migração
          console.log('📋 Verificando dados após migração:');
          await debugAuthStorage();
        } else {
          // Se não tem id, limpar dados (usuário inválido)
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

  // Verificar estado de autenticação ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      await migrateOldUserData();
      await checkAuthState();
    };
    initializeAuth();
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

// Função para forçar logout e limpar todos os dados (emergência)
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

// Função para corrigir username manualmente
export const fixUsername = async (): Promise<void> => {
  try {
    console.log('🔧 Tentando corrigir username...');
    
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    
    if (userData) {
      const user = JSON.parse(userData);
      console.log('👤 Usuário atual:', { id: user.id, username: user.username, nome: user.nome });
      
      if (user.id && user.username !== user.id) {
        console.log('🔄 Corrigindo username de', user.username, 'para', user.id);
        user.username = user.id;
        
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

// Função de debug para verificar dados salvos no AsyncStorage
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
    console.log('👤 Username separado:', username || 'Não encontrado');
    console.log('💾 Lembrar de mim:', rememberMe ? JSON.parse(rememberMe) : 'Não definido');
    
    // Verificar se usuário precisa de migração
    if (parsedUser && !parsedUser.username) {
      console.log('⚠️ ATENÇÃO: Usuário sem username detectado - precisa migração!');
    }
    
    console.log('=== Fim do Debug de Autenticação ===\n');
  } catch (error) {
    console.error('❌ Erro no debug de autenticação:', error);
  }
};