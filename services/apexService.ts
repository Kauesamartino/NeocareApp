/**
 * Serviço de integração com Oracle APEX
 *
 * ATENÇÃO: substitua APEX_BASE_URL pelo endpoint real do seu workspace Oracle APEX.
 * Exemplo: https://apex.oracle.com/pls/apex/<workspace>/<module>
 */
import axios from 'axios';

// TODO: atualizar com o endpoint real do Oracle APEX do grupo
const APEX_BASE_URL = 'https://apex.oracle.com/pls/apex/neocare';

const apexClient = axios.create({
  baseURL: APEX_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface HealthMetric {
  title: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface DailySummary {
  sleep: string;
  meditation: string;
  exercises: number;
  water: number;
  steps: number;
}

export interface SensorStatus {
  isConnected: boolean;
  lastSync: string;
  batteryLevel?: number;
}

export interface DailyData {
  summary: DailySummary;
  sensorStatus: SensorStatus;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'exercise' | 'mindfulness' | 'break';
  priority: 'high' | 'medium' | 'low';
}

// ─── Métricas de saúde (monitoramento fisiológico via APEX) ──────────────────

export async function getHealthMetrics(username: string): Promise<HealthMetric[]> {
  const response = await apexClient.get<{ items: HealthMetric[] }>(
    `/metricas/${username}`
  );
  return response.data.items ?? response.data;
}

// ─── Resumo diário de atividade ───────────────────────────────────────────────

export async function getDailySummary(username: string): Promise<DailyData> {
  const response = await apexClient.get<DailyData>(`/resumo-diario/${username}`);
  return response.data;
}

// ─── Recomendações personalizadas geradas pelo APEX ───────────────────────────

export async function getRecommendations(username: string): Promise<Recommendation[]> {
  const response = await apexClient.get<{ items: Recommendation[] }>(
    `/recomendacoes/${username}`
  );
  return response.data.items ?? response.data;
}

export async function completeRecommendationInApex(
  username: string,
  recommendationId: string
): Promise<void> {
  await apexClient.put(`/recomendacoes/${username}/${recommendationId}/concluir`);
}

// ─── Registrar água e exercício ───────────────────────────────────────────────

export async function addWaterEntry(username: string): Promise<void> {
  await apexClient.post(`/atividade/${username}/agua`);
}

export async function addExerciseEntry(username: string): Promise<void> {
  await apexClient.post(`/atividade/${username}/exercicio`);
}

export async function addMeditationEntry(username: string, minutes: number): Promise<void> {
  await apexClient.post(`/atividade/${username}/meditacao`, { minutes });
}
