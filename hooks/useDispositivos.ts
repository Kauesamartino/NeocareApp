import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGetDispositivosByUserId, DispositivoOutput } from '../services/api';

const USER_TOKEN_KEY = '@neocare_user_token';
const USER_DATA_KEY = '@neocare_user_data';

async function getSessionData(): Promise<{ token: string; userId: number }> {
  const [token, userDataRaw] = await Promise.all([
    AsyncStorage.getItem(USER_TOKEN_KEY),
    AsyncStorage.getItem(USER_DATA_KEY),
  ]);

  if (!token || !userDataRaw) {
    throw new Error('Sessao expirada. Faca login novamente.');
  }

  const userData = JSON.parse(userDataRaw) as { id?: number | string };
  const userId = Number(userData.id);

  if (!Number.isFinite(userId) || userId <= 0) {
    throw new Error('Nao foi possivel identificar o usuario da sessao.');
  }

  return { token, userId };
}

export function useDispositivos() {
  const query = useQuery<DispositivoOutput[]>({
    queryKey: ['dispositivos', 'usuario'],
    queryFn: async () => {
      const { token, userId } = await getSessionData();
      return apiGetDispositivosByUserId(userId, token);
    },
    staleTime: 1000 * 60,
  });

  const ativo = (query.data ?? []).find((d) => d.ativo) ?? null;

  return {
    dispositivos: query.data ?? [],
    dispositivoAtivo: ativo,
    isLoading: query.isLoading,
    isError: query.isError,
    refreshDispositivos: query.refetch,
  };
}
