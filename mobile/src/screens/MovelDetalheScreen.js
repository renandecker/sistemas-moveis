import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Cartao, CampoTexto, Botao, Banner, LinhaVazia, Etiqueta } from '../components/ui';

const ITEM_VAZIO = {
  materialId: null, materialLabel: '', quantidadeNecessaria: '', percentualPerdaAplicado: '',
  comprimentoPecaMm: '', larguraPecaMm: '', ladosFitados: '',
};

export default function MovelDetalheScreen({ route }) {
  const { id } = route.params;
  const api = useApi();

  const [movel, setMovel] = useState(null);
  const [materiais, setMateriais] = useState([]);
  const [item, setItem] = useState(ITEM_VAZIO);
  const [modalAberto, setModalAberto] = useState(false);
  const [buscaMaterial, setBuscaMaterial] = useState('');
  const [quantidadeSimulada, setQuantidadeSimulada] = useState('1');
  const [necessidade, setNecessidade] = useState(null);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(() => {
    api.buscarMovel(id).then(setMovel).catch((e) => setErro(e.message));
  }, [api, id]);

  useFocusEffect(carregar);

  useEffect(() => {
    api.listarMateriais().then(setMateriais).catch((e) => setErro(e.message));
  }, [api]);

  function numOuNull(v) {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }

  async function adicionarItem() {
    if (!item.materialId || !item.quantidadeNecessaria) {
      setErro('Selecione um material e informe a quantidade necessária.');
      return;
    }
    setErro(null);
    try {
      await api.adicionarItemEstrutura(id, {
        materialId: item.materialId,
        quantidadeNecessaria: numOuNull(item.quantidadeNecessaria),
        percentualPerdaAplicado: numOuNull(item.percentualPerdaAplicado),
        comprimentoPecaMm: numOuNull(item.comprimentoPecaMm),
        larguraPecaMm: numOuNull(item.larguraPecaMm),
        ladosFitados: numOuNull(item.ladosFitados),
      });
      setItem(ITEM_VAZIO);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  function removerItem(itemId) {
    Alert.alert('Remover componente', 'Remover este componente da estrutura?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.removerItemEstrutura(id, itemId);
            carregar();
          } catch (e) {
            setErro(e.message);
          }
        },
      },
    ]);
  }

  async function calcularNecessidade() {
    setErro(null);
    try {
      const resp = await api.calcularNecessidade(id, Number(quantidadeSimulada) || 1);
      setNecessidade(resp);
    } catch (e) {
      setErro(e.message);
    }
  }

  const materiaisFiltrados = materiais.filter((m) =>
    `${m.sku} ${m.nome}`.toLowerCase().includes(buscaMaterial.toLowerCase())
  );

  if (!movel) {
    return (
      <View style={styles.tela}>
        <Text style={{ padding: espacamento.lg, color: cores.muted }}>Carregando modelo…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>{movel.nome}</Text>
      <Text style={styles.codigo}>{movel.codigo}</Text>
      {movel.descricao ? <Text style={styles.descricao}>{movel.descricao}</Text> : null}
      {movel.tempoEstimadoMontagemMin ? (
        <Text style={styles.tempo}>Tempo estimado: {movel.tempoEstimadoMontagemMin} min/unidade</Text>
      ) : null}

      {erro && <Banner tipo="erro">{erro}</Banner>}

      <Cartao>
        <Text style={styles.cartaoTitulo}>Estrutura do móvel (BOM)</Text>
        {(!movel.estrutura || movel.estrutura.length === 0) && (
          <LinhaVazia texto="Nenhum componente cadastrado ainda." />
        )}
        {movel.estrutura?.map((it) => (
          <View key={it.id} style={styles.bomLinha}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bomMaterial}>{it.materialSku}</Text>
              <Text style={styles.bomNome}>{it.materialNome}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.bomQtd}>{it.quantidadeNecessaria}</Text>
              <TouchableOpacity onPress={() => removerItem(it.id)}>
                <Text style={styles.remover}>remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Cartao>

      <Cartao>
        <Text style={styles.cartaoTitulo}>Adicionar componente</Text>

        <Text style={styles.label}>Material</Text>
        <TouchableOpacity style={styles.seletor} onPress={() => setModalAberto(true)}>
          <Text style={item.materialLabel ? styles.seletorTexto : styles.seletorPlaceholder}>
            {item.materialLabel || 'Selecione um material…'}
          </Text>
        </TouchableOpacity>

        <CampoTexto
          label="Quantidade necessária"
          keyboardType="decimal-pad"
          value={item.quantidadeNecessaria}
          onChangeText={(v) => setItem({ ...item, quantidadeNecessaria: v })}
        />
        <CampoTexto
          label="% de perda (opcional)"
          ajuda="se vazio, usa o fator padrão do material"
          keyboardType="decimal-pad"
          value={item.percentualPerdaAplicado}
          onChangeText={(v) => setItem({ ...item, percentualPerdaAplicado: v })}
        />
        <View style={{ flexDirection: 'row', gap: espacamento.sm }}>
          <CampoTexto label="Compr. peça (mm)" keyboardType="numeric" value={item.comprimentoPecaMm}
                      onChangeText={(v) => setItem({ ...item, comprimentoPecaMm: v })} style={{ flex: 1 }} />
          <CampoTexto label="Larg. peça (mm)" keyboardType="numeric" value={item.larguraPecaMm}
                      onChangeText={(v) => setItem({ ...item, larguraPecaMm: v })} style={{ flex: 1 }} />
        </View>
        <CampoTexto label="Lados fitados" keyboardType="numeric" value={item.ladosFitados}
                    onChangeText={(v) => setItem({ ...item, ladosFitados: v })} />

        <Botao titulo="Adicionar à estrutura" onPress={adicionarItem} />
      </Cartao>

      <Cartao>
        <Text style={styles.cartaoTitulo}>Explosão de materiais</Text>
        <View style={{ flexDirection: 'row', gap: espacamento.sm, alignItems: 'flex-end' }}>
          <CampoTexto
            label="Quantidade de móveis"
            keyboardType="numeric"
            value={quantidadeSimulada}
            onChangeText={setQuantidadeSimulada}
            style={{ flex: 1 }}
          />
        </View>
        <Botao titulo="Calcular necessidade" onPress={calcularNecessidade} />

        {necessidade && (
          <View style={{ marginTop: espacamento.md }}>
            {necessidade.itens.map((it) => (
              <View key={it.materialId} style={styles.resultLinha}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bomMaterial}>{it.sku}</Text>
                  <Text style={styles.bomNome}>{it.nome}</Text>
                  <Etiqueta texto={it.tipo} tom="teal" />
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.bomQtd}>{it.quantidadeComPerda} {it.unidadeMedida}</Text>
                  <Text style={styles.resultCusto}>R$ {Number(it.custoTotalEstimado).toFixed(2)}</Text>
                </View>
              </View>
            ))}
            <View style={styles.resumo}>
              <Text style={styles.resumoTexto}>
                Custo total estimado: <Text style={styles.resumoValor}>R$ {Number(necessidade.custoTotalEstimado).toFixed(2)}</Text>
              </Text>
              {necessidade.tempoTotalEstimadoMin ? (
                <Text style={styles.resumoTexto}>
                  Tempo total: <Text style={styles.resumoValor}>{necessidade.tempoTotalEstimadoMin} min</Text>
                </Text>
              ) : null}
            </View>
          </View>
        )}
      </Cartao>

      <Modal visible={modalAberto} animationType="slide" onRequestClose={() => setModalAberto(false)}>
        <View style={styles.modalTela}>
          <CampoTexto
            label="Buscar material"
            placeholder="SKU ou nome…"
            value={buscaMaterial}
            onChangeText={setBuscaMaterial}
            autoFocus
          />
          <FlatList
            data={materiaisFiltrados}
            keyExtractor={(m) => String(m.id)}
            renderItem={({ item: m }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setItem((f) => ({ ...f, materialId: m.id, materialLabel: `${m.sku} — ${m.nome}` }));
                  setModalAberto(false);
                  setBuscaMaterial('');
                }}
              >
                <Text style={styles.bomMaterial}>{m.sku}</Text>
                <Text style={styles.bomNome}>{m.nome}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<LinhaVazia texto="Nenhum material encontrado." />}
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
  titulo: { fontSize: 22, fontWeight: '700', color: cores.ink },
  codigo: { fontSize: 12, color: cores.muted, fontFamily: 'monospace', marginTop: 2 },
  descricao: { fontSize: 13, color: cores.muted, marginTop: 8 },
  tempo: { fontSize: 12, color: cores.muted, fontFamily: 'monospace', marginTop: 6, marginBottom: espacamento.md },
  cartaoTitulo: { fontSize: 15, fontWeight: '600', color: cores.ink, marginBottom: espacamento.sm },
  label: { fontSize: 12, color: cores.muted, marginBottom: 6, fontWeight: '500' },
  seletor: {
    borderWidth: 1, borderColor: cores.lineForte, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: cores.paper, marginBottom: espacamento.md,
  },
  seletorTexto: { color: cores.ink, fontSize: 14 },
  seletorPlaceholder: { color: cores.muted, fontSize: 14 },
  bomLinha: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: cores.line,
  },
  bomMaterial: { fontSize: 12, color: cores.muted, fontFamily: 'monospace' },
  bomNome: { fontSize: 13, color: cores.ink, marginTop: 2 },
  bomQtd: { fontSize: 13, color: cores.ink, fontFamily: 'monospace', fontWeight: '600' },
  remover: { fontSize: 11, color: cores.warn, marginTop: 6 },
  resultLinha: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: cores.line,
  },
  resultCusto: { fontSize: 12, color: cores.muted, fontFamily: 'monospace', marginTop: 2 },
  resumo: { marginTop: espacamento.md, paddingTop: espacamento.md, borderTopWidth: 1, borderTopColor: cores.lineForte },
  resumoTexto: { fontSize: 13, color: cores.ink, marginBottom: 4 },
  resumoValor: { fontWeight: '700', fontFamily: 'monospace' },
  modalTela: { flex: 1, backgroundColor: cores.bg, padding: espacamento.lg, paddingTop: 60 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: cores.line },
});
