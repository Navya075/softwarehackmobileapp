import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'solar';
  size?: 'sm' | 'md';
  dot?: boolean;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  dot = false,
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successGhost, text: colors.success, dot: colors.success };
      case 'warning':
        return { bg: colors.warningGhost, text: colors.warning, dot: colors.warning };
      case 'danger':
        return { bg: colors.dangerGhost, text: colors.danger, dot: colors.danger };
      case 'info':
        return { bg: colors.infoGhost, text: colors.info, dot: colors.info };
      case 'solar':
        return { bg: colors.solarGhost, text: colors.solar, dot: colors.solar };
      case 'neutral':
      default:
        return { bg: colors.surfaceHighlight, text: colors.textSecondary, dot: colors.textMuted };
    }
  };

  const scheme = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSm && styles.badgeSm,
        { backgroundColor: scheme.bg },
        style,
      ]}
    >
      {dot && <View style={[styles.dot, isSm && styles.dotSm, { backgroundColor: scheme.dot }]} />}
      <Text
        style={[styles.text, isSm && styles.textSm, { color: scheme.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotSm: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
