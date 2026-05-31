/**
 * ResultScreen — Full-screen success/error result after ticket scan.
 * Green glow for valid, red glow for invalid. Auto-returns to scanner.
 * Uses React Native's built-in Animated API (no Reanimated dependency).
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import TicketResultCard from '../components/TicketResultCard';
import { COLORS, FONTS, SPACING, SCANNER_CONFIG, TicketVerifyResult } from '../utils/constants';

type ResultScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ Result: { result: TicketVerifyResult } }, 'Result'>;
};

const ResultScreen: React.FC<ResultScreenProps> = ({ navigation, route }) => {
  const { result } = route.params;
  const insets = useSafeAreaInsets();
  const isValid = result.valid;

  // Auto-return timer
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [countdown, setCountdown] = React.useState(
    Math.ceil(SCANNER_CONFIG.AUTO_RETURN_MS / 1000)
  );

  // ─── Animations ─────────────────────────────────────────────────────
  const glowOpacity = useRef(new Animated.Value(0.15)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-return timer
    timerRef.current = setTimeout(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }, SCANNER_CONFIG.AUTO_RETURN_MS);

    // Countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Glow pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Bottom section fade in
    Animated.timing(bottomOpacity, {
      toValue: 1,
      duration: 500,
      delay: 600,
      useNativeDriver: true,
    }).start();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(interval);
    };
  }, []);

  const handleGoBack = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const bgColors = isValid
    ? ['rgba(34, 197, 94, 0.05)', COLORS.background]
    : ['rgba(239, 68, 68, 0.05)', COLORS.background];

  const glowColor = isValid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleGoBack}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Background gradient */}
      <LinearGradient
        colors={bgColors as any}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated glow circle */}
      <Animated.View
        style={[
          styles.glowCircle,
          { backgroundColor: glowColor, opacity: glowOpacity },
        ]}
      />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + SPACING.lg }]}>
        {/* Result card */}
        <View style={styles.cardWrapper}>
          <TicketResultCard result={result} />
        </View>

        {/* Bottom section */}
        <Animated.View
          style={[
            styles.bottomSection,
            { paddingBottom: insets.bottom + SPACING.lg, opacity: bottomOpacity },
          ]}
        >
          {/* Scan again button */}
          <TouchableOpacity
            onPress={handleGoBack}
            style={[
              styles.scanAgainButton,
              { borderColor: isValid ? COLORS.success : COLORS.error },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="scan-outline"
              size={20}
              color={isValid ? COLORS.success : COLORS.error}
            />
            <Text
              style={[
                styles.scanAgainText,
                { color: isValid ? COLORS.success : COLORS.error },
              ]}
            >
              Scan Next Ticket
            </Text>
          </TouchableOpacity>

          <Text style={styles.autoReturnText}>
            Auto-returning in {countdown}s • Tap anywhere to go back
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  glowCircle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: '15%',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 50,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  scanAgainText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
  },
  autoReturnText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    textAlign: 'center',
  },
});

export default ResultScreen;
