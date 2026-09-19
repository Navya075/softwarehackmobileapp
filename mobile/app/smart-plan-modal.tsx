import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { useVehicleStore } from '../src/store/useVehicleStore';
import { useEnergyStore } from '../src/store/useEnergyStore';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';

export default function SmartPlanModal() {
  const router = useRouter();
  const { telemetry, setEmergencyBoost, emergencyBoostActive } = useVehicleStore();
  const { decision, gridState } = useEnergyStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <View style={styles.navTitleCol}>
          <Text style={styles.navTitle}>Smart Charging Plan</Text>
          <Text style={styles.navSubtitle}>AI-Engineered Grid Coordination & Savings</Text>
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
        {/* Guarantee Banner */}
        <Card elevated style={styles.guaranteeCard}>
          <View style={styles.guaranteeRow}>
            <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
            <View style={styles.guaranteeCol}>
              <Text style={styles.guaranteeTitle}>Departure Guaranteed</Text>
              <Text style={styles.guaranteeSubtitle}>
                Target {telemetry.target_soc}% will be reached at {telemetry.estimated_completion_time}, 48 minutes before your {telemetry.departure_time} departure.
              </Text>
            </View>
          </View>
        </Card>

        {/* Energy Source Distribution */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>ENERGY ALLOCATION</Text>

          <View style={styles.energyRow}>
            <View style={styles.energyCol}>
              <Text style={styles.energyPercent}>{decision.renewable_percentage}%</Text>
              <Text style={styles.energyLabel}>Clean Solar Energy</Text>
            </View>
            <View style={styles.energyCol}>
              <Text style={[styles.energyPercent, { color: colors.grid }]}>
                {100 - decision.renewable_percentage}%
              </Text>
              <Text style={styles.energyLabel}>Off-Peak Grid</Text>
            </View>
            <View style={styles.energyCol}>
              <Text style={[styles.energyPercent, { color: colors.primary }]}>₹74</Text>
              <Text style={styles.energyLabel}>Estimated Cost</Text>
            </View>
          </View>

          <View style={styles.distributionBar}>
            <View
              style={[
                styles.distributionSolar,
                { width: `${decision.renewable_percentage}%` },
              ]}
            />
            <View
              style={[
                styles.distributionGrid,
                { width: `${100 - decision.renewable_percentage}%` },
              ]}
            />
          </View>
        </Card>

        {/* Building Demand & Smart Charging Rules */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>HOW YOUR CHARGING IS MANAGED</Text>
          <Text style={styles.explanationText}>
            Charging is automatically adjusted to balance high building electricity use while guaranteeing your EV is ready on time.
          </Text>

          <View style={styles.ruleItems}>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.ruleText}>
                More electricity is being used in your building right now, so charging is slowed.
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.ruleText}>
                Electricity is expected to be cheaper later tonight during off-peak hours.
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.ruleText}>
                18 kW rooftop solar energy is prioritized directly for clean charging.
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.ruleText}>
                Your target is still fully guaranteed to finish 48 minutes before you leave.
              </Text>
            </View>
          </View>
        </Card>

        {/* Charge Faster Option */}
        <Card style={styles.overrideCard}>
          <View style={styles.overrideHeader}>
            <Ionicons name="flash" size={20} color={colors.warning} />
            <Text style={styles.overrideTitle}>Need to Leave Sooner?</Text>
          </View>
          <Text style={styles.overrideDesc}>
            Activate Charge Faster to charge at maximum 11 kW regardless of building demand or electricity pricing.
          </Text>

          <Button
            title={emergencyBoostActive ? 'Deactivate Fast Charging' : 'Switch to Charge Faster'}
            variant={emergencyBoostActive ? 'secondary' : 'primary'}
            size="md"
            onPress={() => {
              setEmergencyBoost(!emergencyBoostActive);
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/home');
              }
            }}
            style={styles.overrideBtn}
          />
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
  guaranteeCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  guaranteeCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  guaranteeSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionCard: {
    gap: spacing.sm,
  },
  sectionHeading: {
    ...typography.label,
    color: colors.textMuted,
  },
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  energyCol: {
    alignItems: 'center',
    flex: 1,
  },
  energyPercent: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.solar,
  },
  energyLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  distributionBar: {
    height: 10,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  distributionSolar: {
    backgroundColor: colors.solar,
  },
  distributionGrid: {
    backgroundColor: colors.grid,
  },
  explanationText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  ruleItems: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  ruleText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  overrideCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  overrideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  overrideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  overrideDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  overrideBtn: {
    width: '100%',
  },
});
