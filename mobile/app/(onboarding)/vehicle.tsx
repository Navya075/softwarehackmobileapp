import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

const PRESET_VEHICLES = [
  { make: 'Tesla', model: 'Model 3 Long Range', year: '2024' },
  { make: 'Hyundai', model: 'Ioniq 5 AWD', year: '2024' },
  { make: 'Nissan', model: 'Leaf Plus', year: '2023' },
];

import { useVehicleStore } from '../../src/store/useVehicleStore';

export default function AddEVScreen() {
  const router = useRouter();
  const { activeVehicle } = useVehicleStore();
  const [vehicleType, setVehicleType] = useState<'car' | 'scooter' | 'motorcycle'>(
    activeVehicle?.vehicleType || 'car'
  );
  const [make, setMake] = useState(activeVehicle?.make || 'Tesla');
  const [model, setModel] = useState(activeVehicle?.model || 'Model 3 Long Range');
  const [year, setYear] = useState(String(activeVehicle?.year || 2024));
  const [plate, setPlate] = useState(activeVehicle?.licensePlate || 'EV-001-LR');

  const selectPreset = (preset: typeof PRESET_VEHICLES[0]) => {
    setMake(preset.make);
    setModel(preset.model);
    setYear(preset.year);
  };

  const handleNext = () => {
    if (!make.trim() || !model.trim()) {
      Alert.alert('Required', 'Please enter your vehicle make and model.');
      return;
    }
    const yr = parseInt(year, 10) || 2024;
    const vehicleId = `EV-${plate.trim() || '001'}`;

    useVehicleStore.setState((state) => ({
      activeVehicle: {
        ...state.activeVehicle,
        id: vehicleId,
        vehicleType,
        make: make.trim(),
        model: model.trim(),
        year: yr,
        licensePlate: plate.trim() || 'EV-001-LR',
      },
      telemetry: {
        ...state.telemetry,
        vehicle_id: vehicleId,
        vehicle_type: vehicleType,
        make: make.trim(),
        model: model.trim(),
      },
    }));

    const updated = useVehicleStore.getState().activeVehicle;
    AsyncStorage.setItem('@voltflow_active_vehicle', JSON.stringify(updated)).catch(() => {});

    router.push({
      pathname: '/(onboarding)/technical',
      params: { vehicleType, make: make.trim(), model: model.trim(), year: String(yr), plate: plate.trim() },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress header */}
      <View style={styles.progressContainer}>
        <View style={styles.stepBarActive} />
        <View style={styles.stepBarActive} />
        <View style={styles.stepBarInactive} />
        <View style={styles.stepBarInactive} />
        <View style={styles.stepBarInactive} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stepTag}>STEP 2 OF 5</Text>
        <Text style={styles.title}>Add Your EV</Text>
        <Text style={styles.subtitle}>
          Select or enter your vehicle specifications for telemetry calibration.
        </Text>

        {/* Vehicle Type Selector */}
        <Text style={styles.presetsHeader}>VEHICLE TYPE</Text>
        <View style={styles.presetsRow}>
          {[
            { type: 'car' as const, label: '🚗 Car' },
            { type: 'scooter' as const, label: '🛵 Scooter' },
            { type: 'motorcycle' as const, label: '🏍️ Motorcycle' },
          ].map((item) => {
            const isSelected = vehicleType === item.type;
            return (
              <TouchableOpacity
                key={item.type}
                onPress={() => setVehicleType(item.type)}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
              >
                <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Presets */}
        <Text style={styles.presetsHeader}>QUICK SELECT PRESETS</Text>
        <View style={styles.presetsRow}>
          {PRESET_VEHICLES.map((p) => {
            const isSelected = p.make === make && p.model === model;
            return (
              <TouchableOpacity
                key={p.model}
                onPress={() => selectPreset(p)}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
              >
                <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                  {p.make} {p.model}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.form}>
          <Input label="Make / Manufacturer" value={make} onChangeText={setMake} />
          <Input label="Model & Trim" value={model} onChangeText={setModel} />
          <Input label="Model Year" value={year} onChangeText={setYear} keyboardType="numeric" />
          <Input label="License Plate / Nickname" value={plate} onChangeText={setPlate} />
        </View>

        <Button
          title="Continue to Technical Specs"
          size="lg"
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
    marginBottom: spacing.lg,
  },
  presetsHeader: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetChip: {
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
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  presetTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  form: {
    flex: 1,
  },
  button: {
    marginTop: spacing.lg,
  },
});
