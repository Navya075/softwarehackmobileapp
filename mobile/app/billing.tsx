import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { mockBilling } from '../src/mock';
import { useAppContextStore } from '../src/store/useAppContextStore';
import { Header } from '../src/components/ui/Header';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';

export default function BillingScreen() {
  const router = useRouter();
  const { chargingContext } = useAppContextStore();
  const isResidential = chargingContext === 'residential';

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Billing & Receipts" subtitle="Energy Costs, Tariffs & Statements" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* LATEST CHARGING RECEIPT (Commercial / Individual Session) */}
        <Text style={styles.sectionHeader}>LATEST CHARGING RECEIPT</Text>
        <Card elevated style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <View>
              <Text style={styles.locationTitle}>{mockBilling.currentSession.location}</Text>
              <Text style={styles.dateSub}>
                {mockBilling.currentSession.date} • {mockBilling.currentSession.time}
              </Text>
            </View>
            <Badge label="PAID" variant="success" dot />
          </View>

          <View style={styles.divider} />

          <View style={styles.lineItems}>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>
                EV Energy ({mockBilling.currentSession.energyKwh} kWh @ ₹12.00/kWh)
              </Text>
              <Text style={styles.itemValue}>₹{mockBilling.currentSession.energyCost}</Text>
            </View>

            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Parking Fee (1 hour)</Text>
              <Text style={styles.itemValue}>₹{mockBilling.currentSession.parkingFee}</Text>
            </View>

            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Convenience / Service Fee</Text>
              <Text style={styles.itemValue}>₹{mockBilling.currentSession.serviceFee}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalAmount}>₹{mockBilling.currentSession.total}</Text>
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="View Full Receipt"
              size="sm"
              variant="secondary"
              icon={<Ionicons name="receipt-outline" size={16} color={colors.textPrimary} />}
              onPress={() => Alert.alert('Receipt Details', 'Receipt #VF-90214\nTransaction ID: TXN_8829401')}
              style={styles.btnHalf}
            />

            <Button
              title="Download PDF"
              size="sm"
              variant="secondary"
              icon={<Ionicons name="download-outline" size={16} color={colors.primaryLight} />}
              onPress={() => Alert.alert('Download Receipt', 'Invoice PDF exported to Downloads.')}
              style={styles.btnHalf}
            />
          </View>
        </Card>

        {/* MONTHLY SUMMARY (Residential Community / Utility) */}
        <Text style={styles.sectionHeader}>MONTHLY RESIDENTIAL CHARGING</Text>
        <Card style={styles.monthlyCard}>
          <View style={styles.monthlyHeader}>
            <View>
              <Text style={styles.monthlyMonth}>{mockBilling.monthlyResidential.month}</Text>
              <Text style={styles.monthlyStatus}>{mockBilling.monthlyResidential.status}</Text>
            </View>
            <Text style={styles.monthlyTotal}>₹{mockBilling.monthlyResidential.totalAmount}</Text>
          </View>

          <View style={styles.monthlyStats}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>SESSIONS</Text>
              <Text style={styles.statVal}>{mockBilling.monthlyResidential.totalSessions}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>TOTAL ENERGY</Text>
              <Text style={styles.statVal}>{mockBilling.monthlyResidential.totalKwh} kWh</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>SOLAR SAVINGS</Text>
              <Text style={[styles.statVal, { color: colors.solarLight }]}>
                ₹{mockBilling.monthlyResidential.solarSavings}
              </Text>
            </View>
          </View>

          <Text style={styles.savingsNote}>
            💡 Smart scheduling saved an estimated ₹{mockBilling.monthlyResidential.solarSavings} by shifting flexible charging to lower-cost electricity hours.
          </Text>
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
  sectionHeader: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: -4,
    marginLeft: 4,
  },
  receiptCard: {
    backgroundColor: colors.surfaceElevated,
    gap: spacing.xs,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  locationTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
  },
  dateSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
    marginVertical: spacing.xs,
  },
  lineItems: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: spacing.xs,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.solarLight,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btnHalf: {
    flex: 1,
  },
  monthlyCard: {
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  monthlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  monthlyMonth: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  monthlyStatus: {
    fontSize: 12,
    color: colors.primaryLight,
    marginTop: 2,
  },
  monthlyTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  savingsNote: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
