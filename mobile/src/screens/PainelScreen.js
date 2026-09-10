import React, { useCallback, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Cartao, Banner, LinhaVazia } from '../components/ui';

export default function PainelScreen() {
  const api = useApi();
  const [materiais, setMateriais] = useState([]);
  const [moveis, setMoveis] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [abaixoEstoque, setAbaixoEstoque] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    Promise.all([
      api.listarMateriais(),
      api.listarMoveis(),
      api.listarOrdens(),
      api.materiaisAbaixoEstoque(),
    ])
      .then(([m, mv, o, ae]) => {
        setMateriais(m);
        setMoveis(mv);
        setOrdens(o);
        setAbaixoEstoque(ae);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [api]);

  useFocusEffect(carregar);

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={cores.accent} />}
    >
      <View style={styles.headerMarca}>
        <Image
          source={require('../../assets/logo-moveis-paje.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.eyebrow}>Visão geral</Text>
      <Text style={styles.titulo}>Painel de Produção</Text>
      <Text style={styles.lede}>Catálogo, modelos e ordens em andamento na oficina.</Text>

      {erro && <Banner tipo="erro">Não foi possível carregar os dados: {erro}</Banner>}

      <View style={styles.kpiGrade}>
        <KpiCard valor={materiais.length} label="materiais" />
        <KpiCard valor={moveis.length} label="modelos" />
        <KpiCard valor={ordens.length} label="ordens" />
        <KpiCard valor={abaixoEstoque.length} label="abaixo do mínimo" alerta={abaixoEstoque.length > 0} />
      </View>

      <Cartao>
        <Text style={styles.cartaoTitulo}>Modelos recentes</Text>
        {moveis.length === 0 && <LinhaVazia texto="Nenhum móvel cadastrado ainda." />}
        {moveis.slice(0, 6).map((m) => (
          <View key={m.id} style={styles.linha}>
            <Text style={styles.linhaTexto}>{m.nome}</Text>
            <Text style={styles.linhaMono}>{m.codigo}</Text>
          </View>
        ))}
      </Cartao>

      <Cartao>
        <Text style={styles.cartaoTitulo}>Materiais abaixo do estoque mínimo</Text>
        {abaixoEstoque.length === 0 && <LinhaVazia texto="Todos os materiais estão OK." />}
        {abaixoEstoque.map((m) => (
          <View key={m.id} style={styles.linha}>
            <Text style={styles.linhaTexto}>{m.nome}</Text>
            <Text style={[styles.linhaMono, { color: cores.warn }]}>
              {m.estoqueAtual}/{m.estoqueMinimo} {m.unidadeMedida}
            </Text>
          </View>
        ))}
      </Cartao>
    </ScrollView>
  );
}

function KpiCard({ valor, label, alerta }) {
  return (
    <Cartao style={styles.kpiCartao}>
      <Text style={[styles.kpiValor, alerta && { color: cores.warn }]}>{valor}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </Cartao>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  conteudo: { padding: espacamento.lg, paddingTop: espacamento.xxl, paddingBottom: espacamento.xxl },
  headerMarca: {
    marginHorizontal: -espacamento.lg,
    marginTop: -espacamento.xxl,
    marginBottom: espacamento.lg,
    backgroundColor: cores.teal,
    paddingVertical: espacamento.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 170, height: 170 },
  eyebrow: { fontSize: 12, color: cores.muted },
  titulo: { fontSize: 26, fontWeight: '700', color: cores.ink, marginTop: 2 },
  lede: { fontSize: 13, color: cores.muted, marginTop: 6, marginBottom: espacamento.lg },
  kpiGrade: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.sm, marginBottom: espacamento.sm },
  kpiCartao: { width: '47%', alignItems: 'flex-start', marginBottom: espacamento.sm },
  kpiValor: { fontSize: 28, fontWeight: '700', color: cores.ink },
  kpiLabel: { fontSize: 12, color: cores.muted, marginTop: 2 },
  cartaoTitulo: { fontSize: 15, fontWeight: '600', color: cores.ink, marginBottom: espacamento.sm },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: cores.line,
  },
  linhaTexto: { fontSize: 13, color: cores.ink, flexShrink: 1, paddingRight: 8 },
  linhaMono: { fontSize: 12, color: cores.muted, fontFamily: 'monospace' },
});
