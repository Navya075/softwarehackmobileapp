import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, useThemeColors, spacing, typography, radii } from '../../src/theme';
import { useVehicleStore } from '../../src/store/useVehicleStore';
import { useEnergyStore } from '../../src/store/useEnergyStore';
import { useAppContextStore } from '../../src/store/useAppContextStore';
import {
  mockResidentialCommunity,
  mockCommercialEnergy,
} from '../../src/mock';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { BatteryGauge } from '../../src/components/ui/BatteryGauge';
import { StatCard } from '../../src/components/ui/StatCard';
import { ContextSwitcher } from '../../src/components/ui/ContextSwitcher';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { telemetry, toggleCharging, setEmergencyBoost, emergencyBoostActive, setTargetSoc, setDepartureTime } =
    useVehicleStore();
  const { gridState, decision } = useEnergyStore();
  const { chargingContext, leavingEarlyActive, leavingEarlyMinutes, cancelLeavingEarly } =
    useAppContextStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showRiskDemo, setShowRiskDemo] = useState(false); // Allows judges/testers to toggle Departure Risk UI

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const isCharging = telemetry.charging_status === 'charging';
  const isResidential = chargingContext === 'residential';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="My EV"
        subtitle={`${telemetry.make} ${telemetry.model} • ${telemetry.vehicle_id}`}
        showNotificationBell={true}
        rightAction={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: spacing.sm }}>
            <TouchableOpacity
              style={styles.addVehicleHeaderBtn}
              onPress={() => router.push('/add-vehicle')}
            >
              <Ionicons name="add-circle-outline" size={16} color={colors.primaryLight} />
              <Text style={styles.addVehicleHeaderText}>+ Add Vehicle</Text>
            </TouchableOpacity>
            <View style={styles.headerStatusPill}>
              <View style={[styles.onlineDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.onlineText}>Connected</Text>
            </View>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* 1. PERSISTENT CONTEXT SWITCHER: RESIDENTIAL ↔ COMMERCIAL / INDUSTRIAL */}
        <View style={styles.contextSwitcherWrapper}>
          <ContextSwitcher />
        </View>

        {/* HERO BATTERY & RANGE CARD */}
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.sectionLabel}>LIVE VEHICLE STATUS</Text>
              <Text style={styles.heroTitle}>Battery</Text>
            </View>
            <Badge
              label={isCharging ? 'CHARGING ACTIVE' : 'CHARGING PAUSED'}
              variant={isCharging ? 'success' : 'warning'}
              dot
            />
          </View>

          {/* Central Animated Battery Gauge */}
          <BatteryGauge
            soc={telemetry.current_soc}
            targetSoc={telemetry.target_soc}
            rangeKm={telemetry.estimated_range_km}
            isCharging={isCharging}
            chargingPowerKw={telemetry.charging_power_kw}
          />

          {/* Sub-metrics inside Hero */}
          <View style={styles.heroMetaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>TARGET</Text>
              <Text style={styles.metaValue}>{telemetry.target_soc}%</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>EST. RANGE</Text>
              <Text style={styles.metaValue}>{telemetry.estimated_range_km} km</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>CHARGER CONNECTION</Text>
              <Text style={[styles.metaValue, { color: colors.primary }]}>
                {telemetry.plug_status ? 'Plugged In' : 'Unplugged'}
              </Text>
            </View>
          </View>

          {/* Battery Health Link Pill */}
          <TouchableOpacity
            style={styles.batteryHealthPill}
            onPress={() => router.push('/battery-insights')}
            activeOpacity={0.7}
          >
            <Ionicons name="heart-circle-outline" size={16} color={colors.primaryLight} />
            <Text style={styles.batteryHealthText}>
              Battery Health: <Text style={styles.batteryHealthBold}>{telemetry.battery_health_score || 94}% Good</Text> • Usable: {telemetry.usable_capacity_kwh || 38.1}/{telemetry.battery_capacity_kwh || 40.5} kWh
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* PRIORITY CHARGING BANNER (If 'I'm Leaving Early' is active) */}
        {leavingEarlyActive && (
          <Card style={styles.leavingEarlyActiveCard}>
            <View style={styles.leavingEarlyRow}>
              <Ionicons name="rocket" size={22} color={colors.solar} />
              <View style={styles.leavingEarlyTextCol}>
                <Text style={styles.leavingEarlyTitle}>
                  Leaving Early: Priority Charging Active
                </Text>
                <Text style={styles.leavingEarlySub}>
                  Departure adjusted {leavingEarlyMinutes} mins earlier (Ready by 6:15 AM). Charging rate increased.
                </Text>
              </View>
              <TouchableOpacity onPress={cancelLeavingEarly}>
                <Text style={styles.revertText}>Revert</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* 2. DEPARTURE STATUS: GUARANTEED vs RISK ALERT */}
        {!showRiskDemo ? (
          <Card style={[styles.departureCard, styles.departureGuaranteed]}>
            <View style={styles.departureRow}>
              <View style={styles.departureIconBox}>
                <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
              </View>
              <View style={styles.departureContent}>
                <View style={styles.guaranteeTagRow}>
                  <Text style={[styles.guaranteeTag, { color: colors.primaryLight }]}>
                    🟢 Departure Guaranteed
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowRiskDemo(true)}
                    style={styles.simulateRiskLink}
                  >
                    <Text style={styles.simulateRiskText}>[Simulate Risk]</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.departureTimeText}>
                  Departure: {telemetry.departure_time}
                </Text>
                <Text style={styles.completionEstText}>
                  Ready by: {telemetry.estimated_completion_time} (48m buffer)
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          /* DEPARTURE RISK EXPERIENCE */
          <Card style={[styles.departureCard, styles.departureRisk]}>
            <View style={styles.riskHeader}>
              <Ionicons name="alert-circle" size={24} color={colors.danger} />
              <View style={styles.riskTitleCol}>
                <Text style={styles.riskTitle}>🔴 Your EV may not be ready in time</Text>
                <Text style={styles.riskDesc}>
                  High building demand reduced charging power. Predicted battery at 7:30 AM is 72% instead of 85%.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowRiskDemo(false)}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.riskMetricsRow}>
              <View style={styles.riskMetric}>
                <Text style={styles.riskMetricLabel}>CURRENT</Text>
                <Text style={styles.riskMetricVal}>{telemetry.current_soc}%</Text>
              </View>
              <View style={styles.riskMetric}>
                <Text style={styles.riskMetricLabel}>TARGET</Text>
                <Text style={styles.riskMetricVal}>{telemetry.target_soc}%</Text>
              </View>
              <View style={styles.riskMetric}>
                <Text style={styles.riskMetricLabel}>DEPARTURE</Text>
                <Text style={styles.riskMetricVal}>7:30 AM</Text>
              </View>
              <View style={styles.riskMetric}>
                <Text style={styles.riskMetricLabel}>PREDICTED</Text>
                <Text style={[styles.riskMetricVal, { color: colors.danger }]}>72%</Text>
              </View>
            </View>

            <Text style={styles.riskPrompt}>What would you like to do?</Text>
            <View style={styles.riskActionsRow}>
              <Button
                title="Charge Faster"
                size="sm"
                variant="primary"
                onPress={() => router.push('/charge-faster-modal')}
                style={styles.riskBtn}
              />
              <Button
                title="Lower Target (75%)"
                size="sm"
                variant="secondary"
                onPress={() => {
                  setTargetSoc(75);
                  setShowRiskDemo(false);
                  Alert.alert('Target Adjusted', 'Target lowered to 75%. Departure is now guaranteed.');
                }}
                style={styles.riskBtn}
              />
              <Button
                title="Change Departure"
                size="sm"
                variant="secondary"
                onPress={() => {
                  setDepartureTime('Tomorrow, 8:15 AM');
                  setShowRiskDemo(false);
                  Alert.alert('Departure Updated', 'Departure moved to 8:15 AM.');
                }}
                style={styles.riskBtn}
              />
            </View>
          </Card>
        )}

        {/* POWER, SOLAR & COST METRICS */}
        <View style={styles.metricsGrid}>
          <StatCard
            label="CHARGING"
            value={telemetry.charging_power_kw}
            unit="kW"
            icon={<Ionicons name="flash" size={16} color={colors.primary} />}
            subtitle="Modulated by AI"
            accentColor={colors.primaryLight}
          />

          <StatCard
            label="RENEWABLE"
            value={decision.renewable_percentage}
            unit="%"
            icon={<Ionicons name="leaf" size={16} color={colors.solar} />}
            subtitle="Solar synchronized"
            accentColor={colors.solar}
          />

          <StatCard
            label="EST. COST"
            value={`₹${decision.estimated_cost_inr}`}
            icon={<Ionicons name="cash-outline" size={16} color={colors.textPrimary} />}
            subtitle="Lower-cost period"
            accentColor={colors.textPrimary}
          />
        </View>

        {/* 3. CONTEXT-SPECIFIC ENERGY CARD: RESIDENTIAL vs COMMERCIAL / INDUSTRIAL */}
        {isResidential ? (
          /* RESIDENTIAL COMMUNITY ENERGY CARD */
          <Card style={styles.gridContextCard}>
            <View style={styles.gridHeaderRow}>
              <View style={styles.gridTitleCol}>
                <Text style={styles.sectionLabel}>ENERGY AROUND YOU</Text>
                <Text style={styles.gridTitle}>
                  {mockResidentialCommunity.communityName} Community Energy
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/smart-plan-modal')}
                activeOpacity={0.7}
                style={styles.whyButton}
              >
                <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
                <Text style={styles.whyText}>Why 3.2 kW?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.gridMetricsRow}>
              <View style={styles.gridMetricCol}>
                <Text style={styles.gridMetricLabel}>Building Demand</Text>
                <Text style={styles.gridMetricValue}>
                  {mockResidentialCommunity.buildingElectricityUseKw} kW
                </Text>
              </View>
              <View style={styles.gridMetricCol}>
                <Text style={styles.gridMetricLabel}>EV Charging</Text>
                <Text style={styles.gridMetricValue}>
                  {mockResidentialCommunity.evChargingKw} kW
                </Text>
              </View>
              <View style={styles.gridMetricCol}>
                <Text style={styles.gridMetricLabel}>Solar</Text>
                <Text style={[styles.gridMetricValue, { color: colors.solar }]}>
                  {mockResidentialCommunity.solarGenerationKw} kW
                </Text>
              </View>
              <View style={styles.gridMetricCol}>
                <Text style={styles.gridMetricLabel}>Grid Status</Text>
                <Text style={[styles.gridMetricValue, { color: colors.primaryLight }]}>
                  {mockResidentialCommunity.gridStatus}
                </Text>
              </View>
            </View>

            <Text style={styles.capacityFootnote}>
              💡 {mockResidentialCommunity.explanation}
            </Text>
          </Card>
        ) : (
          /* COMMERCIAL / INDUSTRIAL FACILITY CARD */
          <Card style={styles.gridContextCard}>
            <View style={styles.gridHeaderRow}>
              <View style={styles.gridTitleCol}>
                <Text style={styles.sectionLabel}>ENERGY AROUND YOU</Text>
                <Text style={styles.gridTitle}>
                  {mockCommercialEnergy.facilityName} Commercial Hub
                </Text>
              </View>
              <Badge label="120 kW FAST" variant="info" />
            </View>

            <View style={styles.gridMetricsRow}>
              <View style={styles.gridMetricCol}>
                <Text style={styles.gridMetricLabel}>Charger Status</Text>
                <Text style={[styles.gridMetricValue, { color: colors.primaryLight }]}>
                  {mockCommercialEnergy.chargingStatus}
                </Text>
              </View>
              <View style={styles.gridMetricCol}>
                <Text style={styles.gridMetricLabel}>Solar Level</Text>
                <Text style={[styles.gridMetricValue, { color: colors.solar }]}>
                  {mockCommercialEnergy.solarLevel}
                </Text>
              </View>
              <View style={styles.gridMetricCol}>
                <Text style={styles.gridMetricLabel}>Grid Demand</Text>
                <Text style={styles.gridMetricValue}>
                  {mockCommercialEnergy.electricityDemand}
                </Text>
              </View>
              <View style={styles.gridMetricCol}>
                <Text style={styles.gridMetricLabel}>Electricity Price</Text>
                <Text style={[styles.gridMetricValue, { color: colors.solarLight }]}>
                  {mockCommercialEnergy.currentChargingPrice}
                </Text>
              </View>
            </View>

            <View style={styles.commercialStaySummary}>
              <Text style={styles.commercialStayText}>
                ⏱️ Stay Duration: 2 hrs • Possible energy: 18 kWh • Est. battery: 67%
              </Text>
              <TouchableOpacity onPress={() => router.push('/charger-details')}>
                <Text style={styles.detailsLink}>View Details →</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* PRIMARY CTA: VIEW SMART CHARGING PLAN */}
        <Button
          title="View Smart Charging Plan"
          size="lg"
          variant="primary"
          icon={<Ionicons name="analytics-outline" size={20} color={colors.textInverse} />}
          onPress={() => router.push('/smart-plan-modal')}
          style={styles.primaryCta}
        />

        {/* ACTION BUTTONS: CHARGE FASTER & LEAVING EARLY */}
        <View style={styles.quickActionsRow}>
          <Button
            title={emergencyBoostActive ? 'Fast Charging (11 kW)' : 'Charge Faster'}
            size="md"
            variant={emergencyBoostActive ? 'danger' : 'secondary'}
            icon={<Ionicons name="flash-outline" size={18} color={colors.solar} />}
            onPress={() => router.push('/charge-faster-modal')}
            style={styles.quickActionBtn}
          />

          <Button
            title="I'm Leaving Early"
            size="md"
            variant="secondary"
            icon={<Ionicons name="time-outline" size={18} color={colors.textPrimary} />}
            onPress={() => router.push('/leaving-early-modal')}
            style={styles.quickActionBtn}
          />
        </View>

        {/* PAUSE / RESUME TOGGLE */}
        <Button
          title={isCharging ? 'Pause Charging' : 'Resume Charging'}
          size="sm"
          variant="ghost"
          icon={
            <Ionicons
              name={isCharging ? 'pause-outline' : 'play-outline'}
              size={16}
              color={colors.textSecondary}
            />
          }
          onPress={toggleCharging}
          style={styles.pauseBtn}
          textStyle={{ color: colors.textSecondary }}
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
  addVehicleHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryGhost,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 4,
  },
  addVehicleHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  headerStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  contextSwitcherWrapper: {
    marginBottom: spacing.xs,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    marginBottom: spacing.base,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    ...typography.caption,
    letterSpacing: 1,
    color: colors.textMuted,
    fontWeight: '700',
  },
  heroTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 2,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSubtle,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.surfaceBorderSubtle,
  },
  batteryHealthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSubtle,
  },
  batteryHealthText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  batteryHealthBold: {
    fontWeight: '700',
    color: colors.primaryLight,
  },
  leavingEarlyActiveCard: {
    backgroundColor: colors.solarGhost,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: spacing.base,
  },
  leavingEarlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  leavingEarlyTextCol: {
    flex: 1,
  },
  leavingEarlyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.solarLight,
  },
  leavingEarlySub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  revertText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  departureCard: {
    marginBottom: spacing.base,
    paddingVertical: spacing.md,
  },
  departureGuaranteed: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  departureRisk: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    gap: spacing.sm,
  },
  departureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  departureIconBox: {
    marginRight: spacing.md,
  },
  departureContent: {
    flex: 1,
  },
  guaranteeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  guaranteeTag: {
    fontSize: 13,
    fontWeight: '700',
  },
  simulateRiskLink: {
    paddingHorizontal: 4,
  },
  simulateRiskText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  departureTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  completionEstText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  riskTitleCol: {
    flex: 1,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  riskDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  riskMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  riskMetric: {
    alignItems: 'center',
    flex: 1,
  },
  riskMetricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  riskMetricVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 1,
  },
  riskPrompt: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  riskActionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  riskBtn: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  gridContextCard: {
    marginBottom: spacing.base,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  gridTitleCol: {
    flex: 1,
  },
  gridTitle: {
    ...typography.h3,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 2,
  },
  whyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryGhost,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  whyText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
    marginLeft: 4,
  },
  gridMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  gridMetricCol: {
    alignItems: 'center',
    flex: 1,
  },
  gridMetricLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
  },
  gridMetricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  capacityFootnote: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  commercialStaySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  commercialStayText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  detailsLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.grid,
    marginLeft: spacing.xs,
  },
  primaryCta: {
    marginBottom: spacing.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  quickActionBtn: {
    flex: 1,
  },
  pauseBtn: {
    alignSelf: 'center',
  },
});
