import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Cartao, CampoTexto, Botao, Banner, LinhaVazia, Etiqueta } from '../components/ui';

const CATEGORIAS_RECEITA = ['VENDA_MOVEL', 'OUTRAS_RECEITAS'];
const CATEGORIAS_DESPESA = ['COMPRA_MATERIAL', 'SALARIOS', 'ALUGUEL', 'ENERGIA', 'IMPOSTOS', 'MANUTENCAO', 'OUTRAS_DESPESAS'];

const STATUS_TOM = { PAGO: 'teal', PENDENTE: 'accent', ATRASADO: 'warn', CANCELADO: 'accent' };

function primeiroDiaDoMesISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

const VAZIO = {
  tipo: 'DESPESA', categoria: CATEGORIAS_DESPESA[0], descricao: '',
  valor: '', dataVencimento: hojeISO(), formaPagamento: '',
};

export default function FluxoCaixaScreen() {
  const api = useApi();
  const [resumo, setResumo] = useState(null);
  const [lancamentos, setLancamentos] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(() => {
    setErro(null);
    api.resumoFluxoCaixa(primeiroDiaDoMesISO(), hojeISO()).then(setResumo).catch((e) => setErro(e.message));
    api.listarLancamentos().then(setLancamentos).catch((e) => setErro(e.message));
  }, [api]);

  useFocusEffect(carregar);

  function escolherTipo(tipo) {
    setForm({
      ...form,
      tipo,
      categoria: tipo === 'RECEITA' ? CATEGORIAS_RECEITA[0] : CATEGORIAS_DESPESA[0],
    });
  }

  async function salvar() {
    if (!form.descricao || !form.valor) {
      setErro('Informe ao menos a descrição e o valor.');
      return;
    }
    setErro(null);
    try {
      await api.criarLancamento({ ...form, valor: Number(form.valor) });
      setForm({ ...VAZIO, tipo: form.tipo, categoria: form.categoria });
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function marcarPago(id) {
    try {
      await api.registrarPagamentoLancamento(id, {});
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function cancelar(id) {
    try {
      await api.cancelarLancamento(id);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  const categorias = form.tipo === 'RECEITA' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.eyebrow}>Financeiro</Text>
      <Text style={styles.titulo}>Fluxo de Caixa</Text>
      <Text style={styles.lede}>
        Vendas e compras de material geram lançamentos automaticamente. Use o formulário para
        lançamentos manuais, como aluguel e salários.
      </Text>

      {erro && <Banner tipo="erro">{erro}</Banner>}

      {resumo && (
        <Cartao>
          <Text style={styles.cartaoTitulo}>Resumo do mês</Text>
          <View style={styles.kpiGrade}>
            <Kpi label="Recebido" valor={resumo.totalRecebido} cor={cores.success} />
            <Kpi label="Pago" valor={resumo.totalPago} cor={cores.warn} />
            <Kpi label="Saldo do período" valor={resumo.saldoPeriodo} destaque />
            <Kpi label="Saldo de caixa" valor={resumo.saldoAtual} destaque />
          </View>
          <View style={styles.kpiGrade}>
            <Kpi label="A receber (aberto)" valor={resumo.totalAReceber} cor={cores.accent} pequeno />
            <Kpi label="A pagar (aberto)" valor={resumo.totalAPagar} cor={cores.warn} pequeno />
          </View>
        </Cartao>
      )}

      <Cartao>
        <Text style={styles.cartaoTitulo}>Novo lançamento</Text>

        <View style={styles.tipoLinha}>
          <TouchableOpacity
            style={[styles.tipoBtn, form.tipo === 'RECEITA' && styles.tipoBtnAtivoReceita]}
            onPress={() => escolherTipo('RECEITA')}
          >
            <Text style={[styles.tipoTexto, form.tipo === 'RECEITA' && styles.tipoTextoAtivo]}>Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipoBtn, form.tipo === 'DESPESA' && styles.tipoBtnAtivoDespesa]}
            onPress={() => escolherTipo('DESPESA')}
          >
            <Text style={[styles.tipoTexto, form.tipo === 'DESPESA' && styles.tipoTextoAtivo]}>Despesa</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.chips}>
          {categorias.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setForm({ ...form, categoria: c })}
              style={[styles.chip, form.categoria === c && styles.chipAtivo]}
            >
              <Text style={[styles.chipTexto, form.categoria === c && styles.chipTextoAtivo]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CampoTexto label="Descrição" value={form.descricao} onChangeText={(v) => setForm({ ...form, descricao: v })} />
        <View style={{ flexDirection: 'row', gap: espacamento.sm }}>
          <CampoTexto label="Valor (R$)" keyboardType="decimal-pad" value={form.valor}
                      onChangeText={(v) => setForm({ ...form, valor: v })} style={{ flex: 1 }} />
          <CampoTexto label="Vencimento (AAAA-MM-DD)" value={form.dataVencimento}
                      onChangeText={(v) => setForm({ ...form, dataVencimento: v })} style={{ flex: 1 }} />
        </View>

        <Botao titulo={`Adicionar ${form.tipo === 'RECEITA' ? 'receita' : 'despesa'}`} onPress={salvar} />
      </Cartao>

      <Cartao>
        <Text style={styles.cartaoTitulo}>Lançamentos</Text>
        {lancamentos.length === 0 && <LinhaVazia texto="Nenhum lançamento registrado." />}
        {lancamentos.map((l) => (
          <View key={l.id} style={styles.linha}>
            <View style={{ flex: 1 }}>
              <Text style={styles.linhaDescricao}>{l.descricao}</Text>
              <Text style={styles.linhaCategoria}>{l.categoria}</Text>
              <Text style={styles.linhaData}>Vence: {new Date(l.dataVencimento).toLocaleDateString('pt-BR')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={[styles.linhaValor, { color: l.tipo === 'RECEITA' ? cores.success : cores.warn }]}>
                {l.tipo === 'RECEITA' ? '+' : '−'} R$ {Number(l.valor).toFixed(2)}
              </Text>
              <Etiqueta texto={l.status} tom={STATUS_TOM[l.status]} />
              {(l.status === 'PENDENTE' || l.status === 'ATRASADO') && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                  <TouchableOpacity onPress={() => marcarPago(l.id)}>
                    <Text style={styles.acaoPagar}>marcar pago</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => cancelar(l.id)}>
                    <Text style={styles.acaoCancelar}>cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
      </Cartao>
    </ScrollView>
  );
}

function Kpi({ label, valor, cor, destaque, pequeno }) {
  const numero = Number(valor);
  const corFinal = destaque ? (numero >= 0 ? cores.success : cores.warn) : cor;
  return (
    <View style={styles.kpiItem}>
      <Text style={[styles.kpiValor, { color: corFinal, fontSize: pequeno ? 15 : 18 }]}>
        R$ {numero.toFixed(2)}
      </Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  conteudo: { padding: espacamento.lg, paddingBottom: espacamento.xxl },
  eyebrow: { fontSize: 12, color: cores.muted },
  titulo: { fontSize: 26, fontWeight: '700', color: cores.ink, marginTop: 2 },
  lede: { fontSize: 13, color: cores.muted, marginTop: 6, marginBottom: espacamento.lg },
  cartaoTitulo: { fontSize: 15, fontWeight: '600', color: cores.ink, marginBottom: espacamento.sm },
  kpiGrade: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.sm, marginBottom: espacamento.sm },
  kpiItem: { flex: 1, minWidth: '45%' },
  kpiValor: { fontWeight: '700', fontFamily: 'monospace' },
  kpiLabel: { fontSize: 11, color: cores.muted, marginTop: 2 },
  tipoLinha: { flexDirection: 'row', gap: 8, marginBottom: espacamento.md },
  tipoBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: cores.lineForte,
    alignItems: 'center', backgroundColor: cores.paper,
  },
  tipoBtnAtivoReceita: { backgroundColor: cores.success, borderColor: cores.success },
  tipoBtnAtivoDespesa: { backgroundColor: cores.warn, borderColor: cores.warn },
  tipoTexto: { fontSize: 13, color: cores.muted, fontWeight: '600' },
  tipoTextoAtivo: { color: '#fff' },
  label: { fontSize: 12, color: cores.muted, marginBottom: 6, fontWeight: '500' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: espacamento.md },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: cores.lineForte },
  chipAtivo: { backgroundColor: cores.accent, borderColor: cores.accent },
  chipTexto: { fontSize: 11, color: cores.muted },
  chipTextoAtivo: { color: '#fff', fontWeight: '600' },
  linha: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: cores.line,
  },
  linhaDescricao: { fontSize: 13, fontWeight: '600', color: cores.ink },
  linhaCategoria: { fontSize: 11, color: cores.muted, fontFamily: 'monospace', marginTop: 2 },
  linhaData: { fontSize: 11, color: cores.muted, marginTop: 2 },
  linhaValor: { fontSize: 14, fontFamily: 'monospace', fontWeight: '700' },
  acaoPagar: { fontSize: 11, color: cores.accent, fontWeight: '600' },
  acaoCancelar: { fontSize: 11, color: cores.warn },
});
