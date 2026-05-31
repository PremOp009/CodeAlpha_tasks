/**
 * LoginScreen — Dark futuristic login for scanner staff.
 * Gradient title, custom inputs, role validation.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/constants';

const LoginScreen: React.FC = () => {
  const { login, error, clearError, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    clearError();
    setLocalError('');

    if (!email.trim()) {
      setLocalError('Please enter your email.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      await login(email.trim(), password);
    } catch {
      // Error is already set in context
    }
  };

  const displayError = localError || error;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Logo / Branding ─────────────────────────────────── */}
          <View style={styles.brandingSection}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/icon.png')} 
                style={styles.logoImage} 
                resizeMode="contain"
              />
            </View>

            <Text style={styles.appTitle}>JIGS EVENTS</Text>
            <Text style={styles.appSubtitle}>SCANNER</Text>
            <Text style={styles.appDescription}>
              Event entry management system
            </Text>
          </View>

          {/* ─── Login Form ──────────────────────────────────────── */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Staff Login</Text>
            <Text style={styles.formSubtitle}>
              Sign in with your organizer or scanner staff account
            </Text>

            {/* Error message */}
            {displayError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            {/* Email input */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (localError) setLocalError('');
                  if (error) clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            {/* Password input */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (localError) setLocalError('');
                  if (error) clearError();
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
              style={styles.loginButtonWrapper}
            >
              <LinearGradient
                colors={isLoading ? [COLORS.surfaceLight, COLORS.surfaceLight] : [COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.textPrimary} />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ─── Footer ──────────────────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🔒 Authorized personnel only
            </Text>
            <Text style={styles.footerSubText}>
              Organizers • Admins • Scanner Staff
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // ─── Branding ──────────────────────────────────────────────────────
  brandingSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 24,
  },
  appTitle: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.textPrimary,
    letterSpacing: 4,
  },
  appSubtitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    letterSpacing: 8,
    marginTop: -2,
  },
  appDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // ─── Form ──────────────────────────────────────────────────────────
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  formTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorGlow,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.sm,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 54,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: SPACING.md,
  },
  loginButtonWrapper: {
    marginTop: SPACING.sm,
  },
  loginButton: {
    height: 54,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 1,
  },

  // ─── Footer ────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  footerSubText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginTop: 4,
    opacity: 0.6,
  },
});

export default LoginScreen;
