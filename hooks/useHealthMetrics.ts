import { useMemo } from 'react';
import { useMedicaoEstresseHistory, useMedicaoVitalHistory } from './useMedicoes';

export type HealthMetric = {
  title: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
};

export const useHealthMetrics = () => {
  const historicoVital = useMedicaoVitalHistory();
  const historicoEstresse = useMedicaoEstresseHistory();

  const latestVital = historicoVital.historico[0];
  const latestEstresse = historicoEstresse.historico[0];

  const metrics = useMemo<HealthMetric[]>(() => {
    const bpm = latestVital?.batimentosPorMinuto ?? 0;
    const spo2 = latestVital?.oxigenacaoSangue ?? 0;
    const pressaoSistolica = latestVital?.pressaoSistolica ?? 0;
    const pressaoDiastolica = latestVital?.pressaoDiastolica ?? 0;
    const hrv = latestEstresse?.variacaoFrequenciaCardiaca ?? 0;

    return [
      {
        title: 'Batimentos',
        value: bpm ? String(Math.round(bpm)) : '--',
        unit: 'bpm',
        status: bpm === 0 ? 'warning' : bpm < 50 || bpm > 120 ? 'critical' : bpm < 60 || bpm > 100 ? 'warning' : 'normal',
      },
      {
        title: 'Oxigenacao',
        value: spo2 ? spo2.toFixed(1) : '--',
        unit: '%',
        status: spo2 === 0 ? 'warning' : spo2 < 92 ? 'critical' : spo2 < 95 ? 'warning' : 'normal',
      },
      {
        title: 'Pressao',
        value: pressaoSistolica ? `${pressaoSistolica}/${pressaoDiastolica}` : '--/--',
        unit: 'mmHg',
        status:
          !pressaoSistolica
            ? 'warning'
            : pressaoSistolica >= 180 || pressaoDiastolica >= 120
            ? 'critical'
            : pressaoSistolica >= 140 || pressaoDiastolica >= 90
            ? 'warning'
            : 'normal',
      },
      {
        title: 'HRV',
        value: hrv ? hrv.toFixed(1) : '--',
        unit: 'ms',
        status: hrv === 0 ? 'warning' : hrv < 15 ? 'critical' : hrv < 25 ? 'warning' : 'normal',
      },
    ];
  }, [latestVital, latestEstresse]);

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
    isLoading: historicoVital.isLoading || historicoEstresse.isLoading,
    isError: historicoVital.isError || historicoEstresse.isError,
    getStatusColor,
    getStatusText,
    refreshMetrics: async () => {
      await Promise.all([historicoVital.refreshHistorico(), historicoEstresse.refreshHistorico()]);
    },
    healthSummary: getHealthSummary(),
  };
};