import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppContextStore } from '../src/store/useAppContextStore';
import { useAuthStore } from '../src/store/useAuthStore';
import { useVehicleStore } from '../src/store/useVehicleStore';
import { websocketService } from '../src/services/websocketService';
import { notificationService } from '../src/services/notificationService';

export default function RootLayout() {
  const { themeMode, getColors } = useAppContextStore();
  const themeColors = getColors();
  const { isLoading, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().initialize();
    useVehicleStore.getState().fetchVehicles();
    websocketService.connect();
    notificationService.initialize();

    // Listen for notification taps to open notifications screen safely (native builds only)
    let isMounted = true;
    let removeTapListener: (() => void) | undefined;
    notificationService
      .addNotificationResponseReceivedListener(() => {
        try {
          router.push('/notifications');
        } catch {
          // Ignore navigation errors
        }
      })
      .then((cleanup) => {
        if (isMounted) {
          removeTapListener = cleanup;
        } else {
          cleanup?.();
        }
      });

    return () => {
      isMounted = false;
      removeTapListener?.();
      websocketService.disconnect();
    };
  }, []);

  // When user is authenticated, setup permissions and register device push token
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      notificationService.setupPushNotifications();
    }
  }, [isAuthenticated, user?.id]);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
          <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={[styles.root, { backgroundColor: themeColors.background }]}>
        <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: themeColors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="notifications"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="smart-plan-modal"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="charge-faster-modal"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="leaving-early-modal"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="reserve-charger"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="charger-details" />
          <Stack.Screen name="billing" />
          <Stack.Screen name="charging-history" />
          <Stack.Screen name="carbon-dashboard" />
          <Stack.Screen name="reports" />
          <Stack.Screen name="reservations" />
          <Stack.Screen name="smart-insights" />
          <Stack.Screen name="battery-insights" />
          <Stack.Screen name="settings/index" />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
