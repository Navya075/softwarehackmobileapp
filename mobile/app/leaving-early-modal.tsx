import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { useAppContextStore } from '../src/store/useAppContextStore';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { Badge } from '../src/components/ui/Badge';

const EARLY_OPTIONS = [
  { label: '15 mins earlier', value: 15 },
  { label: '30 mins earlier', value: 30 },
  { label: '45 mins earlier', value: 45 },
  { label: '1 hour earlier', value: 60 },
];

export default function LeavingEarlyModal() {
  const router = useRouter();
  const { setLeavingEarly, leavingEarlyActive, cancelLeavingEarly } = useAppContextStore();
  const [selectedMinutes, setSelectedMinutes] = useState(30);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activated, setActivated] = useState(leavingEarlyActive);

  const handleApply = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setActivated(true);
      setLeavingEarly(selectedMinutes);
    }, 700);
  };

  const handleRevert = () => {
    cancelLeavingEarly();
    setActivated(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <View style={styles.navTitleCol}>
          <Text style={styles.navTitle}>I'm Leaving Early</Text>
          <Text style={styles.navSubtitle}>Update your departure to speed up charging</Text>
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
        {!activated ? (
          <>
            <Text style={styles.sectionHeading}>HOW MUCH EARLIER DO YOU NEED TO LEAVE?</Text>
            <View style={styles.optionList}>
              {EARLY_OPTIONS.map((opt) => {
                const isSelected = selectedMinutes === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.8}
                    onPress={() => setSelectedMinutes(opt.value)}
                    style={[styles.optionCard, isSelected && styles.optionCardActive]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {isCalculating ? (
              <Card style={styles.calcCard}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.calcText}>Recalculating your charging plan...</Text>
              </Card>
            ) : (
              <Button
                title="Update Charging Plan"
                size="lg"
                variant="primary"
                icon={<Ionicons name="flash-outline" size={20} color={colors.textInverse} />}
                onPress={handleApply}
                style={styles.applyBtn}
              />
            )}
          </>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.priorityBadgeBox}>
              <Badge label="PRIORITY CHARGING ACTIVATED" variant="warning" dot />
            </View>

            <Card elevated style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="rocket-outline" size={28} color={colors.solar} />
                <View style={styles.resultHeaderCol}>
                  <Text style={styles.resultTitle}>Early Departure Scheduled</Text>
                  <Text style={styles.resultSubtitle}>
                    Leaving {selectedMinutes} minutes earlier (New Departure: 7:00 AM)
                  </Text>
                </View>
              </View>

              <View style={styles.recalcGrid}>
                <View style={styles.recalcItem}>
                  <Text style={styles.recalcLabel}>REQUIRED BATTERY</Text>
                  <Text style={styles.recalcValue}>85%</Text>
                </View>
                <View style={styles.recalcItem}>
                  <Text style={styles.recalcLabel}>AVAILABLE POWER</Text>
                  <Text style={[styles.recalcValue, { color: colors.solarLight }]}>5.5 kW</Text>
                </View>
              </View>

              <View style={styles.recalcGrid}>
                <View style={styles.recalcItem}>
                  <Text style={styles.recalcLabel}>NEW READY-BY TIME</Text>
                  <Text style={[styles.recalcValue, { color: colors.primaryLight }]}>6:15 AM</Text>
                </View>
                <View style={styles.recalcItem}>
                  <Text style={styles.recalcLabel}>ESTIMATED COST</Text>
                  <Text style={styles.recalcValue}>₹82</Text>
                </View>
              </View>
            </Card>

            <Button
              title="Return to Dashboard"
              size="lg"
              variant="primary"
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/home');
                }
              }}
              style={styles.doneBtn}
            />

            <Button
              title="Cancel Early Departure"
              size="md"
              variant="ghost"
              onPress={handleRevert}
              textStyle={{ color: colors.textSecondary }}
            />
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
  },
  sectionHeading: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  optionList: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.base,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  optionText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionTextActive: {
    color: colors.primaryLight,
  },
  calcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  calcText: {
    fontSize: 14,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  applyBtn: {
    marginTop: spacing.md,
  },
  resultContainer: {
    gap: spacing.base,
  },
  priorityBadgeBox: {
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  resultHeaderCol: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resultSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recalcGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  recalcItem: {
    flex: 1,
  },
  recalcLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  recalcValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  doneBtn: {
    marginTop: spacing.sm,
  },
});
