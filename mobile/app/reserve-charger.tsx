import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { mockChargers } from '../src/mock';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { Badge } from '../src/components/ui/Badge';

const DATE_OPTIONS = [
  { id: 'd1', label: 'Today', sub: 'Sep 18' },
  { id: 'd2', label: 'Tomorrow', sub: 'Sep 19' },
  { id: 'd3', label: 'Saturday', sub: 'Sep 20' },
  { id: 'd4', label: 'Sunday', sub: 'Sep 21' },
];

interface SlotItem {
  id: string;
  timeRange: string;
  isAvailable: boolean;
  statusTag?: string;
  tagVariant?: 'success' | 'warning' | 'solar' | 'neutral';
}

const DETAILED_SLOTS: SlotItem[] = [
  { id: 's1', timeRange: '09:00 AM – 10:00 AM', isAvailable: true, statusTag: 'Available', tagVariant: 'neutral' },
  { id: 's2', timeRange: '11:00 AM – 12:30 PM', isAvailable: true, statusTag: 'Peak Solar ☀️', tagVariant: 'solar' },
  { id: 's3', timeRange: '02:00 PM – 03:00 PM', isAvailable: false, statusTag: 'Booked', tagVariant: 'warning' },
  { id: 's4', timeRange: '04:30 PM – 05:30 PM', isAvailable: true, statusTag: 'Available', tagVariant: 'success' },
  { id: 's5', timeRange: '06:30 PM – 07:30 PM', isAvailable: true, statusTag: 'High Demand', tagVariant: 'warning' },
  { id: 's6', timeRange: '08:00 PM – 09:30 PM', isAvailable: true, statusTag: 'Off-Peak Rate', tagVariant: 'success' },
];

export default function ReserveChargerModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const chargerId = params.chargerId as string;
  const charger = mockChargers.find((c) => c.id === chargerId) || mockChargers[0];

  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM – 12:30 PM');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const handleCancelReservation = () => {
    setIsConfirmed(false);
    Alert.alert('Reservation Cancelled', 'Your charger reservation has been cancelled.');
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
          <Text style={styles.navTitle}>Reserve a Charger</Text>
          <Text style={styles.navSubtitle}>{charger.name} • {charger.connector}</Text>
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
        {!isConfirmed ? (
          <>
            {/* Charger preview card */}
            <Card style={styles.previewCard}>
              <View style={styles.previewRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="flash" size={24} color={colors.primary} />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.chargerName}>{charger.name}</Text>
                  <Text style={styles.chargerLocation}>{charger.location}</Text>
                  <Text style={styles.chargerSpecs}>
                    {charger.speedType} ({charger.powerKw} kW) • ₹{charger.pricePerKwh}/kWh
                  </Text>
                </View>
              </View>
            </Card>

            {/* Date Selection */}
            <Text style={styles.sectionHeading}>SELECT DATE</Text>
            <View style={styles.dateRow}>
              {DATE_OPTIONS.map((d) => {
                const isSelected = selectedDate === d.label;
                return (
                  <TouchableOpacity
                    key={d.id}
                    onPress={() => setSelectedDate(d.label)}
                    style={[styles.dateCard, isSelected && styles.dateCardActive]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dateCardLabel, isSelected && styles.dateCardLabelActive]}>
                      {d.label}
                    </Text>
                    <Text style={[styles.dateCardSub, isSelected && styles.dateCardSubActive]}>
                      {d.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Slot Selection */}
            <Text style={styles.sectionHeading}>AVAILABLE TIME SLOTS</Text>
            <View style={styles.slotList}>
              {DETAILED_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot.timeRange;
                const isAvailable = slot.isAvailable;

                return (
                  <TouchableOpacity
                    key={slot.id}
                    disabled={!isAvailable}
                    onPress={() => setSelectedSlot(slot.timeRange)}
                    style={[
                      styles.slotCard,
                      isSelected && styles.slotCardActive,
                      !isAvailable && styles.slotCardDisabled,
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.slotLeftRow}>
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={
                          !isAvailable
                            ? colors.textMuted
                            : isSelected
                            ? colors.primary
                            : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.slotText,
                          isSelected && styles.slotTextActive,
                          !isAvailable && styles.slotTextDisabled,
                        ]}
                      >
                        {slot.timeRange}
                      </Text>
                    </View>

                    {slot.statusTag && (
                      <Badge
                        label={slot.statusTag}
                        variant={slot.tagVariant || 'neutral'}
                        size="sm"
                        dot={isAvailable}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cost Preview */}
            <Card style={styles.costCard}>
              <Text style={styles.costHeading}>ESTIMATED RESERVATION COST</Text>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Energy (Est. 16 kWh @ ₹{charger.pricePerKwh}/kWh)</Text>
                <Text style={styles.costVal}>₹{16 * charger.pricePerKwh}</Text>
              </View>
              {charger.parkingPricePerHour ? (
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Parking fee (1 hour held)</Text>
                  <Text style={styles.costVal}>₹{charger.parkingPricePerHour}</Text>
                </View>
              ) : null}
              <View style={styles.costRowTotal}>
                <Text style={styles.costLabelTotal}>Total Estimated</Text>
                <Text style={styles.costValTotal}>
                  ₹{16 * charger.pricePerKwh + (charger.parkingPricePerHour || 0)}
                </Text>
              </View>
            </Card>

            <Button
              title="Confirm Charger Reservation"
              size="lg"
              variant="primary"
              onPress={handleConfirm}
              style={styles.confirmBtn}
            />
          </>
        ) : (
          /* Confirmation State */
          <View style={styles.confirmedContainer}>
            <View style={styles.checkIconCircle}>
              <Ionicons name="checkmark" size={40} color={colors.textInverse} />
            </View>

            <Text style={styles.confirmedTitle}>Reservation Confirmed!</Text>
            <Text style={styles.confirmedSubtitle}>
              Your charging slot has been held and synced with building energy management.
            </Text>

            <Card elevated style={styles.ticketCard}>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>CHARGER</Text>
                <Text style={styles.ticketVal}>{charger.name}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>LOCATION</Text>
                <Text style={styles.ticketVal}>{charger.location}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>DATE & TIME</Text>
                <Text style={[styles.ticketVal, { color: colors.primaryLight }]}>
                  {selectedDate}, {selectedSlot}
                </Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>CONNECTOR & POWER</Text>
                <Text style={styles.ticketVal}>
                  {charger.connector} • {charger.powerKw} kW {charger.speedType}
                </Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>ESTIMATED COST</Text>
                <Text style={[styles.ticketVal, { color: colors.solarLight }]}>
                  ₹{16 * charger.pricePerKwh + (charger.parkingPricePerHour || 0)}
                </Text>
              </View>

              <View style={styles.ticketNoticeBox}>
                <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.ticketNoticeText}>
                  We will hold this slot for 15 minutes past start time. You will receive a push notification 30 minutes before arrival.
                </Text>
              </View>
            </Card>

            <View style={styles.confirmedActions}>
              <Button
                title="Navigate to Charger"
                size="lg"
                variant="primary"
                icon={<Ionicons name="navigate-outline" size={20} color={colors.textInverse} />}
                onPress={() => {
                  Alert.alert('Opening Navigation', `Routing to ${charger.location}...`);
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/(tabs)/home');
                  }
                }}
              />

              <Button
                title="Cancel Reservation"
                size="md"
                variant="secondary"
                onPress={handleCancelReservation}
                textStyle={{ color: colors.danger }}
              />
            </View>
          </View>
        )}
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
  previewCard: {
    backgroundColor: colors.surfaceElevated,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryGhost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  chargerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chargerLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chargerSpecs: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeading: {
    ...typography.label,
    color: colors.textMuted,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dateCard: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  dateCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  dateCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dateCardLabelActive: {
    color: colors.primaryLight,
  },
  dateCardSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  dateCardSubActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  slotList: {
    gap: spacing.xs,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  slotCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  slotCardDisabled: {
    opacity: 0.45,
    backgroundColor: colors.surfaceBorderSubtle,
  },
  slotLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  slotTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  slotTextDisabled: {
    color: colors.textMuted,
  },
  costCard: {
    gap: spacing.xs,
  },
  costHeading: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  costLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  costVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  costRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSubtle,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  costLabelTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  costValTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.solarLight,
  },
  confirmBtn: {
    marginTop: spacing.md,
  },
  confirmedContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.base,
  },
  checkIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  confirmedTitle: {
    ...typography.h1,
    fontSize: 24,
    color: colors.textPrimary,
  },
  confirmedSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.base,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  ticketLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  ticketVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ticketNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.primaryGhost,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  ticketNoticeText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
  confirmedActions: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
