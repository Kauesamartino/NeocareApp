import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UpdateUserRequest } from '../services/api';

export interface UserProfileData {
  fullName: string;
  firstName: string;
  email: string;
  telefone: string;
  sexo: string;
  altura: string;
  peso: string;
  dataNascimento: string;
  isComplete: boolean;
}

export const useUserProfile = () => {
  const { user, refreshUserProfile, updateUserProfile, isLoading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Função para formatar nome completo
  const getFullName = (user: any): string => {
    if (user?.sobrenome) {
      return `${user.nome} ${user.sobrenome}`;
    }
    return user?.nome || 'Nome não informado';
  };

  // Função para formatar sexo
  const formatSexo = (sexo?: string): string => {
    switch (sexo) {
      case 'MASCULINO': return 'Masculino';
      case 'FEMININO': return 'Feminino';
      case 'OUTRO': return 'Outro';
      default: return 'Não informado';
    }
  };

  // Função para formatar data
  const formatDate = (date?: string): string => {
    if (!date) return 'Não informado';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('pt-BR');
    } catch {
      return date;
    }
  };

  // Função para verificar se o perfil está completo
  const isProfileComplete = (user: any): boolean => {
    return !!(
      user?.nome && 
      user?.sobrenome && 
      user?.email && 
      user?.telefone && 
      user?.sexo && 
      user?.altura && 
      user?.peso
    );
  };

  // Dados formatados do perfil
  const profileData: UserProfileData = {
    fullName: getFullName(user),
    firstName: user?.nome || 'Usuário',
    email: user?.email || 'Email não informado',
    telefone: user?.telefone || 'Não informado',
    sexo: formatSexo(user?.sexo),
    altura: user?.altura ? `${user.altura} m` : 'Não informado',
    peso: user?.peso ? `${user.peso} kg` : 'Não informado',
    dataNascimento: formatDate(user?.dataNascimento),
    isComplete: isProfileComplete(user),
  };

  // Função para atualizar perfil (refresh dos dados)
  const handleRefreshProfile = async (): Promise<boolean> => {
    try {
      setIsRefreshing(true);
      await refreshUserProfile();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Função para salvar alterações no perfil
  const handleUpdateProfile = async (userData: UpdateUserRequest): Promise<boolean> => {
    try {
      setIsUpdating(true);
      const success = await updateUserProfile(userData);
      return success;
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para converter User para UpdateUserRequest
  const getUserDataForUpdate = (): UpdateUserRequest | null => {
    if (!user) return null;

    return {
      nome: user.nome || '',
      sobrenome: user.sobrenome || '',
      cpf: user.cpf || '',
      telefone: user.telefone || '',
      email: user.email || '',
      dataNascimento: user.dataNascimento || '',
      sexo: user.sexo || 'MASCULINO',
      altura: user.altura || 0,
      peso: user.peso || 0,
      endereco: user.endereco || {
        logradouro: '',
        bairro: '',
        cep: '',
        numero: '',
        complemento: '',
        cidade: '',
        uf: '',
      },
    };
  };

  // Buscar dados do perfil automaticamente quando o usuário estiver disponível
  useEffect(() => {
    if (user && !isProfileComplete(user)) {
      handleRefreshProfile();
    }
  }, [user?.id]);

  return {
    profileData,
    user,
    isLoading: isLoading || isRefreshing || isUpdating,
    isRefreshing,
    isUpdating,
    refreshProfile: handleRefreshProfile,
    updateProfile: handleUpdateProfile,
    getUserDataForUpdate,
    getFullName,
    formatSexo,
    formatDate,
    isProfileComplete: profileData.isComplete,
  };
};

export default useUserProfile;