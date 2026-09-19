import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { mockSmartInsights } from '../src/mock';
import { Header } from '../src/components/ui/Header';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';

export default function SmartInsightsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Smart Insights" subtitle="Predictive Charging, Solar & Departure" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Departure Forecast */}
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.sectionLabel}>PREDICTED DEPARTURE</Text>
              <Text style={styles.heroTitle}>{mockSmartInsights.departureStatus}</Text>
            </View>
            <Badge label="GUARANTEED" variant="success" dot />
          </View>

          <View style={styles.heroGrid}>
            <View style={styles.heroBox}>
              <Text style={styles.heroLabel}>TARGET READY TIME</Text>
              <Text style={styles.heroVal}>{mockSmartInsights.chargingPrediction}</Text>
            </View>
            <View style={styles.heroBox}>
              <Text style={styles.heroLabel}>ESTIMATED RANGE</Text>
              <Text style={styles.heroVal}>{mockSmartInsights.estimatedRange}</Text>
            </View>
          </View>
        </Card>

        {/* Cost Forecast */}
        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="wallet-outline" size={24} color={colors.solar} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Estimated Session Cost</Text>
              <Text style={styles.cardHighlight}>{mockSmartInsights.estimatedCostRange}</Text>
              <Text style={styles.cardSub}>
                Calculated based on scheduled off-peak rate and solar contribution.
              </Text>
            </View>
          </View>
        </Card>

        {/* Environmental Opportunities */}
        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="sunny-outline" size={24} color={colors.solar} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Solar Opportunity Window</Text>
              <Text style={styles.cardHighlight}>{mockSmartInsights.solarOpportunity}</Text>
              <Text style={styles.cardSub}>
                Rooftop solar generation is forecasted to be highest during midday.
              </Text>
            </View>
          </View>
        </Card>

        {/* Building Demand Forecast */}
        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="trending-up-outline" size={24} color={colors.grid} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Building Electricity Demand Window</Text>
              <Text style={styles.cardHighlight}>{mockSmartInsights.electricityDemandWindow}</Text>
              <Text style={styles.cardSub}>
                Smart charging will temporarily slow down to avoid peak demand surcharges.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    gap: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 2,
  },
  heroGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  heroBox: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  heroVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.solarLight,
    marginTop: 2,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
});
