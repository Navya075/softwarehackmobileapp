import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useVehicleStore } from '../../src/store/useVehicleStore';
import { vehicleService } from '../../src/services/vehicleService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TechnicalProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ vehicleType?: string; make?: string; model?: string; year?: string; plate?: string }>();
  const { activeVehicle } = useVehicleStore();

  const [batteryKwh, setBatteryKwh] = useState(String(activeVehicle?.batteryCapacityKwh || 75));
  const [connectorType, setConnectorType] = useState(activeVehicle?.connectorType || 'Type 2 / CCS Combo');
  const [maxAcKw, setMaxAcKw] = useState(String(activeVehicle?.maxAcPowerKw || 11.0));
  const [maxDcKw, setMaxDcKw] = useState(String(activeVehicle?.maxDcPowerKw || 170.0));
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleNext = async () => {
    setErrorMessage('');
    setSaving(true);
    const vType = params.vehicleType || activeVehicle?.vehicleType || 'car';
    const capacity = parseFloat(batteryKwh) || 75.0;
    const acPower = parseFloat(maxAcKw) || 11.0;
    const dcPower = parseFloat(maxDcKw) || 170.0;
    const make = params.make || activeVehicle?.make || 'Tesla';
    const model = params.model || activeVehicle?.model || 'Model 3 Long Range';
    const year = parseInt(params.year || '2024', 10);
    const plate = params.plate || activeVehicle?.licensePlate || 'EV-001-LR';

    const usableCap = Math.round(capacity * 0.95 * 10) / 10;

    // Immediately update local vehicle store
    useVehicleStore.setState((state) => ({
      activeVehicle: {
        ...state.activeVehicle,
        vehicleType: vType as any,
        make,
        model,
        year,
        licensePlate: plate,
        batteryCapacityKwh: capacity,
        usableCapacityKwh: usableCap,
        connectorType,
        maxAcPowerKw: acPower,
        maxDcPowerKw: dcPower,
      },
      telemetry: {
        ...state.telemetry,
        vehicle_type: vType as any,
        make,
        model,
        battery_capacity_kwh: capacity,
        usable_capacity_kwh: usableCap,
        max_charging_power_kw: acPower,
      },
    }));

    const updatedVehicle = useVehicleStore.getState().activeVehicle;
    AsyncStorage.setItem('@voltflow_active_vehicle', JSON.stringify(updatedVehicle)).catch(() => {});

    try {
      console.log('[TECHNICAL] Creating vehicle in backend Cloud Firestore...');
      const created = await vehicleService.createVehicle({
        vehicle_type: vType,
        manufacturer: make,
        model,
        variant: plate,
        year,
        battery_capacity_kwh: capacity,
        usable_battery_capacity_kwh: usableCap,
        battery_health_percent: 94.0,
        max_charging_power_kw: acPower,
        connector: connectorType,
      });
      console.log('[TECHNICAL] Vehicle created successfully:', created.vehicle_id);
      try {
        await useVehicleStore.getState().fetchVehicles();
      } catch (fetchErr) {
        console.warn('[TECHNICAL] fetchVehicles warning:', fetchErr);
      }
      setSaving(false);
      // Navigate to Preferences ONLY after successful save
      router.push('/(onboarding)/preferences');
    } catch (e: any) {
      console.error('[TECHNICAL] Vehicle save failed:', e);
      setSaving(false);
      const msg = e?.message || 'Could not save vehicle details to cloud.';
      setErrorMessage(msg);
      if (Platform.OS === 'web') {
        window.alert(`Save Failed: ${msg}`);
      } else {
        Alert.alert('Save Failed', msg);
      }
      // DO NOT navigate on failure
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress header */}
      <View style={styles.progressContainer}>
        <View style={styles.stepBarActive} />
        <View style={styles.stepBarActive} />
        <View style={styles.stepBarActive} />
        <View style={styles.stepBarInactive} />
        <View style={styles.stepBarInactive} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stepTag}>STEP 3 OF 5</Text>
        <Text style={styles.title}>Technical Profile</Text>
        <Text style={styles.subtitle}>
          These parameters allow the optimization engine to calculate precise charging curves.
        </Text>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Input
            label="Usable Battery Capacity (kWh)"
            value={batteryKwh}
            onChangeText={(txt) => {
              setBatteryKwh(txt);
              if (errorMessage) setErrorMessage('');
            }}
            keyboardType="decimal-pad"
            helper="Model 3 Long Range standard usable capacity is 75 kWh."
          />

          <Input
            label="Charging Port Standard"
            value={connectorType}
            onChangeText={(txt) => {
              setConnectorType(txt);
              if (errorMessage) setErrorMessage('');
            }}
            helper="Supports smart chargers using OCPP 1.6 / 2.0.1 protocol."
          />

          <Input
            label="Max On-Board AC Charging Power (kW)"
            value={maxAcKw}
            onChangeText={(txt) => {
              setMaxAcKw(txt);
              if (errorMessage) setErrorMessage('');
            }}
            keyboardType="decimal-pad"
            helper="Standard Level 2 home/building charger limit is 11 kW."
          />

          <Input
            label="Peak DC Fast Charging Rate (kW)"
            value={maxDcKw}
            onChangeText={(txt) => {
              setMaxDcKw(txt);
              if (errorMessage) setErrorMessage('');
            }}
            keyboardType="decimal-pad"
          />
        </View>

        <Button
          title={saving ? "Saving Technical Specs..." : "Continue to Preferences"}
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
    lineHeight: 18,
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
  button: {
    marginTop: spacing.lg,
  },
});
