import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { cores, espacamento } from '../theme';

export function Cartao({ children, style }) {
  return <View style={[styles.cartao, style]}>{children}</View>;
}

export function Etiqueta({ texto, tom = 'accent' }) {
  const paleta = {
    accent: { bg: cores.accentSoft, fg: cores.accent },
    warn: { bg: cores.warnSoft, fg: cores.warn },
    teal: { bg: '#e2e6e4', fg: cores.teal },
  }[tom];
  return (
    <View style={[styles.etiqueta, { backgroundColor: paleta.bg }]}>
      <Text style={[styles.etiquetaTexto, { color: paleta.fg }]}>{texto}</Text>
    </View>
  );
}

export function Botao({ titulo, onPress, variante = 'primario', disabled = false, carregando = false }) {
  const isPrimario = variante === 'primario';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || carregando}
      style={[
        styles.botao,
        isPrimario ? styles.botaoPrimario : styles.botaoSecundario,
        (disabled || carregando) && styles.botaoDesabilitado,
      ]}
      activeOpacity={0.8}
    >
      {carregando ? (
        <ActivityIndicator color={isPrimario ? '#fff' : cores.accent} />
      ) : (
        <Text style={isPrimario ? styles.botaoTextoPrimario : styles.botaoTextoSecundario}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}

export function Banner({ tipo = 'erro', children }) {
  const isErro = tipo === 'erro';
  return (
    <View style={[styles.banner, { backgroundColor: isErro ? cores.warnSoft : cores.accentSoft }]}>
      <Text style={{ color: isErro ? cores.warn : cores.accent, fontSize: 13 }}>{children}</Text>
    </View>
  );
}

export function LinhaVazia({ texto }) {
  return (
    <View style={styles.linhaVazia}>
      <Text style={{ color: cores.muted, fontSize: 13 }}>{texto}</Text>
    </View>
  );
}

export function CampoTexto({ label, ajuda, style, ...props }) {
  return (
    <View style={[{ marginBottom: espacamento.md }, style]}>
      {label ? <Text style={styles.campoLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={cores.muted}
        style={styles.campoInput}
        {...props}
      />
      {ajuda ? <Text style={styles.campoAjuda}>{ajuda}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.panel,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: 6,
    padding: espacamento.lg,
    marginBottom: espacamento.md,
  },
  etiqueta: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  etiquetaTexto: { fontSize: 11, fontWeight: '600' },
  botao: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPrimario: { backgroundColor: cores.accent },
  botaoSecundario: { backgroundColor: 'transparent', borderWidth: 1, borderColor: cores.accent },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTextoPrimario: { color: '#fff', fontWeight: '600', fontSize: 14 },
  botaoTextoSecundario: { color: cores.accent, fontWeight: '600', fontSize: 14 },
  banner: { padding: 12, borderRadius: 6, marginBottom: espacamento.md },
  linhaVazia: { paddingVertical: espacamento.lg, alignItems: 'center' },
  campoLabel: { fontSize: 12, color: cores.muted, marginBottom: 4, fontWeight: '500' },
  campoInput: {
    borderWidth: 1,
    borderColor: cores.lineForte,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: cores.ink,
    backgroundColor: cores.paper,
  },
  campoAjuda: { fontSize: 11, color: cores.muted, marginTop: 4 },
});
