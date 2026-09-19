import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Padrão de fábrica: o backend publicado (Render). Quem quiser testar contra
// um backend rodando localmente pode trocar a qualquer momento na tela
// "Configurações" — lá também tem a explicação de qual endereço usar em
// cada cenário (emulador Android usa 10.0.2.2, simulador iOS usa localhost,
// celular físico usa o IP da máquina na rede local).
const URL_PADRAO = 'https://paje-micro-service.onrender.com/api';
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
