import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { mockChargers } from '../src/mock';
import { useAppContextStore } from '../src/store/useAppContextStore';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';

const STAY_OPTIONS = [
  { label: '30 min', value: 30, energyKwh: 4.5, expectedSoc: 43 },
  { label: '1 hour', value: 60, energyKwh: 9.0, expectedSoc: 51 },
  { label: '2 hours', value: 120, energyKwh: 18.0, expectedSoc: 67 },
  { label: '3 hours', value: 180, energyKwh: 27.0, expectedSoc: 85 },
];

export default function ChargerDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const chargerId = (params.chargerId as string) || 'ch_phoenix_07';
  const charger = mockChargers.find((c) => c.id === chargerId) || mockChargers[0];

  const {
    stayDurationMinutes,
    setStayDurationMinutes,
    queueJoined,
    queuePosition,
    estimatedWaitMinutes,
    joinQueue,
    leaveQueue,
    chargingContext,
  } = useAppContextStore();

  const [selectedStay, setSelectedStay] = useState(stayDurationMinutes);
  const currentStayOption = STAY_OPTIONS.find((s) => s.value === selectedStay) || STAY_OPTIONS[2];

  // Cost calculation for commercial stay
  const estChargingCost = Math.round(currentStayOption.energyKwh * charger.pricePerKwh);
  const parkingHours = selectedStay / 60;
  const parkingCost = (charger.parkingPricePerHour || 0) * parkingHours;
  const serviceFee = 10;
  const totalCost = estChargingCost + parkingCost + serviceFee;

  const isOccupied = charger.availableCount === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/home');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.navTitleCol}>
          <Text style={styles.navTitle}>{charger.name}</Text>
          <Text style={styles.navSubtitle}>{charger.location}</Text>
        </View>
        <Badge
          label={isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
          variant={isOccupied ? 'danger' : 'success'}
          dot
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Charger Specs Card */}
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.sectionLabel}>STATION HARDWARE</Text>
              <Text style={styles.chargerTitle}>{charger.name} • Slot C07</Text>
            </View>
            <Badge label={charger.speedType} variant="info" />
          </View>

          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>SPEED</Text>
              <Text style={styles.specValue}>{charger.powerKw} kW</Text>
              <Text style={styles.specSub}>Peak Power</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>CONNECTOR</Text>
              <Text style={styles.specValue}>{charger.connector}</Text>
              <Text style={styles.specSub}>Standard</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>ELECTRICITY</Text>
              <Text style={[styles.specValue, { color: colors.solarLight }]}>
                ₹{charger.pricePerKwh}
              </Text>
              <Text style={styles.specSub}>per kWh</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>EST. TIME</Text>
              <Text style={styles.specValue}>{charger.estimatedChargingMin}m</Text>
              <Text style={styles.specSub}>to 80%</Text>
            </View>
          </View>

          <View style={styles.amenitiesRow}>
            <View style={styles.amenityItem}>
              <Ionicons name="car-outline" size={16} color={colors.primary} />
              <Text style={styles.amenityText}>
                Parking: {charger.parkingPricePerHour ? `₹${charger.parkingPricePerHour}/hr` : 'Free'}
              </Text>
            </View>
            {charger.isSolarPowered && (
              <View style={styles.amenityItem}>
                <Ionicons name="sunny-outline" size={16} color={colors.solar} />
                <Text style={styles.amenityText}>Solar Synchronized</Text>
              </View>
            )}
          </View>
        </Card>

        {/* SMART QUEUE (If all chargers occupied) */}
        {isOccupied && (
          <Card style={styles.queueCard}>
            <View style={styles.queueHeader}>
              <Ionicons name="people-outline" size={24} color={colors.warning} />
              <View style={styles.queueTitleCol}>
                <Text style={styles.queueTitle}>All chargers are currently occupied</Text>
                <Text style={styles.queueSubtitle}>
                  {queueJoined ? `You are #${queuePosition} in line` : 'Queue is open for automatic assignment'}
                </Text>
              </View>
            </View>

            <View style={styles.queueStatsRow}>
              <View style={styles.queueStatItem}>
                <Text style={styles.queueStatLabel}>ESTIMATED WAIT</Text>
                <Text style={styles.queueStatValue}>{estimatedWaitMinutes} min</Text>
              </View>
              <View style={styles.queueStatItem}>
                <Text style={styles.queueStatLabel}>POSITION IN QUEUE</Text>
                <Text style={[styles.queueStatValue, { color: colors.solarLight }]}>
                  {queueJoined ? `#${queuePosition}` : 'Not Joined'}
                </Text>
              </View>
            </View>

            <Text style={styles.queueFootnote}>
              Smart Queue factors in vehicle battery level, required energy, and user departure time.
            </Text>

            <Button
              title={queueJoined ? 'Leave Smart Queue' : 'Join Smart Queue (3rd in line)'}
              size="md"
              variant={queueJoined ? 'secondary' : 'primary'}
              onPress={() => {
                if (queueJoined) {
                  leaveQueue();
                  Alert.alert('Left Queue', 'You have been removed from the charging queue.');
                } else {
                  joinQueue();
                  Alert.alert('Joined Queue', 'You are #3 in line. We will notify you when slot C07 frees up.');
                }
              }}
              style={styles.queueBtn}
              textStyle={queueJoined ? { color: colors.danger } : undefined}
            />
          </Card>
        )}

        {/* STAY DURATION CALCULATOR (Commercial / Workplace / Mall) */}
        <Card style={styles.stayCard}>
          <Text style={styles.cardSectionTitle}>HOW LONG WILL YOU STAY?</Text>
          <Text style={styles.cardSectionSubtitle}>
            Helps the system calculate expected battery gain and coordinate energy demand.
          </Text>

          <View style={styles.stayPillRow}>
            {STAY_OPTIONS.map((opt) => {
              const isSelected = selectedStay === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => {
                    setSelectedStay(opt.value);
                    setStayDurationMinutes(opt.value);
                  }}
                  style={[styles.stayPill, isSelected && styles.stayPillActive]}
                >
                  <Text style={[styles.stayPillText, isSelected && styles.stayPillTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Expected Battery Outcome */}
          <View style={styles.outcomeBox}>
            <View style={styles.outcomeRow}>
              <Text style={styles.outcomeLabel}>Current Battery</Text>
              <Text style={styles.outcomeValue}>48%</Text>
            </View>
            <View style={styles.outcomeRow}>
              <Text style={styles.outcomeLabel}>Stay Duration</Text>
              <Text style={styles.outcomeValue}>{currentStayOption.label}</Text>
            </View>
            <View style={styles.outcomeRow}>
              <Text style={styles.outcomeLabel}>Possible Energy Added</Text>
              <Text style={styles.outcomeValue}>{currentStayOption.energyKwh} kWh</Text>
            </View>
            <View style={styles.outcomeRowTotal}>
              <Text style={styles.outcomeLabelTotal}>Expected Battery on Departure</Text>
              <Text style={styles.outcomeValueTotal}>{currentStayOption.expectedSoc}%</Text>
            </View>
          </View>
        </Card>

        {/* PARKING + CHARGING COST BREAKDOWN */}
        <Card style={styles.costBreakdownCard}>
          <Text style={styles.cardSectionTitle}>PARKING & CHARGING COST BREAKDOWN</Text>

          <View style={styles.costTable}>
            <View style={styles.costRow}>
              <Text style={styles.costRowLabel}>
                Charging ({currentStayOption.energyKwh} kWh @ ₹{charger.pricePerKwh}/kWh)
              </Text>
              <Text style={styles.costRowVal}>₹{estChargingCost}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costRowLabel}>
                Parking ({parkingHours} hr @ ₹{charger.parkingPricePerHour || 0}/hr)
              </Text>
              <Text style={styles.costRowVal}>₹{parkingCost}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costRowLabel}>Convenience / Service Fee</Text>
              <Text style={styles.costRowVal}>₹{serviceFee}</Text>
            </View>
            <View style={styles.costDivider} />
            <View style={styles.costRowTotal}>
              <Text style={styles.totalLabel}>Estimated Total</Text>
              <Text style={styles.totalAmount}>₹{totalCost}</Text>
            </View>
          </View>
        </Card>

        {/* Bottom Actions: Reserve & Navigate */}
        <View style={styles.bottomActions}>
          <Button
            title="Reserve This Charger"
            size="lg"
            variant="primary"
            icon={<Ionicons name="calendar-outline" size={20} color={colors.textInverse} />}
            onPress={() =>
              router.push({
                pathname: '/reserve-charger',
                params: { chargerId: charger.id },
              })
            }
            style={styles.actionBtn}
          />

          <Button
            title="Navigate in Maps"
            size="md"
            variant="secondary"
            icon={<Ionicons name="navigate-outline" size={18} color={colors.textPrimary} />}
            onPress={() => Alert.alert('Navigation Started', `Guiding to ${charger.name}...`)}
            style={styles.actionBtn}
          />
        </View>
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
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorderSubtle,
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  navTitleCol: {
    flex: 1,
  },
  navTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  navSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    marginBottom: spacing.xs,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  chargerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 2,
  },
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  specBox: {
    alignItems: 'center',
    flex: 1,
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  specValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  specSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSubtle,
    paddingTop: spacing.sm,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amenityText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  queueCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: spacing.sm,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  queueTitleCol: {
    flex: 1,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.solarLight,
  },
  queueSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  queueStatsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    justifyContent: 'space-around',
    marginTop: spacing.xs,
  },
  queueStatItem: {
    alignItems: 'center',
  },
  queueStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  queueStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  queueFootnote: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
  },
  queueBtn: {
    marginTop: spacing.xs,
  },
  stayCard: {
    gap: spacing.xs,
  },
  cardSectionTitle: {
    ...typography.label,
    color: colors.textMuted,
  },
  cardSectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  stayPillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  stayPill: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  stayPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  stayPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stayPillTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  outcomeBox: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  outcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outcomeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  outcomeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  outcomeRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSubtle,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  outcomeLabelTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  outcomeValueTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  costBreakdownCard: {
    gap: spacing.xs,
  },
  costTable: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costRowLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  costRowVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  costDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
    marginVertical: spacing.xs,
  },
  costRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.solarLight,
  },
  bottomActions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    width: '100%',
  },
});
