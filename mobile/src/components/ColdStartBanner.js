import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { assinarColdStart } from '../utils/coldStartEmitter';
import { cores, espacamento } from '../theme';

/**
 * Mostra um aviso fixo no topo quando alguma chamada à API está demorando
 * mais que o normal — sinal de que o servidor pode estar "acordando" de um
 * cold start (comum em planos gratuitos que dormem após 15min inativos).
 */
export default function ColdStartBanner() {
  const [acordando, setAcordando] = useState(false);

  useEffect(() => {
    return assinarColdStart(setAcordando);
  }, []);

  if (!acordando) return null;

  return (
    <View style={styles.banner}>
      <ActivityIndicator size="small" color="#fff" />
      <Text style={styles.texto}>
        Acordando o servidor… pode levar até 30 segundos. Aguarde.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.sm,
    paddingVertical: 10,
    paddingHorizontal: espacamento.lg,
    backgroundColor: cores.teal,
  },
  texto: {
    color: '#fff',
    fontSize: 12,
    flexShrink: 1,
    textAlign: 'center',
  },
});
