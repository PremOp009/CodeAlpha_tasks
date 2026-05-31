/**
 * AppNavigator — Root navigation with auth-gated routing.
 * Unauthenticated → LoginScreen
 * Authenticated → Bottom tabs (Scanner, History, Settings) with Result stack
 */
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, TicketVerifyResult } from '../utils/constants';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

// ─── Type definitions ────────────────────────────────────────────────────────────
export type ScannerStackParamList = {
  ScannerMain: undefined;
  Result: { result: TicketVerifyResult };
};

export type MainTabParamList = {
  ScannerTab: undefined;
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<ScannerStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ─── Scanner stack (Scanner + Result) ────────────────────────────────────────────
const ScannerStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade',
      contentStyle: { backgroundColor: COLORS.background },
    }}
  >
    <Stack.Screen name="ScannerMain" component={ScannerScreen} />
    <Stack.Screen
      name="Result"
      component={ResultScreen}
      options={{
        animation: 'fade_from_bottom',
        gestureEnabled: true,
      }}
    />
  </Stack.Navigator>
);

// ─── Main tab navigator ──────────────────────────────────────────────────────────
const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopColor: COLORS.surfaceBorder,
        borderTopWidth: 1,
        height: 70,
        paddingBottom: 10,
        paddingTop: 8,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarLabelStyle: {
        fontSize: FONTS.sizes.xs,
        fontWeight: FONTS.weights.semibold,
        letterSpacing: 0.5,
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'scan';

        if (route.name === 'ScannerTab') {
          iconName = focused ? 'scan-circle' : 'scan-circle-outline';
        } else if (route.name === 'History') {
          iconName = focused ? 'time' : 'time-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="ScannerTab"
      component={ScannerStack}
      options={{ tabBarLabel: 'Scanner' }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{ tabBarLabel: 'History' }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ tabBarLabel: 'Settings' }}
    />
  </Tab.Navigator>
);

// ─── Auth stack (Login only) ─────────────────────────────────────────────────────
const AuthStack = createNativeStackNavigator();

const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

// ─── Root navigator ──────────────────────────────────────────────────────────────
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Loading state — checking stored tokens
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default AppNavigator;
