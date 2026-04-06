import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AppNavigationProp } from '../../types/navigation';
import { UpdateUserRequest } from '../../services/api';

type Props = { navigation: AppNavigationProp<'Perfil'> };

type SexoOption = 'MASCULINO' | 'FEMININO' | 'OUTROS' | 'NAO_INFORMADO';

const SEXO_LABELS: Record<SexoOption, string> = {
  MASCULINO: 'Masculino',
  FEMININO: 'Feminino',
  OUTROS: 'Outros',
  NAO_INFORMADO: 'Não informado',
};

const SEXO_OPTIONS: SexoOption[] = ['MASCULINO', 'FEMININO', 'OUTROS', 'NAO_INFORMADO'];

export default function ProfileScreen({ navigation }: Props) {
  const { user, refreshUserProfile, updateUserProfile, isLoading } = useAuth();
  const { colors } = useTheme();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    cpf: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    sexo: 'NAO_INFORMADO' as SexoOption,
    altura: '',
    peso: '',
    logradouro: '',
    bairro: '',
    cep: '',
    numero: '',
    complemento: '',
    cidade: '',
    uf: '',
  });

  const populateForm = (u: typeof user) => {
    if (!u) return;
    setForm({
      nome: u.nome ?? '',
      sobrenome: u.sobrenome ?? '',
      cpf: u.cpf ?? '',
      email: u.email ?? '',
      telefone: u.telefone ?? '',
      dataNascimento: u.dataNascimento ?? '',
      sexo: (u.sexo as SexoOption) ?? 'NAO_INFORMADO',
      altura: u.altura ? String(u.altura) : '',
      peso: u.peso ? String(u.peso) : '',
      logradouro: u.endereco?.logradouro ?? '',
      bairro: u.endereco?.bairro ?? '',
      cep: u.endereco?.cep ?? '',
      numero: u.endereco?.numero ?? '',
      complemento: u.endereco?.complemento ?? '',
      cidade: u.endereco?.cidade ?? '',
      uf: u.endereco?.uf ?? '',
    });
  };

  useEffect(() => {
    populateForm(user);
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUserProfile();
    setRefreshing(false);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleSave = async () => {
    if (!form.nome.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório.');
      return;
    }

    const payload: UpdateUserRequest = {
      nome: form.nome.trim(),
      sobrenome: form.sobrenome.trim(),
      cpf: form.cpf.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      dataNascimento: form.dataNascimento.trim(),
      sexo: form.sexo as any,
      altura: Number(form.altura) || 0,
      peso: Number(form.peso) || 0,
      endereco: {
        logradouro: form.logradouro.trim(),
        bairro: form.bairro.trim(),
        cep: form.cep.trim(),
        numero: form.numero.trim(),
        complemento: form.complemento.trim(),
        cidade: form.cidade.trim(),
        uf: form.uf.trim(),
      },
    };

    setSaving(true);
    const success = await updateUserProfile(payload);
    setSaving(false);

    if (success) {
      setEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
    }
  };

  const handleCancel = () => {
    populateForm(user);
    setEditing(false);
  };

  const field = (label: string, value: string, key: keyof typeof form, opts?: { keyboardType?: any; editable?: boolean }) => (
    <View style={styles.fieldGroup} key={key}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {editing && opts?.editable !== false ? (
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
          value={value}
          onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
          keyboardType={opts?.keyboardType ?? 'default'}
          placeholderTextColor={colors.textSecondary}
        />
      ) : (
        <Text style={[styles.value, { color: colors.text }]}>{value || '—'}</Text>
      )}
    </View>
  );

  const s = StyleSheet.create({
    ...styles,
    container: { ...styles.container, backgroundColor: colors.background },
    header: { ...styles.header, backgroundColor: colors.card, borderBottomColor: colors.border },
  });

  if (refreshing && !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Carregando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Meu Perfil</Text>
        {!editing ? (
          <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
            <Text style={[styles.editText, { color: colors.primary }]}>Editar</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar placeholder */}
        <View style={[styles.avatarContainer]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {(form.nome?.[0] ?? '?').toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {form.nome} {form.sobrenome}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{form.email}</Text>
        </View>

        {/* Dados Pessoais */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Dados Pessoais</Text>
          {field('Nome', form.nome, 'nome')}
          {field('Sobrenome', form.sobrenome, 'sobrenome')}
          {field('CPF', form.cpf, 'cpf', { editable: false })}
          {field('E-mail', form.email, 'email', { keyboardType: 'email-address' })}
          {field('Telefone', form.telefone, 'telefone', { keyboardType: 'phone-pad' })}
          {field('Data de Nascimento', form.dataNascimento, 'dataNascimento')}

          {/* Sexo */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Sexo</Text>
            {editing ? (
              <View style={styles.sexoRow}>
                {SEXO_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.sexoBtn,
                      { borderColor: colors.border, backgroundColor: form.sexo === opt ? colors.primary : colors.card },
                    ]}
                    onPress={() => setForm((f) => ({ ...f, sexo: opt }))}
                  >
                    <Text style={{ color: form.sexo === opt ? '#fff' : colors.text, fontSize: 12 }}>
                      {SEXO_LABELS[opt]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>{SEXO_LABELS[form.sexo] ?? '—'}</Text>
            )}
          </View>

          {field('Altura (cm)', form.altura, 'altura', { keyboardType: 'numeric' })}
          {field('Peso (kg)', form.peso, 'peso', { keyboardType: 'numeric' })}
        </View>

        {/* Endereço */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Endereço</Text>
          {field('CEP', form.cep, 'cep', { keyboardType: 'numeric' })}
          {field('Logradouro', form.logradouro, 'logradouro')}
          {field('Número', form.numero, 'numero', { keyboardType: 'numeric' })}
          {field('Complemento', form.complemento, 'complemento')}
          {field('Bairro', form.bairro, 'bairro')}
          {field('Cidade', form.cidade, 'cidade')}
          {field('UF', form.uf, 'uf')}
        </View>

        {/* Botões de ação */}
        {editing && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btnCancel, { borderColor: colors.border }]}
              onPress={handleCancel}
              disabled={saving}>
              <Text style={[styles.btnCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSave, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnSaveText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!editing && (
          <TouchableOpacity
            style={[styles.refreshBtn, { borderColor: colors.primary }]}
            onPress={handleRefresh}
            disabled={refreshing}>
            {refreshing ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={[styles.refreshText, { color: colors.primary }]}>↻ Atualizar dados</Text>
            )}
          </TouchableOpacity>
        )}
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
  editBtn: { width: 60, alignItems: 'flex-end' },
  editText: { fontSize: 16 },
  scroll: { padding: 16, paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: '700' },
  userName: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 14 },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldGroup: { marginBottom: 12 },
  label: { fontSize: 12, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  sexoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sexoBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnCancelText: { fontSize: 16, fontWeight: '600' },
  btnSave: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSaveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  refreshBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshText: { fontSize: 15, fontWeight: '600' },
});
