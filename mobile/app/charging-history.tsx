import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../src/theme';
import { mockHistory, HistorySessionItem } from '../src/mock';
import { Header } from '../src/components/ui/Header';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';
import { useBillingStore } from '../src/store/useBillingStore';
import { InvoiceModal } from '../src/components/billing/InvoiceModal';
import { BackendBillItem } from '../src/services/billingService';

export default function ChargingHistoryScreen() {
  const [filterPeriod, setFilterPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [selectedSession, setSelectedSession] = useState<HistorySessionItem | null>(null);
  const [selectedInvoiceBill, setSelectedInvoiceBill] = useState<BackendBillItem | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Charging History" subtitle="Past Sessions, Energy & Receipts" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Filter Bar */}
        <View style={styles.filterRow}>
          {(['day', 'week', 'month'] as const).map((period) => {
            const isSelected = filterPeriod === period;
            return (
              <TouchableOpacity
                key={period}
                onPress={() => setFilterPeriod(period)}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {period.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Session List */}
        <View style={styles.sessionList}>
          {mockHistory.map((session) => (
            <TouchableOpacity
              key={session.id}
              activeOpacity={0.8}
              onPress={() => setSelectedSession(session)}
            >
              <Card style={styles.sessionCard}>
                <View style={styles.sessionCardTop}>
                  <View>
                    <Text style={styles.sessionDate}>{session.date}</Text>
                    <Text style={styles.sessionLocation}>{session.location}</Text>
                  </View>
                  <Text style={styles.sessionCost}>₹{session.costInr}</Text>
                </View>

                <View style={styles.sessionMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>ENERGY</Text>
                    <Text style={styles.metricVal}>{session.energyKwh} kWh</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>BATTERY</Text>
                    <Text style={styles.metricVal}>{session.startSoc}% → {session.endSoc}%</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>DURATION</Text>
                    <Text style={styles.metricVal}>{session.duration}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>CLEAN SHARE</Text>
                    <Text style={[styles.metricVal, { color: colors.solarLight }]}>
                      {session.solarSharePercent}%
                    </Text>
                  </View>
                </View>

                {session.reasonSummary && (
                  <View style={styles.reasonBox}>
                    <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
                    <Text style={styles.reasonSummaryText}>{session.reasonSummary}</Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Full Session Details Modal */}
      {selectedSession && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedSession(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Session Details</Text>
                  <Text style={styles.modalSubtitle}>{selectedSession.date} • {selectedSession.location}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedSession(null)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                <View style={styles.detailGrid}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Starting Battery</Text>
                    <Text style={styles.detailVal}>{selectedSession.startSoc}%</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ending Battery</Text>
                    <Text style={[styles.detailVal, { color: colors.primaryLight }]}>{selectedSession.endSoc}%</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Energy Delivered</Text>
                    <Text style={styles.detailVal}>{selectedSession.energyKwh} kWh</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Charging Duration</Text>
                    <Text style={styles.detailVal}>{selectedSession.duration}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Charger Rate</Text>
                    <Text style={styles.detailVal}>{selectedSession.speed}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Clean Solar Share</Text>
                    <Text style={[styles.detailVal, { color: colors.solarLight }]}>
                      {selectedSession.solarSharePercent}%
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Session Cost</Text>
                    <Text style={[styles.detailVal, { color: colors.solarLight, fontWeight: '800' }]}>
                      ₹{selectedSession.costInr}
                    </Text>
                  </View>
                </View>

                {selectedSession.reasonSummary && (
                  <Card style={styles.modalWhyCard}>
                    <Text style={styles.modalWhyTitle}>Why charging was adjusted:</Text>
                    <Text style={styles.modalWhyText}>{selectedSession.reasonSummary}</Text>
                  </Card>
                )}

                <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
                  <Button
                    title="Generate / View Bill"
                    size="md"
                    variant="primary"
                    icon={<Ionicons name="document-text-outline" size={16} color={colors.textInverse} />}
                    onPress={() => {
                      const bill = useBillingStore.getState().generateBillForSession(selectedSession);
                      setSelectedSession(null);
                      setSelectedInvoiceBill(bill);
                    }}
                    style={styles.modalCloseBtn}
                  />

                  <Button
                    title="Close Details"
                    size="md"
                    variant="secondary"
                    onPress={() => setSelectedSession(null)}
                    style={styles.modalCloseBtn}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Full Invoice Modal */}
      <InvoiceModal
        visible={!!selectedInvoiceBill}
        bill={selectedInvoiceBill}
        onClose={() => setSelectedInvoiceBill(null)}
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    padding: 3,
    borderRadius: radii.md,
  },
  filterPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  filterPillActive: {
    backgroundColor: colors.surface,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.primaryLight,
  },
  sessionList: {
    gap: spacing.sm,
  },
  sessionCard: {
    gap: spacing.sm,
  },
  sessionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionDate: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sessionLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sessionCost: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.solarLight,
  },
  sessionMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  reasonSummaryText: {
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalScroll: {
    marginTop: spacing.xs,
  },
  detailGrid: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalWhyCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: spacing.base,
  },
  modalWhyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryLight,
    marginBottom: 4,
  },
  modalWhyText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  modalCloseBtn: {
    marginTop: spacing.xs,
    marginBottom: spacing.base,
  },
});
