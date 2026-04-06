import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  getRecommendations,
  completeRecommendationInApex,
  Recommendation,
} from '../services/apexService';

export type { Recommendation };

const QUERY_KEY = (username: string) => ['recommendations', username];

export const useRecommendations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const username = user?.username ?? '';

  const query = useQuery({
    queryKey: QUERY_KEY(username),
    queryFn: () => getRecommendations(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeRecommendationInApex(username, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(username) }),
  });

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'breathing':   return '#E3F2FD';
      case 'exercise':    return '#E8F5E8';
      case 'mindfulness': return '#F3E5F5';
      case 'break':       return '#FFF3E0';
      default:            return '#F5F5F5';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'breathing':   return '🫁';
      case 'exercise':    return '🏃';
      case 'mindfulness': return '🧘';
      case 'break':       return '☕';
      default:            return '💡';
    }
  };

  return {
    recommendations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    getRecommendationColor,
    getRecommendationIcon,
    completeRecommendation: (id: string) => completeMutation.mutate(id),
    refreshRecommendations: query.refetch,
  };
};
