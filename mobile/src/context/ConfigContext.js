import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Em emulador Android, o host da máquina é 10.0.2.2. Em dispositivo físico
// (Expo Go), use o IP da sua máquina na rede local, ex.: 192.168.0.10.
// Em simulador iOS, 'localhost' funciona normalmente.
const URL_PADRAO = 'http://10.0.2.2:7070/api';
const CHAVE_STORAGE = '@moveis:api_base_url';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [apiBaseUrl, setApiBaseUrlState] = useState(URL_PADRAO);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_STORAGE)
      .then((valor) => {
        if (valor) setApiBaseUrlState(valor);
      })
      .finally(() => setCarregado(true));
  }, []);

  const setApiBaseUrl = useCallback(async (novaUrl) => {
    const limpa = novaUrl.trim().replace(/\/+$/, '');
    setApiBaseUrlState(limpa);
    await AsyncStorage.setItem(CHAVE_STORAGE, limpa);
  }, []);

  if (!carregado) return null;

  return (
    <ConfigContext.Provider value={{ apiBaseUrl, setApiBaseUrl, urlPadrao: URL_PADRAO }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig deve ser usado dentro de <ConfigProvider>');
  return ctx;
}
