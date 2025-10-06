import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Stack = createNativeStackNavigator();

// Componente de Loading
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#2196F3" />
    <Text style={styles.loadingText}>Carregando...</Text>
  </View>
);

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
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
          />
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// App principal com Provider
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
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