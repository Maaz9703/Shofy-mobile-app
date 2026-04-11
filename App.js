import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';


import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { RecentlyViewedProvider } from './src/context/RecentlyViewedContext';
import AppNavigator from './src/navigation/AppNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // SVG icons don't need manual font loading
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);


  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we need this after
      // sub-components have finished rendering, we can use a more detailed
      // approach.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <RecentlyViewedProvider>
                  <AppContent />
                  <StatusBar style="light" />
                  <Toast />
                </RecentlyViewedProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { settings, loading } = useSettings();

  if (!loading && settings.maintenanceMode) {
    return (
      <View style={styles.maintenanceContainer}>
        <Text style={styles.maintenanceTitle}>Under Maintenance</Text>
        <Text style={styles.maintenanceText}>
          Our app is currently undergoing scheduled maintenance. Please check back later!
        </Text>
        <View style={styles.appTag}>
          <Text style={styles.appTagText}>{settings.mobileAppName || 'Shofy'}</Text>
        </View>
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  maintenanceContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  maintenanceTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  maintenanceText: {
    color: '#94a3b8',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  appTag: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  appTagText: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '700',
  },
});

