import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { mockReservations, ReservationItem } from '../src/mock';
import { Header } from '../src/components/ui/Header';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';

export default function ReservationsScreen() {
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationItem[]>(mockReservations);

  const upcoming = reservations.filter((r) => r.status === 'Confirmed');
  const past = reservations.filter((r) => r.status !== 'Confirmed');

  const handleCancel = (id: string) => {
    Alert.alert(
      'Cancel Reservation?',
      'Are you sure you want to release this charger slot?',
      [
        { text: 'Keep Slot', style: 'cancel' },
        {
          text: 'Cancel Reservation',
          style: 'destructive',
          onPress: () => {
            setReservations((prev) =>
              prev.map((r) => (r.id === id ? { ...r, status: 'Cancelled' } : r))
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Reservations" subtitle="Booked Charging Slots & Locations" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Upcoming Section */}
        <Text style={styles.sectionHeading}>UPCOMING RESERVATIONS</Text>
        {upcoming.length > 0 ? (
          upcoming.map((res) => (
            <Card key={res.id} elevated style={styles.resCard}>
              <View style={styles.resHeader}>
                <View>
                  <Text style={styles.chargerTitle}>{res.slotNumber} • {res.chargerName}</Text>
                  <Text style={styles.locationText}>{res.location}</Text>
                </View>
                <Badge label="CONFIRMED" variant="success" dot />
              </View>

              <View style={styles.timeBox}>
                <Ionicons name="time-outline" size={18} color={colors.primaryLight} />
                <Text style={styles.timeText}>{res.date} • {res.timeSlot}</Text>
              </View>

              <View style={styles.actionRow}>
                <Button
                  title="Navigate"
                  size="sm"
                  variant="primary"
                  icon={<Ionicons name="navigate-outline" size={16} color={colors.textInverse} />}
                  onPress={() => Alert.alert('Navigation', `Guiding to ${res.chargerName}...`)}
                  style={styles.actionBtn}
                />
                <Button
                  title="Cancel"
                  size="sm"
                  variant="secondary"
                  onPress={() => handleCancel(res.id)}
                  style={styles.actionBtn}
                  textStyle={{ color: colors.danger }}
                />
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No upcoming charger reservations.</Text>
            <Button
              title="Explore & Reserve Chargers"
              size="sm"
              variant="outline"
              onPress={() => router.push('/(tabs)/explore')}
              style={styles.exploreBtn}
            />
          </Card>
        )}

        {/* Past Section */}
        <Text style={styles.sectionHeading}>PAST RESERVATIONS</Text>
        {past.map((res) => (
          <Card key={res.id} style={styles.pastCard}>
            <View style={styles.resHeader}>
              <View>
                <Text style={styles.pastTitle}>{res.slotNumber} • {res.chargerName}</Text>
                <Text style={styles.locationText}>{res.location}</Text>
                <Text style={styles.pastDate}>{res.date} • {res.timeSlot}</Text>
              </View>
              <Badge
                label={res.status.toUpperCase()}
                variant={res.status === 'Completed' ? 'neutral' : 'danger'}
              />
            </View>
          </Card>
        ))}
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
  sectionHeading: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: -4,
    marginLeft: 4,
  },
  resCard: {
    gap: spacing.md,
  },
  resHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chargerTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radii.md,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  exploreBtn: {
    marginTop: spacing.xs,
  },
  pastCard: {
    backgroundColor: colors.surfaceElevated,
    opacity: 0.85,
  },
  pastTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pastDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
});
