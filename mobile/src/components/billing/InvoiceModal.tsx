import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../../theme';
import { BackendBillItem } from '../../services/billingService';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { downloadAndShareInvoice, printInvoice } from '../../utils/invoicePdf';

interface InvoiceModalProps {
  visible: boolean;
  bill: BackendBillItem | null;
  onClose: () => void;
  onPayBill?: (bill: BackendBillItem) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  visible,
  bill,
  onClose,
  onPayBill,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  if (!bill) return null;

  const isPaid = (bill.status || '').toLowerCase() === 'paid';
  const invNumber = bill.invoice_number || `VF-INV-${bill.bill_id.replace(/^bill_/, '').toUpperCase()}`;
  const invDate = bill.paid_at
    ? new Date(bill.paid_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date(bill.created_at || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await downloadAndShareInvoice(bill);
      if (!res.success) {
        Alert.alert('Download Bill', 'Invoice ready in system print/save dialog.');
      }
    } catch {
      Alert.alert('Error', 'Unable to generate PDF document.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printInvoice(bill);
    } catch {
      Alert.alert('Error', 'Print action failed.');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.brandingBox}>
              <Text style={styles.brandTitle}>VOLT FLOW</Text>
              <Text style={styles.brandSub}>EV Charging Invoice</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Invoice Meta Card */}
            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <View>
                  <Text style={styles.metaLabel}>Invoice Number</Text>
                  <Text style={styles.metaValHighlight}>{invNumber}</Text>
                </View>
                <View style={styles.metaRight}>
                  <Text style={styles.metaLabel}>Invoice Date</Text>
                  <Text style={styles.metaVal}>{invDate}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View>
                  <Text style={styles.metaLabel}>Payment Status</Text>
                  <Badge
                    label={isPaid ? 'PAID' : 'PENDING'}
                    variant={isPaid ? 'success' : 'warning'}
                    dot
                  />
                </View>
                <View style={styles.metaRight}>
                  <Text style={styles.metaLabel}>Payment Method</Text>
                  <Text style={styles.metaVal}>
                    {bill.payment_method || (isPaid ? 'Demo Payment' : 'Unpaid')}
                  </Text>
                </View>
              </View>
            </View>

            {/* CUSTOMER & VEHICLE */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeader}>CUSTOMER DETAILS</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Customer Name:</Text>
                  <Text style={styles.infoVal}>{bill.customer_name || 'Alex Mercer'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email / Mobile:</Text>
                  <Text style={styles.infoVal}>alex.mercer@voltflow.energy</Text>
                </View>
              </View>

              <View style={styles.subDivider} />

              <Text style={styles.sectionHeader}>VEHICLE INFORMATION</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Make / Model:</Text>
                  <Text style={styles.infoVal}>{bill.vehicle_model || 'Tata Nexon EV Max'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Vehicle Type:</Text>
                  <Text style={styles.infoVal}>Passenger EV (Electric)</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>License Plate:</Text>
                  <Text style={styles.infoVal}>{bill.license_plate || 'KA-01-EV-2024'}</Text>
                </View>
              </View>
            </View>

            {/* CHARGING SESSION */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeader}>CHARGING SESSION</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Charger / Hub:</Text>
                  <Text style={styles.infoVal}>{bill.charger_name || 'Phoenix Mall (Charger C07)'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Charging Date:</Text>
                  <Text style={styles.infoVal}>{invDate}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Time Window:</Text>
                  <Text style={styles.infoVal}>
                    {bill.start_time || '04:30 PM'} - {bill.end_time || '05:25 PM'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Duration:</Text>
                  <Text style={styles.infoVal}>{bill.duration || '55 mins'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Energy Consumed:</Text>
                  <Text style={[styles.infoVal, { color: colors.primaryLight, fontWeight: '800' }]}>
                    {bill.energy_kwh} kWh
                  </Text>
                </View>
              </View>
            </View>

            {/* CHARGING COST & BREAKDOWN */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeader}>CHARGING COST BREAKDOWN</Text>

              <View style={styles.costTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableColLabel, { flex: 2 }]}>DESCRIPTION</Text>
                  <Text style={[styles.tableColLabel, { flex: 1, textAlign: 'right' }]}>RATE</Text>
                  <Text style={[styles.tableColLabel, { flex: 1, textAlign: 'right' }]}>AMOUNT</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    EV Energy Delivered ({bill.energy_kwh} kWh)
                  </Text>
                  <Text style={[styles.tableCellMuted, { flex: 1, textAlign: 'right' }]}>
                    ₹{(bill.rate_per_kwh ?? 12).toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                    ₹{bill.energy_cost.toFixed(2)}
                  </Text>
                </View>

                {(bill.parking_cost ?? 0) > 0 && (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>EV Parking Bay Charge</Text>
                    <Text style={[styles.tableCellMuted, { flex: 1, textAlign: 'right' }]}>Fixed</Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                      ₹{(bill.parking_cost ?? 0).toFixed(2)}
                    </Text>
                  </View>
                )}

                {(bill.service_fee ?? 0) > 0 && (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>Convenience / Service Fee</Text>
                    <Text style={[styles.tableCellMuted, { flex: 1, textAlign: 'right' }]}>Fixed</Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                      ₹{(bill.service_fee ?? 0).toFixed(2)}
                    </Text>
                  </View>
                )}

                <View style={styles.costDivider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalVal}>₹{bill.total_cost.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* PAYMENT DETAILS */}
            <View style={[styles.sectionBox, { marginBottom: spacing.md }]}>
              <Text style={styles.sectionHeader}>PAYMENT DETAILS</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Method:</Text>
                  <Text style={styles.infoVal}>
                    {bill.payment_method || (isPaid ? 'Demo Payment' : 'Pending Payment')}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Status:</Text>
                  <Text style={[styles.infoVal, { color: isPaid ? colors.primary : colors.warning }]}>
                    {isPaid ? 'PAID' : 'PENDING'}
                  </Text>
                </View>
                {bill.paid_at && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Payment Date:</Text>
                    <Text style={styles.infoVal}>
                      {new Date(bill.paid_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footerActions}>
            {!isPaid && onPayBill && (
              <Button
                title="Pay Bill (Demo)"
                size="md"
                variant="primary"
                icon={<Ionicons name="card-outline" size={16} color={colors.textInverse} />}
                onPress={() => onPayBill(bill)}
                style={styles.btnFull}
              />
            )}

            <View style={styles.downloadRow}>
              <Button
                title={downloading ? 'Preparing PDF...' : 'Download Bill'}
                size="md"
                variant={isPaid ? 'primary' : 'secondary'}
                loading={downloading}
                disabled={downloading}
                icon={<Ionicons name="download-outline" size={16} color={isPaid ? colors.textInverse : colors.textPrimary} />}
                onPress={handleDownload}
                style={styles.btnHalf}
              />

              <Button
                title={printing ? 'Printing...' : 'Print Bill'}
                size="md"
                variant="secondary"
                loading={printing}
                disabled={printing}
                icon={<Ionicons name="print-outline" size={16} color={colors.primaryLight} />}
                onPress={handlePrint}
                style={styles.btnHalf}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  modalCard: {
    width: '100%',
    maxHeight: '92%',
    maxWidth: 500,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorderSubtle,
    marginBottom: spacing.sm,
  },
  brandingBox: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  scrollArea: {
    flexGrow: 0,
  },
  metaCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSubtle,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  metaValHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 1,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 1,
  },
  sectionBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSubtle,
  },
  sectionHeader: {
    ...typography.label,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  subDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
    marginVertical: spacing.xs,
  },
  infoGrid: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  costTable: {
    gap: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorderSubtle,
  },
  tableColLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  tableCell: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  tableCellMuted: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  costDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.solarLight,
  },
  footerActions: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSubtle,
    gap: spacing.xs,
  },
  downloadRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  btnHalf: {
    flex: 1,
  },
  btnFull: {
    width: '100%',
  },
});
