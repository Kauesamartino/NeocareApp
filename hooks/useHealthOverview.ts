import { useMemo } from 'react';
import { useAlertas } from './useAlertas';
import { useMedicaoEstresseHistory, useMedicaoVitalHistory } from './useMedicoes';

export type HealthMetricCard = {
  title: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
};

export const useHealthOverview = () => {
  const vitalQuery = useMedicaoVitalHistory();
  const estresseQuery = useMedicaoEstresseHistory();
  const alertasQuery = useAlertas();

  const latestVital = vitalQuery.historico[0];
  const latestEstresse = estresseQuery.historico[0];

  const metrics = useMemo<HealthMetricCard[]>(() => {
    const bpm = latestVital?.batimentosPorMinuto ?? 0;
    const spo2 = latestVital?.oxigenacaoSangue ?? 0;
    const pressao = latestVital ? `${latestVital.pressaoSistolica}/${latestVital.pressaoDiastolica}` : '--/--';
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
        value: pressao,
        unit: 'mmHg',
        status:
          !latestVital
            ? 'warning'
            : latestVital.pressaoSistolica >= 180 || latestVital.pressaoDiastolica >= 120
            ? 'critical'
            : latestVital.pressaoSistolica >= 140 || latestVital.pressaoDiastolica >= 90
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

  const isLoading = vitalQuery.isLoading || estresseQuery.isLoading || alertasQuery.isLoading;
  const isError = vitalQuery.isError || estresseQuery.isError || alertasQuery.isError;

  const healthSummary = useMemo(() => {
    const criticalCount = metrics.filter((m) => m.status === 'critical').length;
    const warningCount = metrics.filter((m) => m.status === 'warning').length;

    if (criticalCount > 0) {
      return { status: 'critical', message: `${criticalCount} indicador(es) critico(s)` };
    }

    if (warningCount > 0) {
      return { status: 'warning', message: `${warningCount} indicador(es) em atencao` };
    }

    return { status: 'normal', message: 'Indicadores estaveis' };
  }, [metrics]);

  return {
    metrics,
    alertas: alertasQuery.alertas,
    historicoVital: vitalQuery.historico,
    historicoEstresse: estresseQuery.historico,
    isLoading,
    isError,
    healthSummary,
    refreshAll: async () => {
      await Promise.all([
        vitalQuery.refreshHistorico(),
        estresseQuery.refreshHistorico(),
        alertasQuery.refreshAlertas(),
      ]);
    },
  };
};
