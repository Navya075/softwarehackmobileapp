import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { mockReports } from '../src/mock';
import { Header } from '../src/components/ui/Header';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';

export default function ReportsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Vehicle Reports" subtitle="Monthly Performance & Energy Summaries" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Active Month Report Header */}
        <Card elevated style={styles.heroCard}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.periodText}>{mockReports.month}</Text>
              <Text style={styles.reportTitle}>Monthly EV Energy Report</Text>
            </View>
            <Badge label="100% READY" variant="success" dot />
          </View>

          <View style={styles.kpiGrid}>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>SESSIONS</Text>
              <Text style={styles.kpiVal}>{mockReports.totalSessions}</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>TOTAL ENERGY</Text>
              <Text style={styles.kpiVal}>{mockReports.energyConsumedKwh} kWh</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>TOTAL SPENT</Text>
              <Text style={[styles.kpiVal, { color: colors.solarLight }]}>₹{mockReports.totalCostInr}</Text>
            </View>
          </View>
        </Card>

        {/* Detailed Report Table */}
        <Card style={styles.tableCard}>
          <Text style={styles.sectionHeading}>KEY OPERATIONAL METRICS</Text>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Average Charging Duration</Text>
            <Text style={styles.rowVal}>{mockReports.avgChargingDuration}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Renewable Energy Utilized</Text>
            <Text style={[styles.rowVal, { color: colors.solarLight }]}>{mockReports.renewableKwh} kWh</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Grid Energy Utilized</Text>
            <Text style={styles.rowVal}>{mockReports.gridKwh} kWh</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Renewable Energy Share</Text>
            <Text style={[styles.rowVal, { color: colors.solarLight }]}>
              {mockReports.renewableSharePercent}%
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Estimated CO₂ Impact</Text>
            <Text style={[styles.rowVal, { color: colors.primaryLight }]}>
              {mockReports.co2ImpactKg} kg avoided
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>On-Time Departure Readiness</Text>
            <Text style={[styles.rowVal, { color: colors.primaryLight }]}>
              {mockReports.departureReadinessPercent}% on time
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Charge Faster Sessions Used</Text>
            <Text style={styles.rowVal}>{mockReports.chargeFasterSessions} sessions</Text>
          </View>
        </Card>

        {/* Generate Report Action */}
        <Button
          title="Generate & Export Full Report"
          size="lg"
          variant="primary"
          icon={<Ionicons name="document-text-outline" size={20} color={colors.textInverse} />}
          onPress={() => Alert.alert('Report Generated', 'Monthly report compiled and saved to device.')}
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
  scrollContent: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  periodText: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: '700',
    letterSpacing: 1,
  },
  reportTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  kpiBox: {
    alignItems: 'center',
    flex: 1,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  kpiVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  tableCard: {
    gap: spacing.xs,
  },
  sectionHeading: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorderSubtle,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rowVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionBtn: {
    marginTop: spacing.xs,
  },
});
