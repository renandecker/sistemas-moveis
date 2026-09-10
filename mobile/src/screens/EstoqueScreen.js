import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Cartao, CampoTexto, Botao, Banner, LinhaVazia, Etiqueta } from '../components/ui';

const VAZIO = {
  materialId: null, materialLabel: '', tipo: 'ENTRADA', quantidade: '',
  custoUnitario: '', fornecedorId: null, fornecedorLabel: '', observacao: '',
};

export default function EstoqueScreen() {
  const api = useApi();
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [form, setForm] = useState(VAZIO);
  const [modalMaterial, setModalMaterial] = useState(false);
  const [modalFornecedor, setModalFornecedor] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    api.listarMovimentacoes({ tipo: filtroTipo || undefined })
      .then(setMovimentacoes)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [api, filtroTipo]);

  useFocusEffect(carregar);

  useEffect(() => {
    api.listarMateriais().then(setMateriais).catch((e) => setErro(e.message));
    api.listarFornecedores().then(setFornecedores).catch((e) => setErro(e.message));
  }, [api]);

  async function registrar() {
    if (!form.materialId || !form.quantidade) {
      setErro('Selecione um material e informe a quantidade.');
      return;
    }
    setErro(null);
    setSucesso(null);
    try {
      await api.registrarMovimentacao({
        materialId: form.materialId,
        tipo: form.tipo,
        quantidade: Number(form.quantidade),
        custoUnitario: form.custoUnitario ? Number(form.custoUnitario) : null,
        fornecedorId: form.fornecedorId,
        observacao: form.observacao || null,
      });
      setForm(VAZIO);
      setSucesso('Movimentação registrada e estoque atualizado.');
      carregar();
      api.listarMateriais().then(setMateriais);
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.eyebrow}>Estoque</Text>
      <Text style={styles.titulo}>Entrada · Saída</Text>
      <Text style={styles.lede}>
        Registre compras de fornecedores (entrada) e consumo/perdas (saída). O estoque é atualizado na hora.
      </Text>

      {erro && <Banner tipo="erro">{erro}</Banner>}
      {sucesso && <Banner tipo="info">{sucesso}</Banner>}

      <Cartao>
        <Text style={styles.cartaoTitulo}>Nova movimentação</Text>

        <View style={styles.tipoLinha}>
          <TouchableOpacity
            style={[styles.tipoBtn, form.tipo === 'ENTRADA' && styles.tipoBtnAtivo]}
            onPress={() => setForm({ ...form, tipo: 'ENTRADA' })}
          >
            <Text style={[styles.tipoTexto, form.tipo === 'ENTRADA' && styles.tipoTextoAtivo]}>Entrada</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipoBtn, form.tipo === 'SAIDA' && styles.tipoBtnAtivoSaida]}
            onPress={() => setForm({ ...form, tipo: 'SAIDA' })}
          >
            <Text style={[styles.tipoTexto, form.tipo === 'SAIDA' && styles.tipoTextoAtivo]}>Saída</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Material</Text>
        <TouchableOpacity style={styles.seletor} onPress={() => setModalMaterial(true)}>
          <Text style={form.materialLabel ? styles.seletorTexto : styles.seletorPlaceholder}>
            {form.materialLabel || 'Selecione…'}
          </Text>
        </TouchableOpacity>

        <CampoTexto label="Quantidade" keyboardType="decimal-pad" value={form.quantidade}
                    onChangeText={(v) => setForm({ ...form, quantidade: v })} />

        {form.tipo === 'ENTRADA' && (
          <>
            <CampoTexto
              label="Custo unitário (R$)"
              ajuda="se informado, atualiza o custo cadastrado do material"
              keyboardType="decimal-pad"
              value={form.custoUnitario}
              onChangeText={(v) => setForm({ ...form, custoUnitario: v })}
            />
            <Text style={styles.label}>Fornecedor (opcional)</Text>
            <TouchableOpacity style={styles.seletor} onPress={() => setModalFornecedor(true)}>
              <Text style={form.fornecedorLabel ? styles.seletorTexto : styles.seletorPlaceholder}>
                {form.fornecedorLabel || 'Selecione…'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <CampoTexto
          label="Observação"
          value={form.observacao}
          onChangeText={(v) => setForm({ ...form, observacao: v })}
          placeholder="Ex.: consumo na ordem #12..."
        />

        <Botao titulo={`Registrar ${form.tipo === 'ENTRADA' ? 'entrada' : 'saída'}`} onPress={registrar} />
      </Cartao>

      <Cartao>
        <View style={styles.filtroLinha}>
          <Text style={styles.cartaoTitulo}>Histórico</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {['', 'ENTRADA', 'SAIDA'].map((t) => (
              <TouchableOpacity
                key={t || 'todas'}
                onPress={() => setFiltroTipo(t)}
                style={[styles.filtroChip, filtroTipo === t && styles.filtroChipAtivo]}
              >
                <Text style={[styles.filtroTexto, filtroTipo === t && styles.filtroTextoAtivo]}>
                  {t || 'Todas'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {movimentacoes.length === 0 && !carregando && <LinhaVazia texto="Nenhuma movimentação registrada." />}
        {movimentacoes.map((m) => (
          <View key={m.id} style={styles.movLinha}>
            <View style={{ flex: 1 }}>
              <Text style={styles.movMaterial}>{m.materialSku}</Text>
              <Text style={styles.movNome}>{m.materialNome}</Text>
              <Text style={styles.movObs}>{m.observacao || m.fornecedorNome || '—'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Etiqueta texto={m.tipo} tom={m.tipo === 'SAIDA' ? 'warn' : 'teal'} />
              <Text style={styles.movQtd}>{m.quantidade} {m.unidadeMedida}</Text>
              <Text style={styles.movData}>{new Date(m.dataMovimentacao).toLocaleDateString('pt-BR')}</Text>
            </View>
          </View>
        ))}
      </Cartao>

      <Modal visible={modalMaterial} animationType="slide" onRequestClose={() => setModalMaterial(false)}>
        <View style={styles.modalTela}>
          <FlatList
            data={materiais}
            keyExtractor={(m) => String(m.id)}
            renderItem={({ item: m }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setForm((f) => ({ ...f, materialId: m.id, materialLabel: `${m.sku} — ${m.nome}` }));
                  setModalMaterial(false);
                }}
              >
                <Text style={styles.modalCodigo}>{m.sku}</Text>
                <Text style={styles.modalNome}>{m.nome}</Text>
                <Text style={styles.modalEstoque}>Estoque atual: {m.estoqueAtual} {m.unidadeMedida}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<LinhaVazia texto="Nenhum material encontrado." />}
          />
          <Botao titulo="Fechar" variante="secundario" onPress={() => setModalMaterial(false)} />
        </View>
      </Modal>

      <Modal visible={modalFornecedor} animationType="slide" onRequestClose={() => setModalFornecedor(false)}>
        <View style={styles.modalTela}>
          <FlatList
            data={fornecedores}
            keyExtractor={(f) => String(f.id)}
            renderItem={({ item: f }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setForm((form2) => ({ ...form2, fornecedorId: f.id, fornecedorLabel: f.nome }));
                  setModalFornecedor(false);
                }}
              >
                <Text style={styles.modalNome}>{f.nome}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<LinhaVazia texto="Nenhum fornecedor cadastrado." />}
          />
          <Botao titulo="Fechar" variante="secundario" onPress={() => setModalFornecedor(false)} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  conteudo: { padding: espacamento.lg, paddingBottom: espacamento.xxl },
  eyebrow: { fontSize: 12, color: cores.muted },
  titulo: { fontSize: 26, fontWeight: '700', color: cores.ink, marginTop: 2 },
  lede: { fontSize: 13, color: cores.muted, marginTop: 6, marginBottom: espacamento.lg },
  cartaoTitulo: { fontSize: 15, fontWeight: '600', color: cores.ink, marginBottom: espacamento.sm },
  tipoLinha: { flexDirection: 'row', gap: 8, marginBottom: espacamento.md },
  tipoBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: cores.lineForte,
    alignItems: 'center', backgroundColor: cores.paper,
  },
  tipoBtnAtivo: { backgroundColor: cores.success, borderColor: cores.success },
  tipoBtnAtivoSaida: { backgroundColor: cores.warn, borderColor: cores.warn },
  tipoTexto: { fontSize: 13, color: cores.muted, fontWeight: '600' },
  tipoTextoAtivo: { color: '#fff' },
  label: { fontSize: 12, color: cores.muted, marginBottom: 6, fontWeight: '500' },
  seletor: {
    borderWidth: 1, borderColor: cores.lineForte, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: cores.paper, marginBottom: espacamento.md,
  },
  seletorTexto: { color: cores.ink, fontSize: 14 },
  seletorPlaceholder: { color: cores.muted, fontSize: 14 },
  filtroLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: espacamento.sm, flexWrap: 'wrap', gap: 6 },
  filtroChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: cores.lineForte },
  filtroChipAtivo: { backgroundColor: cores.teal, borderColor: cores.teal },
  filtroTexto: { fontSize: 11, color: cores.muted },
  filtroTextoAtivo: { color: '#fff', fontWeight: '600' },
  movLinha: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: cores.line,
  },
  movMaterial: { fontSize: 12, color: cores.muted, fontFamily: 'monospace' },
  movNome: { fontSize: 13, color: cores.ink, marginTop: 2 },
  movObs: { fontSize: 11, color: cores.muted, marginTop: 4 },
  movQtd: { fontSize: 13, color: cores.ink, fontFamily: 'monospace', fontWeight: '600', marginTop: 4 },
  movData: { fontSize: 11, color: cores.muted, marginTop: 2 },
  modalTela: { flex: 1, backgroundColor: cores.bg, padding: espacamento.lg, paddingTop: 60 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: cores.line },
  modalCodigo: { fontSize: 11, color: cores.muted, fontFamily: 'monospace' },
  modalNome: { fontSize: 14, color: cores.ink, marginTop: 2 },
  modalEstoque: { fontSize: 11, color: cores.muted, marginTop: 2 },
});
