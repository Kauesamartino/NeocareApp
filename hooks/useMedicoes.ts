import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  apiGetDispositivosByUserId,
  apiGetMedicoesEstresseByUserId,
  apiGetMedicoesVitaisByUserId,
  apiPostMedicaoEstresse,
  apiPostMedicaoVital,
  MedicaoEstresseHistoricoOutput,
  MedicaoVitalHistoricoOutput,
  MedicaoEstresseInput,
  MedicaoVitalInput,
} from '../services/api';

const USER_DATA_KEY = '@neocare_user_data';
const USER_TOKEN_KEY = '@neocare_user_token';

function getFallbackDispositivoId(): number {
  return Math.floor(Math.random() * 3) + 1;
}

async function getSessionData(): Promise<{ userId: number; token: string }> {
  const [rawUser, token] = await Promise.all([
    AsyncStorage.getItem(USER_DATA_KEY),
    AsyncStorage.getItem(USER_TOKEN_KEY),
  ]);

  if (!rawUser || !token) {
    throw new Error('Sessao expirada. Faca login novamente.');
  }

  const parsedUser = JSON.parse(rawUser) as { id?: number | string };
  const userId = Number(parsedUser.id);

  if (!Number.isFinite(userId) || userId <= 0) {
    throw new Error('Nao foi possivel identificar o usuario da sessao.');
  }

  return { userId, token };
}

async function resolveDispositivoAtivo(userId: number, token: string): Promise<number> {
  try {
    const dispositivos = await apiGetDispositivosByUserId(userId, token);
    const dispositivoAtivo = dispositivos.find((dispositivo) => dispositivo.ativo);

    if (dispositivoAtivo) {
      return dispositivoAtivo.id;
    }

    const fallbackId = getFallbackDispositivoId();
    console.warn(`Nenhum dispositivo ativo encontrado para o usuário ${userId}. Usando fallback ${fallbackId}.`);
    return fallbackId;
  } catch (error) {
    const fallbackId = getFallbackDispositivoId();
    console.warn(`Falha ao buscar dispositivos do usuário ${userId}. Usando fallback ${fallbackId}.`, error);
    return fallbackId;
  }
}

export function usePostMedicaoEstresse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<MedicaoEstresseInput, 'idUsuario' | 'idDispositivo' | 'tipoMedicao'>,
    ) => {
      const { userId, token } = await getSessionData();
      const idDispositivo = await resolveDispositivoAtivo(userId, token);

      return apiPostMedicaoEstresse({
        ...data,
        idUsuario: userId,
        idDispositivo,
        tipoMedicao: 'MEDICAO_ESTRESSE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicoes', 'estresse'] });
    },
  });
}

export function usePostMedicaoVital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<MedicaoVitalInput, 'idUsuario' | 'idDispositivo' | 'tipoMedicao'>,
    ) => {
      const { userId, token } = await getSessionData();
      const idDispositivo = await resolveDispositivoAtivo(userId, token);

      return apiPostMedicaoVital({
        ...data,
        idUsuario: userId,
        idDispositivo,
        tipoMedicao: 'MEDICAO_VITAL',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicoes', 'vital'] });
    },
  });
}

export function useMedicaoVitalHistory() {
  const query = useQuery<MedicaoVitalHistoricoOutput[]>({
    queryKey: ['medicoes', 'vital', 'historico'],
    queryFn: async () => {
      const { userId, token } = await getSessionData();
      const historico = await apiGetMedicoesVitaisByUserId(userId, token);
      return historico.sort(
        (a, b) => new Date(b.dataMedicao).getTime() - new Date(a.dataMedicao).getTime(),
      );
    },
    staleTime: 1000 * 45,
  });

  return {
    historico: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refreshHistorico: query.refetch,
  };
}

export function useMedicaoEstresseHistory() {
  const query = useQuery<MedicaoEstresseHistoricoOutput[]>({
    queryKey: ['medicoes', 'estresse', 'historico'],
    queryFn: async () => {
      const { userId, token } = await getSessionData();
      const historico = await apiGetMedicoesEstresseByUserId(userId, token);
      return historico.sort(
        (a, b) => new Date(b.dataMedicao).getTime() - new Date(a.dataMedicao).getTime(),
      );
    },
    staleTime: 1000 * 45,
  });

  return {
    historico: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refreshHistorico: query.refetch,
  };
}
