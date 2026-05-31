/**
 * ScannerOverlay — Futuristic HUD overlay for the camera scanner.
 * Animated corner brackets, scanning line, and glow effects.
 * Uses React Native's built-in Animated API (no Reanimated dependency).
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { COLORS, SCANNER_CONFIG, FONTS } from '../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_SIZE = SCANNER_CONFIG.SCAN_AREA_SIZE;
const BRACKET = SCANNER_CONFIG.BRACKET_SIZE;
const THICKNESS = SCANNER_CONFIG.BRACKET_THICKNESS;

interface ScannerOverlayProps {
  isProcessing?: boolean;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ isProcessing = false }) => {
  // ─── Animated values ─────────────────────────────────────────────────
  const scanLineY = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const bracketGlow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Scanning line animation (up and down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: SCAN_SIZE - 4,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for the frame
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.02,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.2,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Bracket glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(bracketGlow, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bracketGlow, {
          toValue: 0.4,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // ─── Interpolated opacity for scan line ──────────────────────────────
  const scanLineOpacity = scanLineY.interpolate({
    inputRange: [0, SCAN_SIZE * 0.1, SCAN_SIZE * 0.9, SCAN_SIZE],
    outputRange: [0.3, 1, 1, 0.3],
    extrapolate: 'clamp',
  });

  const bracketColor = isProcessing ? COLORS.warning : COLORS.scannerBracket;

  return (
    <View style={styles.container}>
      {/* Dark overlay — top */}
      <View style={styles.overlayTop} />

      {/* Middle row */}
      <View style={styles.middleRow}>
        {/* Dark overlay — left */}
        <View style={styles.overlaySide} />

        {/* Scanner window */}
        <Animated.View style={[styles.scanWindow, { transform: [{ scale: pulseScale }] }]}>
          {/* Glow ring */}
          <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />

          {/* Corner brackets — Top Left */}
          <Animated.View style={[styles.bracketTL, { opacity: bracketGlow }]}>
            <View style={[styles.bracketHorizontal, { backgroundColor: bracketColor }]} />
            <View style={[styles.bracketVertical, { backgroundColor: bracketColor }]} />
          </Animated.View>

          {/* Corner brackets — Top Right */}
          <Animated.View style={[styles.bracketTR, { opacity: bracketGlow }]}>
            <View style={[styles.bracketHorizontal, { backgroundColor: bracketColor }]} />
            <View style={[styles.bracketVertical, { backgroundColor: bracketColor }]} />
          </Animated.View>

          {/* Corner brackets — Bottom Left */}
          <Animated.View style={[styles.bracketBL, { opacity: bracketGlow }]}>
            <View style={[styles.bracketHorizontal, { backgroundColor: bracketColor }]} />
            <View style={[styles.bracketVertical, { backgroundColor: bracketColor }]} />
          </Animated.View>

          {/* Corner brackets — Bottom Right */}
          <Animated.View style={[styles.bracketBR, { opacity: bracketGlow }]}>
            <View style={[styles.bracketHorizontal, { backgroundColor: bracketColor }]} />
            <View style={[styles.bracketVertical, { backgroundColor: bracketColor }]} />
          </Animated.View>

          {/* Scanning line */}
          {!isProcessing && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLineY }],
                  opacity: scanLineOpacity,
                },
              ]}
            >
              <View style={styles.scanLineGradient} />
            </Animated.View>
          )}
        </Animated.View>

        {/* Dark overlay — right */}
        <View style={styles.overlaySide} />
      </View>

      {/* Dark overlay — bottom */}
      <View style={styles.overlayBottom}>
        <Text style={styles.instructionText}>
          {isProcessing ? '⏳ Verifying ticket...' : '📷 Align QR code within the frame'}
        </Text>
        <Text style={styles.subText}>
          Scanner will automatically detect the ticket
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.overlay,
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  scanWindow: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  glowRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.scannerGlow,
  },
  // ─── Corner brackets ───────────────────────────────────────────────
  bracketTL: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bracketTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    transform: [{ scaleX: -1 }],
  },
  bracketBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    transform: [{ scaleY: -1 }],
  },
  bracketBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    transform: [{ scaleX: -1 }, { scaleY: -1 }],
  },
  bracketHorizontal: {
    width: BRACKET,
    height: THICKNESS,
    borderRadius: THICKNESS / 2,
  },
  bracketVertical: {
    width: THICKNESS,
    height: BRACKET,
    borderRadius: THICKNESS / 2,
  },
  // ─── Scan line ─────────────────────────────────────────────────────
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 3,
    zIndex: 10,
  },
  scanLineGradient: {
    flex: 1,
    backgroundColor: COLORS.scannerLine,
    borderRadius: 2,
    shadowColor: COLORS.scannerLine,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  // ─── Bottom text ───────────────────────────────────────────────────
  overlayBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    paddingTop: 32,
  },
  instructionText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ScannerOverlay;
