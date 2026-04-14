import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ProfileCompact, ProfileModal } from '../../_components/Profile';
import { useHealthMetrics } from '../../hooks/useHealthMetrics';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useProfileModal } from '../../hooks/useProfileModal';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useHealthOverview } from '../../hooks/useHealthOverview';
import { AppNavigationProp } from '../../types/navigation';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: { navigation: AppNavigationProp<'Home'> }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { profileData } = useUserProfile();
  
  const { 
    metrics: healthMetrics, 
    isLoading: metricsRefreshing, 
    refreshMetrics, 
    getStatusColor,
    getStatusText 
  } = useHealthMetrics();
  
  const { 
    recommendations, 
    getRecommendationColor,
    completeRecommendation 
  } = useRecommendations();
  
  const { 
    isVisible: isProfileModalVisible, 
    openProfile: openProfileModal, 
    closeProfile: closeProfileModal 
  } = useProfileModal();

  const {
    alertas,
    historicoVital,
    historicoEstresse,
    healthSummary,
    refreshAll,
  } = useHealthOverview();

  const isRefreshing = metricsRefreshing;

  const handleRefresh = async () => {
    await Promise.all([
      refreshMetrics(),
      refreshAll(),
    ]);
  };

  const latestVitalDate = historicoVital[0]?.dataMedicao
    ? new Date(historicoVital[0].dataMedicao).toLocaleString('pt-BR')
    : 'Sem sincronização recente';

  const latestEstresse = historicoEstresse[0]?.variacaoFrequenciaCardiaca?.toFixed(1) ?? '--';


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>Bom dia, {profileData.firstName}!</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{healthSummary.message}</Text>
            </View>
            <ProfileCompact onPress={() => openProfileModal()} />
          </View>
        </View>

        <View style={[styles.sensorStatus, { backgroundColor: colors.card }]}> 
          <View style={styles.sensorIndicator}>
            <View style={[styles.statusDot, { backgroundColor: alertas.length > 0 ? '#FF9800' : '#4CAF50' }]} />
            <Text style={[styles.sensorText, { color: colors.text }]}>Resumo de monitoramento</Text>
            <Text style={[styles.batteryText, { color: colors.textSecondary }]}>Alertas: {alertas.length}</Text>
          </View>
          <Text style={[styles.lastSync, { color: colors.textSecondary }]}>Última medição vital: {latestVitalDate}</Text>
        </View>

        {/* Métricas de Saúde */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Suas Métricas</Text>
          <View style={styles.metricsGrid}>
            {healthMetrics.map((metric, index) => (
              <TouchableOpacity key={index} style={[styles.metricCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{metric.title}</Text>
                <View style={styles.metricValueContainer}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
                  <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>{metric.unit}</Text>
                </View>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(metric.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusText(metric.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gráfico Simples */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Estatística Real</Text>
          <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.chartPlaceholder, { color: colors.text }]}>Nível de estresse atual: {latestEstresse}</Text>
            <Text style={[styles.chartSubtext, { color: colors.textSecondary }]}>Baseado na medição mais recente da API Java</Text>
          </View>
        </View>

        {/* Recomendações */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recomendações para Você</Text>
          {recommendations.map((recommendation) => (
            <TouchableOpacity 
              key={recommendation.id} 
              style={[
                styles.recommendationCard,
                { backgroundColor: getRecommendationColor(recommendation.type) }
              ]}
              onPress={() => completeRecommendation(recommendation.id)}
            >
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
              <View style={styles.recommendationAction}>
                <Text style={styles.actionText}>Começar agora →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={[styles.dailySummary, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Resumo de Saúde</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>{historicoVital.length}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Medições vitais</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#FF9800' }]}>{historicoEstresse.length}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Medições estresse</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: alertas.length > 0 ? '#F44336' : '#4CAF50' }]}>{alertas.length}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Alertas ativos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#2E86DE' }]}
              onPress={() => navigation.navigate('Medicao')}>
              <Text style={styles.actionCardIcon}>📊</Text>
              <Text style={styles.actionCardTitle}>Nova Medição</Text>
              <Text style={styles.actionCardSub}>Registrar sinais vitais</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#16A085' }]}
              onPress={() => navigation.navigate('Perfil')}>
              <Text style={styles.actionCardIcon}>👤</Text>
              <Text style={styles.actionCardTitle}>Meu Perfil</Text>
              <Text style={styles.actionCardSub}>Ver e editar dados</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#F39C12' }]}
              onPress={() => navigation.navigate('Notificacoes')}>
              <Text style={styles.actionCardIcon}>🔔</Text>
              <Text style={styles.actionCardTitle}>Notificações</Text>
              <Text style={styles.actionCardSub}>Alertas em tempo real</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#8E44AD' }]}
              onPress={() => navigation.navigate('SobreApp')}>
              <Text style={styles.actionCardIcon}>ℹ️</Text>
              <Text style={styles.actionCardTitle}>Sobre o App</Text>
              <Text style={styles.actionCardSub}>Conheça a plataforma</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <ProfileModal 
        visible={isProfileModalVisible} 
        onClose={closeProfileModal} 
        onNavigateSettings={(route) => navigation.navigate(route)}
      />
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    flex: 1,
  },
  batteryText: {
    fontSize: 14,
    color: '#666',
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
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 50) / 2,
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
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionCard: {
    width: (width - 52) / 2,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  actionCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionCardSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    textAlign: 'center',
  },
});

