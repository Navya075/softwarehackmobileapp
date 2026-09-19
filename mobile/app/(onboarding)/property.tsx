import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useAppContextStore } from '../../src/store/useAppContextStore';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function PropertyTypeScreen() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuthStore();
  const { setChargingContext } = useAppContextStore();

  const [buildingName, setBuildingName] = useState(user?.buildingName || 'Green Residency');
  const [flatNumber, setFlatNumber] = useState(user?.unitNumber || 'Flat 402, Block B');
  const [locality, setLocality] = useState(user?.locality || 'Gachibowli');
  const [city, setCity] = useState(user?.city || user?.address || 'San Francisco');
  const [pincode, setPincode] = useState(user?.pincode || '94105');
  const [hasHomeCharger, setHasHomeCharger] = useState(user?.hasHomeCharger ?? true);
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    setSubmitting(true);
    const parts = [flatNumber.trim(), buildingName.trim(), locality.trim(), city.trim(), pincode.trim()].filter(Boolean);
    const fullAddress = parts.join(', ');

    try {
      await completeOnboarding({
        buildingName: buildingName.trim(),
        unitNumber: flatNumber.trim(),
        locality: locality.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        hasHomeCharger,
        address: fullAddress || user?.address || 'San Francisco, CA',
        propertyType: 'residential',
      });
      setChargingContext('residential');
      router.replace('/(tabs)/home');
    } catch (e) {
      console.error('[PROPERTY STEP] Error completing onboarding:', e);
      router.replace('/(tabs)/home');
    } finally {
      setSubmitting(false);
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
        <View style={styles.stepBarActive} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stepTag}>STEP 5 OF 5</Text>
        <Text style={styles.title}>Residential Property</Text>
        <Text style={styles.subtitle}>
          Enter your home building & location details for smart residential charging optimization.
        </Text>

        <View style={styles.form}>
          <Input
            label="Building / Apartment Name"
            value={buildingName}
            onChangeText={setBuildingName}
            placeholder="e.g. Green Residency"
          />

          <Input
            label="Flat / Apartment Number"
            value={flatNumber}
            onChangeText={setFlatNumber}
            placeholder="e.g. Flat 402, Block B"
          />

          <Input
            label="Area / Locality"
            value={locality}
            onChangeText={setLocality}
            placeholder="e.g. Gachibowli / Financial Dist"
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="City"
                value={city}
                onChangeText={setCity}
                placeholder="e.g. San Francisco"
              />
            </View>
            <View style={styles.col}>
              <Input
                label="PIN Code"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                placeholder="e.g. 94105"
              />
            </View>
          </View>

          {/* Home Charger Availability Toggle */}
          <View style={styles.chargerToggleBox}>
            <View style={styles.chargerToggleLeft}>
              <Ionicons name="flash-outline" size={22} color={colors.primary} />
              <View style={styles.chargerToggleTextCol}>
                <Text style={styles.chargerToggleTitle}>Dedicated Home EV Charger</Text>
                <Text style={styles.chargerToggleDesc}>240V Level 2 charger installed at home</Text>
              </View>
            </View>
            <Switch
              value={hasHomeCharger}
              onValueChange={setHasHomeCharger}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </View>
        </View>

        {/* Automatic environmental indicator */}
        <View style={styles.autoEnergyBox}>
          <Ionicons name="sunny" size={20} color={colors.solar} />
          <View style={styles.autoEnergyTextCol}>
            <Text style={styles.autoEnergyTitle}>Automatic Solar & Clean Grid Detection</Text>
            <Text style={styles.autoEnergyDesc}>
              Rooftop solar generation and local utility tariffs are automatically synced for your residential location.
            </Text>
          </View>
        </View>

        <Button
          title={submitting ? "Saving Property Details..." : "Complete Setup & Launch Dashboard"}
          size="lg"
          loading={submitting}
          icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.textInverse} />}
          onPress={handleFinish}
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
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
  chargerToggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  chargerToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  chargerToggleTextCol: {
    flex: 1,
  },
  chargerToggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chargerToggleDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  autoEnergyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.base,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  autoEnergyTextCol: {
    flex: 1,
    marginLeft: spacing.md,
  },
  autoEnergyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.solarLight,
  },
  autoEnergyDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  button: {
    marginTop: spacing.md,
  },
});
