import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, useThemeColors, spacing, typography, radii } from '../../src/theme';
import { useVehicleStore } from '../../src/store/useVehicleStore';
import { mockTrips } from '../../src/mock';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';

const CALENDAR_DAYS = [
  { id: 'today', label: 'Today', dateStr: 'Sep 18' },
  { id: 'tomorrow', label: 'Tomorrow', dateStr: 'Sep 19' },
  { id: 'sat', label: 'Sat', dateStr: 'Sep 20' },
  { id: 'sun', label: 'Sun', dateStr: 'Sep 21' },
  { id: 'mon', label: 'Mon', dateStr: 'Sep 22' },
];

const TIME_PRESETS = ['6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM'];
const TARGET_SOC_PRESETS = [75, 80, 85, 90, 100];

export default function ScheduleTabScreen() {
  const colors = useThemeColors();
  const { telemetry, setDepartureTime, setTargetSoc } = useVehicleStore();
  const [selectedDaysType, setSelectedDaysType] = useState<'weekdays' | 'weekends' | 'custom'>('weekdays');
  const [targetTripCreated, setTargetTripCreated] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('7:30 AM');

  const handleDaySelect = (dayLabel: string) => {
    setSelectedDay(dayLabel);
    setDepartureTime(`${dayLabel}, ${selectedTime}`);
  };

  const handleTimeSelect = (timeStr: string) => {
    setSelectedTime(timeStr);
    setDepartureTime(`${selectedDay}, ${timeStr}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Schedule & Trips"
        subtitle="Departure Readiness, Recurring Rules & Energy Plan"
        showNotificationBell={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. CHARGING CALENDAR / NEXT DEPARTURE HERO */}
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.sectionLabel}>CHARGING CALENDAR</Text>
              <Text style={styles.departureLarge}>{telemetry.departure_time}</Text>
            </View>
            <Badge label="SMART OPTIMIZED" variant="success" dot size="sm" />
          </View>

          {/* Interactive Date Selector Scrubber */}
          <Text style={styles.subHeading}>1. Select Departure Day</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarStrip}
          >
            {CALENDAR_DAYS.map((day) => {
              const isSelected = selectedDay === day.label;
              return (
                <TouchableOpacity
                  key={day.id}
                  onPress={() => handleDaySelect(day.label)}
                  style={[styles.dateTile, isSelected && styles.dateTileActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateTileDay, isSelected && styles.dateTileDayActive]}>
                    {day.label}
                  </Text>
                  <Text style={[styles.dateTileNum, isSelected && styles.dateTileNumActive]}>
                    {day.dateStr}
                  </Text>
                  {isSelected && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Interactive Time Selector */}
          <Text style={styles.subHeading}>2. Select Departure Time</Text>
          <View style={styles.presetRow}>
            {TIME_PRESETS.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  onPress={() => handleTimeSelect(time)}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={isSelected ? colors.primaryLight : colors.textMuted}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Target Battery Level Selector */}
          <Text style={styles.subHeading}>3. Target Battery Level</Text>
          <View style={styles.targetSocRow}>
            {TARGET_SOC_PRESETS.map((socVal) => {
              const isSelected = telemetry.target_soc === socVal;
              return (
                <TouchableOpacity
                  key={socVal}
                  onPress={() => setTargetSoc(socVal)}
                  style={[styles.socPill, isSelected && styles.socPillActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.socPillText, isSelected && styles.socPillTextActive]}>
                    {socVal}%{socVal === 85 ? ' (Eco)' : socVal === 100 ? ' (Trip)' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Guaranteed Readiness Summary */}
          <View style={styles.calendarSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>TARGET BATTERY</Text>
              <Text style={styles.summaryVal}>{telemetry.target_soc}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>READY BY</Text>
              <Text style={[styles.summaryVal, { color: colors.primaryLight }]}>
                {telemetry.estimated_completion_time}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>BUFFER</Text>
              <Text style={styles.summaryVal}>48 mins</Text>
            </View>
          </View>
        </Card>

        {/* 2. RECURRING SCHEDULE */}
        <Text style={styles.sectionTitle}>RECURRING SCHEDULE</Text>
        <Card style={styles.recurringCard}>
          <View style={styles.typeSelectorRow}>
            {(['weekdays', 'weekends', 'custom'] as const).map((type) => {
              const isSelected = selectedDaysType === type;
              const label = type === 'weekdays' ? 'Weekdays' : type === 'weekends' ? 'Weekends' : 'Custom';
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedDaysType(type)}
                  style={[styles.typePill, isSelected && styles.typePillActive]}
                >
                  <Text style={[styles.typePillText, isSelected && styles.typePillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Schedule Rule Card */}
          <View style={styles.ruleDetailsBox}>
            <View style={styles.ruleTopRow}>
              <View>
                <Text style={styles.ruleName}>
                  {selectedDaysType === 'weekdays'
                    ? 'Weekday Morning Routine (Mon–Fri)'
                    : selectedDaysType === 'weekends'
                    ? 'Weekend Leisure (Sat–Sun)'
                    : 'Custom Travel Plan'}
                </Text>
                <Text style={styles.ruleSub}>Automatic departure guarantee active</Text>
              </View>
              <Badge label="ACTIVE" variant="neutral" />
            </View>

            <View style={styles.ruleTimeline}>
              <View style={styles.ruleTimeCol}>
                <Text style={styles.timeLabelSmall}>PLUG IN</Text>
                <Text style={styles.timeValLarge}>6:00 PM</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
              <View style={styles.ruleTimeCol}>
                <Text style={styles.timeLabelSmall}>TARGET</Text>
                <Text style={[styles.timeValLarge, { color: colors.solarLight }]}>85%</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
              <View style={styles.ruleTimeCol}>
                <Text style={styles.timeLabelSmall}>LEAVE</Text>
                <Text style={[styles.timeValLarge, { color: colors.primaryLight }]}>7:30 AM</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* 3. TOMORROW'S ENERGY PLAN */}
        <Text style={styles.sectionTitle}>TOMORROW'S ENERGY PLAN</Text>
        <Card style={styles.energyPlanCard}>
          <View style={styles.planPoint}>
            <View style={styles.planIconSolar}>
              <Ionicons name="sunny" size={18} color={colors.solar} />
            </View>
            <View style={styles.planPointTextCol}>
              <Text style={styles.planPointTitle}>Best solar period</Text>
              <Text style={styles.planPointTime}>11:00 AM – 2:00 PM</Text>
              <Text style={styles.planPointSub}>Peak rooftop & community solar surplus</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.planPoint}>
            <View style={styles.planIconDemand}>
              <Ionicons name="trending-up" size={18} color={colors.warning} />
            </View>
            <View style={styles.planPointTextCol}>
              <Text style={styles.planPointTitle}>Higher electricity demand</Text>
              <Text style={styles.planPointTime}>6:30 PM – 9:00 PM</Text>
              <Text style={styles.planPointSub}>Evening grid strain; charging will temporarily slow</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Recommended slot */}
          <View style={styles.recommendedSlotBox}>
            <View style={styles.recHeader}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primaryLight} />
              <Text style={styles.recTitle}>Recommended Charging Window</Text>
            </View>
            <Text style={styles.recTime}>11:20 AM – 12:50 PM</Text>
            <Text style={styles.recExplain}>
              "We shifted flexible charging toward cleaner energy while keeping your EV ready on time."
            </Text>
          </View>
        </Card>

        {/* 4. TRIP READINESS CALCULATOR */}
        <Text style={styles.sectionTitle}>TRIP READINESS</Text>
        <Card style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <View style={styles.tripHeaderLeft}>
              <Text style={styles.tripRouteTitle}>
                {mockTrips.fromCity} → {mockTrips.toCity}
              </Text>
              <Text style={styles.tripSub}>Intercity Highway Route • {mockTrips.distanceKm} km</Text>
            </View>
            <Badge label="EXTRA CHARGE NEEDED" variant="warning" size="sm" dot style={styles.tripBadge} />
          </View>

          <View style={styles.tripMetricsGrid}>
            <View style={styles.tripBox}>
              <Text style={styles.tripBoxLabel}>TRIP DISTANCE</Text>
              <Text style={styles.tripBoxVal}>{mockTrips.distanceKm} km</Text>
            </View>
            <View style={styles.tripBox}>
              <Text style={styles.tripBoxLabel}>CURRENT RANGE</Text>
              <Text style={styles.tripBoxVal}>{mockTrips.currentRangeKm} km</Text>
            </View>
            <View style={styles.tripBox}>
              <Text style={styles.tripBoxLabel}>RECOMMENDED</Text>
              <Text style={[styles.tripBoxVal, { color: colors.solarLight }]}>
                {mockTrips.recommendedTargetSoc}%
              </Text>
            </View>
          </View>

          <View style={styles.tripDetails}>
            <Text style={styles.tripDetailText}>
              🔋 Additional charging required: ~{mockTrips.requiredKwh} kWh ({mockTrips.estimatedChargingTimeMin} mins on DC Fast).
            </Text>
          </View>

          <Button
            title={targetTripCreated ? 'Trip Charging Plan Created ✓' : 'Create Charging Plan for Trip'}
            size="md"
            variant={targetTripCreated ? 'secondary' : 'primary'}
            icon={<Ionicons name="map-outline" size={18} color={targetTripCreated ? colors.primaryLight : colors.textInverse} />}
            onPress={() => {
              setTargetTripCreated(true);
              Alert.alert(
                'Trip Plan Scheduled',
                `Target battery increased to ${mockTrips.recommendedTargetSoc}% before your trip to ${mockTrips.toCity}.`
              );
            }}
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
  scrollContent: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    gap: spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  departureLarge: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  calendarSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  subHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  calendarStrip: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  dateTile: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    position: 'relative',
  },
  dateTileActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  dateTileDay: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  dateTileDayActive: {
    color: colors.primaryLight,
  },
  dateTileNum: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  dateTileNumActive: {
    color: colors.textPrimary,
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  targetSocRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  socPill: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  socPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  socPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  socPillTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  presetChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  presetText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  presetTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: -4,
    marginLeft: 4,
  },
  recurringCard: {
    gap: spacing.md,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    padding: 3,
    borderRadius: radii.md,
  },
  typePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  typePillActive: {
    backgroundColor: colors.surface,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  typePillTextActive: {
    color: colors.primaryLight,
  },
  ruleDetailsBox: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  ruleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ruleName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ruleSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ruleTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  ruleTimeCol: {
    alignItems: 'center',
  },
  timeLabelSmall: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  timeValLarge: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  energyPlanCard: {
    gap: spacing.sm,
  },
  planPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: 2,
  },
  planIconSolar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.solarGhost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planIconDemand: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.warningGhost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planPointTextCol: {
    flex: 1,
  },
  planPointTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  planPointTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.solarLight,
    marginTop: 1,
  },
  planPointSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
  },
  recommendedSlotBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  recTime: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  recExplain: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  tripCard: {
    gap: spacing.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  tripHeaderLeft: {
    flex: 1,
    minWidth: 150,
  },
  tripBadge: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  tripRouteTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tripSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tripMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  tripBox: {
    alignItems: 'center',
    flex: 1,
  },
  tripBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tripBoxVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  tripDetails: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  tripDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
