import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { AppNavigationProp } from '../../types/navigation';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface CadastroScreenProps {
  navigation?: AppNavigationProp<'Cadastro'>;
}

const steps = [
  { icon: '👤', title: 'Dados Pessoais', description: 'Nome, CPF, e informações básicas' },
  { icon: '🔑', title: 'Credenciais', description: 'Username e senha de acesso' },
  { icon: '🏠', title: 'Endereço', description: 'Onde você está localizado' },
];

export default function CadastroScreen({ navigation }: CadastroScreenProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.primary }]}>NeoCare</Text>
          <Text style={[styles.title, { color: colors.text }]}>Criar conta</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Seu cadastro é feito em 3 etapas simples. Vamos começar!
          </Text>
        </View>

        {/* Etapas do cadastro */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View
              key={index}
              style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <View style={styles.stepTextContainer}>
                <Text style={[styles.stepNumber, { color: colors.primary }]}>Etapa {index + 1}</Text>
                <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Botão principal */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => navigation?.navigate('CadastroDadosPessoais')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Começar cadastro</Text>
        </TouchableOpacity>

        {/* Link login */}
        <TouchableOpacity onPress={() => navigation?.navigate('Login')} style={styles.loginLink}>
          <Text style={[styles.loginText, { color: colors.textSecondary }]}>
            Já tem conta?{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Fazer login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 36,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsContainer: {
    gap: 12,
    marginBottom: 36,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  stepIcon: {
    fontSize: 28,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginText: {
    fontSize: 14,
  },
});
