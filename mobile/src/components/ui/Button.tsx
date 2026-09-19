import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.lg,
    };

    // Size
    switch (size) {
      case 'sm':
        base.paddingVertical = spacing.sm;
        base.paddingHorizontal = spacing.md;
        break;
      case 'lg':
        base.paddingVertical = 16;
        base.paddingHorizontal = spacing.xl;
        break;
      case 'md':
      default:
        base.paddingVertical = spacing.md;
        base.paddingHorizontal = spacing.base;
        break;
    }

    // Variant
    if (disabled) {
      return {
        ...base,
        backgroundColor: colors.buttonDisabled,
        borderColor: 'transparent',
      };
    }

    switch (variant) {
      case 'secondary':
        return {
          ...base,
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.surfaceBorder,
          borderWidth: 1,
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1.5,
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          ...base,
          backgroundColor: colors.danger,
        };
      case 'primary':
      default:
        return {
          ...base,
          backgroundColor: colors.primary,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    if (disabled) {
      return { ...typography.bodyMedium, fontWeight: '600', color: colors.buttonDisabledText };
    }

    switch (variant) {
      case 'secondary':
        return { ...typography.bodyMedium, fontWeight: '600', color: colors.textPrimary };
      case 'outline':
        return { ...typography.bodyMedium, fontWeight: '600', color: colors.primary };
      case 'ghost':
        return { ...typography.bodyMedium, fontWeight: '600', color: colors.textSecondary };
      case 'danger':
        return { ...typography.bodyMedium, fontWeight: '600', color: '#FFFFFF' };
      case 'primary':
      default:
        return { ...typography.bodyMedium, fontWeight: '700', color: colors.textInverse };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.textInverse : colors.primary}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={[getTextStyle(), icon ? { marginLeft: spacing.sm } : undefined, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
