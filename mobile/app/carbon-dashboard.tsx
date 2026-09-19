import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { mockCarbon } from '../src/mock';
import { Header } from '../src/components/ui/Header';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';

export default function CarbonDashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Energy & Carbon" subtitle="Clean Energy Usage & Sustainability" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Month Banner */}
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.sectionLabel}>MONTHLY SUMMARY</Text>
              <Text style={styles.heroMonth}>{mockCarbon.month} Energy</Text>
            </View>
            <Badge label={`${mockCarbon.renewableSharePercent}% Clean Share`} variant="solar" dot />
          </View>

          <View style={styles.kwhLargeRow}>
            <Text style={styles.kwhNumber}>{mockCarbon.totalKwh}</Text>
            <Text style={styles.kwhUnit}>kWh Total EV Energy</Text>
          </View>

          {/* Clean vs Grid Bar */}
          <View style={styles.barContainer}>
            <View
              style={[
                styles.barSolar,
                { width: `${mockCarbon.renewableSharePercent}%` },
              ]}
            />
            <View
              style={[
                styles.barGrid,
                { width: `${100 - mockCarbon.renewableSharePercent}%` },
              ]}
            />
          </View>

          <View style={styles.barLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.solar }]} />
              <Text style={styles.legendText}>Solar & Renewable ({mockCarbon.renewableKwh} kWh)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.grid }]} />
              <Text style={styles.legendText}>Grid Energy ({mockCarbon.gridKwh} kWh)</Text>
            </View>
          </View>
        </Card>

        {/* Environmental Impact Summary */}
        <Text style={styles.sectionHeading}>ESTIMATED ENVIRONMENTAL IMPACT</Text>
        <View style={styles.impactGrid}>
          <Card style={styles.impactCard}>
            <Ionicons name="leaf-outline" size={28} color={colors.primary} />
            <Text style={styles.impactVal}>{mockCarbon.co2AvoidedKg} kg</Text>
            <Text style={styles.impactLabel}>CO₂ Emissions Avoided</Text>
            <Text style={styles.impactSub}>Compared to gasoline driving</Text>
          </Card>

          <Card style={styles.impactCard}>
            <Ionicons name="speedometer-outline" size={28} color={colors.solar} />
            <Text style={styles.impactVal}>{mockCarbon.gasolineSavedLitres} L</Text>
            <Text style={styles.impactLabel}>Gasoline Displaced</Text>
            <Text style={styles.impactSub}>Fuel saved this month</Text>
          </Card>
        </View>

        {/* Friendly explanation card */}
        <Card style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
            <Text style={styles.noteTitle}>How VoltFlow Maximizes Clean Energy</Text>
          </View>
          <Text style={styles.noteDesc}>
            By coordinating charging with rooftop solar peaks and late-night wind power periods, your vehicle automatically absorbs cleaner energy without requiring manual planning.
          </Text>
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
  heroCard: {
    gap: spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  heroMonth: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 2,
  },
  kwhLargeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  kwhNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  kwhUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  barContainer: {
    height: 12,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  barSolar: {
    backgroundColor: colors.solar,
  },
  barGrid: {
    backgroundColor: colors.grid,
  },
  barLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  sectionHeading: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: 4,
  },
  impactGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  impactCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  impactVal: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  impactLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  impactSub: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    gap: spacing.xs,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  noteDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
