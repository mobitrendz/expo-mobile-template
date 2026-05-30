import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup';

export function LoginScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setFullName('');
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    if (isSignup && !fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signup(email, password, fullName);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : isSignup ? 'Sign up failed' : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>{isSignup ? 'Create account' : 'Sign in'}</Text>
          <Text style={styles.subtitle}>Regular user account</Text>

          {isSignup ? (
            <>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                autoCapitalize="words"
                autoComplete="name"
                placeholder="Your name"
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                editable={!isSubmitting}
              />
            </>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            secureTextEntry
            autoComplete={isSignup ? 'new-password' : 'password'}
            placeholder="Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
            onSubmitEditing={handleSubmit}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isSignup ? 'Sign up' : 'Sign in'}</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.switchModeButton}
            onPress={() => switchMode(isSignup ? 'login' : 'signup')}
            disabled={isSubmitting}
          >
            <Text style={styles.switchModeText}>
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  error: {
    color: '#c62828',
    marginTop: 4,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchModeText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});
