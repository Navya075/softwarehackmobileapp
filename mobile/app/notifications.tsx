import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { useNotificationStore } from '../src/store/useNotificationStore';
import { Badge } from '../src/components/ui/Badge';
import { Card } from '../src/components/ui/Card';
import { NotificationSeverity } from '../src/types';

export default function NotificationsModal() {
  const router = useRouter();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotificationStore();

  const getSeverityBadge = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'success':
        return <Badge label="Optimization" variant="success" dot />;
      case 'warning':
        return <Badge label="Grid Alert" variant="warning" dot />;
      case 'urgent':
        return <Badge label="Urgent" variant="danger" dot />;
      case 'info':
      default:
        return <Badge label="Telemetry" variant="info" dot />;
    }
  };

  const getSeverityIcon = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'success':
        return <Ionicons name="leaf" size={20} color={colors.primary} />;
      case 'warning':
        return <Ionicons name="warning" size={20} color={colors.warning} />;
      case 'urgent':
        return <Ionicons name="alert-circle" size={20} color={colors.danger} />;
      case 'info':
      default:
        return <Ionicons name="flash" size={20} color={colors.info} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal Navigation Bar */}
      <View style={styles.navBar}>
        <View style={styles.navTitleCol}>
          <Text style={styles.navTitle}>Notifications</Text>
          <Text style={styles.navSubtitle}>Real-time system events & telemetry alerts</Text>
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/home');
            }
          }}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Action Header */}
      <View style={styles.actionRow}>
        <Text style={styles.unreadCounter}>
          {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All notifications caught up'}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.map((n) => (
          <TouchableOpacity
            key={n.id}
            activeOpacity={0.8}
            onPress={() => markAsRead(n.id)}
          >
            <Card
              style={[
                styles.notifCard,
                !n.read && styles.unreadCard,
              ]}
            >
              <View style={styles.notifTopRow}>
                <View style={styles.iconTagRow}>
                  <View style={styles.iconCircle}>{getSeverityIcon(n.severity)}</View>
                  {getSeverityBadge(n.severity)}
                </View>
                <Text style={styles.timestamp}>{n.timestamp}</Text>
              </View>

              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifMessage}>{n.message}</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorderSubtle,
  },
  navTitleCol: {
    flex: 1,
  },
  navTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.textPrimary,
  },
  navSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  unreadCounter: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  notifCard: {
    marginBottom: spacing.xs,
  },
  unreadCard: {
    borderColor: colors.primaryMuted,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestamp: {
    fontSize: 11,
    color: colors.textMuted,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  notifMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
});
