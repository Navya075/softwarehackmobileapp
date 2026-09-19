import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { useAuthStore } from '../src/store/useAuthStore';
import { Button } from '../src/components/ui/Button';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isOnboarded } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.pulseHalo} />
          <View style={styles.iconBox}>
            <Ionicons name="flash" size={40} color={colors.primary} />
          </View>
        </View>

        {/* Brand Typography */}
        <Text style={styles.brandTitle}>VOLTFLOW</Text>
        <Text style={styles.brandTagline}>Intelligent EV Energy & Fleet Telemetry</Text>

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Real-Time Telemetry</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Grid Peak Shaving</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Solar Synchronized</Text>
          </View>
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <Button
          title={isAuthenticated ? (isOnboarded ? "Open EV Dashboard" : "Continue Setup") : "Get Started"}
          size="lg"
          variant="primary"
          icon={<Ionicons name={isAuthenticated ? (isOnboarded ? "car-outline" : "options-outline") : "arrow-forward"} size={20} color={colors.textInverse} />}
          onPress={() => {
            if (isAuthenticated) {
              if (isOnboarded) {
                router.replace('/(tabs)/home');
              } else {
                router.replace('/(onboarding)/personal');
              }
            } else {
              router.push('/(auth)/signup');
            }
          }}
          style={styles.primaryButton}
        />

        {!isAuthenticated ? (
          <Button
            title="Sign In"
            size="md"
            variant="secondary"
            icon={<Ionicons name="log-in-outline" size={18} color={colors.textPrimary} />}
            onPress={() => router.push('/(auth)/login')}
            style={styles.secondaryButton}
          />
        ) : (
          <Button
            title="Sign In with Another Account"
            size="md"
            variant="secondary"
            icon={<Ionicons name="log-in-outline" size={18} color={colors.textPrimary} />}
            onPress={() => router.push('/(auth)/login')}
            style={styles.secondaryButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  pulseHalo: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryGhost,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  brandTitle: {
    ...typography.h1,
    fontSize: 32,
    letterSpacing: 2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  brandTagline: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  footer: {
    width: '100%',
    paddingBottom: spacing.base,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
  secondaryButton: {
    marginBottom: spacing.base,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  loginLinkText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  loginHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
});
