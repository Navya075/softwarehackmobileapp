import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiClient } from './apiClient';

// Configure foreground notification presentation handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
   * Requests OS notification permissions, retrieves native device push token,
   * configures Android channel, and registers token with backend for authenticated user.
   */
  async setupPushNotifications(): Promise<string | null> {
    try {
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
