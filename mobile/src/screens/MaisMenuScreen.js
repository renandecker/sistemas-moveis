import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacamento } from '../theme';

const ITENS = [
  { rota: 'OrdensLista', titulo: 'Ordens de Montagem', descricao: 'Produção por modelo e quantidade', icone: 'clipboard-outline' },
  { rota: 'FornecedoresLista', titulo: 'Fornecedores', descricao: 'Cadastro e tabela de preços por material', icone: 'business-outline' },
  { rota: 'Estoque', titulo: 'Entrada · Saída', descricao: 'Movimentações de estoque', icone: 'swap-vertical-outline' },
  { rota: 'FluxoCaixa', titulo: 'Fluxo de Caixa', descricao: 'Receitas, despesas e saldo', icone: 'cash-outline' },
  { rota: 'Calculadoras', titulo: 'Calculadoras', descricao: 'Plano de corte e fita de borda', icone: 'calculator-outline' },
  { rota: 'Config', titulo: 'Configurações', descricao: 'Endereço da API do backend', icone: 'settings-outline' },
];

export default function MaisMenuScreen({ navigation }) {
  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.eyebrow}>Mais</Text>
      <Text style={styles.titulo}>Outras áreas</Text>

      {ITENS.map((item) => (
        <TouchableOpacity key={item.rota} style={styles.item} onPress={() => navigation.navigate(item.rota)}>
          <View style={styles.itemIcone}>
            <Ionicons name={item.icone} size={20} color={cores.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitulo}>{item.titulo}</Text>
            <Text style={styles.itemDescricao}>{item.descricao}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={cores.muted} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  conteudo: { padding: espacamento.lg, paddingTop: espacamento.xxl, paddingBottom: espacamento.xxl },
  eyebrow: { fontSize: 12, color: cores.muted },
  titulo: { fontSize: 26, fontWeight: '700', color: cores.ink, marginTop: 2, marginBottom: espacamento.lg },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: espacamento.md,
    backgroundColor: cores.panel, borderWidth: 1, borderColor: cores.line,
    borderRadius: 6, padding: espacamento.md, marginBottom: espacamento.sm,
  },
  itemIcone: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#e2e6e4',
    alignItems: 'center', justifyContent: 'center',
  },
  itemTitulo: { fontSize: 14, fontWeight: '600', color: cores.ink },
  itemDescricao: { fontSize: 12, color: cores.muted, marginTop: 2 },
});
