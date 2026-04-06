import { useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  apiPostMedicaoEstresse,
  apiPostMedicaoVital,
  MedicaoEstresseInput,
  MedicaoVitalInput,
} from '../services/api';

const USER_ID_KEY = '@neocare_user_id';

async function getUserId(): Promise<number> {
  const stored = await AsyncStorage.getItem(USER_ID_KEY);
  return stored ? parseInt(stored, 10) : 1;
}

export function usePostMedicaoEstresse() {
  return useMutation({
    mutationFn: async (
      data: Omit<MedicaoEstresseInput, 'idUsuario' | 'idDispositivo' | 'tipoMedicao'>,
    ) => {
      const idUsuario = await getUserId();
      return apiPostMedicaoEstresse({
        ...data,
        idUsuario,
        idDispositivo: 1,
        tipoMedicao: 'MEDICAO_ESTRESSE',
      });
    },
  });
}

export function usePostMedicaoVital() {
  return useMutation({
    mutationFn: async (
      data: Omit<MedicaoVitalInput, 'idUsuario' | 'idDispositivo' | 'tipoMedicao'>,
    ) => {
      const idUsuario = await getUserId();
      return apiPostMedicaoVital({
        ...data,
        idUsuario,
        idDispositivo: 1,
        tipoMedicao: 'MEDICAO_VITAL',
      });
    },
  });
}
