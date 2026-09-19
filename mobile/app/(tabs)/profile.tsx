import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, useThemeColors, spacing, typography, radii } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useVehicleStore } from '../../src/store/useVehicleStore';
import { useAppContextStore } from '../../src/store/useAppContextStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';

export default function ProfileTabScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user, fetchProfile, logout } = useAuthStore();
  const { activeVehicle, fetchVehicles } = useVehicleStore();
  const { chargingContext, themeMode } = useAppContextStore();

  useEffect(() => {
    fetchProfile();
    fetchVehicles();
  }, []);

  const handleLogout = () => {
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

  const renderNavRow = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    badgeText?: string,
    badgeColor?: string
  ) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.navRow}
      onPress={onPress}
    >
      <View style={styles.navRowLeft}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon as any} size={18} color={colors.textPrimary} />
        </View>
        <View style={styles.navTextCol}>
          <Text style={[styles.navRowTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.navRowSub, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.navRowRight}>
        {badgeText && (
          <Text style={[styles.badgePill, badgeColor ? { color: badgeColor } : undefined]}>
            {badgeText}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Account & Vehicle"
        subtitle="Manage Profiles, Energy Reports & Preferences"
        showNotificationBell={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Summary Card */}
        <Card elevated style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={28} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.displayName || 'EV Owner'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@voltflow.io'}</Text>
              <View style={styles.badgeRow}>
                <Badge
                  label={chargingContext === 'residential' ? '🏠 Residential' : '🏢 Commercial'}
                  variant="neutral"
                />
                <Badge label="Smart Plan ON" variant="success" dot />
              </View>
            </View>
          </View>
        </Card>

        {/* SECTION: ACCOUNT */}
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <Card style={styles.sectionCard}>
          {renderNavRow(
            'person-outline',
            'Personal Information',
            'Name, contact phone & city',
            () => router.push({ pathname: '/(onboarding)/personal', params: { fromProfile: 'true' } })
          )}
          <View style={styles.divider} />
          {renderNavRow(
            'settings-outline',
            'Settings & Security',
            'Appearance, preferences & security',
            () => router.push('/settings')
          )}
          <View style={styles.divider} />
          {renderNavRow(
            'log-out-outline',
            'Log Out',
            'Sign out of your VoltFlow account',
            handleLogout,
            undefined,
            colors.danger
          )}
        </Card>

        {/* SECTION: MY EV */}
        <Text style={styles.sectionHeader}>MY EV</Text>
        <Card style={styles.sectionCard}>
          {renderNavRow(
            'car-outline',
            'Vehicle Details',
            `${activeVehicle.make} ${activeVehicle.model} • ${activeVehicle.usableCapacityKwh || 38.1}/${activeVehicle.batteryCapacityKwh || 40.5} kWh`,
            () => router.push('/(onboarding)/technical'),
            activeVehicle.licensePlate
          )}
          <View style={styles.divider} />
          {renderNavRow(
            'analytics-outline',
            'Battery Insights',
            `Pack health ${activeVehicle.batteryHealthScore || 94}% • 6% degradation over 84 cycles`,
            () => router.push('/battery-insights'),
            `${activeVehicle.batteryHealthScore || 94}% Good`,
            colors.primaryLight
          )}
        </Card>

        {/* SECTION: CHARGING */}
        <Text style={styles.sectionHeader}>CHARGING</Text>
        <Card style={styles.sectionCard}>
          {renderNavRow(
            'options-outline',
            'Charging Preferences',
            'Target battery %, departure time & priority',
            () => router.push('/(onboarding)/preferences'),
            `${activeVehicle.targetSocDefault}% Target`
          )}
          <View style={styles.divider} />
          {renderNavRow(
            'time-outline',
            'Charging History',
            'Filtered past sessions, duration & energy breakdown',
            () => router.push('/charging-history'),
            'Sep 18 Latest'
          )}
          <View style={styles.divider} />
          {renderNavRow(
            'receipt-outline',
            'Billing & Receipts',
            'Energy costs, parking fee & downloadable receipts',
            () => router.push('/billing')
          )}
          <View style={styles.divider} />
          {renderNavRow(
            'calendar-outline',
            'Reservations',
            'Upcoming booked charger slots & past reservations',
            () => router.push('/reservations'),
            '1 Confirmed',
            colors.primaryLight
          )}
        </Card>

        {/* SECTION: ENERGY */}
        <Text style={styles.sectionHeader}>ENERGY</Text>
        <Card style={styles.sectionCard}>
          {renderNavRow(
            'leaf-outline',
            'Energy & Carbon',
            'Monthly clean energy ratio & environmental offset',
            () => router.push('/carbon-dashboard'),
            '64% Clean',
            colors.solarLight
          )}
          <View style={styles.divider} />
          {renderNavRow(
            'document-text-outline',
            'Monthly Reports',
            'Detailed energy consumed, readiness & export report',
            () => router.push('/reports')
          )}
          <View style={styles.divider} />
          {renderNavRow(
            'sparkles-outline',
            'Smart Insights & Predictions',
            'Cost forecasts, solar peaks & departure readiness',
            () => router.push('/smart-insights')
          )}
        </Card>

        {/* SECTION: APP */}
        <Text style={styles.sectionHeader}>APPLICATION</Text>
        <Card style={styles.sectionCard}>
          {renderNavRow(
            'notifications-outline',
            'Notifications Center',
            'Real-time alerts, energy adjustments & billing',
            () => router.push('/notifications')
          )}
          <View style={styles.divider} />
          {renderNavRow(
            'color-palette-outline',
            'Appearance Theme',
            `Current: ${themeMode === 'dark' ? 'Dark Mode' : themeMode === 'light' ? 'Light Mode' : 'System'}`,
            () => router.push('/settings')
          )}
          <View style={styles.divider} />
          {renderNavRow(
            'swap-horizontal-outline',
            'Charging Context',
            `Currently in ${chargingContext === 'residential' ? 'Residential Home' : 'Commercial / Industrial'}`,
            () => router.push('/settings')
          )}
        </Card>

        {/* STANDALONE LOGOUT ACTION */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={[styles.bottomLogoutButton, { backgroundColor: colors.dangerGhost, borderColor: colors.danger }]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.bottomLogoutText, { color: colors.danger }]}>Log Out of VoltFlow</Text>
        </TouchableOpacity>
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
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  userCard: {
    marginBottom: spacing.xs,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 6,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: -6,
    marginLeft: 4,
  },
  sectionCard: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: 0,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTextCol: {
    flex: 1,
  },
  navRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  navRowSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  navRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badgePill: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
  },
  bottomLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  bottomLogoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
