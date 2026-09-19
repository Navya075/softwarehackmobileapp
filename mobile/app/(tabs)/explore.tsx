import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, useThemeColors, spacing, typography, radii } from '../../src/theme';
import { mockChargers, ChargerItem } from '../../src/mock';
import { useAppContextStore } from '../../src/store/useAppContextStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';

export default function ExploreTabScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { chargingContext } = useAppContextStore();
  const isResidential = chargingContext === 'residential';

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [speedFilter, setSpeedFilter] = useState<'all' | 'dc' | 'ac'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Filter chargers
  const filteredChargers = mockChargers.filter((c) => {
    if (onlyAvailable && c.availableCount === 0) return false;
    if (speedFilter === 'dc' && !c.speedType.includes('DC') && !c.speedType.includes('Ultra')) return false;
    if (speedFilter === 'ac' && !c.speedType.includes('AC') && !c.speedType.includes('Level 2')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Find Chargers"
        subtitle="Public Fast Hubs, Workplace & Community Charging"
        showNotificationBell={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar with Map / List Toggle */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              placeholder="Search by mall, station or area..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Map/List Switcher */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            >
              <Ionicons
                name="list"
                size={18}
                color={viewMode === 'list' ? colors.primaryLight : colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('map')}
              style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            >
              <Ionicons
                name="map"
                size={18}
                color={viewMode === 'map' ? colors.primaryLight : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersScroll}>
          <TouchableOpacity
            onPress={() => setSpeedFilter('all')}
            style={[styles.filterChip, speedFilter === 'all' && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, speedFilter === 'all' && styles.filterChipTextActive]}>
              All Speeds
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSpeedFilter('dc')}
            style={[styles.filterChip, speedFilter === 'dc' && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, speedFilter === 'dc' && styles.filterChipTextActive]}>
              ⚡ DC Fast (50+ kW)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSpeedFilter('ac')}
            style={[styles.filterChip, speedFilter === 'ac' && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, speedFilter === 'ac' && styles.filterChipTextActive]}>
              Level 2 AC
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setOnlyAvailable(!onlyAvailable)}
            style={[styles.filterChip, onlyAvailable && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, onlyAvailable && styles.filterChipTextActive]}>
              ✓ Available Only
            </Text>
          </TouchableOpacity>
        </View>

        {/* MAP VIEW VISUALIZER */}
        {viewMode === 'map' && (
          <Card style={styles.mapCard}>
            <View style={styles.mapMockArea}>
              <Ionicons name="map-outline" size={40} color={colors.textMuted} />
              <Text style={styles.mapTitle}>Live Charger Density Map</Text>
              <Text style={styles.mapSub}>
                Showing 4 stations within 5 km of your location
              </Text>
              <View style={styles.mapPinsRow}>
                <View style={styles.mapPin}>
                  <Text style={styles.pinText}>Phoenix Mall (3 avail)</Text>
                </View>
                <View style={[styles.mapPin, { backgroundColor: colors.solar }]}>
                  <Text style={styles.pinText}>Green Residency (2 avail)</Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* RESIDENTIAL COMMUNITY CHARGING BANNER (If in Residential Mode) */}
        {isResidential && (
          <Card style={styles.communityBanner}>
            <View style={styles.commTop}>
              <View>
                <Text style={styles.commTitle}>Apartment Community Chargers</Text>
                <Text style={styles.commSub}>Green Residency • 2 of 3 Chargers Available</Text>
              </View>
              <Badge label="RESIDENTIAL" variant="neutral" />
            </View>

            <View style={styles.commSlotsRow}>
              <View style={styles.commSlot}>
                <Text style={styles.slotName}>C01</Text>
                <Text style={[styles.slotStatus, { color: colors.primaryLight }]}>Available</Text>
              </View>
              <View style={styles.commSlot}>
                <Text style={styles.slotName}>C02</Text>
                <Text style={[styles.slotStatus, { color: colors.warning }]}>Occupied</Text>
              </View>
              <View style={styles.commSlot}>
                <Text style={styles.slotName}>C03</Text>
                <Text style={[styles.slotStatus, { color: colors.primaryLight }]}>Available</Text>
              </View>
            </View>

            <Button
              title="Reserve Community Charger C01"
              size="sm"
              variant="outline"
              icon={<Ionicons name="calendar-outline" size={16} color={colors.primaryLight} />}
              onPress={() =>
                router.push({
                  pathname: '/reserve-charger',
                  params: { chargerId: 'ch_green_res_01' },
                })
              }
            />
          </Card>
        )}

        {/* CHARGER LIST */}
        <Text style={styles.sectionHeader}>
          {filteredChargers.length} CHARGERS NEARBY
        </Text>

        <View style={styles.chargerList}>
          {filteredChargers.map((ch) => {
            const isFull = ch.availableCount === 0;
            return (
              <Card key={ch.id} style={styles.chargerCard}>
                <View style={styles.chargerTopRow}>
                  <View style={styles.chargerNameCol}>
                    <Text style={styles.chargerName}>{ch.name}</Text>
                    <Text style={styles.chargerLocation}>{ch.location}</Text>
                  </View>
                  <Badge
                    label={isFull ? 'OCCUPIED' : `${ch.availableCount}/${ch.totalCount} AVAILABLE`}
                    variant={isFull ? 'danger' : 'success'}
                    dot
                  />
                </View>

                {/* Specs */}
                <View style={styles.specsRow}>
                  <View style={styles.specItem}>
                    <Ionicons name="navigate-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.specText}>{ch.distanceKm} km</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Ionicons name="flash-outline" size={14} color={colors.primaryLight} />
                    <Text style={styles.specText}>{ch.speedType} ({ch.powerKw} kW)</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Ionicons name="cash-outline" size={14} color={colors.solarLight} />
                    <Text style={styles.specText}>₹{ch.pricePerKwh}/kWh</Text>
                  </View>
                </View>

                {/* Bottom actions */}
                <View style={styles.cardActionsRow}>
                  <Button
                    title="View Charger & Reserve"
                    size="sm"
                    variant="primary"
                    onPress={() =>
                      router.push({
                        pathname: '/charger-details',
                        params: { chargerId: ch.id },
                      })
                    }
                    style={styles.cardBtn}
                  />
                </View>
              </Card>
            );
          })}
        </View>
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
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.surface,
  },
  filtersScroll: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGhost,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  mapCard: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  mapMockArea: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  mapTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  mapSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  mapPinsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  mapPin: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  pinText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
  },
  communityBanner: {
    backgroundColor: colors.surfaceElevated,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: spacing.md,
  },
  commTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  commTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  commSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  commSlotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  commSlot: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  slotName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  slotStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: -4,
    marginLeft: 4,
  },
  chargerList: {
    gap: spacing.sm,
  },
  chargerCard: {
    gap: spacing.md,
  },
  chargerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chargerNameCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  chargerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chargerLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardBtn: {
    flex: 1,
  },
});
