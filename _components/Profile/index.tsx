import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface ProfileProps {
  visible?: boolean;
  onClose?: () => void;
  compact?: boolean; // Para exibição compacta no header
}

export const ProfileAvatar: React.FC<{ name: string; size?: number }> = ({ 
  name, 
  size = 40 
}) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <View 
      style={[
        styles.avatar, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor: getAvatarColor(name)
        }
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

export const ProfileCompact: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const { user } = useAuth();

  return (
    <TouchableOpacity style={styles.compactProfile} onPress={onPress}>
      <ProfileAvatar name={user?.nome || 'Usuário'} size={36} />
    </TouchableOpacity>
  );
};

export const ProfileModal: React.FC<ProfileProps> = ({ visible, onClose }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'health' | 'settings'>('info');

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            onClose?.();
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Editar Perfil',
      'Funcionalidade em desenvolvimento. Em breve você poderá editar suas informações.',
      [{ text: 'OK' }]
    );
  };

  const profileStats = [
    { label: 'Dias ativos', value: '28', color: '#4CAF50' },
    { label: 'Meta diária', value: '85%', color: '#2196F3' },
    { label: 'Streak atual', value: '12', color: '#FF9800' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.tabContent}>
            <View style={styles.profileHeader}>
              <ProfileAvatar name={user?.nome || 'Usuário'} size={80} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.nome || 'Nome não informado'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'Email não informado'}</Text>
                <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                  <Text style={styles.editButtonText}>Editar perfil</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>{user?.telefone || 'Não informado'}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Data de Nascimento</Text>
                <Text style={styles.infoValue}>{user?.dataNascimento || 'Não informado'}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>ID do Usuário</Text>
                <Text style={styles.infoValue}>{user?.id || 'N/A'}</Text>
              </View>
            </View>
          </View>
        );

      case 'health':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Estatísticas de Saúde</Text>
            
            <View style={styles.statsGrid}>
              {profileStats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.healthMetrics}>
              <Text style={styles.sectionTitle}>Métricas Recentes</Text>
              
              <View style={styles.metricItem}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricName}>Batimentos Cardíacos</Text>
                  <Text style={styles.metricSubtext}>Média dos últimos 7 dias</Text>
                </View>
                <Text style={styles.metricValue}>74 bpm</Text>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricName}>Qualidade do Sono</Text>
                  <Text style={styles.metricSubtext}>Última noite</Text>
                </View>
                <Text style={styles.metricValue}>8.5/10</Text>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricName}>Nível de Estresse</Text>
                  <Text style={styles.metricSubtext}>Hoje</Text>
                </View>
                <Text style={[styles.metricValue, { color: '#FF9800' }]}>3.2/10</Text>
              </View>
            </View>
          </View>
        );

      case 'settings':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Configurações</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Notificações</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Privacidade</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Sobre o App</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Suporte</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.dangerZone}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Sair da conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Perfil</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
              Info
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'health' && styles.activeTab]}
            onPress={() => setActiveTab('health')}
          >
            <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>
              Saúde
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
              Config
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Avatar styles
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Compact profile styles
  compactProfile: {
    padding: 4,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 18,
  },

  // Tab bar styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2196F3',
  },

  // Content styles
  modalContent: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },

  // Profile header styles
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Section styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  // Info section styles
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },

  // Stats styles
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Health metrics styles
  healthMetrics: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  metricSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  metricValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },

  // Settings styles
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingArrow: {
    fontSize: 18,
    color: '#ccc',
  },

  // Danger zone styles
  dangerZone: {
    marginTop: 30,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});