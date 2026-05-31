/**
 * HistoryScreen — List of recently scanned tickets with search/filter.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, ScanHistoryItem } from '../utils/constants';
import { useScannerContext } from '../context/ScannerContext';

const HistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { scanHistory, clearHistory } = useScannerContext();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter history based on search
  const filteredHistory = scanHistory.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.attendeeName.toLowerCase().includes(q) ||
      item.eventName.toLowerCase().includes(q) ||
      item.ticketId.toLowerCase().includes(q)
    );
  });

  const validCount = scanHistory.filter((i) => i.isValid).length;
  const invalidCount = scanHistory.filter((i) => !i.isValid).length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: ScanHistoryItem }) => (
    <View style={[styles.historyItem, !item.isValid && styles.historyItemInvalid]}>
      <View style={styles.itemLeft}>
        <View style={[styles.statusIcon, { backgroundColor: item.isValid ? COLORS.successGlow : COLORS.errorGlow }]}>
          <Ionicons
            name={item.isValid ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={item.isValid ? COLORS.success : COLORS.error}
          />
        </View>
      </View>

      <View style={styles.itemCenter}>
        <Text style={styles.attendeeName} numberOfLines={1}>
          {item.attendeeName}
        </Text>
        <Text style={styles.eventName} numberOfLines={1}>
          {item.eventName}
        </Text>
        <Text style={styles.ticketIdText}>
          {item.ticketId}
        </Text>
        {!item.isValid && item.reason && (
          <Text style={styles.reasonText} numberOfLines={1}>
            {item.reason}
          </Text>
        )}
      </View>

      <View style={styles.itemRight}>
        <Text style={styles.timeText}>{formatTime(item.scannedAt)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.isValid ? COLORS.successGlow : COLORS.errorGlow }]}>
          <Text style={[styles.statusBadgeText, { color: item.isValid ? COLORS.success : COLORS.error }]}>
            {item.isValid ? 'VALID' : 'INVALID'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="scan-outline" size={64} color={COLORS.surfaceBorder} />
      <Text style={styles.emptyTitle}>No Scans Yet</Text>
      <Text style={styles.emptyDesc}>
        Scanned tickets will appear here. Go to the scanner tab to start scanning.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        {scanHistory.length > 0 && (
          <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats bar */}
      {scanHistory.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{scanHistory.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>{validCount}</Text>
            <Text style={styles.statLabel}>Valid</Text>
          </View>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={[styles.statNumber, { color: COLORS.error }]}>{invalidCount}</Text>
            <Text style={styles.statLabel}>Invalid</Text>
          </View>
        </View>
      )}

      {/* Search bar */}
      {scanHistory.length > 0 && (
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search attendee, event, or ticket..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* History list */}
      <FlatList
        data={filteredHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ─── Header ────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.errorGlow,
    borderRadius: RADIUS.full,
  },
  clearText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },

  // ─── Stats ─────────────────────────────────────────────────────────
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.surfaceBorder,
  },
  statNumber: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ─── Search ────────────────────────────────────────────────────────
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
  },

  // ─── List ──────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  historyItemInvalid: {
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  itemLeft: {
    marginRight: SPACING.md,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCenter: {
    flex: 1,
  },
  attendeeName: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
  eventName: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  ticketIdText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  reasonText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
    fontStyle: 'italic',
  },
  itemRight: {
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 1,
  },
  separator: {
    height: SPACING.sm,
  },

  // ─── Empty state ───────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginTop: SPACING.lg,
  },
  emptyDesc: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    lineHeight: 22,
  },
});

export default HistoryScreen;
