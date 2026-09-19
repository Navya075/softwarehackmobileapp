import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, useThemeColors, radii, spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  highlighted?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated = false,
  highlighted = false,
}) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          borderColor: highlighted ? colors.primary : colors.surfaceBorder,
        },
        elevated && styles.elevated,
        highlighted && styles.highlighted,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  highlighted: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
});
