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

const { width, height } = Dimensions.get('window');

interface CadastroScreenProps {
  navigation?: any;
}

export default function CadastroScreen({ navigation }: CadastroScreenProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Usar o contexto de autenticação
  const { register, isLoading } = useAuth();

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone) || phone.length >= 10;
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
    const { nome, email, telefone, dataNascimento, password, confirmPassword } = formData;

    if (!nome.trim() || nome.length < 2) {
      Alert.alert('Erro', 'Nome deve ter pelo menos 2 caracteres');
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

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Erro', 'Você deve aceitar os termos de uso');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      const success = await register({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        dataNascimento: formData.dataNascimento,
        password: formData.password,
      });

      if (success) {
        Alert.alert(
          'Sucesso!',
          'Conta criada com sucesso! Você já está logado.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navegação será automática pelo App.tsx
                console.log('✅ Cadastro realizado, navegando para Home...');
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
              <Text style={styles.subtitle}>Crie sua conta e comece a cuidar da sua saúde</Text>
            </View>

            {/* Welcome Message */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Vamos começar! 🚀</Text>
              <Text style={styles.welcomeSubtitle}>
                Preencha os dados abaixo para criar sua conta
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome completo</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nome}
                  onChangeText={(value) => updateField('nome', value)}
                  placeholder="Digite seu nome completo"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
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
                <Text style={styles.label}>Telefone</Text>
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
                <Text style={styles.label}>Data de nascimento</Text>
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
                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={formData.password}
                    onChangeText={(value) => updateField('password', value)}
                    placeholder="Digite uma senha segura"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.passwordToggleText}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateField('confirmPassword', value)}
                    placeholder="Confirme sua senha"
                    placeholderTextColor="#999"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.passwordToggleText}>
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                >
                  <Text style={styles.checkboxIcon}>
                    {acceptTerms ? '☑️' : '☐'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  Eu aceito os{' '}
                  <Text style={styles.termsLink}>Termos de Uso</Text>
                  {' '}e a{' '}
                  <Text style={styles.termsLink}>Política de Privacidade</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                <Text style={styles.signUpButtonText}>
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Sign Up */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialIcon}>🔍</Text>
                <Text style={styles.socialText}>Cadastrar com Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialIcon}>📘</Text>
                <Text style={styles.socialText}>Cadastrar com Facebook</Text>
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  checkboxIcon: {
    fontSize: 20,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#2196F3',
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  socialContainer: {
    marginBottom: 25,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  socialText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
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
