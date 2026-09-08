import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { CampoTexto, Botao, Banner } from '../components/ui';

const TIPOS = ['CHAPA', 'FERRAGEM', 'CONSUMIVEL', 'ACABAMENTO'];

const VAZIO = {
  sku: '', nome: '', tipo: 'CHAPA', unidadeMedida: 'UN',
  comprimentoMm: '', larguraMm: '', espessuraMm: '',
  custoUnitario: '', estoqueMinimo: '', estoqueAtual: '', fatorPerdaPadrao: '0.05',
};

export default function NovoMaterialScreen({ navigation }) {
  const api = useApi();
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function campo(chave, valor) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  function numOuNull(v) {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }

  async function salvar() {
    if (!form.sku || !form.nome || !form.custoUnitario) {
      setErro('Preencha ao menos SKU, Nome e Custo unitário.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await api.criarMaterial({
        ...form,
        comprimentoMm: numOuNull(form.comprimentoMm),
        larguraMm: numOuNull(form.larguraMm),
        espessuraMm: numOuNull(form.espessuraMm),
        custoUnitario: numOuNull(form.custoUnitario),
        estoqueMinimo: numOuNull(form.estoqueMinimo) ?? 0,
        estoqueAtual: numOuNull(form.estoqueAtual) ?? 0,
        fatorPerdaPadrao: numOuNull(form.fatorPerdaPadrao) ?? 0.05,
      });
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

      <CampoTexto label="SKU" value={form.sku} onChangeText={(v) => campo('sku', v)} placeholder="CHP-MDF-BCO-15" autoCapitalize="characters" />
      <CampoTexto label="Nome" value={form.nome} onChangeText={(v) => campo('nome', v)} placeholder="Chapa MDF Branco 15mm" />

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.chips}>
        {TIPOS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => campo('tipo', t)}
            style={[styles.chip, form.tipo === t && styles.chipAtivo]}
          >
            <Text style={[styles.chipTexto, form.tipo === t && styles.chipTextoAtivo]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <CampoTexto label="Unidade de medida" value={form.unidadeMedida} onChangeText={(v) => campo('unidadeMedida', v)} placeholder="UN, M2, M, KG, ML" />

      {form.tipo === 'CHAPA' && (
        <View style={styles.linha3}>
          <CampoTexto label="Compr. (mm)" keyboardType="numeric" value={form.comprimentoMm} onChangeText={(v) => campo('comprimentoMm', v)} style={{ flex: 1 }} />
          <CampoTexto label="Larg. (mm)" keyboardType="numeric" value={form.larguraMm} onChangeText={(v) => campo('larguraMm', v)} style={{ flex: 1 }} />
          <CampoTexto label="Esp. (mm)" keyboardType="numeric" value={form.espessuraMm} onChangeText={(v) => campo('espessuraMm', v)} style={{ flex: 1 }} />
        </View>
      )}

      <CampoTexto label="Custo unitário (R$)" keyboardType="decimal-pad" value={form.custoUnitario} onChangeText={(v) => campo('custoUnitario', v)} placeholder="189.90" />

      <View style={styles.linha2}>
        <CampoTexto label="Estoque mínimo" keyboardType="numeric" value={form.estoqueMinimo} onChangeText={(v) => campo('estoqueMinimo', v)} style={{ flex: 1 }} />
        <CampoTexto label="Estoque atual" keyboardType="numeric" value={form.estoqueAtual} onChangeText={(v) => campo('estoqueAtual', v)} style={{ flex: 1 }} />
      </View>

      <CampoTexto
        label="Fator de perda padrão"
        ajuda="0.05–0.10 ferragens · 0.15–0.25 chapas"
        keyboardType="decimal-pad"
        value={form.fatorPerdaPadrao}
        onChangeText={(v) => campo('fatorPerdaPadrao', v)}
      />

      <Botao titulo="Adicionar material" onPress={salvar} carregando={salvando} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  conteudo: { padding: espacamento.lg, paddingBottom: espacamento.xxl },
  label: { fontSize: 12, color: cores.muted, marginBottom: 6, fontWeight: '500' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: espacamento.md },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: cores.lineForte },
  chipAtivo: { backgroundColor: cores.accent, borderColor: cores.accent },
  chipTexto: { fontSize: 12, color: cores.muted },
  chipTextoAtivo: { color: '#fff', fontWeight: '600' },
  linha2: { flexDirection: 'row', gap: espacamento.sm },
  linha3: { flexDirection: 'row', gap: espacamento.sm },
});
