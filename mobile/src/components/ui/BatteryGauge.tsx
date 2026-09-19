import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface BatteryGaugeProps {
  soc: number;
  targetSoc: number;
  rangeKm: number;
  isCharging: boolean;
  chargingPowerKw?: number;
}

export const BatteryGauge: React.FC<BatteryGaugeProps> = ({
  soc,
  targetSoc,
  rangeKm,
  isCharging,
  chargingPowerKw = 3.2,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCharging) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCharging]);

  return (
    <View style={styles.container}>
      {/* Outer Pulse Container */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            transform: [{ scale: pulseAnim }],
            borderColor: isCharging ? colors.primaryLight : colors.surfaceBorder,
          },
        ]}
      >
        <View style={styles.innerRing}>
          {/* Circular Battery Progress Bar Background */}
          <View style={styles.trackRing}>
            {/* Battery fill representation */}
            <View
              style={[
                styles.fillArc,
                {
                  height: `${Math.min(Math.max(soc, 5), 100)}%`,
                  backgroundColor: isCharging ? colors.primary : colors.primaryMuted,
                },
              ]}
            />
            {/* Target SOC marker line */}
            <View
              style={[
                styles.targetMarker,
                {
                  bottom: `${targetSoc}%`,
                },
              ]}
            >
              <View style={styles.targetLabelBox}>
                <Text style={styles.targetLabelText}>Target {targetSoc}%</Text>
              </View>
            </View>
          </View>

          {/* Central Metrics Content */}
          <View style={styles.centerContent}>
            {isCharging && (
              <View style={styles.chargingPill}>
                <Ionicons name="flash" size={13} color={colors.primary} />
                <Text style={styles.chargingPillText}>{chargingPowerKw} kW Active</Text>
              </View>
            )}

            <View style={styles.percentageRow}>
              <Text style={styles.percentageText}>{soc}</Text>
              <Text style={styles.percentSymbol}>%</Text>
            </View>

            <View style={styles.rangeRow}>
              <Ionicons name="speedometer-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.rangeText}>{rangeKm} km</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  outerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21, 28, 38, 0.6)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  innerRing: {
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  trackRing: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: 'flex-end',
  },
  fillArc: {
    width: '100%',
    opacity: 0.16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  targetMarker: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.solar,
    zIndex: 10,
  },
  targetLabelBox: {
    position: 'absolute',
    right: 12,
    top: -9,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.solarLight,
  },
  targetLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.solarLight,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  chargingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryGhost,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  chargingPillText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  percentageText: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  percentSymbol: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 2,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
