import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useVehicleStore } from '../../src/store/useVehicleStore';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    console.log('[SIGNIN] SIGNIN BUTTON PRESSED');
    setErrorMessage('');

    if (!email.trim() || !password) {
      const msg = 'Please enter your email address and password.';
      console.log('[SIGNIN] VALIDATION FAILED:', msg);
      setErrorMessage(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Required', msg);
      return;
    }

    setSubmitting(true);
    try {
      console.log('[SIGNIN] FIREBASE SIGNIN STARTED');
      await login(email.trim(), password);
      console.log('[SIGNIN] FIREBASE SIGNIN SUCCESS');

      await useVehicleStore.getState().fetchVehicles();
      const currentUser = useAuthStore.getState().user;

      if (currentUser && currentUser.completedOnboarding === false) {
        console.log('[SIGNIN] NAVIGATION STARTED -> /(onboarding)/personal');
        router.replace('/(onboarding)/personal');
      } else {
        console.log('[SIGNIN] NAVIGATION STARTED -> /(tabs)/home');
        router.replace('/(tabs)/home');
      }
      console.log('[SIGNIN] NAVIGATION SUCCESS');
    } catch (e: any) {
      console.error('[SIGNIN] FULL ERROR:', e);
      console.error('[SIGNIN] ERROR CODE:', e?.code);
      console.error('[SIGNIN] ERROR MESSAGE:', e?.message);
      const msg = e?.message || 'Please check your credentials.';
      console.error('[SIGNIN] SIGNIN ERROR:', msg);
      setErrorMessage(msg);
      if (Platform.OS === 'web') window.alert(`Sign In Failed: ${msg}`);
      else Alert.alert('Sign In Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back navigation */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/home');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to manage your EV telemetry and smart charging</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email Address"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (errorMessage) setErrorMessage('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="your.email@example.com"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (errorMessage) setErrorMessage('');
            }}
            secureTextEntry
            placeholder="••••••••••••"
          />

          <Button
            title="Sign In"
            size="lg"
            loading={submitting}
            onPress={handleLogin}
            style={styles.signInButton}
          />
        </View>

        {/* Sign up link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to VoltFlow? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signupText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  backButton: {
    paddingVertical: spacing.xs,
    width: 40,
  },
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
    lineHeight: 18,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    flex: 1,
  },
  signInButton: {
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  signupText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
