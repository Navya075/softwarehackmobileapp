import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../../theme';
import { BackendBillItem } from '../../services/billingService';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface DemoPaymentModalProps {
  visible: boolean;
  bill: BackendBillItem | null;
  onClose: () => void;
  onPaymentSuccess: (paidBill: BackendBillItem) => void;
  onViewInvoice?: (bill: BackendBillItem) => void;
}

type PaymentMethodType = 'UPI (Demo)' | 'Card (Demo)' | 'Wallet (Demo)';

export const DemoPaymentModal: React.FC<DemoPaymentModalProps> = ({
  visible,
  bill,
  onClose,
  onPaymentSuccess,
  onViewInvoice,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('UPI (Demo)');
  const [processing, setProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedBill, setCompletedBill] = useState<BackendBillItem | null>(null);

  if (!bill) return null;

  const handlePay = async () => {
    setProcessing(true);
    // Short simulated processing delay (approx 1s) for authentic UX
    setTimeout(async () => {
      try {
        const { useBillingStore } = await import('../../store/useBillingStore');
        const paid = await useBillingStore.getState().payBill(bill.bill_id, selectedMethod);
        const finalBill = paid || {
          ...bill,
          status: 'paid',
          payment_method: selectedMethod,
          paid_at: new Date().toISOString(),
          invoice_number: bill.invoice_number || `VF-INV-${bill.bill_id.replace(/^bill_/, '').toUpperCase()}`,
        };
        setCompletedBill(finalBill);
        setIsSuccess(true);
        setProcessing(false);
        onPaymentSuccess(finalBill);
      } catch {
        setProcessing(false);
      }
    }, 900);
  };

  const handleDone = () => {
    setIsSuccess(false);
    setCompletedBill(null);
    onClose();
  };

  const handleViewInvoice = () => {
    const target = completedBill || bill;
    setIsSuccess(false);
    setCompletedBill(null);
    onClose();
    if (onViewInvoice) {
      onViewInvoice(target);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={isSuccess ? handleDone : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {isSuccess ? (
            /* SUCCESS STATE */
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
              </View>

              <Text style={styles.successTitle}>Payment Successful</Text>
              <Text style={styles.successSubtitle}>Demo payment completed</Text>

              <View style={styles.successReceiptBox}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Invoice Number</Text>
                  <Text style={styles.receiptValue}>
                    {completedBill?.invoice_number || bill.invoice_number || 'VF-INV-90214'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Amount Paid</Text>
                  <Text style={[styles.receiptValue, { color: colors.solarLight }]}>
                    ₹{completedBill?.total_cost ?? bill.total_cost}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Payment Method</Text>
                  <Text style={styles.receiptValue}>{selectedMethod}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Status</Text>
                  <Badge label="PAID" variant="success" dot />
                </View>
              </View>

              <View style={styles.successButtonsRow}>
                <Button
                  title="View Bill / Invoice"
                  size="md"
                  variant="primary"
                  icon={<Ionicons name="document-text-outline" size={16} color={colors.textInverse} />}
                  onPress={handleViewInvoice}
                  style={styles.actionBtn}
                />
                <Button
                  title="Done"
                  size="md"
                  variant="secondary"
                  onPress={handleDone}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          ) : (
            /* PAYMENT SELECTION STATE */
            <View>
              <View style={styles.modalHeader}>
                <View>
                  <View style={styles.titleBadgeRow}>
                    <Text style={styles.modalTitle}>Demo Payment</Text>
                    <Badge label="DEMO ONLY" variant="warning" />
                  </View>
                  <Text style={styles.modalSubtitle}>
                    Simulated Hackathon Checkout • No real money processed
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} disabled={processing}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Amount Banner */}
              <View style={styles.amountBanner}>
                <Text style={styles.amountLabel}>Total Amount Due</Text>
                <Text style={styles.amountValue}>₹{bill.total_cost.toFixed(2)}</Text>
                <Text style={styles.sessionDetailsSub}>
                  {bill.charger_name} • {bill.energy_kwh} kWh
                </Text>
              </View>

              {/* Payment Methods */}
              <Text style={styles.sectionHeading}>SELECT DEMO PAYMENT METHOD</Text>

              <View style={styles.methodsList}>
                {/* UPI DEMO */}
                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    selectedMethod === 'UPI (Demo)' && styles.methodOptionSelected,
                  ]}
                  onPress={() => setSelectedMethod('UPI (Demo)')}
                  activeOpacity={0.8}
                  disabled={processing}
                >
                  <View style={styles.methodIconBox}>
                    <Ionicons name="flash-outline" size={20} color={colors.primaryLight} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>UPI (Demo)</Text>
                    <Text style={styles.methodSub}>Simulated Instant VPA / QR Payment</Text>
                  </View>
                  <Ionicons
                    name={selectedMethod === 'UPI (Demo)' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedMethod === 'UPI (Demo)' ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>

                {/* CARD DEMO */}
                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    selectedMethod === 'Card (Demo)' && styles.methodOptionSelected,
                  ]}
                  onPress={() => setSelectedMethod('Card (Demo)')}
                  activeOpacity={0.8}
                  disabled={processing}
                >
                  <View style={styles.methodIconBox}>
                    <Ionicons name="card-outline" size={20} color={colors.solarLight} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>Card (Demo)</Text>
                    <Text style={styles.methodSub}>Simulated Credit / Debit Card</Text>
                  </View>
                  <Ionicons
                    name={selectedMethod === 'Card (Demo)' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedMethod === 'Card (Demo)' ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>

                {/* WALLET DEMO */}
                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    selectedMethod === 'Wallet (Demo)' && styles.methodOptionSelected,
                  ]}
                  onPress={() => setSelectedMethod('Wallet (Demo)')}
                  activeOpacity={0.8}
                  disabled={processing}
                >
                  <View style={styles.methodIconBox}>
                    <Ionicons name="wallet-outline" size={20} color="#60a5fa" />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>Wallet (Demo)</Text>
                    <Text style={styles.methodSub}>Simulated VoltFlow EV Balance</Text>
                  </View>
                  <Ionicons
                    name={selectedMethod === 'Wallet (Demo)' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedMethod === 'Wallet (Demo)' ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.securityNotice}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.primaryLight} />
                <Text style={styles.securityNoticeText}>
                  Demo payment simulation: no credentials or sensitive data are collected.
                </Text>
              </View>

              {/* Action Button */}
              <Button
                title={processing ? 'Processing Demo Payment...' : `Pay ₹${bill.total_cost} (Demo)`}
                size="lg"
                variant="primary"
                loading={processing}
                disabled={processing}
                onPress={handlePay}
                style={styles.payBtn}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  modalTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  amountBanner: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSubtle,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.solarLight,
    marginVertical: 4,
  },
  sessionDetailsSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionHeading: {
    ...typography.label,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginLeft: 2,
  },
  methodsList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSubtle,
  },
  methodOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 229, 153, 0.08)',
  },
  methodIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  methodSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0, 229, 153, 0.06)',
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  securityNoticeText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 14,
  },
  payBtn: {
    width: '100%',
  },
  /* SUCCESS STYLES */
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successIconCircle: {
    marginBottom: spacing.sm,
  },
  successTitle: {
    ...typography.h2,
    fontSize: 22,
    color: colors.textPrimary,
  },
  successSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  successReceiptBox: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSubtle,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  receiptLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  successButtonsRow: {
    width: '100%',
    gap: spacing.xs,
  },
  actionBtn: {
    width: '100%',
  },
});
