import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  getDailySummary,
  addWaterEntry,
  addExerciseEntry,
  addMeditationEntry,
  DailySummary,
  SensorStatus,
} from '../services/apexService';

export type { DailySummary, SensorStatus };

const QUERY_KEY = (username: string) => ['dailySummary', username];

export const useDailyData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const username = user?.username ?? '';

  const query = useQuery({
    queryKey: QUERY_KEY(username),
    queryFn: () => getDailySummary(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 2,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEY(username) });

  const addWaterMutation = useMutation({
    mutationFn: () => addWaterEntry(username),
    onSuccess: invalidate,
  });

  const addExerciseMutation = useMutation({
    mutationFn: () => addExerciseEntry(username),
    onSuccess: invalidate,
  });

  const addMeditationMutation = useMutation({
    mutationFn: (minutes: number) => addMeditationEntry(username, minutes),
    onSuccess: invalidate,
  });

  const summary = query.data?.summary;
  const sensorStatus = query.data?.sensorStatus;

  const getDailyProgress = () => {
    if (!summary) {
      return { overall: 0, sleep: 0, meditation: 0, exercise: 0, water: 0, steps: 0 };
    }
    const sleepHours = parseFloat(summary.sleep.replace('h', '')) || 0;
    const meditationMinutes = parseInt(summary.meditation.replace(' min', '')) || 0;

    const sleepProgress     = Math.min((sleepHours / 8) * 100, 100);
    const meditationProgress = Math.min((meditationMinutes / 30) * 100, 100);
    const exerciseProgress  = Math.min((summary.exercises / 5) * 100, 100);
    const waterProgress     = Math.min((summary.water / 8) * 100, 100);
    const stepsProgress     = Math.min((summary.steps / 8000) * 100, 100);

    const overall = (sleepProgress + meditationProgress + exerciseProgress + waterProgress + stepsProgress) / 5;

    return {
      overall:    Math.round(overall),
      sleep:      Math.round(sleepProgress),
      meditation: Math.round(meditationProgress),
      exercise:   Math.round(exerciseProgress),
      water:      Math.round(waterProgress),
      steps:      Math.round(stepsProgress),
    };
  };

  return {
    dailySummary: summary ?? null,
    sensorStatus: sensorStatus ?? null,
    isRefreshing: query.isFetching,
    isLoading: query.isLoading,
    isError: query.isError,
    refreshSensorData: query.refetch,
    addWater: () => addWaterMutation.mutate(),
    addExercise: () => addExerciseMutation.mutate(),
    addMeditation: (minutes: number) => addMeditationMutation.mutate(minutes),
    progress: getDailyProgress(),
  };
};
