import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { useAppContextStore } from '../../store/useAppContextStore';

interface ContextSwitcherProps {
  compact?: boolean;
}

export const ContextSwitcher: React.FC<ContextSwitcherProps> = ({ compact = false }) => {
  const { chargingContext, setChargingContext } = useAppContextStore();

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setChargingContext('residential')}
        style={[
          styles.segment,
          chargingContext === 'residential' && styles.segmentActive,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            chargingContext === 'residential' && styles.segmentTextActive,
          ]}
        >
          🏠 Residential
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setChargingContext('commercial')}
        style={[
          styles.segment,
          chargingContext === 'commercial' && styles.segmentActiveCommercial,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            chargingContext === 'commercial' && styles.segmentTextActiveCommercial,
          ]}
        >
          🏢 Commercial / Industrial
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignSelf: 'center',
    marginVertical: spacing.xs,
  },
  compactContainer: {
    marginVertical: 2,
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.primaryGhost,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  segmentActiveCommercial: {
    backgroundColor: colors.gridGhost,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  segmentTextActiveCommercial: {
    color: colors.grid,
    fontWeight: '700',
  },
});
