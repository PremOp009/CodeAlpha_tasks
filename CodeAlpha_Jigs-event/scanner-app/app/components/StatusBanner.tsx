/**
 * StatusBanner — Animated top banner showing connection/scan status.
 * Uses React Native's built-in Animated API (no Reanimated dependency).
 */
import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../utils/constants';

interface StatusBannerProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
  duration?: number;
  onHide?: () => void;
}

const StatusBanner: React.FC<StatusBannerProps> = ({
  message,
  type,
  visible,
  duration = 3000,
  onHide,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const bgColors: Record<string, string> = {
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    info: COLORS.primary,
  };

  useEffect(() => {
    if (visible) {
      // Show banner
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -100,
              duration: 300,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (onHide) onHide();
          });
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      // Hide banner
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: bgColors[type],
          paddingTop: insets.top + 8,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    zIndex: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
  },
});

export default StatusBanner;
