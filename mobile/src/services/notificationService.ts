import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type * as NotificationsType from 'expo-notifications';
import { apiClient } from './apiClient';

/**
 * Indicates if the application is running inside Expo Go.
 * Remote push notifications via expo-notifications are not supported in Expo Go (SDK 53+).
 */
export const isExpoGo: boolean = (() => {
  try {
    if (typeof isRunningInExpoGo === 'function' && isRunningInExpoGo()) {
      return true;
    }
  } catch {}
  try {
    if (
      Constants.appOwnership === 'expo' ||
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      (Constants.executionEnvironment as string) === 'storeClient'
    ) {
      return true;
    }
  } catch {}
  return false;
})();

let notificationsModule: typeof NotificationsType | null = null;
let isHandlerConfigured = false;

/**
 * Safely dynamic-imports expo-notifications only in native / development builds.
 * In Expo Go, returns null to avoid native module crashes.
 */
async function getNotificationsModule(): Promise<typeof NotificationsType | null> {
  if (isExpoGo) {
    return null;
  }
  if (!notificationsModule) {
    try {
      const mod = await import('expo-notifications');
      notificationsModule = mod;
      if (notificationsModule && !isHandlerConfigured) {
        notificationsModule.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
        isHandlerConfigured = true;
      }
    } catch {
      notificationsModule = null;
    }
  }
  return notificationsModule;
}

export interface BackendNotification {
  id: string;
  user_id: string;
  timestamp: string;
  type: string;
  severity: 'info' | 'warning' | 'success' | 'urgent';
  title: string;
  message: string;
  read: boolean;
  action_label?: string;
  metadata?: Record<string, any>;
}

export const notificationService = {
  /**
   * Initializes notification handlers in native/development builds.
   * In Expo Go, this is a safe no-op.
   */
  async initialize(): Promise<void> {
    if (!isExpoGo) {
      await getNotificationsModule();
    }
  },

  async getNotifications(): Promise<BackendNotification[]> {
    return await apiClient.get<BackendNotification[]>('/api/notifications');
  },

  async markRead(notificationId: string): Promise<void> {
    await apiClient.post(`/api/notifications/${notificationId}/read`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.post('/api/notifications/read-all');
  },

  async registerPushToken(pushToken: string): Promise<void> {
    await apiClient.post('/api/notifications/register-token', { push_token: pushToken });
  },

  /**
   * Listens for notification response (tap) events in native/development builds.
   * Returns a cleanup function. In Expo Go, safely returns undefined.
   */
  async addNotificationResponseReceivedListener(
    listener: (response: NotificationsType.NotificationResponse) => void
  ): Promise<(() => void) | undefined> {
    if (isExpoGo) {
      return undefined;
    }
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) return undefined;
      const subscription = Notifications.addNotificationResponseReceivedListener(listener);
      return () => {
        subscription.remove();
      };
    } catch {
      return undefined;
    }
  },

  /**
   * Requests OS notification permissions, retrieves native device push token,
   * configures Android channel, and registers token with backend for authenticated user.
   * In Expo Go, this safely returns null without requesting permissions or tokens.
   */
  async setupPushNotifications(): Promise<string | null> {
    if (isExpoGo) {
      return null;
    }

    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) {
        return null;
      }

      // Configure Android default notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'VoltFlow Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00E599',
        });
      }

      // Check existing permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      // Retrieve native FCM device token (preferred for firebase_admin.messaging.send)
      let token: string | null = null;
      try {
        const deviceTokenRes = await Notifications.getDevicePushTokenAsync();
        token = typeof deviceTokenRes.data === 'string' ? deviceTokenRes.data : JSON.stringify(deviceTokenRes.data);
      } catch {
        try {
          const expoTokenRes = await Notifications.getExpoPushTokenAsync();
          token = expoTokenRes.data;
        } catch {
          token = null;
        }
      }

      if (token) {
        await this.registerPushToken(token);
        return token;
      }
    } catch (e) {
      // Fail silently without blocking navigation or app features
    }
    return null;
  },
};
