import { useState, useEffect } from 'react';

export interface HealthMetric {
  title: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

export const useHealthMetrics = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([
    {
      title: 'Batimentos Cardíacos',
      value: '72',
      unit: 'bpm',
      status: 'normal'
    },
    {
      title: 'Nível de Estresse',
      value: '3.2',
      unit: '/10',
      status: 'warning'
    },
    {
      title: 'Qualidade do Sono',
      value: '8.5',
      unit: '/10',
      status: 'normal'
    },
    {
      title: 'Atividade Física',
      value: '6,234',
      unit: 'passos',
      status: 'normal'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'critical':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'warning':
        return 'Atenção';
      case 'critical':
        return 'Crítico';
      default:
        return 'Desconhecido';
    }
  };

  // Simular atualização de dados de sensores
  const refreshMetrics = async () => {
    setIsLoading(true);
    
    // Simular delay da API/sensores
    setTimeout(() => {
      // Simular variação nos dados
      setMetrics(prev => prev.map(metric => {
        if (metric.title === 'Batimentos Cardíacos') {
          const newValue = Math.floor(Math.random() * (85 - 65) + 65);
          return { ...metric, value: newValue.toString() };
        }
        if (metric.title === 'Nível de Estresse') {
          const newValue = (Math.random() * 10).toFixed(1);
          const status = parseFloat(newValue) > 7 ? 'critical' : parseFloat(newValue) > 4 ? 'warning' : 'normal';
          return { ...metric, value: newValue, status };
        }
        return metric;
      }));
      setIsLoading(false);
    }, 1500);
  };

  // Calcular resumo geral da saúde
  const getHealthSummary = () => {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) {
      return { status: 'critical', message: `${criticalCount} métrica(s) em estado crítico` };
    }
    if (warningCount > 0) {
      return { status: 'warning', message: `${warningCount} métrica(s) precisam de atenção` };
    }
    return { status: 'normal', message: 'Todas as métricas estão normais' };
  };

  return {
    metrics,
    isLoading,
    getStatusColor,
    getStatusText,
    refreshMetrics,
    healthSummary: getHealthSummary(),
  };
};