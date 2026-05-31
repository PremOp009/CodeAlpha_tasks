/**
 * TicketResultCard — Glassmorphism card showing ticket verification details.
 * Success (green) and Error (red) variants with animated entry.
 * Uses React Native's built-in Animated API (no Reanimated dependency).
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, TicketVerifyResult } from '../utils/constants';

interface TicketResultCardProps {
  result: TicketVerifyResult;
}

const TicketResultCard: React.FC<TicketResultCardProps> = ({ result }) => {
  const isValid = result.valid;

  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const detailsTranslateY = useRef(new Animated.Value(30)).current;
  const detailsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card entrance
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 12,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Icon fade in (delay 200ms)
    Animated.timing(iconOpacity, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Title fade in (delay 300ms)
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 400,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Details slide in (delay 400ms)
    Animated.parallel([
      Animated.spring(detailsTranslateY, {
        toValue: 0,
        damping: 12,
        stiffness: 100,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(detailsOpacity, {
        toValue: 1,
        duration: 400,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // ─── Error reason label ──────────────────────────────────────────────
  const getReasonLabel = (reason?: string): string => {
    const labels: Record<string, string> = {
      already_checked_in: '⚠️ Already Checked In',
      invalid_qr: '❌ Invalid QR Code',
      event_expired: '⏰ Event Expired',
      ticket_cancelled: '🚫 Ticket Cancelled',
      payment_incomplete: '💳 Payment Incomplete',
      event_cancelled: '🚫 Event Cancelled',
      network_error: '📡 Network Error',
    };
    return labels[reason || ''] || '❌ Verification Failed';
  };

  if (isValid) {
    return (
      <Animated.View
        style={[
          styles.card,
          styles.successCard,
          { transform: [{ scale }], opacity },
        ]}
      >
        {/* Success icon */}
        <Animated.View style={[styles.iconContainer, { opacity: iconOpacity }]}>
          <View style={[styles.iconCircle, styles.successIconCircle]}>
            <Ionicons name="checkmark-sharp" size={48} color={COLORS.white} />
          </View>
        </Animated.View>

        <Animated.Text
          style={[styles.statusTitle, styles.successTitle, { opacity: titleOpacity }]}
        >
          ENTRY APPROVED
        </Animated.Text>

        {/* Ticket details */}
        <Animated.View
          style={[
            styles.detailsContainer,
            {
              opacity: detailsOpacity,
              transform: [{ translateY: detailsTranslateY }],
            },
          ]}
        >
          <DetailRow icon="person" label="Attendee" value={result.attendee} />
          <DetailRow icon="calendar" label="Event" value={result.event} />
          <DetailRow icon="location" label="Venue" value={result.venue} />
          <DetailRow icon="time" label="Check-in" value={formatTime(result.checked_in_at)} />
          <DetailRow icon="pricetag" label="Ticket Type" value={result.ticket_type} />
          <DetailRow icon="ticket" label="Ticket ID" value={result.ticket_id} mono />
          <DetailRow icon="people" label="Attendance" value={result.seat_info} />
        </Animated.View>
      </Animated.View>
    );
  }

  // ─── Error card ──────────────────────────────────────────────────────
  return (
    <Animated.View
      style={[
        styles.card,
        styles.errorCard,
        { transform: [{ scale }], opacity },
      ]}
    >
      <Animated.View style={[styles.iconContainer, { opacity: iconOpacity }]}>
        <View style={[styles.iconCircle, styles.errorIconCircle]}>
          <Ionicons name="close-sharp" size={48} color={COLORS.white} />
        </View>
      </Animated.View>

      <Animated.Text
        style={[styles.statusTitle, styles.errorTitle, { opacity: titleOpacity }]}
      >
        {getReasonLabel(result.reason)}
      </Animated.Text>

      <Animated.View
        style={[
          styles.detailsContainer,
          {
            opacity: detailsOpacity,
            transform: [{ translateY: detailsTranslateY }],
          },
        ]}
      >
        <Text style={styles.errorMessage}>{result.error}</Text>

        {result.attendee && (
          <DetailRow icon="person" label="Attendee" value={result.attendee} />
        )}
        {result.event && (
          <DetailRow icon="calendar" label="Event" value={result.event} />
        )}
        {result.checked_in_at && (
          <DetailRow icon="time" label="Checked in at" value={formatTime(result.checked_in_at)} />
        )}
      </Animated.View>
    </Animated.View>
  );
};

// ─── Detail Row sub-component ──────────────────────────────────────────
interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  mono?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value, mono }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabel}>
      <Ionicons name={icon} size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
      <Text style={styles.detailLabelText}>{label}</Text>
    </View>
    <Text style={[styles.detailValue, mono && styles.monoText]} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  successCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconCircle: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  errorIconCircle: {
    backgroundColor: COLORS.error,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  statusTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.extrabold,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  successTitle: {
    color: COLORS.success,
  },
  errorTitle: {
    color: COLORS.error,
    letterSpacing: 0.5,
    fontSize: FONTS.sizes.lg,
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabelText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  detailValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    flex: 1.5,
    textAlign: 'right',
  },
  monoText: {
    fontFamily: 'monospace',
    fontSize: FONTS.sizes.sm,
    letterSpacing: 0.5,
  },
  errorMessage: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
});

export default TicketResultCard;
