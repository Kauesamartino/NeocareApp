import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'exercise' | 'mindfulness' | 'break';
  priority: 'high' | 'medium' | 'low';
}

export const useRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Base de recomendações
  const baseRecommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Respiração Profunda',
      description: 'Seu nível de estresse está elevado. Tente 5 minutos de respiração profunda.',
      type: 'breathing',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Pausa Ativa',
      description: 'Que tal fazer uma caminhada de 10 minutos para relaxar?',
      type: 'exercise',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Meditação Guiada',
      description: 'Uma sessão de mindfulness pode ajudar a reduzir a ansiedade.',
      type: 'mindfulness',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Hidratação',
      description: 'Beba um copo d\'água. A hidratação é importante para o bem-estar.',
      type: 'break',
      priority: 'low'
    },
    {
      id: '5',
      title: 'Alongamento',
      description: 'Faça alguns alongamentos para aliviar a tensão muscular.',
      type: 'exercise',
      priority: 'medium'
    }
  ];

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'breathing':
        return '#E3F2FD';
      case 'exercise':
        return '#E8F5E8';
      case 'mindfulness':
        return '#F3E5F5';
      case 'break':
        return '#FFF3E0';
      default:
        return '#F5F5F5';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'breathing':
        return '🫁';
      case 'exercise':
        return '🏃';
      case 'mindfulness':
        return '🧘';
      case 'break':
        return '☕';
      default:
        return '💡';
    }
  };

  // Gerar recomendações personalizadas baseadas no perfil do usuário
  const generatePersonalizedRecommendations = (healthData?: any) => {
    setIsLoading(true);
    
    setTimeout(() => {
      // Simular lógica de IA para recomendações personalizadas
      const hour = new Date().getHours();
      let selectedRecommendations = [...baseRecommendations];

      // Filtrar por horário
      if (hour < 12) {
        selectedRecommendations = selectedRecommendations.filter(r => 
          r.type === 'exercise' || r.type === 'breathing'
        );
      } else if (hour > 18) {
        selectedRecommendations = selectedRecommendations.filter(r => 
          r.type === 'mindfulness' || r.type === 'break'
        );
      }

      // Limitar a 3 recomendações
      const finalRecommendations = selectedRecommendations
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 3);

      setRecommendations(finalRecommendations);
      setIsLoading(false);
    }, 1000);
  };

  // Marcar recomendação como completada
  const completeRecommendation = (id: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
    
    // Aqui você salvaria no AsyncStorage ou enviaria para API
    console.log(`✅ Recomendação ${id} completada por ${user?.nome}`);
  };

  // Adicionar nova recomendação personalizada
  const addCustomRecommendation = (title: string, description: string, type: Recommendation['type']) => {
    const newRecommendation: Recommendation = {
      id: `custom_${Date.now()}`,
      title,
      description,
      type,
      priority: 'medium'
    };
    
    setRecommendations(prev => [newRecommendation, ...prev]);
  };

  // Carregar recomendações na inicialização
  useEffect(() => {
    generatePersonalizedRecommendations();
  }, [user]);

  return {
    recommendations,
    isLoading,
    getRecommendationColor,
    getRecommendationIcon,
    generatePersonalizedRecommendations,
    completeRecommendation,
    addCustomRecommendation,
  };
};