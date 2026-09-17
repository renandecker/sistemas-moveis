import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConfigProvider } from './src/context/ConfigContext';
import Navegacao from './src/navigation';
import ColdStartBanner from './src/components/ColdStartBanner';

export default function App() {
  return (
    <SafeAreaProvider>
      <ConfigProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          <Navegacao />
          <ColdStartBanner />
        </View>
      </ConfigProvider>
    </SafeAreaProvider>
  );
}
