import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppNavigationProp } from '../../types/navigation';
import { usePostMedicaoEstresse, usePostMedicaoVital } from '../../hooks/useMedicoes';

type Props = { navigation: AppNavigationProp<'Medicao'> };
type Tab = 'vital' | 'estresse';

export default function MedicaoScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('vital');

  // Medição Vital
  const [bpm, setBpm] = useState('');
  const [oxigenacao, setOxigenacao] = useState('');
  const [pressaoSistolica, setPressaoSistolica] = useState('');
  const [pressaoDiastolica, setPressaoDiastolica] = useState('');

  // Medição de Estresse
  const [variacaoFC, setVariacaoFC] = useState('');
  const [condutividade, setCondutividade] = useState('');

  const mutVital = usePostMedicaoVital();
  const mutEstresse = usePostMedicaoEstresse();

  const isBusy = mutVital.isPending || mutEstresse.isPending;

  const handleSubmitVital = async () => {
    const bpmN = parseFloat(bpm);
    const oxiN = parseFloat(oxigenacao);
    const sisN = parseFloat(pressaoSistolica);
    const diaN = parseFloat(pressaoDiastolica);

    if ([bpmN, oxiN, sisN, diaN].some(isNaN)) {
      Alert.alert('Erro', 'Preencha todos os campos com valores numéricos válidos.');
      return;
    }

    mutVital.mutate(
      { batimentosPorMinuto: bpmN, oxigenacaoSangue: oxiN, pressaoSistolica: sisN, pressaoDiastolica: diaN },
      {
        onSuccess: (data) => {
          const dataMedicao = new Date(data.medicaoOutDto.dataMedicao).toLocaleString('pt-BR');
          Alert.alert(
            'Medição Registrada!',
            `BPM: ${data.batimentosPorMinuto}\nSpO₂: ${data.oxigenacaoSangue}%\nPressão: ${data.pressaoSistolica}/${data.pressaoDiastolica} mmHg\nData: ${dataMedicao}`,
            [{ text: 'OK', onPress: () => { setBpm(''); setOxigenacao(''); setPressaoSistolica(''); setPressaoDiastolica(''); } }],
          );
        },
        onError: () => Alert.alert('Erro', 'Não foi possível registrar a medição. Verifique sua conexão.'),
      },
    );
  };

  const handleSubmitEstresse = async () => {
    const fcN = parseFloat(variacaoFC);
    const condN = parseFloat(condutividade);

    if ([fcN, condN].some(isNaN)) {
      Alert.alert('Erro', 'Preencha todos os campos com valores numéricos válidos.');
      return;
    }

    mutEstresse.mutate(
      { variacaoFrequenciaCardiaca: fcN, condutividadePele: condN },
      {
        onSuccess: (data) => {
          const dataMedicao = new Date(data.medicaoOutDto.dataMedicao).toLocaleString('pt-BR');
          Alert.alert(
            'Medição Registrada!',
            `Variação FC: ${data.variacaoFrequenciaCardiaca}\nCondutividade: ${data.condutividadePele} µS\nData: ${dataMedicao}`,
            [{ text: 'OK', onPress: () => { setVariacaoFC(''); setCondutividade(''); } }],
          );
        },
        onError: () => Alert.alert('Erro', 'Não foi possível registrar a medição. Verifique sua conexão.'),
      },
    );
  };

  const inputStyle = [styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Nova Medição</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, tab === 'vital' && { backgroundColor: colors.primary }]}
            onPress={() => setTab('vital')}>
            <Text style={[styles.tabText, { color: tab === 'vital' ? '#fff' : colors.textSecondary }]}>❤️ Sinais Vitais</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'estresse' && { backgroundColor: colors.primary }]}
            onPress={() => setTab('estresse')}>
            <Text style={[styles.tabText, { color: tab === 'estresse' ? '#fff' : colors.textSecondary }]}>🧠 Estresse</Text>
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {tab === 'vital' ? '📊 Medição de Sinais Vitais' : '📊 Medição de Nível de Estresse'}
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {tab === 'vital'
              ? 'Registre os dados de frequência cardíaca, oxigenação e pressão arterial coletados pelo dispositivo.'
              : 'Registre os dados de variação da frequência cardíaca e condutividade da pele para análise de estresse.'}
          </Text>
        </View>

        {tab === 'vital' ? (
          <View style={[styles.form, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Dados da Medição</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Batimentos por Minuto (BPM)</Text>
            <TextInput
              style={inputStyle}
              value={bpm}
              onChangeText={setBpm}
              placeholder="Ex: 72"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Oxigenação do Sangue (%)</Text>
            <TextInput
              style={inputStyle}
              value={oxigenacao}
              onChangeText={setOxigenacao}
              placeholder="Ex: 98.5"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Pressão Sistólica (mmHg)</Text>
            <TextInput
              style={inputStyle}
              value={pressaoSistolica}
              onChangeText={setPressaoSistolica}
              placeholder="Ex: 120"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Pressão Diastólica (mmHg)</Text>
            <TextInput
              style={inputStyle}
              value={pressaoDiastolica}
              onChangeText={setPressaoDiastolica}
              placeholder="Ex: 80"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }, isBusy && styles.disabled]}
              onPress={handleSubmitVital}
              disabled={isBusy}>
              {mutVital.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Registrar Medição</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.form, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Dados da Medição</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Variação da Frequência Cardíaca (HRV)</Text>
            <TextInput
              style={inputStyle}
              value={variacaoFC}
              onChangeText={setVariacaoFC}
              placeholder="Ex: 0.85"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Condutividade da Pele (µS)</Text>
            <TextInput
              style={inputStyle}
              value={condutividade}
              onChangeText={setCondutividade}
              placeholder="Ex: 3.2"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }, isBusy && styles.disabled]}
              onPress={handleSubmitEstresse}
              disabled={isBusy}>
              {mutEstresse.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Registrar Medição</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Referências */}
        <View style={[styles.refCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.refTitle, { color: colors.textSecondary }]}>Valores de Referência</Text>
          {tab === 'vital' ? (
            <>
              <Text style={[styles.refItem, { color: colors.textSecondary }]}>• BPM em repouso: 60–100 bpm</Text>
              <Text style={[styles.refItem, { color: colors.textSecondary }]}>• Oxigenação normal: 95–100%</Text>
              <Text style={[styles.refItem, { color: colors.textSecondary }]}>• Pressão ideal: &lt; 120/80 mmHg</Text>
            </>
          ) : (
            <>
              <Text style={[styles.refItem, { color: colors.textSecondary }]}>• HRV alto = maior resiliência ao estresse</Text>
              <Text style={[styles.refItem, { color: colors.textSecondary }]}>• Condutividade alta indica maior ativação simpática</Text>
            </>
          )}
        </View>
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
  backBtn: { width: 60 },
  backText: { fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  infoText: { fontSize: 13, lineHeight: 20 },
  form: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  submitBtn: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  refCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  refTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  refItem: { fontSize: 13, marginBottom: 4, lineHeight: 20 },
});
