import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Banner, LinhaVazia, Botao, Etiqueta } from '../components/ui';

export default function FornecedoresScreen({ navigation }) {
  const api = useApi();
  const [fornecedores, setFornecedores] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    api.listarFornecedores().then(setFornecedores).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  }, [api]);

  useFocusEffect(carregar);

  function remover(id, nome) {
    Alert.alert('Remover fornecedor', `Remover "${nome}" e suas cotações de preço?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.removerFornecedor(id);
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
        data={fornecedores}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregar}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={!carregando && <LinhaVazia texto="Nenhum fornecedor cadastrado." />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('FornecedorDetalhe', { id: item.id, nome: item.nome })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemDoc}>{item.cnpj || '—'}</Text>
              <View style={{ marginTop: 6 }}>
                <Etiqueta texto={item.ativo ? 'ativo' : 'inativo'} tom={item.ativo ? 'teal' : 'warn'} />
              </View>
            </View>
            <TouchableOpacity onPress={() => remover(item.id, item.nome)}>
              <Text style={styles.remover}>remover</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <View style={styles.rodape}>
        <Botao titulo="+ Novo fornecedor" onPress={() => navigation.navigate('NovoFornecedor')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  lista: { padding: espacamento.lg, paddingBottom: 100 },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: cores.panel, borderWidth: 1, borderColor: cores.line,
    borderRadius: 6, padding: espacamento.md, marginBottom: espacamento.sm,
  },
  itemNome: { fontSize: 14, fontWeight: '600', color: cores.ink },
  itemDoc: { fontSize: 11, color: cores.muted, fontFamily: 'monospace', marginTop: 2 },
  remover: { fontSize: 11, color: cores.warn },
  rodape: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: espacamento.lg, backgroundColor: cores.bg,
    borderTopWidth: 1, borderTopColor: cores.line,
  },
});
