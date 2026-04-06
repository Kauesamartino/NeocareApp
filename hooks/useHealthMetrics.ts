import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { getHealthMetrics, HealthMetric } from '../services/apexService';

export type { HealthMetric };

export const useHealthMetrics = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['healthMetrics', user?.username],
    queryFn: () => getHealthMetrics(user!.username),
    enabled: !!user?.username,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  const metrics = query.data ?? [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':   return '#4CAF50';
      case 'warning':  return '#FF9800';
      case 'critical': return '#F44336';
      default:         return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':   return 'Normal';
      case 'warning':  return 'Atenção';
      case 'critical': return 'Crítico';
      default:         return 'Desconhecido';
    }
  };

  const getHealthSummary = () => {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount  = metrics.filter(m => m.status === 'warning').length;
    if (criticalCount > 0) return { status: 'critical', message: `${criticalCount} métrica(s) em estado crítico` };
    if (warningCount  > 0) return { status: 'warning',  message: `${warningCount} métrica(s) precisam de atenção` };
    return { status: 'normal', message: 'Todas as métricas estão normais' };
  };

  return {
    metrics,
    isLoading: query.isLoading,
    isError: query.isError,
    getStatusColor,
    getStatusText,
    refreshMetrics: query.refetch,
    healthSummary: getHealthSummary(),
  };
};