import React from 'react';
import { Stack } from 'expo-router';
import { useAppContextStore } from '../../src/store/useAppContextStore';

export default function AuthLayout() {
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
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
