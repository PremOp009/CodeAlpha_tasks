/**
 * ScannerScreen — Full-screen camera scanner with futuristic HUD overlay.
 * Handles camera permissions, QR detection, flashlight toggle.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScannerOverlay from '../components/ScannerOverlay';
import { useAuth } from '../context/AuthContext';
import { useScannerContext } from '../context/ScannerContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/constants';

type ScannerScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const ScannerScreen: React.FC<ScannerScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const { isProcessing, handleBarCodeScanned, canScan, scanHistory } = useScannerContext();

  // ─── Camera permission handling ─────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={64} color={COLORS.primary} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDesc}>
            The scanner needs camera access to read QR codes on event tickets.
          </Text>
          <TouchableOpacity onPress={requestPermission} activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.permissionButton}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── QR scan handler ────────────────────────────────────────────────
  const onBarcodeScanned = async (scanResult: { data: string }) => {
    if (!canScan || isProcessing) return;

    const result = await handleBarCodeScanned(scanResult.data);
    if (result) {
      navigation.navigate('Result', { result });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchOn}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={canScan && !isProcessing ? onBarcodeScanned : undefined}
      />

      {/* Scanner overlay */}
      <ScannerOverlay isProcessing={isProcessing} />

      {/* Top header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 8 }]}>
        <View style={styles.userBadge}>
          <Ionicons name="person-circle" size={24} color={COLORS.primaryLight} />
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name || 'Scanner'}
          </Text>
        </View>

        <View style={styles.scanCountBadge}>
          <Ionicons name="checkmark-done" size={16} color={COLORS.success} />
          <Text style={styles.scanCountText}>
            {scanHistory.filter((s) => s.isValid).length} scanned
          </Text>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 80 }]}>
        {/* Flashlight toggle */}
        <TouchableOpacity
          onPress={() => setTorchOn(!torchOn)}
          style={[styles.controlButton, torchOn && styles.controlButtonActive]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={torchOn ? 'flash' : 'flash-outline'}
            size={24}
            color={torchOn ? COLORS.warning : COLORS.textPrimary}
          />
          <Text style={[styles.controlLabel, torchOn && { color: COLORS.warning }]}>
            {torchOn ? 'ON' : 'Flash'}
          </Text>
        </TouchableOpacity>

        {/* Status indicator */}
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: canScan ? COLORS.success : COLORS.warning }]} />
          <Text style={styles.statusText}>
            {isProcessing ? 'Verifying...' : canScan ? 'Ready to scan' : 'Cooldown...'}
          </Text>
        </View>

        {/* History shortcut */}
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('History')}
          style={styles.controlButton}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={24} color={COLORS.textPrimary} />
          <Text style={styles.controlLabel}>History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },

  // ─── Permission states ─────────────────────────────────────────────
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permissionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    maxWidth: 340,
  },
  permissionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  permissionDesc: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  permissionText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  permissionButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },

  // ─── Top header ────────────────────────────────────────────────────
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    zIndex: 10,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 6,
    maxWidth: 180,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  scanCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  scanCountText: {
    color: COLORS.success,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },

  // ─── Bottom controls ───────────────────────────────────────────────
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    zIndex: 10,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    minWidth: 64,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  controlLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
    fontWeight: FONTS.weights.medium,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
});

export default ScannerScreen;
