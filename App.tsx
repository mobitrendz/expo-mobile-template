import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { TodoListScreen } from './src/screens/TodoListScreen';

type AppScreen = 'todos' | 'profile';

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const [screen, setScreen] = useState<AppScreen>('todos');

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (screen === 'profile') {
    return <ProfileScreen onBack={() => setScreen('todos')} />;
  }

  return <TodoListScreen onOpenProfile={() => setScreen('profile')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f6f8',
  },
});
