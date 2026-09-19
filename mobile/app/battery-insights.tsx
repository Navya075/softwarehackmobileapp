import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, useThemeColors, spacing, typography, radii } from '../src/theme';
import { mockBatteryInsights } from '../src/mock';
import { Header } from '../src/components/ui/Header';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';

import { useVehicleStore } from '../src/store/useVehicleStore';

export default function BatteryInsightsScreen() {
  const colors = useThemeColors();
  const { telemetry } = useVehicleStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Battery Insights" subtitle="Health Diagnostics & Charging Habits" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Comparison: Level vs Health */}
        <View style={styles.topComparisonRow}>
          {/* Current Level (SOC) */}
          <Card style={styles.levelCard}>
            <Text style={styles.sectionLabel}>OPERATIONAL CHARGE</Text>
            <Text style={styles.levelTitle}>Battery Level</Text>
            <View style={styles.socRow}>
              <Text style={styles.socNumber}>{telemetry.current_soc}%</Text>
              <Text style={styles.socSub}>{telemetry.estimated_range_km} km range</Text>
            </View>
            <Badge
              label={telemetry.charging_status === 'charging' ? 'CHARGING' : 'IDLE'}
              variant={telemetry.charging_status === 'charging' ? 'success' : 'neutral'}
              size="sm"
              dot
            />
          </Card>

          {/* Battery Health (SOH) */}
          <Card elevated style={styles.healthCard}>
            <Text style={styles.sectionLabel}>PACK CONDITION</Text>
            <Text style={styles.healthTitle}>Battery Health</Text>
            <View style={styles.healthRow}>
              <Text style={styles.healthNumber}>{mockBatteryInsights.healthScore}%</Text>
              <Text style={styles.healthSub}>{mockBatteryInsights.healthStatus}</Text>
            </View>
            <Badge label="GOOD CONDITION" variant="success" size="sm" dot />
          </Card>
        </View>

        {/* Physical Capacity & Cell Telemetry */}
        <Text style={styles.sectionHeading}>PACK CAPACITY & DIAGNOSTICS</Text>
        <Card style={styles.capacityCard}>
          <View style={styles.capacityMetricsGrid}>
            <View style={styles.capMetricBox}>
              <Text style={styles.capMetricLabel}>USABLE CAPACITY</Text>
              <Text style={styles.capMetricVal}>{mockBatteryInsights.usableCapacityKwh} kWh</Text>
              <Text style={styles.capMetricSub}>Available today</Text>
            </View>
            <View style={styles.capMetricBox}>
              <Text style={styles.capMetricLabel}>ORIGINAL PACK</Text>
              <Text style={styles.capMetricVal}>{mockBatteryInsights.originalCapacityKwh} kWh</Text>
              <Text style={styles.capMetricSub}>Factory rating</Text>
            </View>
            <View style={styles.capMetricBox}>
              <Text style={styles.capMetricLabel}>DEGRADATION</Text>
              <Text style={[styles.capMetricVal, { color: colors.solarLight }]}>
                {mockBatteryInsights.degradationPercent}%
              </Text>
              <Text style={styles.capMetricSub}>Over 84 cycles</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.diagRow}>
            <View style={styles.diagItem}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.diagText}>Cells: {mockBatteryInsights.cellCondition}</Text>
            </View>
            <View style={styles.diagItem}>
              <Ionicons name="thermometer-outline" size={16} color={colors.solar} />
              <Text style={styles.diagText}>Temp: {mockBatteryInsights.operatingTemperatureC}°C</Text>
            </View>
            <View style={styles.diagItem}>
              <Ionicons name="hourglass-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.diagText}>Est. Life: ~{mockBatteryInsights.estimatedLifeRemainingYears} yrs</Text>
            </View>
          </View>
        </Card>

        {/* Observed Charging Patterns */}
        <Text style={styles.sectionHeading}>OBSERVED CHARGING PATTERNS</Text>
        <Card style={styles.patternsCard}>
          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TYPICAL RANGE</Text>
              <Text style={styles.statVal}>{mockBatteryInsights.averageChargingRange}</Text>
              <Text style={styles.statDesc}>Start → Finish</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>AVG SESSION</Text>
              <Text style={styles.statVal}>{mockBatteryInsights.averageSessionDuration}</Text>
              <Text style={styles.statDesc}>Overnight buffer</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Normal vs Fast charging distribution */}
          <Text style={styles.distributionTitle}>Charging Speed Breakdown</Text>
          <View style={styles.distBar}>
            <View
              style={[
                styles.distNormal,
                { width: '88%' },
              ]}
            />
            <View
              style={[
                styles.distFast,
                { width: '12%' },
              ]}
            />
          </View>

          <View style={styles.distLabels}>
            <Text style={styles.distLegend}>
              Normal L2 Charging ({mockBatteryInsights.normalChargingShare})
            </Text>
            <Text style={[styles.distLegend, { color: colors.solarLight }]}>
              DC Fast ({mockBatteryInsights.fastChargingShare})
            </Text>
          </View>
        </Card>

        {/* Friendly Care Guidance */}
        <Text style={styles.sectionHeading}>RECOMMENDED BATTERY CARE</Text>
        <Card style={styles.tipsCard}>
          {mockBatteryInsights.recommendations.map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
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
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  topComparisonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  levelCard: {
    flex: 1,
    gap: spacing.xs,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  socRow: {
    marginVertical: spacing.xs,
  },
  socNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  socSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  healthCard: {
    flex: 1,
    gap: spacing.xs,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  healthRow: {
    marginVertical: spacing.xs,
  },
  healthNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  healthSub: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 10,
  },
  capacityCard: {
    gap: spacing.md,
  },
  capacityMetricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  capMetricBox: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  capMetricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  capMetricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  capMetricSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  diagRow: {
    gap: spacing.xs,
  },
  diagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  diagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionHeading: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: 4,
  },
  patternsCard: {
    gap: spacing.md,
  },
  statGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  statDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
  },
  distributionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  distBar: {
    height: 10,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  distNormal: {
    backgroundColor: colors.primary,
  },
  distFast: {
    backgroundColor: colors.solar,
  },
  distLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distLegend: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tipsCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    gap: spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
});
