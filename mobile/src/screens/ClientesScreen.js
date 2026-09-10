import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Banner, LinhaVazia, Botao, CampoTexto } from '../components/ui';

export default function ClientesScreen({ navigation }) {
  const api = useApi();
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    api.listarClientes(busca || undefined)
      .then(setClientes)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [api, busca]);

  useFocusEffect(carregar);

  function remover(id, nome) {
    Alert.alert('Remover cliente', `Remover "${nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.removerCliente(id);
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
      <View style={{ paddingHorizontal: espacamento.lg, paddingTop: espacamento.lg }}>
        <CampoTexto
          placeholder="Buscar por nome…"
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={carregar}
          returnKeyType="search"
        />
        {erro && <Banner tipo="erro">{erro}</Banner>}
      </View>

      <FlatList
        data={clientes}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregar}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={!carregando && <LinhaVazia texto="Nenhum cliente encontrado." />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('ClienteDetalhe', { id: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemDoc}>{item.cpfCnpj || '—'}</Text>
              {item.cidade ? <Text style={styles.itemCidade}>{item.cidade}/{item.estado}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => remover(item.id, item.nome)}>
              <Text style={styles.remover}>remover</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <View style={styles.rodape}>
        <Botao titulo="+ Novo cliente" onPress={() => navigation.navigate('NovoCliente')} />
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
  itemCidade: { fontSize: 12, color: cores.muted, marginTop: 4 },
  remover: { fontSize: 11, color: cores.warn },
  rodape: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: espacamento.lg, backgroundColor: cores.bg,
    borderTopWidth: 1, borderTopColor: cores.line,
  },
});
