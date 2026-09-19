import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, useThemeColors, spacing, typography, radii } from '../../src/theme';
import { useVehicleStore } from '../../src/store/useVehicleStore';
import { useEnergyStore } from '../../src/store/useEnergyStore';
import { mockChargingSession, mockChargingPlan } from '../../src/mock';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';

export default function ChargeTabScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { telemetry, setTargetSoc, toggleCharging, emergencyBoostActive } = useVehicleStore();
  const { decision } = useEnergyStore();

  const isCharging = telemetry.charging_status === 'charging';
  const targetOptions = [70, 80, 85, 90, 100];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Charging Session"
        subtitle="Live Power, Smart Schedule & Explainability"
        showNotificationBell={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* CURRENT CHARGING SESSION HERO */}
        <Card elevated style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <View>
              <Text style={styles.sectionLabel}>ACTIVE CHARGING SESSION</Text>
              <Text style={styles.powerLarge}>
                {telemetry.charging_power_kw} <Text style={styles.powerUnit}>kW</Text>
              </Text>
            </View>
            <Badge
              label={isCharging ? 'CHARGING ACTIVE' : 'PAUSED'}
              variant={isCharging ? 'success' : 'warning'}
              dot
            />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Current Battery: {telemetry.current_soc}%</Text>
              <Text style={styles.progressTarget}>Target: {telemetry.target_soc}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${telemetry.current_soc}%` },
                ]}
              />
            </View>
          </View>

          {/* 9 Metrics specified in requirements */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>READY BY</Text>
              <Text style={[styles.metricVal, { color: colors.primaryLight }]}>
                {telemetry.estimated_completion_time}
              </Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>TIME REMAINING</Text>
              <Text style={styles.metricVal}>2h 22m</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>DELIVERED</Text>
              <Text style={styles.metricVal}>{telemetry.energy_delivered_kwh} kWh</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>EST. COST</Text>
              <Text style={[styles.metricVal, { color: colors.solarLight }]}>
                ₹{decision.estimated_cost_inr}
              </Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>CLEAN SHARE</Text>
              <Text style={[styles.metricVal, { color: colors.solarLight }]}>
                {decision.renewable_percentage}%
              </Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>SESSION DURATION</Text>
              <Text style={styles.metricVal}>{mockChargingSession.durationFormatted}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.primaryActionRow}>
            <Button
              title={isCharging ? 'Pause Charging' : 'Resume Charging'}
              size="md"
              variant={isCharging ? 'secondary' : 'primary'}
              icon={
                <Ionicons
                  name={isCharging ? 'pause-outline' : 'play-outline'}
                  size={18}
                  color={isCharging ? colors.textPrimary : colors.textInverse}
                />
              }
              onPress={toggleCharging}
              style={styles.actionBtnHalf}
            />

            <Button
              title="Charge Faster"
              size="md"
              variant="secondary"
              icon={<Ionicons name="flash-outline" size={18} color={colors.solar} />}
              onPress={() => router.push('/charge-faster-modal')}
              style={styles.actionBtnHalf}
            />
          </View>
        </Card>

        {/* TARGET BATTERY LIMIT SELECTOR */}
        <Card style={styles.controlCard}>
          <Text style={styles.cardTitle}>Set Target Battery</Text>
          <Text style={styles.cardSubtitle}>
            80%–85% is recommended for daily battery longevity.
          </Text>

          <View style={styles.targetPillRow}>
            {targetOptions.map((val) => {
              const isSelected = telemetry.target_soc === val;
              return (
                <TouchableOpacity
                  key={val}
                  onPress={() => setTargetSoc(val)}
                  style={[styles.targetPill, isSelected && styles.targetPillActive]}
                >
                  <Text style={[styles.targetPillText, isSelected && styles.targetPillTextActive]}>
                    {val}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* "WHY DID MY CHARGING CHANGE?" - SIMPLE HUMAN EXPLANATION */}
        <Card style={styles.whyCard}>
          <View style={styles.whyHeader}>
            <Ionicons name="help-circle-outline" size={22} color={colors.primaryLight} />
            <Text style={styles.whyHeaderTitle}>Why did my charging change?</Text>
          </View>

          <Text style={styles.whyChangeSummary}>
            Charging slowed to {telemetry.charging_power_kw} kW
          </Text>

          <View style={styles.whyReasonList}>
            <View style={styles.whyRow}>
              <Text style={styles.whyEmoji}>🏢</Text>
              <Text style={styles.whyText}>More electricity is being used in your building right now.</Text>
            </View>
            <View style={styles.whyRow}>
              <Text style={styles.whyEmoji}>⚡</Text>
              <Text style={styles.whyText}>Less charging capacity is available right now.</Text>
            </View>
            <View style={styles.whyRow}>
              <Text style={styles.whyEmoji}>🕐</Text>
              <Text style={styles.whyText}>You still have enough time before you leave tomorrow morning.</Text>
            </View>
            <View style={styles.whyRow}>
              <Text style={styles.whyEmoji}>✅</Text>
              <Text style={styles.whyText}>Your 85% target is still fully on track by 6:42 AM.</Text>
            </View>
          </View>
        </Card>

        {/* SMART CHARGING PLAN TIMELINE */}
        <Card style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <View>
              <Text style={styles.sectionLabel}>AUTOMATED ENERGY SCHEDULE</Text>
              <Text style={styles.cardTitle}>Smart Charging Plan</Text>
            </View>
            <Badge label="OPTIMIZED" variant="success" dot />
          </View>

          <View style={styles.timelineSteps}>
            {mockChargingPlan.steps.map((step, idx) => (
              <View key={idx} style={styles.stepItem}>
                <View style={styles.stepIndicatorCol}>
                  <View
                    style={[
                      styles.stepDot,
                      step.isCurrent && styles.stepDotCurrent,
                      step.isPaused && styles.stepDotPaused,
                      step.isTarget && styles.stepDotTarget,
                    ]}
                  />
                  {idx < mockChargingPlan.steps.length - 1 && <View style={styles.stepLine} />}
                </View>

                <View style={styles.stepContentCol}>
                  <View style={styles.stepTimeRow}>
                    <Text
                      style={[
                        styles.stepTime,
                        step.isCurrent && { color: colors.primaryLight, fontWeight: '800' },
                      ]}
                    >
                      {step.time}
                    </Text>
                    <Text
                      style={[
                        styles.stepKw,
                        step.isPaused
                          ? { color: colors.warning }
                          : step.isTarget
                          ? { color: colors.primaryLight }
                          : undefined,
                      ]}
                    >
                      {step.isPaused ? 'Paused' : step.isTarget ? 'Target 85%' : `${step.powerKw} kW`}
                    </Text>
                  </View>
                  <Text style={styles.stepDesc}>{step.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Why This Plan Summary */}
          <View style={styles.whyPlanBox}>
            <Text style={styles.whyPlanTitle}>Why this plan?</Text>
            {mockChargingPlan.whyThisPlan.map((bullet, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
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
  sessionCard: {
    gap: spacing.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  powerLarge: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  powerUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  progressContainer: {
    marginVertical: spacing.xs,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressTarget: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.solar,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  metricCol: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  primaryActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtnHalf: {
    flex: 1,
  },
  controlCard: {
    gap: spacing.xs,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  targetPillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  targetPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  targetPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  targetPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  targetPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  whyCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    gap: spacing.xs,
  },
  whyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  whyHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  whyChangeSummary: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginVertical: spacing.xs,
  },
  whyReasonList: {
    gap: spacing.sm,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  whyEmoji: {
    fontSize: 14,
    marginTop: 1,
  },
  whyText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
  timelineCard: {
    gap: spacing.md,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  timelineSteps: {
    gap: 0,
    marginTop: spacing.xs,
  },
  stepItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 16,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryMuted,
    marginTop: 3,
  },
  stepDotCurrent: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.textInverse,
  },
  stepDotPaused: {
    backgroundColor: colors.warning,
  },
  stepDotTarget: {
    backgroundColor: colors.solar,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    marginVertical: 4,
    minHeight: 28,
  },
  stepContentCol: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  stepTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  stepTime: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepKw: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  whyPlanBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  whyPlanTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  bulletText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
});
