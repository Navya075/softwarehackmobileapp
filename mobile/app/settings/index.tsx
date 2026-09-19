import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, useThemeColors, spacing, typography, radii } from '../../src/theme';
import { useAppContextStore, ThemeModeType } from '../../src/store/useAppContextStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { ContextSwitcher } from '../../src/components/ui/ContextSwitcher';

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { themeMode, setThemeMode, chargingContext } = useAppContextStore();
  const { user, logout } = useAuthStore();

  // Notification toggles
  const [notifCharging, setNotifCharging] = useState(true);
  const [notifEnergy, setNotifEnergy] = useState(true);
  const [notifSolar, setNotifSolar] = useState(true);
  const [notifReservations, setNotifReservations] = useState(true);
  const [notifBilling, setNotifBilling] = useState(true);
  const [notifDepartureRisk, setNotifDepartureRisk] = useState(true);

  const confirmLogout = () => {
    const title = 'Log out?';
    const message = 'Are you sure you want to log out of your VoltFlow account?';

    const performLogout = async () => {
      try {
        await logout();
        router.replace('/(auth)/login');
      } catch (err) {
        console.error('Logout error:', err);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        performLogout();
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Settings" subtitle="Preferences, Appearance & Account" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* APPEARANCE SECTION */}
        <Text style={styles.sectionHeader}>APPEARANCE</Text>
        <Card style={styles.sectionCard}>
          <Text style={styles.cardSubtitle}>Choose your preferred visual theme</Text>
          <View style={styles.themeRow}>
            {(['dark', 'light', 'system'] as ThemeModeType[]).map((mode) => {
              const isSelected = themeMode === mode;
              const label = mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : 'System Default';
              const icon = mode === 'dark' ? 'moon' : mode === 'light' ? 'sunny' : 'phone-portrait';
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[styles.themePill, isSelected && styles.themePillActive]}
                >
                  <Ionicons
                    name={icon as any}
                    size={16}
                    color={isSelected ? colors.primaryLight : colors.textSecondary}
                  />
                  <Text style={[styles.themePillText, isSelected && styles.themePillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* CHARGING CONTEXT SECTION */}
        <Text style={styles.sectionHeader}>CHARGING ENVIRONMENT</Text>
        <Card style={styles.sectionCard}>
          <Text style={styles.cardSubtitle}>
            Switch between residential home and commercial/workplace infrastructure.
          </Text>
          <ContextSwitcher />
        </Card>

        {/* NOTIFICATIONS SECTION */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <Card style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelCol}>
              <Text style={styles.switchTitle}>Charging Sessions</Text>
              <Text style={styles.switchSub}>Started, paused, resumed, and target reached</Text>
            </View>
            <Switch
              value={notifCharging}
              onValueChange={setNotifCharging}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelCol}>
              <Text style={styles.switchTitle}>Energy & Grid Adjustments</Text>
              <Text style={styles.switchSub}>When charging slows for high building demand</Text>
            </View>
            <Switch
              value={notifEnergy}
              onValueChange={setNotifEnergy}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelCol}>
              <Text style={styles.switchTitle}>Solar Opportunities</Text>
              <Text style={styles.switchSub}>High solar surplus windows for green charging</Text>
            </View>
            <Switch
              value={notifSolar}
              onValueChange={setNotifSolar}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelCol}>
              <Text style={styles.switchTitle}>Departure Guarantees & Risk</Text>
              <Text style={styles.switchSub}>Alerts if vehicle may not meet readiness deadline</Text>
            </View>
            <Switch
              value={notifDepartureRisk}
              onValueChange={setNotifDepartureRisk}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelCol}>
              <Text style={styles.switchTitle}>Charger Reservations</Text>
              <Text style={styles.switchSub}>Upcoming bookings and parking queue updates</Text>
            </View>
            <Switch
              value={notifReservations}
              onValueChange={setNotifReservations}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelCol}>
              <Text style={styles.switchTitle}>Billing & Receipts</Text>
              <Text style={styles.switchSub}>Session cost summaries and invoices</Text>
            </View>
            <Switch
              value={notifBilling}
              onValueChange={setNotifBilling}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
            />
          </View>
        </Card>

        {/* ACCOUNT & SECURITY */}
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <Card style={styles.sectionCard}>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Signed In As</Text>
            <Text style={styles.accountValue}>{user?.email || 'alex.rivera@mobility.io'}</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => Alert.alert('Security', 'Password change email sent.')}
          >
            <Text style={styles.navRowText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Clean Logout Trigger with Confirmation */}
          <TouchableOpacity style={styles.logoutRow} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Card>
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
    padding: spacing.base,
    gap: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: 4,
    marginLeft: 4,
  },
  sectionCard: {
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  themePillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  themePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  themePillTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  switchLabelCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  switchSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
    marginVertical: spacing.xs,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  accountLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  accountValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  navRowText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
});
