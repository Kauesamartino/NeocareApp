import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppNavigationProp } from '../../types/navigation';
import { useAlertas } from '../../hooks/useAlertas';

type Props = { navigation: AppNavigationProp<'Notificacoes'> };

export default function NotificacoesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { alertas, isLoading, isError, refreshAlertas } = useAlertas();

  const severityColor = (severidade: string) => {
    if (severidade?.toUpperCase() === 'ALTA') return '#DC3545';
    if (severidade?.toUpperCase() === 'MODERADA') return '#FF9800';
    return '#2196F3';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Notificações</Text>
        <TouchableOpacity onPress={() => refreshAlertas()}>
          <Text style={[styles.refreshText, { color: colors.primary }]}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Carregando alertas...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={{ color: '#DC3545', marginBottom: 10 }}>Falha ao carregar notificações.</Text>
          <TouchableOpacity onPress={() => refreshAlertas()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}> 
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={alertas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: colors.textSecondary }}>Sem notificações no momento.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card }]}> 
              <View style={styles.cardTop}>
                <Text style={[styles.alertType, { color: severityColor(item.severidade) }]}>{item.tipoAlerta}</Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {new Date(item.dataNotificacao).toLocaleString('pt-BR')}
                </Text>
              </View>
              <Text style={[styles.message, { color: colors.text }]}>{item.mensagem}</Text>
              <Text style={[styles.detected, { color: colors.textSecondary }]}>Valor detectado: {item.valorDetectado}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 72 },
  backText: { fontSize: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  refreshText: { fontSize: 14, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  retryBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  card: {
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  alertType: { fontSize: 13, fontWeight: '700' },
  date: { fontSize: 12 },
  message: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  detected: { fontSize: 12 },
});
