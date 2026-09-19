import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, useThemeColors, radii, spacing, typography } from '../../theme';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  accentColor?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  subtitle,
  accentColor,
  style,
}) => {
  const colors = useThemeColors();
  const resolvedAccent = accentColor || colors.textPrimary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        {icon && <View style={styles.iconBox}>{icon}</View>}
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: resolvedAccent }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>}
      </View>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.lg,
    padding: spacing.md,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  iconBox: {
    opacity: 0.85,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 3,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },
});
