import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Banner, Etiqueta, LinhaVazia, Botao } from '../components/ui';

const TIPOS = ['', 'CHAPA', 'FERRAGEM', 'CONSUMIVEL', 'ACABAMENTO'];

export default function MateriaisScreen({ navigation }) {
  const api = useApi();
  const [materiais, setMateriais] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    api
      .listarMateriais(filtroTipo || undefined)
      .then(setMateriais)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [api, filtroTipo]);

  useFocusEffect(carregar);

  async function remover(id, nome) {
    Alert.alert('Remover material', `Remover "${nome}" do catálogo?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.removerMaterial(id);
            carregar();
          } catch (e) {
            setErro(e.message);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.tela}>
      <View style={styles.filtros}>
        {TIPOS.map((t) => (
          <TouchableOpacity
            key={t || 'todos'}
            onPress={() => setFiltroTipo(t)}
            style={[styles.filtroChip, filtroTipo === t && styles.filtroChipAtivo]}
          >
            <Text style={[styles.filtroTexto, filtroTipo === t && styles.filtroTextoAtivo]}>
              {t || 'Todos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {erro && (
        <View style={{ paddingHorizontal: espacamento.lg }}>
          <Banner tipo="erro">{erro}</Banner>
        </View>
      )}

      <FlatList
        data={materiais}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregar}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={!carregando && <LinhaVazia texto="Nenhum material encontrado." />}
        renderItem={({ item }) => {
          const abaixoMinimo = Number(item.estoqueAtual) < Number(item.estoqueMinimo);
          return (
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNome}>{item.nome}</Text>
                <Text style={styles.itemSku}>{item.sku}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                  <Etiqueta texto={item.tipo} tom="teal" />
                  {abaixoMinimo && <Etiqueta texto="estoque baixo" tom="warn" />}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.itemCusto}>R$ {Number(item.custoUnitario).toFixed(2)}</Text>
                <Text style={[styles.itemEstoque, abaixoMinimo && { color: cores.warn }]}>
                  {item.estoqueAtual} {item.unidadeMedida}
                </Text>
                <TouchableOpacity onPress={() => remover(item.id, item.nome)}>
                  <Text style={styles.remover}>remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.rodape}>
        <Botao titulo="+ Novo material" onPress={() => navigation.navigate('NovoMaterial')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: espacamento.lg, paddingBottom: espacamento.sm },
  filtroChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: cores.lineForte, backgroundColor: cores.panel,
  },
  filtroChipAtivo: { backgroundColor: cores.teal, borderColor: cores.teal },
  filtroTexto: { fontSize: 12, color: cores.muted },
  filtroTextoAtivo: { color: '#fff', fontWeight: '600' },
  lista: { paddingHorizontal: espacamento.lg, paddingBottom: 100 },
  item: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: cores.panel, borderWidth: 1, borderColor: cores.line,
    borderRadius: 6, padding: espacamento.md, marginBottom: espacamento.sm,
  },
  itemNome: { fontSize: 14, fontWeight: '600', color: cores.ink },
  itemSku: { fontSize: 11, color: cores.muted, fontFamily: 'monospace', marginTop: 2 },
  itemCusto: { fontSize: 13, fontWeight: '600', color: cores.ink, fontFamily: 'monospace' },
  itemEstoque: { fontSize: 11, color: cores.muted, marginTop: 2, fontFamily: 'monospace' },
  remover: { fontSize: 11, color: cores.warn, marginTop: 6 },
  rodape: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: espacamento.lg, backgroundColor: cores.bg,
    borderTopWidth: 1, borderTopColor: cores.line,
  },
});
