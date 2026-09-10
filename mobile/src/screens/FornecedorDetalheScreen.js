import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Cartao, CampoTexto, Botao, Banner, LinhaVazia, Etiqueta } from '../components/ui';

const ITEM_VAZIO = { materialId: null, materialLabel: '', precoUnitario: '', prazoEntregaDias: '', preferencial: false };

export default function FornecedorDetalheScreen({ route }) {
  const { id } = route.params;
  const api = useApi();

  const [fornecedor, setFornecedor] = useState(null);
  const [precos, setPrecos] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [item, setItem] = useState(ITEM_VAZIO);
  const [modalAberto, setModalAberto] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(() => {
    api.buscarFornecedor(id).then(setFornecedor).catch((e) => setErro(e.message));
    api.listarMateriaisDoFornecedor(id).then(setPrecos).catch((e) => setErro(e.message));
  }, [api, id]);

  useFocusEffect(carregar);

  useEffect(() => {
    api.listarMateriais().then(setMateriais).catch((e) => setErro(e.message));
  }, [api]);

  async function adicionarPreco() {
    if (!item.materialId || !item.precoUnitario) {
      setErro('Selecione um material e informe o preço unitário.');
      return;
    }
    setErro(null);
    try {
      await api.adicionarMaterialAoFornecedor(id, {
        materialId: item.materialId,
        precoUnitario: Number(item.precoUnitario),
        prazoEntregaDias: item.prazoEntregaDias ? Number(item.prazoEntregaDias) : null,
        preferencial: item.preferencial,
      });
      setItem(ITEM_VAZIO);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  function removerPreco(itemId) {
    Alert.alert('Remover preço', 'Remover este material da tabela de preços?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.removerMaterialDoFornecedor(id, itemId);
            carregar();
          } catch (e) {
            setErro(e.message);
          }
        },
      },
    ]);
  }

  if (!fornecedor) {
    return (
      <View style={styles.tela}>
        <Text style={{ padding: espacamento.lg, color: cores.muted }}>Carregando fornecedor…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>{fornecedor.nome}</Text>
      <Text style={styles.doc}>{fornecedor.cnpj}</Text>
      <Text style={styles.contato}>
        {[fornecedor.telefone, fornecedor.email].filter(Boolean).join(' · ') || 'Sem contato cadastrado'}
      </Text>

      {erro && <Banner tipo="erro">{erro}</Banner>}

      <Cartao>
        <Text style={styles.cartaoTitulo}>Adicionar preço de material</Text>

        <Text style={styles.label}>Material</Text>
        <TouchableOpacity style={styles.seletor} onPress={() => setModalAberto(true)}>
          <Text style={item.materialLabel ? styles.seletorTexto : styles.seletorPlaceholder}>
            {item.materialLabel || 'Selecione…'}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: espacamento.sm }}>
          <CampoTexto label="Preço unitário (R$)" keyboardType="decimal-pad" value={item.precoUnitario}
                      onChangeText={(v) => setItem({ ...item, precoUnitario: v })} style={{ flex: 1 }} />
          <CampoTexto label="Prazo (dias)" keyboardType="numeric" value={item.prazoEntregaDias}
                      onChangeText={(v) => setItem({ ...item, prazoEntregaDias: v })} style={{ flex: 1 }} />
        </View>

        <TouchableOpacity
          style={styles.checkboxLinha}
          onPress={() => setItem({ ...item, preferencial: !item.preferencial })}
        >
          <View style={[styles.checkbox, item.preferencial && styles.checkboxMarcado]}>
            {item.preferencial ? <Text style={styles.checkboxMarca}>✓</Text> : null}
          </View>
          <Text style={styles.checkboxLabel}>Fornecedor preferencial para este material</Text>
        </TouchableOpacity>

        <Botao titulo="Adicionar à tabela de preços" onPress={adicionarPreco} />
      </Cartao>

      <Cartao>
        <Text style={styles.cartaoTitulo}>Tabela de preços</Text>
        {precos.length === 0 && <LinhaVazia texto="Nenhum preço cadastrado ainda." />}
        {precos.map((p) => (
          <View key={p.id} style={styles.precoLinha}>
            <View style={{ flex: 1 }}>
              <Text style={styles.precoMaterial}>{p.materialSku}</Text>
              <Text style={styles.precoNome}>{p.materialNome}</Text>
              {p.preferencial ? <Etiqueta texto="preferencial" tom="accent" /> : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.precoValor}>R$ {Number(p.precoUnitario).toFixed(2)}</Text>
              {p.prazoEntregaDias ? <Text style={styles.precoPrazo}>{p.prazoEntregaDias}d de prazo</Text> : null}
              <TouchableOpacity onPress={() => removerPreco(p.id)}>
                <Text style={styles.remover}>remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Cartao>

      <Modal visible={modalAberto} animationType="slide" onRequestClose={() => setModalAberto(false)}>
        <View style={styles.modalTela}>
          <FlatList
            data={materiais}
            keyExtractor={(m) => String(m.id)}
            renderItem={({ item: m }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setItem((f) => ({ ...f, materialId: m.id, materialLabel: `${m.sku} — ${m.nome}` }));
                  setModalAberto(false);
                }}
              >
                <Text style={styles.modalCodigo}>{m.sku}</Text>
                <Text style={styles.modalNome}>{m.nome}</Text>
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
  doc: { fontSize: 12, color: cores.muted, fontFamily: 'monospace', marginTop: 2 },
  contato: { fontSize: 13, color: cores.ink, marginTop: 8, marginBottom: espacamento.md },
  cartaoTitulo: { fontSize: 15, fontWeight: '600', color: cores.ink, marginBottom: espacamento.sm },
  label: { fontSize: 12, color: cores.muted, marginBottom: 6, fontWeight: '500' },
  seletor: {
    borderWidth: 1, borderColor: cores.lineForte, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: cores.paper, marginBottom: espacamento.md,
  },
  seletorTexto: { color: cores.ink, fontSize: 14 },
  seletorPlaceholder: { color: cores.muted, fontSize: 14 },
  checkboxLinha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: espacamento.md },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: cores.lineForte,
    alignItems: 'center', justifyContent: 'center', backgroundColor: cores.paper,
  },
  checkboxMarcado: { backgroundColor: cores.accent, borderColor: cores.accent },
  checkboxMarca: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkboxLabel: { fontSize: 13, color: cores.ink },
  precoLinha: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: cores.line,
  },
  precoMaterial: { fontSize: 12, color: cores.muted, fontFamily: 'monospace' },
  precoNome: { fontSize: 13, color: cores.ink, marginTop: 2, marginBottom: 4 },
  precoValor: { fontSize: 14, color: cores.ink, fontFamily: 'monospace', fontWeight: '700' },
  precoPrazo: { fontSize: 11, color: cores.muted, marginTop: 2 },
  remover: { fontSize: 11, color: cores.warn, marginTop: 6 },
  modalTela: { flex: 1, backgroundColor: cores.bg, padding: espacamento.lg, paddingTop: 60 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: cores.line },
  modalCodigo: { fontSize: 11, color: cores.muted, fontFamily: 'monospace' },
  modalNome: { fontSize: 14, color: cores.ink, marginTop: 2 },
});
