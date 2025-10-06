import { useState, useEffect } from 'react';

interface DailySummary {
  sleep: string;
  meditation: string;
  exercises: number;
  water: number;
  steps: number;
}

interface SensorStatus {
  isConnected: boolean;
  lastSync: string;
  batteryLevel?: number;
}

export const useDailyData = () => {
  const [dailySummary, setDailySummary] = useState<DailySummary>({
    sleep: '7h 30m',
    meditation: '15 min',
    exercises: 3,
    water: 6,
    steps: 6234,
  });

  const [sensorStatus, setSensorStatus] = useState<SensorStatus>({
    isConnected: true,
    lastSync: 'há 2 min',
    batteryLevel: 85,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simular atualização de dados do sensor
  const refreshSensorData = async () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      // Simular variação nos dados
      setDailySummary(prev => ({
        ...prev,
        steps: prev.steps + Math.floor(Math.random() * 100),
        water: Math.min(prev.water + (Math.random() > 0.5 ? 1 : 0), 8),
      }));

      setSensorStatus(prev => ({
        ...prev,
        lastSync: 'agora mesmo',
        batteryLevel: Math.max((prev.batteryLevel || 85) - 1, 20),
      }));

      setIsRefreshing(false);
    }, 2000);
  };

  // Atualizar progresso de exercício
  const addExercise = () => {
    setDailySummary(prev => ({
      ...prev,
      exercises: prev.exercises + 1,
    }));
  };

  // Adicionar tempo de meditação
  const addMeditation = (minutes: number) => {
    const currentMinutes = parseInt(dailySummary.meditation.replace(' min', ''));
    const newTotal = currentMinutes + minutes;
    setDailySummary(prev => ({
      ...prev,
      meditation: `${newTotal} min`,
    }));
  };

  // Registrar copo de água
  const addWater = () => {
    setDailySummary(prev => ({
      ...prev,
      water: Math.min(prev.water + 1, 10),
    }));
  };

  // Calcular progresso geral do dia
  const getDailyProgress = () => {
    const sleepHours = parseFloat(dailySummary.sleep.replace('h', ''));
    const meditationMinutes = parseInt(dailySummary.meditation.replace(' min', ''));
    const exerciseGoal = 5;
    const waterGoal = 8;
    const stepsGoal = 8000;

    const sleepProgress = Math.min((sleepHours / 8) * 100, 100);
    const meditationProgress = Math.min((meditationMinutes / 30) * 100, 100);
    const exerciseProgress = Math.min((dailySummary.exercises / exerciseGoal) * 100, 100);
    const waterProgress = Math.min((dailySummary.water / waterGoal) * 100, 100);
    const stepsProgress = Math.min((dailySummary.steps / stepsGoal) * 100, 100);

    const overallProgress = (
      sleepProgress + 
      meditationProgress + 
      exerciseProgress + 
      waterProgress + 
      stepsProgress
    ) / 5;

    return {
      overall: Math.round(overallProgress),
      sleep: Math.round(sleepProgress),
      meditation: Math.round(meditationProgress),
      exercise: Math.round(exerciseProgress),
      water: Math.round(waterProgress),
      steps: Math.round(stepsProgress),
    };
  };

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular pequenas atualizações automáticas
      setSensorStatus(prev => ({
        ...prev,
        lastSync: `há ${Math.floor(Math.random() * 10) + 1} min`,
      }));
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  return {
    dailySummary,
    sensorStatus,
    isRefreshing,
    refreshSensorData,
    addExercise,
    addMeditation,
    addWater,
    progress: getDailyProgress(),
  };
};