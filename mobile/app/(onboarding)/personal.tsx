import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function PersonalProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; email?: string; phone?: string; fromProfile?: string }>();
  const { user, updateProfile, isLoading } = useAuthStore();

  const isEditingFromProfile = params.fromProfile === 'true' || Boolean(user?.completedOnboarding);

  const [fullName, setFullName] = useState(
    params.name || user?.displayName || ''
  );
  const [phoneNumber, setPhoneNumber] = useState(
    params.phone || user?.phone || ''
  );
  const [city, setCity] = useState(
    user?.address || ''
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.name) {
      setFullName(params.name);
    } else if (user?.displayName) {
      setFullName(user.displayName);
    }
    if (params.phone) {
      setPhoneNumber(params.phone);
    } else if (user?.phone) {
      setPhoneNumber(user.phone);
    }
    if (user?.address) {
      setCity(user.address);
    }
  }, [params.name, params.phone, user?.displayName, user?.phone, user?.address]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        displayName: fullName.trim() || 'EV Owner',
        phone: phoneNumber.trim(),
        address: city.trim(),
      });

      if (isEditingFromProfile) {
        Alert.alert(
          'Profile Saved',
          'Your profile details have been updated successfully and saved to the cloud.',
          [{
            text: 'OK',
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/profile');
              }
            }
          }]
        );
      } else {
        router.push('/(onboarding)/vehicle');
      }
    } catch (e: any) {
      Alert.alert('Save Failed', e?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress header (hidden if editing from profile tab) */}
      {!isEditingFromProfile ? (
        <View style={styles.progressContainer}>
          <View style={styles.stepBarActive} />
          <View style={styles.stepBarInactive} />
          <View style={styles.stepBarInactive} />
          <View style={styles.stepBarInactive} />
          <View style={styles.stepBarInactive} />
        </View>
      ) : (
        <View style={styles.topNavRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/profile');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {!isEditingFromProfile && <Text style={styles.stepTag}>STEP 1 OF 5</Text>}
        <Text style={styles.title}>
          {isEditingFromProfile ? 'Personal Information' : 'Personal Profile'}
        </Text>
        <Text style={styles.subtitle}>
          {isEditingFromProfile
            ? 'Update your name, contact phone number, and primary location.'
            : 'Help us customize your charging alerts and departure guarantees.'}
        </Text>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Alex Rivera"
          />

          <Input
            label="Phone Number (for Urgent Alerts)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="+1 (555) 000-0000"
          />

          <Input
            label="Primary Location / City"
            value={city}
            onChangeText={setCity}
            placeholder="City, State"
            helper="Used to synchronize local utility time-of-use tariffs."
          />
        </View>

        <Button
          title={isEditingFromProfile ? 'Save Profile Changes' : 'Continue to Vehicle Setup'}
          size="lg"
          loading={saving || isLoading}
          icon={
            <Ionicons
              name={isEditingFromProfile ? 'checkmark-circle-outline' : 'arrow-forward'}
              size={18}
              color={colors.textInverse}
            />
          }
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
  },
  backButton: {
    paddingVertical: spacing.xs,
    width: 40,
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
  button: {
    marginTop: spacing.xl,
  },
});
