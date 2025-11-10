import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useUserProfile } from '../../hooks/useUserProfile';
import { UpdateUserRequest } from '../../services/api';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose, onSave }) => {
  const { user, updateProfile, isUpdating, getUserDataForUpdate } = useUserProfile();
  
  const [formData, setFormData] = useState<UpdateUserRequest>({
    nome: '',
    sobrenome: '',
    cpf: '',
    telefone: '',
    email: '',
    dataNascimento: '',
    sexo: 'MASCULINO',
    altura: 0,
    peso: 0,
    endereco: {
      logradouro: '',
      bairro: '',
      cep: '',
      numero: '',
      complemento: '',
      cidade: '',
      uf: '',
    },
  });

  // Carregar dados do usuário quando o modal abrir
  useEffect(() => {
    if (visible && user) {
      const userData = getUserDataForUpdate();
      if (userData) {
        // Converter data da API para formato de exibição
        const formattedData = {
          ...userData,
          dataNascimento: formatDateFromAPI(userData.dataNascimento),
        };
        setFormData(formattedData);
      }
    }
  }, [visible, user]);

  const handleSave = async () => {
    // Validações básicas
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }
    
    if (!formData.sobrenome.trim()) {
      Alert.alert('Erro', 'Sobrenome é obrigatório');
      return;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return;
    }
    
    if (!formData.telefone.trim()) {
      Alert.alert('Erro', 'Telefone é obrigatório');
      return;
    }

    try {
      // Converter data para formato da API antes de enviar
      const dataToSend = {
        ...formData,
        dataNascimento: formatDateForAPI(formData.dataNascimento),
      };
      
      const success = await updateProfile(dataToSend);
      
      if (success) {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        onSave?.();
        onClose();
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar as alterações.');
    }
  };

  const updateField = (field: keyof UpdateUserRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateEnderecoField = (field: keyof UpdateUserRequest['endereco'], value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value }
    }));
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

  const formatDateForDisplay = (date: string) => {
    const numbers = date.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
  };

  const formatDateForAPI = (displayDate: string) => {
    // Converter de DD/MM/AAAA para AAAA-MM-DD
    const parts = displayDate.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return displayDate;
  };

  const formatDateFromAPI = (apiDate: string) => {
    // Converter de AAAA-MM-DD para DD/MM/AAAA
    if (apiDate && apiDate.includes('-')) {
      const parts = apiDate.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
    }
    return apiDate;
  };

  const formatCEP = (cep: string) => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isUpdating}
          >
            <Text style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}>
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Dados Pessoais */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Nome *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nome}
                  onChangeText={(value) => updateField('nome', value)}
                  placeholder="Digite seu nome"
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Sobrenome *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.sobrenome}
                  onChangeText={(value) => updateField('sobrenome', value)}
                  placeholder="Digite seu sobrenome"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>CPF</Text>
              <TextInput
                style={styles.input}
                value={formData.cpf}
                onChangeText={(value) => updateField('cpf', formatCPF(value))}
                placeholder="000.000.000-00"
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
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Telefone *</Text>
              <TextInput
                style={styles.input}
                value={formData.telefone}
                onChangeText={(value) => updateField('telefone', formatPhone(value))}
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput
                style={styles.input}
                value={formData.dataNascimento}
                onChangeText={(value) => updateField('dataNascimento', formatDateForDisplay(value))}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sexo</Text>
              <View style={styles.radioGroup}>
                {['MASCULINO', 'FEMININO', 'OUTRO'].map((sexo) => (
                  <TouchableOpacity
                    key={sexo}
                    style={[styles.radioOption, formData.sexo === sexo && styles.radioOptionSelected]}
                    onPress={() => updateField('sexo', sexo as 'MASCULINO' | 'FEMININO' | 'OUTRO')}
                  >
                    <View style={[styles.radioCircle, formData.sexo === sexo && styles.radioCircleSelected]}>
                      {formData.sexo === sexo && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>
                      {sexo === 'MASCULINO' ? 'Masculino' : sexo === 'FEMININO' ? 'Feminino' : 'Outro'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Altura (m)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.altura.toString()}
                  onChangeText={(value) => updateField('altura', parseFloat(value) || 0)}
                  placeholder="1.75"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.peso.toString()}
                  onChangeText={(value) => updateField('peso', parseFloat(value) || 0)}
                  placeholder="70.5"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Endereço */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Logradouro</Text>
              <TextInput
                style={styles.input}
                value={formData.endereco.logradouro}
                onChangeText={(value) => updateEnderecoField('logradouro', value)}
                placeholder="Rua, Avenida, etc."
                autoCapitalize="words"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Número</Text>
                <TextInput
                  style={styles.input}
                  value={formData.endereco.numero}
                  onChangeText={(value) => updateEnderecoField('numero', value)}
                  placeholder="123"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>CEP</Text>
                <TextInput
                  style={styles.input}
                  value={formData.endereco.cep}
                  onChangeText={(value) => updateEnderecoField('cep', formatCEP(value))}
                  placeholder="00000-000"
                  keyboardType="numeric"
                  maxLength={9}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bairro</Text>
              <TextInput
                style={styles.input}
                value={formData.endereco.bairro}
                onChangeText={(value) => updateEnderecoField('bairro', value)}
                placeholder="Nome do bairro"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                style={styles.input}
                value={formData.endereco.complemento}
                onChangeText={(value) => updateEnderecoField('complemento', value)}
                placeholder="Apt, Bloco, etc."
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  style={styles.input}
                  value={formData.endereco.cidade}
                  onChangeText={(value) => updateEnderecoField('cidade', value)}
                  placeholder="Nome da cidade"
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>UF</Text>
                <TextInput
                  style={styles.input}
                  value={formData.endereco.uf}
                  onChangeText={(value) => updateEnderecoField('uf', value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>

          {/* Espaço extra para o teclado */}
          <View style={{ height: 50 }} />
        </ScrollView>

        {/* Loading overlay */}
        {isUpdating && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Salvando alterações...</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  saveButtonDisabled: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 15,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
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
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default EditProfileModal;