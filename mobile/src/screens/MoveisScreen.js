import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Banner, LinhaVazia, Botao } from '../components/ui';

export default function MoveisScreen({ navigation }) {
  const api = useApi();
  const [moveis, setMoveis] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    api.listarMoveis().then(setMoveis).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  }, [api]);

  useFocusEffect(carregar);

  function remover(id, nome) {
    Alert.alert('Remover modelo', `Remover "${nome}" e toda a sua estrutura (BOM)?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.removerMovel(id);
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
      {erro && (
        <View style={{ paddingHorizontal: espacamento.lg, paddingTop: espacamento.lg }}>
          <Banner tipo="erro">{erro}</Banner>
        </View>
      )}

      <FlatList
        data={moveis}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregar}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={!carregando && <LinhaVazia texto="Nenhum modelo cadastrado ainda." />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('MovelDetalhe', { id: item.id, nome: item.nome })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemCodigo}>{item.codigo}</Text>
              {item.descricao ? <Text style={styles.itemDescricao} numberOfLines={2}>{item.descricao}</Text> : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {item.tempoEstimadoMontagemMin ? (
                <Text style={styles.itemTempo}>{item.tempoEstimadoMontagemMin} min</Text>
              ) : null}
              <TouchableOpacity onPress={() => remover(item.id, item.nome)}>
                <Text style={styles.remover}>remover</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.rodape}>
        <Botao titulo="+ Novo modelo" onPress={() => navigation.navigate('NovoMovel')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  lista: { padding: espacamento.lg, paddingBottom: 100 },
  item: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: cores.panel, borderWidth: 1, borderColor: cores.line,
    borderRadius: 6, padding: espacamento.md, marginBottom: espacamento.sm,
  },
  itemNome: { fontSize: 15, fontWeight: '600', color: cores.ink },
  itemCodigo: { fontSize: 11, color: cores.muted, fontFamily: 'monospace', marginTop: 2 },
  itemDescricao: { fontSize: 12, color: cores.muted, marginTop: 6 },
  itemTempo: { fontSize: 12, color: cores.ink, fontFamily: 'monospace' },
  remover: { fontSize: 11, color: cores.warn, marginTop: 8 },
  rodape: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: espacamento.lg, backgroundColor: cores.bg,
    borderTopWidth: 1, borderTopColor: cores.line,
  },
});
