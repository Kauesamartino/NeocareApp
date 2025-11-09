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
import { BootstrapEye } from '../../_components/icons/BootstrapEye';
import { DadosPessoais, Credenciais } from '../../types/cadastro';

const { width } = Dimensions.get('window');

interface CadastroCredenciaisProps {
  navigation?: any;
  route?: {
    params: {
      dadosPessoais: DadosPessoais;
    };
  };
}

export default function CadastroCredenciaisScreen({ navigation, route }: CadastroCredenciaisProps) {
  const { dadosPessoais } = route?.params || {};

  const [formData, setFormData] = useState<Credenciais & { confirmPassword: string }>({
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (field: keyof (Credenciais & { confirmPassword: string }), value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateUsername = (username: string) => {
    // Username deve ter pelo menos 3 caracteres, apenas letras, números e underscore
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password: string) => {
    // Senha deve ter pelo menos 8 caracteres, uma maiúscula, uma minúscula, um número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[@$!%*?&]/.test(password),
      password.length >= 12,
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) return { level: 'Fraca', color: '#F44336', widthPercent: 33 };
    if (strength <= 4) return { level: 'Média', color: '#FF9800', widthPercent: 66 };
    return { level: 'Forte', color: '#4CAF50', widthPercent: 100 };
  };

  const validateForm = () => {
    const { username, password, confirmPassword } = formData;

    if (!username.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome de usuário');
      return false;
    }

    if (!validateUsername(username)) {
      Alert.alert(
        'Erro', 
        'Nome de usuário deve ter entre 3-20 caracteres e conter apenas letras, números e underscore'
      );
      return false;
    }

    if (!password) {
      Alert.alert('Erro', 'Por favor, insira uma senha');
      return false;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        'Erro', 
        'A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número'
      );
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;

    // Navegar para a próxima tela passando todos os dados
    navigation?.navigate('CadastroEndereco', {
      dadosPessoais,
      credenciais: {
        username: formData.username,
        password: formData.password,
      },
    });
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleLogin = () => {
    navigation?.navigate('Login');
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
              <Text style={styles.subtitle}>Agora vamos criar suas credenciais de acesso</Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressStep, styles.progressStepCompleted]} />
                <View style={[styles.progressStep, styles.progressStepActive]} />
                <View style={styles.progressStep} />
              </View>
              <Text style={styles.progressText}>Passo 2 de 3 - Credenciais</Text>
            </View>

            {/* Welcome Message */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>
                Olá, {dadosPessoais?.nome || 'usuário'}! 👋
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Crie um nome de usuário e senha seguros para acessar sua conta
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome de usuário *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.username}
                  onChangeText={(value) => updateField('username', value.toLowerCase())}
                  placeholder="Digite um nome de usuário único"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.helpText}>
                  3-20 caracteres, apenas letras, números e underscore (_)
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Senha *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={formData.password}
                    onChangeText={(value) => updateField('password', value)}
                    placeholder="Crie uma senha segura"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <BootstrapEye
                      visible={showPassword}
                      size={18}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                
                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.passwordStrengthBar}>
                      <View 
                        style={[
                          styles.passwordStrengthFill, 
                          { 
                            width: `${passwordStrength.widthPercent}%`, 
                            backgroundColor: passwordStrength.color 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.level}
                    </Text>
                  </View>
                )}
                
                <Text style={styles.helpText}>
                  Mínimo 8 caracteres, incluindo maiúscula, minúscula e número
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar senha *</Text>
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
                    <BootstrapEye
                      visible={showConfirmPassword}
                      size={18}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword.length > 0 && (
                  <View style={styles.passwordMatchContainer}>
                    {formData.password === formData.confirmPassword ? (
                      <Text style={styles.passwordMatchSuccess}>✓ Senhas coincidem</Text>
                    ) : (
                      <Text style={styles.passwordMatchError}>✗ Senhas não coincidem</Text>
                    )}
                  </View>
                )}
              </View>

              {/* Security Tips */}
              <View style={styles.securityTipsContainer}>
                <Text style={styles.securityTipsTitle}>💡 Dicas de segurança:</Text>
                <Text style={styles.securityTip}>• Use uma combinação de letras, números e símbolos</Text>
                <Text style={styles.securityTip}>• Evite informações pessoais óbvias</Text>
                <Text style={styles.securityTip}>• Não reutilize senhas de outras contas</Text>
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
                  style={[
                    styles.nextButton,
                    (!validateUsername(formData.username) || !validatePassword(formData.password) || formData.password !== formData.confirmPassword) && styles.nextButtonDisabled
                  ]}
                  onPress={handleNext}
                  disabled={!validateUsername(formData.username) || !validatePassword(formData.password) || formData.password !== formData.confirmPassword}
                >
                  <Text style={styles.nextButtonText}>Próximo</Text>
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
    marginBottom: 20,
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
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginRight: 10,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  passwordMatchContainer: {
    marginTop: 5,
  },
  passwordMatchSuccess: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  passwordMatchError: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  securityTipsContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  securityTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  securityTip: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
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
    flex: 0.45,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 18,
    flex: 0.45,
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
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