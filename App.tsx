import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Screens
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';
import CadastroDadosPessoaisScreen from './screens/CadastroDadosPessoaisScreen';
import CadastroCredenciaisScreen from './screens/CadastroCredenciaisScreen';
import CadastroEnderecoScreen from './screens/CadastroEnderecoScreen';
import ProfileScreen from './screens/ProfileScreen';
import MedicaoScreen from './screens/MedicaoScreen';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { RootStackParamList } from './types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 },
  },
});

// Componente de Loading
const LoadingScreen = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando...</Text>
    </View>
  );
};

// Navegador principal
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      >
        {isAuthenticated ? (
          // Usuário autenticado - mostrar telas principais
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Perfil" component={ProfileScreen} />
            <Stack.Screen name="Medicao" component={MedicaoScreen} />
          </>
        ) : (
          // Usuário não autenticado - mostrar telas de auth
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
            />
            <Stack.Screen 
              name="Cadastro" 
              component={CadastroScreen}
            />
            <Stack.Screen 
              name="CadastroDadosPessoais" 
              component={CadastroDadosPessoaisScreen}
            />
            <Stack.Screen 
              name="CadastroCredenciais" 
              component={CadastroCredenciaisScreen}
            />
            <Stack.Screen 
              name="CadastroEndereco" 
              component={CadastroEnderecoScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// App principal com Providers
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});