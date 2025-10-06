import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves para o AsyncStorage
export const STORAGE_KEYS = {
  USER_TOKEN: '@neocare_user_token',
  USER_DATA: '@neocare_user_data',
  REMEMBER_ME: '@neocare_remember_me',
  USER_PREFERENCES: '@neocare_user_preferences',
  HEALTH_DATA: '@neocare_health_data',
  LAST_SYNC: '@neocare_last_sync',
} as const;

// Interface para dados do usuário
export interface UserData {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  avatar?: string;
}

// Interface para preferências do usuário
export interface UserPreferences {
  notificationsEnabled: boolean;
  reminderTime: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

// Interface para dados de saúde
export interface HealthData {
  heartRate?: number[];
  stressLevel?: number[];
  sleepQuality?: number[];
  steps?: number[];
  lastUpdate: string;
}

/**
 * Utilitários para AsyncStorage
 */
export class StorageUtils {
  
  /**
   * Salva dados no AsyncStorage de forma segura
   */
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`✅ Dados salvos: ${key}`);
    } catch (error) {
      console.error(`❌ Erro ao salvar ${key}:`, error);
      throw error;
    }
  }

  /**
   * Recupera dados do AsyncStorage de forma segura
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) return null;
      
      // Tentar fazer parse JSON, se falhar retornar como string
      try {
        return JSON.parse(jsonValue) as T;
      } catch {
        return jsonValue as unknown as T;
      }
    } catch (error) {
      console.error(`❌ Erro ao recuperar ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove um item do AsyncStorage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Item removido: ${key}`);
    } catch (error) {
      console.error(`❌ Erro ao remover ${key}:`, error);
      throw error;
    }
  }

  /**
   * Remove múltiplos itens do AsyncStorage
   */
  static async removeItems(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
      console.log(`🗑️ Itens removidos: ${keys.join(', ')}`);
    } catch (error) {
      console.error('❌ Erro ao remover itens:', error);
      throw error;
    }
  }

  /**
   * Limpa todos os dados do app (reset completo)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('🧹 AsyncStorage limpo completamente');
    } catch (error) {
      console.error('❌ Erro ao limpar AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Obtém todas as chaves armazenadas
   */
  static async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('❌ Erro ao obter chaves:', error);
      return [];
    }
  }

  /**
   * Obtém múltiplos itens de uma vez
   */
  static async getMultiple(keys: string[]): Promise<readonly [string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('❌ Erro ao obter múltiplos itens:', error);
      return [];
    }
  }
}

/**
 * Funções específicas para autenticação
 */
export class AuthStorage {
  
  static async saveUserSession(userData: UserData, token: string): Promise<void> {
    try {
      await Promise.all([
        StorageUtils.setItem(STORAGE_KEYS.USER_DATA, userData),
        StorageUtils.setItem(STORAGE_KEYS.USER_TOKEN, token),
      ]);
      console.log('✅ Sessão do usuário salva');
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
      throw error;
    }
  }

  static async getUserSession(): Promise<{ user: UserData | null; token: string | null }> {
    try {
      const [userData, token] = await Promise.all([
        StorageUtils.getItem<UserData>(STORAGE_KEYS.USER_DATA),
        StorageUtils.getItem<string>(STORAGE_KEYS.USER_TOKEN),
      ]);

      return { user: userData, token };
    } catch (error) {
      console.error('❌ Erro ao recuperar sessão:', error);
      return { user: null, token: null };
    }
  }

  static async clearUserSession(): Promise<void> {
    try {
      await StorageUtils.removeItems([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.USER_TOKEN,
      ]);
      console.log('🗑️ Sessão do usuário removida');
    } catch (error) {
      console.error('❌ Erro ao limpar sessão:', error);
      throw error;
    }
  }

  static async setRememberMe(remember: boolean): Promise<void> {
    await StorageUtils.setItem(STORAGE_KEYS.REMEMBER_ME, remember);
  }

  static async getRememberMe(): Promise<boolean> {
    const remember = await StorageUtils.getItem<boolean>(STORAGE_KEYS.REMEMBER_ME);
    return remember ?? false;
  }
}

/**
 * Funções específicas para dados de saúde
 */
export class HealthStorage {
  
  static async saveHealthData(data: Partial<HealthData>): Promise<void> {
    try {
      const currentData = await StorageUtils.getItem<HealthData>(STORAGE_KEYS.HEALTH_DATA);
      const updatedData: HealthData = {
        heartRate: [],
        stressLevel: [],
        sleepQuality: [],
        steps: [],
        ...currentData,
        ...data,
        lastUpdate: new Date().toISOString(),
      };
      
      await StorageUtils.setItem(STORAGE_KEYS.HEALTH_DATA, updatedData);
      console.log('💓 Dados de saúde salvos');
    } catch (error) {
      console.error('❌ Erro ao salvar dados de saúde:', error);
      throw error;
    }
  }

  static async getHealthData(): Promise<HealthData | null> {
    return await StorageUtils.getItem<HealthData>(STORAGE_KEYS.HEALTH_DATA);
  }

  static async clearHealthData(): Promise<void> {
    await StorageUtils.removeItem(STORAGE_KEYS.HEALTH_DATA);
  }
}

/**
 * Funções específicas para preferências do usuário
 */
export class PreferencesStorage {
  
  static async savePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const currentPrefs = await StorageUtils.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
      const updatedPrefs: UserPreferences = {
        notificationsEnabled: true,
        reminderTime: '09:00',
        theme: 'auto',
        language: 'pt-BR',
        ...currentPrefs,
        ...preferences,
      };
      
      await StorageUtils.setItem(STORAGE_KEYS.USER_PREFERENCES, updatedPrefs);
      console.log('⚙️ Preferências salvas');
    } catch (error) {
      console.error('❌ Erro ao salvar preferências:', error);
      throw error;
    }
  }

  static async getPreferences(): Promise<UserPreferences> {
    const preferences = await StorageUtils.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
    return preferences ?? {
      notificationsEnabled: true,
      reminderTime: '09:00',
      theme: 'auto',
      language: 'pt-BR',
    };
  }

  static async clearPreferences(): Promise<void> {
    await StorageUtils.removeItem(STORAGE_KEYS.USER_PREFERENCES);
  }
}

/**
 * Hook para debug - mostra todos os dados salvos no AsyncStorage
 */
export class DebugStorage {
  
  static async logAllStoredData(): Promise<void> {
    try {
      const keys = await StorageUtils.getAllKeys();
      console.log('\n📱 === DEBUG: Dados no AsyncStorage ===');
      
      for (const key of keys) {
        const value = await StorageUtils.getItem(key);
        console.log(`${key}:`, value);
      }
      
      console.log('=== Fim do Debug ===\n');
    } catch (error) {
      console.error('❌ Erro no debug:', error);
    }
  }

  static async getStorageSize(): Promise<number> {
    try {
      const keys = await StorageUtils.getAllKeys();
      const data = await StorageUtils.getMultiple([...keys]);
      let totalSize = 0;
      
      data.forEach(([key, value]) => {
        if (value) {
          totalSize += new Blob([value]).size;
        }
      });
      
      return totalSize;
    } catch (error) {
      console.error('❌ Erro ao calcular tamanho:', error);
      return 0;
    }
  }
}

// Exportar tudo como default também
export default {
  StorageUtils,
  AuthStorage,
  HealthStorage,
  PreferencesStorage,
  DebugStorage,
  STORAGE_KEYS,
};