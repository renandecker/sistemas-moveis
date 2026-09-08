import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { CampoTexto, Botao, Banner, LinhaVazia } from '../components/ui';

export default function NovaOrdemScreen({ navigation }) {
  const api = useApi();
  const [moveis, setMoveis] = useState([]);
  const [movelId, setMovelId] = useState(null);
  const [movelLabel, setMovelLabel] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [modalAberto, setModalAberto] = useState(false);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api.listarMoveis().then(setMoveis).catch((e) => setErro(e.message));
  }, [api]);

  async function salvar() {
    if (!movelId || !quantidade) {
      setErro('Selecione um modelo de móvel e informe a quantidade.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await api.criarOrdem({ movelId, quantidadeMoveis: Number(quantidade) });
      navigation.goBack();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      {erro && <Banner tipo="erro">{erro}</Banner>}

      <Text style={styles.label}>Modelo de móvel</Text>
      <TouchableOpacity style={styles.seletor} onPress={() => setModalAberto(true)}>
        <Text style={movelLabel ? styles.seletorTexto : styles.seletorPlaceholder}>
          {movelLabel || 'Selecione…'}
        </Text>
      </TouchableOpacity>

      <CampoTexto label="Quantidade" keyboardType="numeric" value={quantidade} onChangeText={setQuantidade} />

      <Botao titulo="Criar ordem" onPress={salvar} carregando={salvando} />

      <Modal visible={modalAberto} animationType="slide" onRequestClose={() => setModalAberto(false)}>
        <View style={styles.modalTela}>
          <FlatList
            data={moveis}
            keyExtractor={(m) => String(m.id)}
            renderItem={({ item: m }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setMovelId(m.id);
                  setMovelLabel(`${m.codigo} — ${m.nome}`);
                  setModalAberto(false);
                }}
              >
                <Text style={styles.modalCodigo}>{m.codigo}</Text>
                <Text style={styles.modalNome}>{m.nome}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<LinhaVazia texto="Nenhum modelo cadastrado." />}
          />
          <Botao titulo="Fechar" variante="secundario" onPress={() => setModalAberto(false)} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  conteudo: { padding: espacamento.lg, paddingBottom: espacamento.xxl },
  label: { fontSize: 12, color: cores.muted, marginBottom: 6, fontWeight: '500' },
  seletor: {
    borderWidth: 1, borderColor: cores.lineForte, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: cores.paper, marginBottom: espacamento.md,
  },
  seletorTexto: { color: cores.ink, fontSize: 14 },
  seletorPlaceholder: { color: cores.muted, fontSize: 14 },
  modalTela: { flex: 1, backgroundColor: cores.bg, padding: espacamento.lg, paddingTop: 60 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: cores.line },
  modalCodigo: { fontSize: 11, color: cores.muted, fontFamily: 'monospace' },
  modalNome: { fontSize: 14, color: cores.ink, marginTop: 2 },
});
