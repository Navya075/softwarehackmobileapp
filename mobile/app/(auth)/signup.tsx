import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function SignUpScreen() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleNext = async () => {
    console.log('[SIGNUP] SIGNUP BUTTON PRESSED');
    setErrorMessage('');

    const emailTrimmed = email.trim();
    const nameTrimmed = name.trim();
    const phoneTrimmed = phone.trim();

    if (!nameTrimmed) {
      const msg = 'Please enter your full name.';
      console.log('[SIGNUP] VALIDATION FAILED:', msg);
      setErrorMessage(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Validation Error', msg);
      return;
    }

    if (!phoneTrimmed) {
      const msg = 'Please enter your mobile phone number.';
      console.log('[SIGNUP] VALIDATION FAILED:', msg);
      setErrorMessage(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Validation Error', msg);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      const msg = 'Please enter a valid email address (e.g. name@example.com).';
      console.log('[SIGNUP] VALIDATION FAILED:', msg);
      setErrorMessage(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Validation Error', msg);
      return;
    }

    if (!password || password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      console.log('[SIGNUP] VALIDATION FAILED:', msg);
      setErrorMessage(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Validation Error', msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Password and Confirm Password do not match.';
      console.log('[SIGNUP] VALIDATION FAILED:', msg);
      setErrorMessage(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Validation Error', msg);
      return;
    }

    console.log('[SIGNUP] VALIDATION PASSED');
    setSubmitting(true);

    try {
      console.log('[SIGNUP] FIREBASE SIGNUP STARTED');
      await signup(nameTrimmed, emailTrimmed, password, phoneTrimmed);
      console.log('[SIGNUP] FIREBASE SIGNUP SUCCESS');

      const user = useAuthStore.getState().user;
      console.log('[SIGNUP] UID RECEIVED:', user?.id);

      console.log('[SIGNUP] PROFILE SAVE SUCCESS');

      console.log('[SIGNUP] NAVIGATION STARTED -> /(onboarding)/personal');
      router.replace({
        pathname: '/(onboarding)/personal',
        params: { name: nameTrimmed, email: emailTrimmed, phone: phoneTrimmed },
      });
      console.log('[SIGNUP] NAVIGATION SUCCESS');
    } catch (e: any) {
      console.error('[SIGNUP] FULL ERROR:', e);
      console.error('[SIGNUP] ERROR CODE:', e?.code);
      console.error('[SIGNUP] ERROR MESSAGE:', e?.message);
      const msg = e?.message || 'Could not complete registration.';
      console.error('[SIGNUP] SIGNUP ERROR:', msg);
      setErrorMessage(msg);
      if (Platform.OS === 'web') window.alert(`Sign Up Failed: ${msg}`);
      else Alert.alert('Sign Up Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(auth)/login');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Begin your smart EV energy journey</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Enter your full name"
          />

          <Input
            label="Mobile Number"
            value={phone}
            onChangeText={(txt) => {
              setPhone(txt);
              if (errorMessage) setErrorMessage('');
            }}
            keyboardType="phone-pad"
            placeholder="+1 (555) 000-0000"
          />

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

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              if (errorMessage) setErrorMessage('');
            }}
            secureTextEntry
            placeholder="••••••••••••"
          />

          <Button
            title="Create Account & Continue"
            size="lg"
            loading={submitting}
            onPress={handleNext}
            style={styles.continueButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginText}>Sign In</Text>
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
  continueButton: {
    marginTop: spacing.md,
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
  loginText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
