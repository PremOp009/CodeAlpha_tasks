/**
 * SettingsScreen — Backend URL config, user info, logout.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getBaseUrl, setBaseUrl } from '../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/constants';

const APP_VERSION = '1.0.0';

const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [apiUrl, setApiUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    loadCurrentUrl();
  }, []);

  const loadCurrentUrl = async () => {
    const url = await getBaseUrl();
    setApiUrl(url);
  };

  const handleSaveUrl = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid API URL.');
      return;
    }

    setIsSaving(true);
    try {
      await setBaseUrl(apiUrl.trim());
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to save API URL.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to sign out of the scanner app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin': return COLORS.error;
      case 'organizer': return COLORS.primary;
      case 'scanner_staff': return COLORS.success;
      default: return COLORS.textMuted;
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'organizer': return 'Event Organizer';
      case 'scanner_staff': return 'Scanner Staff';
      default: return role || 'Unknown';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>Settings</Text>

        {/* ─── User Profile Section ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Unknown'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user?.role) + '22' }]}>
                <View style={[styles.roleDot, { backgroundColor: getRoleBadgeColor(user?.role) }]} />
                <Text style={[styles.roleText, { color: getRoleBadgeColor(user?.role) }]}>
                  {getRoleLabel(user?.role)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Server Configuration ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server Configuration</Text>
          <View style={styles.configCard}>
            <Text style={styles.configLabel}>Backend API URL</Text>
            <Text style={styles.configDesc}>
              The server URL where your Jigs Events backend is running
            </Text>
            <View style={styles.urlInputRow}>
              <TextInput
                style={styles.urlInput}
                value={apiUrl}
                onChangeText={setApiUrl}
                placeholder="http://192.168.1.100:8000/api/"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity
                onPress={handleSaveUrl}
                style={[styles.saveButton, showSaved && styles.savedButton]}
                disabled={isSaving}
              >
                <Ionicons
                  name={showSaved ? 'checkmark' : 'save-outline'}
                  size={18}
                  color={showSaved ? COLORS.success : COLORS.primary}
                />
              </TouchableOpacity>
            </View>
            {showSaved && (
              <Text style={styles.savedText}>✓ URL saved successfully</Text>
            )}
          </View>
        </View>

        {/* ─── About Section ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <AboutRow icon="information-circle" label="Version" value={APP_VERSION} />
            <AboutRow icon="phone-portrait" label="Platform" value="React Native + Expo" />
            <AboutRow icon="shield-checkmark" label="Security" value="JWT + SecureStore" />
            <AboutRow icon="code-slash" label="Build" value="Production" />
          </View>
        </View>

        {/* ─── Logout Button ─────────────────────────────────────── */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Jigs Events Scanner v{APP_VERSION}</Text>
          <Text style={styles.footerSubText}>© 2026 Jigs Events Platform</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── About Row sub-component ───────────────────────────────────────────
interface AboutRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const AboutRow: React.FC<AboutRowProps> = ({ icon, label, value }) => (
  <View style={styles.aboutRow}>
    <View style={styles.aboutRowLeft}>
      <Ionicons name={icon} size={18} color={COLORS.textMuted} />
      <Text style={styles.aboutLabel}>{label}</Text>
    </View>
    <Text style={styles.aboutValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },

  // ─── Section ───────────────────────────────────────────────────────
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },

  // ─── Profile ───────────────────────────────────────────────────────
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  profileEmail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: 6,
    gap: 6,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  roleText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ─── Config ────────────────────────────────────────────────────────
  configCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  configLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  configDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  urlInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  savedButton: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successGlow,
  },
  savedText: {
    color: COLORS.success,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.sm,
  },

  // ─── About ─────────────────────────────────────────────────────────
  aboutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surfaceBorder,
  },
  aboutRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  aboutLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  aboutValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: FONTS.weights.medium,
  },

  // ─── Logout ────────────────────────────────────────────────────────
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorGlow,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
  },

  // ─── Footer ────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
  },
  footerSubText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
    opacity: 0.5,
  },
});

export default SettingsScreen;
