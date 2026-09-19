import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { Input } from '../src/components/ui/Input';
import { Button } from '../src/components/ui/Button';
import { vehicleService } from '../src/services/vehicleService';
import { useVehicleStore } from '../src/store/useVehicleStore';

const PRESET_VEHICLES = [
  { type: 'car' as const, make: 'Tesla', model: 'Model 3 Long Range', year: '2024', battery: '75', acKw: '11', connector: 'CCS2 / Type 2' },
  { type: 'car' as const, make: 'Hyundai', model: 'Ioniq 5 AWD', year: '2024', battery: '77.4', acKw: '11', connector: 'CCS2 / Type 2' },
  { type: 'scooter' as const, make: 'Ather', model: '450X Gen 3', year: '2024', battery: '3.7', acKw: '3.3', connector: 'Ather Fast Connector' },
  { type: 'motorcycle' as const, make: 'Revolt', model: 'RV400', year: '2024', battery: '3.24', acKw: '2.5', connector: 'Standard 15A Plug' },
];

export default function AddVehicleScreen() {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<'car' | 'scooter' | 'motorcycle'>('car');
  const [make, setMake] = useState('Hyundai');
  const [model, setModel] = useState('Ioniq 5 AWD');
  const [year, setYear] = useState('2024');
  const [plate, setPlate] = useState('EV-002-HY');
  const [batteryKwh, setBatteryKwh] = useState('77.4');
  const [connectorType, setConnectorType] = useState('CCS2 / Type 2');
  const [maxAcKw, setMaxAcKw] = useState('11.0');
  const [maxDcKw, setMaxDcKw] = useState('170.0');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectPreset = (preset: typeof PRESET_VEHICLES[0]) => {
    setVehicleType(preset.type);
    setMake(preset.make);
    setModel(preset.model);
    setYear(preset.year);
    setBatteryKwh(preset.battery);
    setMaxAcKw(preset.acKw);
    setConnectorType(preset.connector);
  };

  const handleSave = async () => {
    setErrorMessage('');
    if (!make.trim() || !model.trim()) {
      const msg = 'Please enter vehicle make and model.';
      setErrorMessage(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Required', msg);
      return;
    }

    setSaving(true);
    const capacity = parseFloat(batteryKwh) || 75.0;
    const acPower = parseFloat(maxAcKw) || 11.0;
    const yr = parseInt(year, 10) || 2024;
    const usableCap = Math.round(capacity * 0.95 * 10) / 10;

    try {
      console.log('[ADD VEHICLE] Creating new vehicle in Cloud Firestore...');
      const created = await vehicleService.createVehicle({
        vehicle_type: vehicleType,
        manufacturer: make.trim(),
        model: model.trim(),
        variant: plate.trim() || 'EV-002',
        year: yr,
        battery_capacity_kwh: capacity,
        usable_battery_capacity_kwh: usableCap,
        battery_health_percent: 97.0,
        max_charging_power_kw: acPower,
        connector: connectorType.trim() || 'CCS2 / Type 2',
      });

      console.log('[ADD VEHICLE] Vehicle registered successfully:', created.vehicle_id);

      try {
        await useVehicleStore.getState().fetchVehicles();
      } catch (e) {
        console.warn('[ADD VEHICLE] fetchVehicles warning:', e);
      }

      setSaving(false);
      if (Platform.OS === 'web') {
        window.alert(`Vehicle Registered! ${make} ${model} has been added to your account.`);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert(
          'Vehicle Registered',
          `Your new vehicle (${make} ${model}) has been registered and saved to Cloud Firestore.`,
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
        );
      }
    } catch (err: any) {
      console.error('[ADD VEHICLE] Error creating vehicle:', err);
      setSaving(false);
      const msg = err?.message || 'Could not register vehicle. Please check network connection.';
      setErrorMessage(msg);
      if (Platform.OS === 'web') window.alert(`Save Failed: ${msg}`);
      else Alert.alert('Save Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNavRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)/home');
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Vehicle</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Register an additional EV (Car, Scooter, or Motorcycle) to your account.
        </Text>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Vehicle Type Selector */}
        <Text style={styles.sectionHeader}>VEHICLE TYPE</Text>
        <View style={styles.chipRow}>
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
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Select Presets */}
        <Text style={styles.sectionHeader}>QUICK PRESETS</Text>
        <View style={styles.chipRow}>
          {PRESET_VEHICLES.map((p) => {
            const isSelected = p.make === make && p.model === model;
            return (
              <TouchableOpacity
                key={p.model}
                onPress={() => selectPreset(p)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {p.make} {p.model}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          <Input
            label="Make / Manufacturer"
            value={make}
            onChangeText={(txt) => {
              setMake(txt);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="e.g. Tesla, Ather, Hyundai"
          />

          <Input
            label="Model & Trim"
            value={model}
            onChangeText={(txt) => {
              setModel(txt);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="e.g. Model 3, 450X, Ioniq 5"
          />

          <Input
            label="Model Year"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            placeholder="2024"
          />

          <Input
            label="License Plate / Nickname"
            value={plate}
            onChangeText={setPlate}
            placeholder="e.g. EV-002-HY"
          />

          <Input
            label="Usable Battery Capacity (kWh)"
            value={batteryKwh}
            onChangeText={setBatteryKwh}
            keyboardType="decimal-pad"
            helper="Total usable capacity in kWh"
          />

          <Input
            label="Charging Port Standard"
            value={connectorType}
            onChangeText={setConnectorType}
            placeholder="e.g. CCS2 / Type 2"
          />

          <Input
            label="Max On-Board AC Charging Power (kW)"
            value={maxAcKw}
            onChangeText={setMaxAcKw}
            keyboardType="decimal-pad"
          />

          <Input
            label="Peak DC Fast Charging Rate (kW)"
            value={maxDcKw}
            onChangeText={setMaxDcKw}
            keyboardType="decimal-pad"
          />
        </View>

        <Button
          title={saving ? "Registering Vehicle..." : "Save & Register Vehicle"}
          size="lg"
          loading={saving}
          icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.textInverse} />}
          onPress={handleSave}
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
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  backButton: {
    paddingVertical: spacing.xs,
    width: 40,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: radii.md,
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
  sectionHeader: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  form: {
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.xl,
  },
});
