import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Banner, LinhaVazia, Botao, Etiqueta } from '../components/ui';

const STATUS = ['RASCUNHO', 'APROVADA', 'EM_PRODUCAO', 'CONCLUIDA', 'CANCELADA'];
const PROXIMO_STATUS = {
  RASCUNHO: 'APROVADA',
  APROVADA: 'EM_PRODUCAO',
  EM_PRODUCAO: 'CONCLUIDA',
  CONCLUIDA: 'CONCLUIDA',
  CANCELADA: 'CANCELADA',
};

export default function OrdensScreen({ navigation }) {
  const api = useApi();
  const [ordens, setOrdens] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    api.listarOrdens().then(setOrdens).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  }, [api]);

  useFocusEffect(carregar);

  async function avancarStatus(ordem) {
    const novo = PROXIMO_STATUS[ordem.status];
    try {
      await api.atualizarStatusOrdem(ordem.id, novo);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  function cancelar(ordem) {
    Alert.alert('Cancelar ordem', `Cancelar a ordem de "${ordem.movelNome}"?`, [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar ordem',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.atualizarStatusOrdem(ordem.id, 'CANCELADA');
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
        data={ordens}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregar}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={!carregando && <LinhaVazia texto="Nenhuma ordem registrada." />}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNome}>{item.movelNome}</Text>
              <Text style={styles.itemData}>{new Date(item.dataCriacao).toLocaleString('pt-BR')}</Text>
              <View style={{ marginTop: 6 }}>
                <Etiqueta texto={item.status} tom={item.status === 'CANCELADA' ? 'warn' : 'teal'} />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <Text style={styles.itemQtd}>{item.quantidadeMoveis}x</Text>
              {item.status !== 'CONCLUIDA' && item.status !== 'CANCELADA' && (
                <TouchableOpacity onPress={() => avancarStatus(item)}>
                  <Text style={styles.avancar}>avançar →</Text>
                </TouchableOpacity>
              )}
              {item.status !== 'CANCELADA' && item.status !== 'CONCLUIDA' && (
                <TouchableOpacity onPress={() => cancelar(item)}>
                  <Text style={styles.remover}>cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      <View style={styles.rodape}>
        <Botao titulo="+ Nova ordem" onPress={() => navigation.navigate('NovaOrdem')} />
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
  itemNome: { fontSize: 14, fontWeight: '600', color: cores.ink },
  itemData: { fontSize: 11, color: cores.muted, fontFamily: 'monospace', marginTop: 2 },
  itemQtd: { fontSize: 15, fontWeight: '700', color: cores.ink, fontFamily: 'monospace' },
  avancar: { fontSize: 11, color: cores.accent, fontWeight: '600' },
  remover: { fontSize: 11, color: cores.warn },
  rodape: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: espacamento.lg, backgroundColor: cores.bg,
    borderTopWidth: 1, borderTopColor: cores.line,
  },
});
