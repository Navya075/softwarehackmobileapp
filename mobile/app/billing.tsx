import React, { useEffect, useState } from 'react';
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
import { useBillingStore } from '../src/store/useBillingStore';
import { BackendBillItem } from '../src/services/billingService';
import { DemoPaymentModal } from '../src/components/billing/DemoPaymentModal';
import { InvoiceModal } from '../src/components/billing/InvoiceModal';
import { downloadAndShareInvoice } from '../src/utils/invoicePdf';

export default function BillingScreen() {
  const router = useRouter();
  const { chargingContext } = useAppContextStore();
  const isResidential = chargingContext === 'residential';

  const { bills, fetchBills } = useBillingStore();
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<BackendBillItem | null>(null);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState<BackendBillItem | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  // Featured bill: prioritize pending bill if available, else the first bill
  const pendingBill = bills.find((b) => (b.status || '').toLowerCase() === 'pending');
  const latestBill = pendingBill || bills[0];
  const isLatestPaid = (latestBill?.status || '').toLowerCase() === 'paid';

  const handleDownloadLatest = async (bill: BackendBillItem) => {
    setDownloadingPdf(true);
    try {
      const res = await downloadAndShareInvoice(bill);
      if (!res.success) {
        Alert.alert('Download Bill', 'Invoice ready in system print/save dialog.');
      }
    } catch {
      Alert.alert('Download Bill', 'Unable to export invoice PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Billing & Receipts" subtitle="Energy Costs, Tariffs & Statements" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* LATEST CHARGING RECEIPT (Commercial / Individual Session) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>
            {isLatestPaid ? 'LATEST CHARGING RECEIPT' : 'CURRENT CHARGING BILL'}
          </Text>
          {!isLatestPaid && (
            <Badge label="PAYMENT DUE" variant="warning" dot />
          )}
        </View>

        {latestBill && (
          <Card elevated style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <View style={styles.headerInfo}>
                <Text style={styles.locationTitle}>{latestBill.charger_name || mockBilling.currentSession.location}</Text>
                <Text style={styles.dateSub}>
                  {latestBill.start_time && latestBill.end_time
                    ? `${latestBill.start_time} - ${latestBill.end_time}`
                    : mockBilling.currentSession.time}{' '}
                  • {latestBill.duration || '55 mins'}
                </Text>
                {latestBill.invoice_number && (
                  <Text style={styles.invoiceNumSub}>Inv #{latestBill.invoice_number}</Text>
                )}
              </View>
              <Badge
                label={isLatestPaid ? 'PAID' : 'PENDING'}
                variant={isLatestPaid ? 'success' : 'warning'}
                dot
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.lineItems}>
              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>
                  EV Energy ({latestBill.energy_kwh} kWh @ ₹{(latestBill.rate_per_kwh ?? 12).toFixed(2)}/kWh)
                </Text>
                <Text style={styles.itemValue}>₹{latestBill.energy_cost.toFixed(2)}</Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Parking Fee</Text>
                <Text style={styles.itemValue}>₹{(latestBill.parking_cost ?? 0).toFixed(2)}</Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Convenience / Service Fee</Text>
                <Text style={styles.itemValue}>₹{(latestBill.service_fee ?? 0).toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{isLatestPaid ? 'Total Paid' : 'Total Due'}</Text>
              <Text style={styles.totalAmount}>₹{latestBill.total_cost.toFixed(2)}</Text>
            </View>

            <View style={styles.buttonRow}>
              {!isLatestPaid ? (
                <>
                  <Button
                    title="Pay Bill"
                    size="sm"
                    variant="primary"
                    icon={<Ionicons name="card-outline" size={16} color={colors.textInverse} />}
                    onPress={() => setSelectedBillForPayment(latestBill)}
                    style={styles.btnHalf}
                  />

                  <Button
                    title="Generate Bill"
                    size="sm"
                    variant="secondary"
                    icon={<Ionicons name="document-text-outline" size={16} color={colors.textPrimary} />}
                    onPress={() => setSelectedBillForInvoice(latestBill)}
                    style={styles.btnHalf}
                  />
                </>
              ) : (
                <>
                  <Button
                    title="View Bill"
                    size="sm"
                    variant="secondary"
                    icon={<Ionicons name="receipt-outline" size={16} color={colors.textPrimary} />}
                    onPress={() => setSelectedBillForInvoice(latestBill)}
                    style={styles.btnHalf}
                  />

                  <Button
                    title={downloadingPdf ? 'Exporting...' : 'Download PDF'}
                    size="sm"
                    variant="secondary"
                    loading={downloadingPdf}
                    disabled={downloadingPdf}
                    icon={<Ionicons name="download-outline" size={16} color={colors.primaryLight} />}
                    onPress={() => handleDownloadLatest(latestBill)}
                    style={styles.btnHalf}
                  />
                </>
              )}
            </View>
          </Card>
        )}

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

        {/* ALL CHARGING INVOICES & STATEMENTS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>CHARGING INVOICES & STATEMENTS</Text>
          <Text style={styles.countBadge}>{bills.length} Records</Text>
        </View>

        <View style={styles.billsListContainer}>
          {bills.map((item) => {
            const paid = (item.status || '').toLowerCase() === 'paid';
            const itemDate = item.paid_at
              ? new Date(item.paid_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : new Date(item.created_at || Date.now()).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

            return (
              <Card key={item.bill_id} style={styles.billItemCard}>
                <View style={styles.billItemTop}>
                  <View style={styles.billItemMeta}>
                    <View style={styles.invBadgeRow}>
                      <Text style={styles.billInvoiceNum}>
                        {item.invoice_number || `VF-INV-${item.bill_id.replace(/^bill_/, '').toUpperCase()}`}
                      </Text>
                      <Badge
                        label={paid ? 'PAID' : 'PENDING'}
                        variant={paid ? 'success' : 'warning'}
                        dot
                      />
                    </View>
                    <Text style={styles.billItemDate}>
                      {itemDate} • {item.charger_name}
                    </Text>
                    <Text style={styles.billItemVehicle}>
                      Vehicle: {item.vehicle_model || 'Tata Nexon EV Max'} ({item.license_plate || 'KA-01-EV-2024'})
                    </Text>
                  </View>
                  <View style={styles.billItemRight}>
                    <Text style={styles.billItemAmount}>₹{item.total_cost.toFixed(2)}</Text>
                    <Text style={styles.billItemEnergy}>{item.energy_kwh} kWh</Text>
                  </View>
                </View>

                <View style={styles.billItemDivider} />

                <View style={styles.billItemActionRow}>
                  {paid ? (
                    <Button
                      title="View Bill"
                      size="sm"
                      variant="secondary"
                      icon={<Ionicons name="document-text-outline" size={14} color={colors.textPrimary} />}
                      onPress={() => setSelectedBillForInvoice(item)}
                      style={styles.btnFullWidth}
                    />
                  ) : (
                    <View style={styles.pendingActionGroup}>
                      <Button
                        title="Pay Bill (Demo)"
                        size="sm"
                        variant="primary"
                        icon={<Ionicons name="card-outline" size={14} color={colors.textInverse} />}
                        onPress={() => setSelectedBillForPayment(item)}
                        style={styles.btnHalf}
                      />
                      <Button
                        title="View Bill"
                        size="sm"
                        variant="secondary"
                        icon={<Ionicons name="document-text-outline" size={14} color={colors.textPrimary} />}
                        onPress={() => setSelectedBillForInvoice(item)}
                        style={styles.btnHalf}
                      />
                    </View>
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* DEMO PAYMENT MODAL */}
      <DemoPaymentModal
        visible={!!selectedBillForPayment}
        bill={selectedBillForPayment}
        onClose={() => setSelectedBillForPayment(null)}
        onPaymentSuccess={(paid) => {
          setSelectedBillForPayment(null);
        }}
        onViewInvoice={(bill) => {
          setSelectedBillForPayment(null);
          setSelectedBillForInvoice(bill);
        }}
      />

      {/* FULL PROFESSIONAL INVOICE MODAL */}
      <InvoiceModal
        visible={!!selectedBillForInvoice}
        bill={selectedBillForInvoice}
        onClose={() => setSelectedBillForInvoice(null)}
        onPayBill={(bill) => {
          setSelectedBillForInvoice(null);
          setSelectedBillForPayment(bill);
        }}
      />
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -4,
    marginLeft: 4,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textMuted,
  },
  countBadge: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
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
  headerInfo: {
    flex: 1,
    marginRight: spacing.sm,
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
  invoiceNumSub: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '700',
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
  btnFullWidth: {
    width: '100%',
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
  /* BILLS LIST STYLES */
  billsListContainer: {
    gap: spacing.sm,
  },
  billItemCard: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
  },
  billItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  billItemMeta: {
    flex: 1,
    marginRight: spacing.sm,
  },
  invBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  billInvoiceNum: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  billItemDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  billItemVehicle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  billItemRight: {
    alignItems: 'flex-end',
  },
  billItemAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.solarLight,
  },
  billItemEnergy: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  billItemDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
    marginVertical: spacing.xs,
  },
  billItemActionRow: {
    marginTop: 2,
  },
  pendingActionGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
