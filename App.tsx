import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initDatabase } from './src/db';
import { useAppStore } from './src/store/useAppStore';
import { colors } from './src/theme/darkColors';
import { FeedbackProvider } from './src/components/FeedbackProvider';

const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.textPrimary,
    border: colors.borderCard,
    primary: colors.primary,
  },
};

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    initDatabase();
    // Após o banco estar migrado, carregamos a última sincronização persistida.
    useAppStore.getState().loadLastSyncAt();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <FeedbackProvider>
          <NavigationContainer theme={appTheme}>
            <RootNavigator />
          </NavigationContainer>
        </FeedbackProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
