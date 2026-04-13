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
import { useAuth } from '../../contexts/AuthContext';
import { DadosPessoais, Credenciais, Endereco } from '../../types/cadastro';
import { buscarCEP } from '../../services/cepService';
import { toPhoneAPI } from '../../utils/formatUtils';
import { AppNavigationProp, AppRouteProp } from '../../types/navigation';

const { width } = Dimensions.get('window');

interface CadastroEnderecoProps {
  navigation?: AppNavigationProp<'CadastroEndereco'>;
  route?: AppRouteProp<'CadastroEndereco'>;
}

export default function CadastroEnderecoScreen({ navigation, route }: CadastroEnderecoProps) {
  const { dadosPessoais, credenciais } = route?.params || {};
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState<Endereco>({
    logradouro: '',
    bairro: '',
    cep: '',
    numero: '',
    complemento: '',
    cidade: '',
    uf: '',
  });

  const [loadingCEP, setLoadingCEP] = useState(false);

  const updateField = (field: keyof Endereco, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCEP = (cep: string) => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const validateCEP = (cep: string) => {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
  };

  // Função para buscar CEP via API
  const handleBuscarCEP = async (cep: string) => {
    if (!validateCEP(cep)) return;

    setLoadingCEP(true);
    try {
      const data = await buscarCEP(cep);
      setFormData(prev => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        uf: data.uf || prev.uf,
      }));
    } catch {
      Alert.alert('Erro', 'CEP não encontrado ou serviço indisponível');
    } finally {
      setLoadingCEP(false);
    }
  };

  const validateForm = () => {
    const { logradouro, bairro, cep, numero, cidade, uf } = formData;

    if (!logradouro.trim()) {
      Alert.alert('Erro', 'Por favor, insira o logradouro');
      return false;
    }

    if (!bairro.trim()) {
      Alert.alert('Erro', 'Por favor, insira o bairro');
      return false;
    }

    if (!validateCEP(cep)) {
      Alert.alert('Erro', 'Por favor, insira um CEP válido');
      return false;
    }

    if (!numero.trim()) {
      Alert.alert('Erro', 'Por favor, insira o número');
      return false;
    }

    if (!cidade.trim()) {
      Alert.alert('Erro', 'Por favor, insira a cidade');
      return false;
    }

    if (!uf.trim() || uf.length !== 2) {
      Alert.alert('Erro', 'Por favor, insira um UF válido (2 caracteres)');
      return false;
    }

    return true;
  };

  const handleFinish = async () => {
    if (!validateForm()) return;

    if (!dadosPessoais || !credenciais) {
      Alert.alert('Erro', 'Dados incompletos. Por favor, reinicie o cadastro.');
      return;
    }

    const formatCEPForAPI = (cep: string) => {
      const numbers = cep.replace(/\D/g, '');
      return numbers.length === 8 ? `${numbers.slice(0, 5)}-${numbers.slice(5)}` : cep;
    };

    const validateRequestData = () => {
      if (!dadosPessoais.nome?.trim()) {
        Alert.alert('Erro', 'Nome é obrigatório');
        return false;
      }
      if (!dadosPessoais.email?.trim()) {
        Alert.alert('Erro', 'Email é obrigatório');
        return false;
      }
      if (!credenciais.username?.trim()) {
        Alert.alert('Erro', 'Username é obrigatório');
        return false;
      }
      if (!credenciais.password?.trim()) {
        Alert.alert('Erro', 'Password é obrigatório');
        return false;
      }
      return true;
    };

    if (!validateRequestData()) return;

    const requestBody = {
      nome: dadosPessoais.nome,
      sobrenome: dadosPessoais.sobrenome,
      cpf: dadosPessoais.cpf.replace(/\D/g, ''),
      email: dadosPessoais.email,
      credenciais: {
        username: credenciais.username,
        password: credenciais.password,
      },
      telefone: toPhoneAPI(dadosPessoais.telefone),
      dataNascimento: convertDateToAPI(dadosPessoais.dataNascimento),
      sexo: dadosPessoais.sexo === '' ? 'MASCULINO' : dadosPessoais.sexo,
      altura: parseFloat(dadosPessoais.altura),
      peso: parseFloat(dadosPessoais.peso),
      endereco: {
        logradouro: formData.logradouro,
        bairro: formData.bairro,
        cep: formatCEPForAPI(formData.cep),
        numero: formData.numero,
        complemento: formData.complemento,
        cidade: formData.cidade,
        uf: formData.uf.toUpperCase(),
      },
    };

    try {
      console.log('📋 Enviando dados completos do cadastro para API:');
      console.log('📝 Nome:', requestBody.nome);
      console.log('📧 Email:', requestBody.email);
      console.log('� Username:', requestBody.credenciais.username);
      console.log('🏠 CEP:', requestBody.endereco.cep);
      console.log('📋 Dados completos:', JSON.stringify(requestBody, null, 2));

      const success = await register(requestBody);

      if (success) {
        Alert.alert(
          'Sucesso! 🎉',
          'Sua conta foi criada com sucesso! Agora faça login para acessar o NeoCare.',
          [
            {
              text: 'Fazer Login',
              onPress: () => {
                console.log('✅ Cadastro completo realizado, redirecionando para Login...');
                navigation?.navigate('Login');
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro durante o cadastro. Tente novamente.');
      console.error('Erro no cadastro:', error);
    }
  };

  const convertDateToAPI = (date: string) => {
    // Converte DD/MM/YYYY para YYYY-MM-DD
    const [day, month, year] = date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleLogin = () => {
    navigation?.navigate('Login');
  };

  // Lista de UFs do Brasil
  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

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
              <Text style={styles.subtitle}>Por último, vamos cadastrar seu endereço</Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressStep, styles.progressStepCompleted]} />
                <View style={[styles.progressStep, styles.progressStepCompleted]} />
                <View style={[styles.progressStep, styles.progressStepActive]} />
              </View>
              <Text style={styles.progressText}>Passo 3 de 3 - Endereço</Text>
            </View>

            {/* Welcome Message */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>
                Quase lá, {dadosPessoais?.nome || 'usuário'}! 🏠
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Informe seu endereço para personalizar melhor sua experiência
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>CEP *</Text>
                <View style={styles.cepContainer}>
                  <TextInput
                    style={[styles.input, styles.cepInput]}
                    value={formData.cep}
                    onChangeText={(value) => {
                      const formatted = formatCEP(value);
                      updateField('cep', formatted);
                      if (formatted.length === 9) {
                        handleBuscarCEP(formatted);
                      }
                    }}
                    placeholder="00000-000"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={9}
                  />
                  {loadingCEP && (
                    <View style={styles.cepLoading}>
                      <Text style={styles.cepLoadingText}>Buscando...</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.helpText}>
                  Digite o CEP para preenchimento automático
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Logradouro *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.logradouro}
                  onChangeText={(value) => updateField('logradouro', value)}
                  placeholder="Rua, Avenida, Travessa..."
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.inputLarge]}>
                  <Text style={styles.label}>Bairro *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.bairro}
                    onChangeText={(value) => updateField('bairro', value)}
                    placeholder="Nome do bairro"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                  />
                </View>

                <View style={[styles.inputContainer, styles.inputSmall]}>
                  <Text style={styles.label}>Número *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.numero}
                    onChangeText={(value) => updateField('numero', value)}
                    placeholder="123"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Complemento</Text>
                <TextInput
                  style={styles.input}
                  value={formData.complemento}
                  onChangeText={(value) => updateField('complemento', value)}
                  placeholder="Apto, Bloco, Casa... (opcional)"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.inputLarge]}>
                  <Text style={styles.label}>Cidade *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.cidade}
                    onChangeText={(value) => updateField('cidade', value)}
                    placeholder="Nome da cidade"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                  />
                </View>

                <View style={[styles.inputContainer, styles.inputSmall]}>
                  <Text style={styles.label}>UF *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.uf}
                    onChangeText={(value) => updateField('uf', value.toUpperCase())}
                    placeholder="SP"
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                    maxLength={2}
                  />
                </View>
              </View>

              {/* UF Suggestions */}
              {formData.uf.length === 1 && (
                <View style={styles.ufSuggestions}>
                  <Text style={styles.ufSuggestionsTitle}>Estados sugeridos:</Text>
                  <View style={styles.ufGrid}>
                    {ufs
                      .filter(uf => uf.startsWith(formData.uf.toUpperCase()))
                      .slice(0, 6)
                      .map(uf => (
                        <TouchableOpacity
                          key={uf}
                          style={styles.ufSuggestion}
                          onPress={() => updateField('uf', uf)}
                        >
                          <Text style={styles.ufSuggestionText}>{uf}</Text>
                        </TouchableOpacity>
                      ))
                    }
                  </View>
                </View>
              )}

              {/* Summary */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>📋 Resumo do cadastro</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Nome:</Text>
                  <Text style={styles.summaryValue}>
                    {dadosPessoais?.nome} {dadosPessoais?.sobrenome}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Email:</Text>
                  <Text style={styles.summaryValue}>{dadosPessoais?.email}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Username:</Text>
                  <Text style={styles.summaryValue}>@{credenciais?.username}</Text>
                </View>
              </View>

              {/* Navigation Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.finishButton, isLoading && styles.finishButtonDisabled]}
                  onPress={handleFinish}
                  disabled={isLoading}
                >
                  <Text style={styles.finishButtonText}>
                    {isLoading ? 'Criando conta...' : 'Finalizar cadastro 🎉'}
                  </Text>
                </TouchableOpacity>
              </View>
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
  progressStepCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  welcomeContainer: {
    marginBottom: 25,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
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
  inputLarge: {
    width: '65%',
  },
  inputSmall: {
    width: '30%',
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
  cepContainer: {
    position: 'relative',
  },
  cepInput: {
    paddingRight: 80,
  },
  cepLoading: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  cepLoadingText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  ufSuggestions: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  ufSuggestionsTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  ufGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ufSuggestion: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  ufSuggestionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 18,
    width: '30%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    width: '65%',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  finishButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
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