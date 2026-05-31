/**
 * Jigs Events Scanner — Root App Component
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './app/context/AuthContext';
import { ScannerProvider } from './app/context/ScannerContext';
import AppNavigator from './app/navigation/AppNavigator';
import { COLORS } from './app/utils/constants';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />
      <AuthProvider>
        <ScannerProvider>
          <AppNavigator />
        </ScannerProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
