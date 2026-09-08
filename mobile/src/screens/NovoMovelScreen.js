import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { CampoTexto, Botao, Banner } from '../components/ui';

export default function NovoMovelScreen({ navigation }) {
  const api = useApi();
  const [form, setForm] = useState({ codigo: '', nome: '', descricao: '', tempoEstimadoMontagemMin: '' });
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function campo(chave, valor) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  async function salvar() {
    if (!form.codigo || !form.nome) {
      setErro('Preencha ao menos Código e Nome.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await api.criarMovel({
        ...form,
        tempoEstimadoMontagemMin: form.tempoEstimadoMontagemMin ? Number(form.tempoEstimadoMontagemMin) : null,
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

      <CampoTexto label="Código" value={form.codigo} onChangeText={(v) => campo('codigo', v)} placeholder="MOV-003" autoCapitalize="characters" />
      <CampoTexto label="Nome" value={form.nome} onChangeText={(v) => campo('nome', v)} placeholder="Rack para TV 180cm" />
      <CampoTexto
        label="Descrição"
        value={form.descricao}
        onChangeText={(v) => campo('descricao', v)}
        multiline
        numberOfLines={3}
        style={{ minHeight: 80 }}
      />
      <CampoTexto
        label="Tempo estimado (min)"
        keyboardType="numeric"
        value={form.tempoEstimadoMontagemMin}
        onChangeText={(v) => campo('tempoEstimadoMontagemMin', v)}
      />

      <Botao titulo="Adicionar modelo" onPress={salvar} carregando={salvando} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  conteudo: { padding: espacamento.lg, paddingBottom: espacamento.xxl },
});
