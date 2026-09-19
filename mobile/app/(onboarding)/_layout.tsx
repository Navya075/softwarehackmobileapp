import React from 'react';
import { Stack } from 'expo-router';
import { useAppContextStore } from '../../src/store/useAppContextStore';

export default function OnboardingLayout() {
  const { getColors } = useAppContextStore();
  const themeColors = getColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="personal" />
      <Stack.Screen name="vehicle" />
      <Stack.Screen name="technical" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="property" />
    </Stack>
  );
}
