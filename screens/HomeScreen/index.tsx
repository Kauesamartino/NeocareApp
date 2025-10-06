import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface HealthMetric {
  title: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'exercise' | 'mindfulness' | 'break';
}

export default function HomeScreen() {
  const healthMetrics: HealthMetric[] = [
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
  ];

  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Respiração Profunda',
      description: 'Seu nível de estresse está elevado. Tente 5 minutos de respiração profunda.',
      type: 'breathing'
    },
    {
      id: '2',
      title: 'Pausa Ativa',
      description: 'Que tal fazer uma caminhada de 10 minutos para relaxar?',
      type: 'exercise'
    },
    {
      id: '3',
      title: 'Meditação Guiada',
      description: 'Uma sessão de mindfulness pode ajudar a reduzir a ansiedade.',
      type: 'mindfulness'
    }
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Bom dia!</Text>
          <Text style={styles.subtitle}>Como você está se sentindo hoje?</Text>
        </View>

        {/* Status do Sensor */}
        <View style={styles.sensorStatus}>
          <View style={styles.sensorIndicator}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.sensorText}>Pulseira conectada</Text>
          </View>
          <Text style={styles.lastSync}>Última sincronização: há 2 min</Text>
        </View>

        {/* Métricas de Saúde */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suas Métricas</Text>
          <View style={styles.metricsGrid}>
            {healthMetrics.map((metric, index) => (
              <TouchableOpacity key={index} style={styles.metricCard}>
                <Text style={styles.metricTitle}>{metric.title}</Text>
                <View style={styles.metricValueContainer}>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Text style={styles.metricUnit}>{metric.unit}</Text>
                </View>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(metric.status) }]}>
                  <Text style={styles.statusText}>
                    {metric.status === 'normal' ? 'Normal' : 
                     metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gráfico Simples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Batimentos nas Últimas 24h</Text>
          <View style={styles.chartContainer}>
            <Text style={styles.chartPlaceholder}>📊 Gráfico de batimentos cardíacos</Text>
            <Text style={styles.chartSubtext}>Variação: 68-85 bpm</Text>
          </View>
        </View>

        {/* Recomendações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendações para Você</Text>
          {recommendations.map((recommendation) => (
            <TouchableOpacity 
              key={recommendation.id} 
              style={[
                styles.recommendationCard,
                { backgroundColor: getRecommendationColor(recommendation.type) }
              ]}
            >
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
              <View style={styles.recommendationAction}>
                <Text style={styles.actionText}>Começar agora →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resumo do Dia */}
        <View style={styles.section}>
          <View style={styles.dailySummary}>
            <Text style={styles.summaryTitle}>Resumo do Dia</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>7h 30m</Text>
                <Text style={styles.summaryLabel}>Sono</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>15 min</Text>
                <Text style={styles.summaryLabel}>Meditação</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>3</Text>
                <Text style={styles.summaryLabel}>Exercícios</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  sensorStatus: {
    margin: 20,
    marginTop: 0,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sensorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sensorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lastSync: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  metricUnit: {
    fontSize: 14,
    color: '#888',
    marginLeft: 4,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholder: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#888',
  },
  recommendationCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  recommendationAction: {
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  dailySummary: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
});

