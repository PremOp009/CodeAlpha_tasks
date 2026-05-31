/**
 * LoadingAnimation — Pulsing spinner with gradient glow during ticket verification.
 * Uses React Native's built-in Animated API (no Reanimated dependency).
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';
import { COLORS, FONTS, SPACING } from '../utils/constants';

interface LoadingAnimationProps {
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  message = 'Verifying ticket...',
}) => {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringOpacity, {
          toValue: 0.7,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0.2,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.spinnerWrapper}>
        {/* Outer glow ring */}
        <Animated.View style={[styles.outerRing, { opacity: ringOpacity }]} />

        {/* Inner pulsing spinner */}
        <Animated.View style={[styles.innerPulse, { transform: [{ scale: pulseScale }] }]}>
          <ActivityIndicator size="large" color={COLORS.primaryLight} />
        </Animated.View>
      </View>

      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subMessage}>Please wait...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  spinnerWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  outerRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accentGlow,
  },
  innerPulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  message: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subMessage: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default LoadingAnimation;
