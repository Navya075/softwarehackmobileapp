import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { chargingService } from '../../src/services';
import { useVehicleStore } from '../../src/store/useVehicleStore';

export default function ChargingPreferencesScreen() {
  const router = useRouter();
  const [targetSoc, setTargetSoc] = useState('85');
  const [departureTime, setDepartureTime] = useState('7:30 AM');
  const [priority, setPriority] = useState<'eco' | 'balanced' | 'speed'>('balanced');
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    setSaving(true);
    const target = parseInt(targetSoc, 10) || 85;
    try {
      await chargingService.updatePreferences({
        target_soc: target,
        departure_time: departureTime,
        prefer_renewable: priority === 'eco',
        charge_faster: priority === 'speed',
        prefer_lower_cost: priority === 'balanced',
      });
    } catch (e) {
      // offline fallback
    } finally {
      useVehicleStore.getState().setTargetSoc(target);
      useVehicleStore.getState().setDepartureTime(departureTime);
      setSaving(false);
      router.push('/(onboarding)/property');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress header */}
      <View style={styles.progressContainer}>
        <View style={styles.stepBarActive} />
        <View style={styles.stepBarActive} />
        <View style={styles.stepBarActive} />
        <View style={styles.stepBarActive} />
        <View style={styles.stepBarInactive} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stepTag}>STEP 4 OF 5</Text>
        <Text style={styles.title}>Charging Preferences</Text>
        <Text style={styles.subtitle}>
          Set your daily departure goals and energy optimization strategy.
        </Text>

        <View style={styles.form}>
          <Input
            label="Daily Target SOC (%)"
            value={targetSoc}
            onChangeText={setTargetSoc}
            keyboardType="numeric"
            helper="Recommended 80-85% for long-term Li-ion battery health."
          />

          <Input
            label="Default Morning Departure Time"
            value={departureTime}
            onChangeText={setDepartureTime}
            helper="The AI optimizer guarantees this deadline with departure confirmation."
          />

          <Text style={styles.label}>OPTIMIZATION STRATEGY</Text>
          <View style={styles.strategyRow}>
            <TouchableOpacity
              onPress={() => setPriority('eco')}
              style={[styles.strategyCard, priority === 'eco' && styles.strategyActive]}
            >
              <Ionicons
                name="leaf-outline"
                size={22}
                color={priority === 'eco' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.strategyTitle, priority === 'eco' && styles.strategyTitleActive]}>
                Prefer Renewable Energy
              </Text>
              <Text style={styles.strategyDesc}>Prioritize solar & cleaner energy when available</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPriority('balanced')}
              style={[styles.strategyCard, priority === 'balanced' && styles.strategyActive]}
            >
              <Ionicons
                name="speedometer-outline"
                size={22}
                color={priority === 'balanced' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.strategyTitle,
                  priority === 'balanced' && styles.strategyTitleActive,
                ]}
              >
                Balanced
              </Text>
              <Text style={styles.strategyDesc}>Cheapest rates while guaranteeing departure</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPriority('speed')}
              style={[styles.strategyCard, priority === 'speed' && styles.strategyActive]}
            >
              <Ionicons
                name="flash-outline"
                size={22}
                color={priority === 'speed' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.strategyTitle, priority === 'speed' && styles.strategyTitleActive]}>
                Max Speed
              </Text>
              <Text style={styles.strategyDesc}>Charge immediately at full charger capacity</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title={saving ? 'Saving Preferences...' : 'Continue to Property Setup'}
          size="lg"
          loading={saving}
          icon={<Ionicons name="arrow-forward" size={18} color={colors.textInverse} />}
          onPress={handleNext}
          style={styles.button}
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
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    gap: 6,
  },
  stepBarActive: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  stepBarInactive: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceBorder,
  },
  content: {
    padding: spacing.xl,
    justifyContent: 'space-between',
    minHeight: '85%',
  },
  stepTag: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  strategyRow: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  strategyCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  strategyActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  strategyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  strategyTitleActive: {
    color: colors.primary,
  },
  strategyDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  button: {
    marginTop: spacing.lg,
  },
});
