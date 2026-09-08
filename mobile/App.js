import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConfigProvider } from './src/context/ConfigContext';
import Navegacao from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <ConfigProvider>
        <StatusBar style="dark" />
        <Navegacao />
      </ConfigProvider>
    </SafeAreaProvider>
  );
}
