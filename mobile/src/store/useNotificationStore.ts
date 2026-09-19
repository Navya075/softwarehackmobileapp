import { create } from 'zustand';
import { NotificationItem, NotificationEventType } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    timestamp: '10 mins ago',
    type: 'solar_opportunity',
    severity: 'success',
    title: 'Clean Solar Energy Prioritized',
    message: '18 kW solar generation detected. 68% of your current charging is powered by clean rooftop energy.',
    read: false,
  },
  {
    id: 'notif_2',
    timestamp: '25 mins ago',
    type: 'optimization_curtailment',
    severity: 'info',
    title: 'Charging Temporarily Slowed',
    message: 'Your building is using more electricity right now. Your EV charging was adjusted to 3.2 kW and is still on track for 7:30 AM.',
    read: false,
  },
  {
    id: 'notif_3',
    timestamp: '1 hour ago',
    type: 'charger_event',
    severity: 'info',
    title: 'Charger Reserved',
    message: 'Slot C07 at Phoenix Mall is reserved for Today, 4:30 PM – 5:30 PM.',
    read: false,
  },
  {
    id: 'notif_4',
    timestamp: '11:15 PM',
    type: 'charging_start',
    severity: 'info',
    title: 'Charging Session Started',
    message: 'Connected to Level 2 charger. Target set to 85% battery, guaranteed ready by 6:42 AM.',
    read: true,
  },
  {
    id: 'notif_5',
    timestamp: 'Yesterday',
    type: 'billing_event',
    severity: 'info',
    title: 'Session Receipt Available',
    message: 'Completed session: 18.2 kWh delivered (₹258 total). View or download your receipt.',
    read: true,
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: 3,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const items = await notificationService.getNotifications();
      if (items && items.length > 0) {
        const mapped: NotificationItem[] = items.map((n) => ({
          id: n.id,
          type: n.type as NotificationEventType,
          severity: n.severity,
          title: n.title,
          message: n.message,
          timestamp: n.timestamp,
          read: n.read,
          actionLabel: n.action_label,
          metadata: n.metadata,
        }));
        const unread = mapped.filter((n) => !n.read).length;
        set({ notifications: mapped, unreadCount: unread, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    try {
      await notificationService.markAllRead();
    } catch {
      // Ignore API errors gracefully
    }
  },

  markAsRead: async (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      const unread = updated.filter((n) => !n.read).length;
      return { notifications: updated, unreadCount: unread };
    });
    try {
      await notificationService.markRead(id);
    } catch {
      // Ignore API errors gracefully
    }
  },

  addNotification: (item) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    set((state) => ({
      notifications: [newItem, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
