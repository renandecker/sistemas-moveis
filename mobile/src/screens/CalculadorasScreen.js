import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Cartao, CampoTexto, Botao, Banner } from '../components/ui';

const PECA_VAZIA = { comprimentoMm: '', larguraMm: '', quantidade: '' };
const LADO_VAZIO = { comprimentoLadoMm: '', quantidadeLados: '' };

export default function CalculadorasScreen() {
  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.eyebrow}>Seção 2 — Fórmulas de Insumos</Text>
      <Text style={styles.titulo}>Calculadoras</Text>
      <Text style={styles.lede}>Simulações rápidas de plano de corte e fita de borda.</Text>

      <CalculadoraChapas />
      <CalculadoraFitaBorda />
    </ScrollView>
  );
}

function CalculadoraChapas() {
  const api = useApi();
  const [areaUtilChapaM2, setAreaUtilChapaM2] = useState('5.0325');
  const [percentualPerdaCorte, setPercentualPerdaCorte] = useState('0.20');
  const [pecas, setPecas] = useState([{ ...PECA_VAZIA }]);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  function atualizarPeca(idx, campo, valor) {
    setPecas((ps) => ps.map((p, i) => (i === idx ? { ...p, [campo]: valor } : p)));
  }

  async function calcular() {
    setErro(null);
    try {
      const resp = await api.calcularChapas({
        areaUtilChapaM2: Number(areaUtilChapaM2),
        percentualPerdaCorte: Number(percentualPerdaCorte),
        pecas: pecas.map((p) => ({
          comprimentoMm: Number(p.comprimentoMm),
          larguraMm: Number(p.larguraMm),
          quantidade: Number(p.quantidade),
        })),
      });
      setResultado(resp);
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Cartao>
      <Text style={styles.cartaoTitulo}>Plano de Corte (Chapas)</Text>
      <Text style={styles.formula}>Área Total = Σ(Compr. × Larg. × Qtd.)</Text>
      <Text style={styles.formula}>Chapas = ⌈Área Total ÷ (Área Útil × (1 − Perda))⌉</Text>

      {erro && <Banner tipo="erro">{erro}</Banner>}

      <View style={{ flexDirection: 'row', gap: espacamento.sm }}>
        <CampoTexto label="Área útil da chapa (m²)" keyboardType="decimal-pad" value={areaUtilChapaM2}
                    onChangeText={setAreaUtilChapaM2} style={{ flex: 1 }} />
        <CampoTexto label="% perda de corte" keyboardType="decimal-pad" value={percentualPerdaCorte}
                    onChangeText={setPercentualPerdaCorte} style={{ flex: 1 }} />
      </View>

      <Text style={styles.subhead}>Peças a cortar</Text>
      {pecas.map((p, idx) => (
        <View key={idx} style={styles.pecaRow}>
          <CampoTexto placeholder="Compr. (mm)" keyboardType="numeric" value={p.comprimentoMm}
                      onChangeText={(v) => atualizarPeca(idx, 'comprimentoMm', v)} style={{ flex: 1 }} />
          <CampoTexto placeholder="Larg. (mm)" keyboardType="numeric" value={p.larguraMm}
                      onChangeText={(v) => atualizarPeca(idx, 'larguraMm', v)} style={{ flex: 1 }} />
          <CampoTexto placeholder="Qtd." keyboardType="numeric" value={p.quantidade}
                      onChangeText={(v) => atualizarPeca(idx, 'quantidade', v)} style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => setPecas((ps) => ps.filter((_, i) => i !== idx))}
            disabled={pecas.length === 1}
          >
            <Text style={[styles.removerPeca, pecas.length === 1 && { opacity: 0.3 }]}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={() => setPecas((ps) => [...ps, { ...PECA_VAZIA }])}>
        <Text style={styles.adicionarLink}>+ adicionar peça</Text>
      </TouchableOpacity>

      <View style={{ marginTop: espacamento.md }}>
        <Botao titulo="Calcular" onPress={calcular} />
      </View>

      {resultado && (
        <View style={styles.resultBlock}>
          <View style={styles.resultLinha}>
            <Text style={styles.resultLabel}>Área total de peças</Text>
            <Text style={styles.resultValor}>{resultado.areaTotalM2} m²</Text>
          </View>
          <View style={styles.resultLinha}>
            <Text style={styles.resultLabel}>Área útil líquida por chapa</Text>
            <Text style={styles.resultValor}>{resultado.areaUtilLiquidaChapaM2} m²</Text>
          </View>
          <View style={styles.resultDestaque}>
            <Text style={styles.resultLabel}>Chapas necessárias</Text>
            <Text style={styles.resultDestaqueValor}>{resultado.chapasNecessarias}</Text>
          </View>
        </View>
      )}
    </Cartao>
  );
}

function CalculadoraFitaBorda() {
  const api = useApi();
  const [itens, setItens] = useState([{ ...LADO_VAZIO }]);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  function atualizarItem(idx, campo, valor) {
    setItens((its) => its.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it)));
  }

  async function calcular() {
    setErro(null);
    try {
      const resp = await api.calcularFitaBorda({
        itens: itens.map((it) => ({
          comprimentoLadoMm: Number(it.comprimentoLadoMm),
          quantidadeLados: Number(it.quantidadeLados),
        })),
      });
      setResultado(resp);
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Cartao>
      <Text style={styles.cartaoTitulo}>Fita de Borda</Text>
      <Text style={styles.formula}>Perímetro Fitado = Σ(Lados × Compr.) × 1.10</Text>

      {erro && <Banner tipo="erro">{erro}</Banner>}

      <Text style={styles.subhead}>Lados a fitar</Text>
      {itens.map((it, idx) => (
        <View key={idx} style={styles.pecaRow}>
          <CampoTexto placeholder="Compr. do lado (mm)" keyboardType="numeric" value={it.comprimentoLadoMm}
                      onChangeText={(v) => atualizarItem(idx, 'comprimentoLadoMm', v)} style={{ flex: 1 }} />
          <CampoTexto placeholder="Qtd. de lados" keyboardType="numeric" value={it.quantidadeLados}
                      onChangeText={(v) => atualizarItem(idx, 'quantidadeLados', v)} style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => setItens((its) => its.filter((_, i) => i !== idx))}
            disabled={itens.length === 1}
          >
            <Text style={[styles.removerPeca, itens.length === 1 && { opacity: 0.3 }]}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={() => setItens((its) => [...its, { ...LADO_VAZIO }])}>
        <Text style={styles.adicionarLink}>+ adicionar lado</Text>
      </TouchableOpacity>

      <View style={{ marginTop: espacamento.md }}>
        <Botao titulo="Calcular" onPress={calcular} />
      </View>

      {resultado && (
        <View style={styles.resultBlock}>
          <View style={styles.resultLinha}>
            <Text style={styles.resultLabel}>Perímetro bruto</Text>
            <Text style={styles.resultValor}>{resultado.perimetroBrutoM} m</Text>
          </View>
          <View style={styles.resultDestaque}>
            <Text style={styles.resultLabel}>Perímetro fitado (+10%)</Text>
            <Text style={styles.resultDestaqueValor}>{resultado.perimetroFitadoM} m</Text>
          </View>
        </View>
      )}
    </Cartao>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  conteudo: { padding: espacamento.lg, paddingBottom: espacamento.xxl },
  eyebrow: { fontSize: 12, color: cores.muted },
  titulo: { fontSize: 26, fontWeight: '700', color: cores.ink, marginTop: 2 },
  lede: { fontSize: 13, color: cores.muted, marginTop: 6, marginBottom: espacamento.lg },
  cartaoTitulo: { fontSize: 15, fontWeight: '600', color: cores.ink, marginBottom: 6 },
  formula: {
    fontFamily: 'monospace', fontSize: 11, color: cores.teal,
    backgroundColor: cores.paper, padding: 8, borderLeftWidth: 2, borderLeftColor: cores.teal, marginBottom: 4,
  },
  subhead: { fontSize: 12, fontWeight: '600', color: cores.muted, marginTop: espacamento.md, marginBottom: 4 },
  pecaRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 4 },
  removerPeca: { fontSize: 16, color: cores.warn, paddingHorizontal: 6 },
  adicionarLink: { fontSize: 12, color: cores.accent, marginTop: 4, marginBottom: 4 },
  resultBlock: { marginTop: espacamento.md, paddingTop: espacamento.md, borderTopWidth: 1, borderTopColor: cores.lineForte, gap: 8 },
  resultLinha: { flexDirection: 'row', justifyContent: 'space-between' },
  resultLabel: { fontSize: 13, color: cores.ink },
  resultValor: { fontSize: 13, color: cores.ink, fontFamily: 'monospace', fontWeight: '600' },
  resultDestaque: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: cores.accentSoft, padding: 10, borderRadius: 6,
  },
  resultDestaqueValor: { fontSize: 18, color: cores.accent, fontFamily: 'monospace', fontWeight: '700' },
});
