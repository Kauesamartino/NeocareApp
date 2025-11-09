import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { DadosPessoais } from '../../types/cadastro';

const { width } = Dimensions.get('window');

interface CadastroDadosPessoaisProps {
  navigation?: any;
}

export default function CadastroDadosPessoaisScreen({ navigation }: CadastroDadosPessoaisProps) {
  const [formData, setFormData] = useState<DadosPessoais>({
    nome: '',
    sobrenome: '',
    cpf: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    sexo: '',
    altura: '',
    peso: '',
  });

  const updateField = (field: keyof DadosPessoais, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone) || phone.length >= 10;
  };

  const formatCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatDate = (date: string) => {
    const numbers = date.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
  };

  const validateForm = () => {
    const { nome, sobrenome, cpf, email, telefone, dataNascimento, sexo, altura, peso } = formData;

    if (!nome.trim() || nome.length < 2) {
      Alert.alert('Erro', 'Nome deve ter pelo menos 2 caracteres');
      return false;
    }

    if (!sobrenome.trim() || sobrenome.length < 2) {
      Alert.alert('Erro', 'Sobrenome deve ter pelo menos 2 caracteres');
      return false;
    }

    if (!validateCPF(cpf)) {
      Alert.alert('Erro', 'Por favor, insira um CPF válido');
      return false;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return false;
    }

    if (!validatePhone(telefone)) {
      Alert.alert('Erro', 'Por favor, insira um telefone válido');
      return false;
    }

    if (!dataNascimento || dataNascimento.length !== 10) {
      Alert.alert('Erro', 'Por favor, insira uma data de nascimento válida');
      return false;
    }

    if (!sexo) {
      Alert.alert('Erro', 'Por favor, selecione o sexo');
      return false;
    }

    if (!altura || parseFloat(altura) <= 0) {
      Alert.alert('Erro', 'Por favor, insira uma altura válida');
      return false;
    }

    if (!peso || parseFloat(peso) <= 0) {
      Alert.alert('Erro', 'Por favor, insira um peso válido');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;

    // Navegar para a próxima tela passando os dados
    navigation?.navigate('CadastroCredenciais', { dadosPessoais: formData });
  };

  const handleLogin = () => {
    navigation?.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>NeoCare</Text>
              <Text style={styles.subtitle}>Vamos conhecer você melhor</Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressStep, styles.progressStepActive]} />
                <View style={styles.progressStep} />
                <View style={styles.progressStep} />
              </View>
              <Text style={styles.progressText}>Passo 1 de 3 - Dados Pessoais</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.inputHalf]}>
                  <Text style={styles.label}>Nome *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.nome}
                    onChangeText={(value) => updateField('nome', value)}
                    placeholder="Digite seu nome"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                  />
                </View>

                <View style={[styles.inputContainer, styles.inputHalf]}>
                  <Text style={styles.label}>Sobrenome *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.sobrenome}
                    onChangeText={(value) => updateField('sobrenome', value)}
                    placeholder="Digite seu sobrenome"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>CPF *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cpf}
                  onChangeText={(value) => updateField('cpf', formatCPF(value))}
                  placeholder="000.000.000-00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={14}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  placeholder="seu.email@exemplo.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Telefone *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.telefone}
                  onChangeText={(value) => updateField('telefone', formatPhone(value))}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Data de Nascimento *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.dataNascimento}
                  onChangeText={(value) => updateField('dataNascimento', formatDate(value))}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sexo *</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[styles.radioOption, formData.sexo === 'MASCULINO' && styles.radioOptionSelected]}
                    onPress={() => updateField('sexo', 'MASCULINO')}
                  >
                    <View style={[styles.radioCircle, formData.sexo === 'MASCULINO' && styles.radioCircleSelected]}>
                      {formData.sexo === 'MASCULINO' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>Masculino</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioOption, formData.sexo === 'FEMININO' && styles.radioOptionSelected]}
                    onPress={() => updateField('sexo', 'FEMININO')}
                  >
                    <View style={[styles.radioCircle, formData.sexo === 'FEMININO' && styles.radioCircleSelected]}>
                      {formData.sexo === 'FEMININO' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>Feminino</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioOption, formData.sexo === 'OUTRO' && styles.radioOptionSelected]}
                    onPress={() => updateField('sexo', 'OUTRO')}
                  >
                    <View style={[styles.radioCircle, formData.sexo === 'OUTRO' && styles.radioCircleSelected]}>
                      {formData.sexo === 'OUTRO' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>Outro</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.inputHalf]}>
                  <Text style={styles.label}>Altura (m) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.altura}
                    onChangeText={(value) => updateField('altura', value)}
                    placeholder="1.75"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.inputContainer, styles.inputHalf]}>
                  <Text style={styles.label}>Peso (kg) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.peso}
                    onChangeText={(value) => updateField('peso', value)}
                    placeholder="70.5"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>Próximo</Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  progressStep: {
    width: 80,
    height: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#2196F3',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginHorizontal: 2,
  },
  radioOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#f0f8ff',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#2196F3',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});