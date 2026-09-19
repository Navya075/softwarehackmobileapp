import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { useVehicleStore } from '../src/store/useVehicleStore';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { Badge } from '../src/components/ui/Badge';

export default function ChargeFasterModal() {
  const router = useRouter();
  const { setEmergencyBoost, emergencyBoostActive } = useVehicleStore();
  const [selectedPlan, setSelectedPlan] = useState<'normal' | 'faster'>(
    emergencyBoostActive ? 'faster' : 'normal'
  );

  const handleActivate = () => {
    if (selectedPlan === 'faster') {
      setEmergencyBoost(true);
    } else {
      setEmergencyBoost(false);
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <View style={styles.navTitleCol}>
          <Text style={styles.navTitle}>Charging Speed Options</Text>
          <Text style={styles.navSubtitle}>Compare smart energy savings vs faster charging</Text>
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/home');
            }
          }}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Advisory banner */}
        <View style={styles.advisoryBanner}>
          <Ionicons name="information-circle-outline" size={20} color={colors.solar} />
          <Text style={styles.advisoryText}>
            Charging faster may cost more and use more grid capacity during busy hours.
          </Text>
        </View>

        {/* Plan 1: Normal Smart Charging */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedPlan('normal')}
        >
          <Card
            style={[
              styles.planCard,
              selectedPlan === 'normal' && styles.planCardActive,
            ]}
          >
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planTitle}>Normal Smart Charging</Text>
                <Text style={styles.planBadgeText}>Grid & Cost Balanced</Text>
              </View>
              <Badge label="RECOMMENDED" variant="success" dot />
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>TARGET</Text>
                <Text style={styles.metricValue}>85%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>READY BY</Text>
                <Text style={[styles.metricValue, { color: colors.primaryLight }]}>6:42 AM</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>EST. COST</Text>
                <Text style={styles.metricValue}>₹74</Text>
              </View>
            </View>

            <Text style={styles.planSummary}>
              Schedules flexible charging during low-cost electricity hours. Guaranteed ready 48 minutes before your 7:30 AM departure.
            </Text>
          </Card>
        </TouchableOpacity>

        {/* Plan 2: Charge Faster */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedPlan('faster')}
        >
          <Card
            style={[
              styles.planCard,
              selectedPlan === 'faster' && styles.planCardFasterActive,
            ]}
          >
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planTitle}>Charge Faster</Text>
                <Text style={[styles.planBadgeText, { color: colors.solar }]}>Priority Speed Mode</Text>
              </View>
              <Badge label="FASTER" variant="warning" dot />
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>TARGET</Text>
                <Text style={styles.metricValue}>85%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>READY BY</Text>
                <Text style={[styles.metricValue, { color: colors.solarLight }]}>5:50 AM</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>EST. COST</Text>
                <Text style={[styles.metricValue, { color: colors.solarLight }]}>₹91</Text>
              </View>
            </View>

            <Text style={styles.planSummary}>
              Charges at higher rate immediately to finish 52 minutes earlier. Bypasses building load-smoothing limits.
            </Text>
          </Card>
        </TouchableOpacity>

        {/* Confirmation Action */}
        <Button
          title={selectedPlan === 'faster' ? 'Activate: Charge Faster' : 'Keep Normal Smart Charging'}
          size="lg"
          variant={selectedPlan === 'faster' ? 'primary' : 'secondary'}
          icon={
            <Ionicons
              name={selectedPlan === 'faster' ? 'flash' : 'shield-checkmark'}
              size={20}
              color={selectedPlan === 'faster' ? colors.textInverse : colors.textPrimary}
            />
          }
          onPress={handleActivate}
          style={styles.actionBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorderSubtle,
  },
  navTitleCol: {
    flex: 1,
  },
  navTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.textPrimary,
  },
  navSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  advisoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.solarGhost,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  advisoryText: {
    flex: 1,
    fontSize: 12,
    color: colors.solarLight,
    lineHeight: 16,
    fontWeight: '500',
  },
  planCard: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  planCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  planCardFasterActive: {
    borderColor: colors.solar,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  planTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  planBadgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  planSummary: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  actionBtn: {
    marginTop: spacing.md,
  },
});
