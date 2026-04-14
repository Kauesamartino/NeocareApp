import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppNavigationProp } from '../../types/navigation';

type Props = { navigation: AppNavigationProp<'SobreApp'> };

export default function SobreAppScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const cards = [
    {
      title: 'Missão',
      text: 'Ajudar você a acompanhar estresse e sinais vitais com dados reais e alertas acionáveis.',
      color: '#EAF7EE',
    },
    {
      title: 'Como funciona',
      text: 'O app coleta medições, calcula indicadores e destaca riscos com notificações priorizadas.',
      color: '#E9F3FF',
    },
    {
      title: 'Privacidade',
      text: 'Seu acesso é autenticado com JWT e as rotas sensíveis são protegidas por perfil de usuário.',
      color: '#FFF4E6',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Sobre o App</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { backgroundColor: colors.card }]}> 
          <Text style={[styles.heroTitle, { color: colors.text }]}>Neocare</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>Monitoramento inteligente de saude e bem-estar</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Versão 1.0.0</Text>
        </View>

        <View style={styles.timelineContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Jornada da Plataforma</Text>
          <View style={styles.timelineItem}>
            <View style={styles.dot} />
            <Text style={[styles.timelineText, { color: colors.textSecondary }]}>Entrada de medições vitais e estresse</Text>
          </View>
          <View style={styles.timelineItem}>
            <View style={styles.dot} />
            <Text style={[styles.timelineText, { color: colors.textSecondary }]}>Processamento de indicadores e tendências</Text>
          </View>
          <View style={styles.timelineItem}>
            <View style={styles.dot} />
            <Text style={[styles.timelineText, { color: colors.textSecondary }]}>Geração de alertas e recomendações personalizadas</Text>
          </View>
        </View>

        {cards.map((card) => (
          <View key={card.title} style={[styles.infoCard, { backgroundColor: card.color }]}> 
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardText}>{card.text}</Text>
          </View>
        ))}
      </ScrollView>
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
  scroll: { padding: 16, gap: 12 },
  hero: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
  },
  heroTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  heroSubtitle: { fontSize: 14, marginBottom: 10 },
  version: { fontSize: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  timelineContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E86DE',
    marginRight: 10,
  },
  timelineText: { fontSize: 13 },
  infoCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6, color: '#2F3542' },
  cardText: { fontSize: 13, color: '#57606F', lineHeight: 19 },
});
