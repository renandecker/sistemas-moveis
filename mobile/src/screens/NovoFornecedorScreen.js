import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { CampoTexto, Botao, Banner } from '../components/ui';

const VAZIO = {
  nome: '', cnpj: '', email: '', telefone: '',
  logradouro: '', numero: '', cidade: '', estado: '', cep: '',
};

export default function NovoFornecedorScreen({ navigation }) {
  const api = useApi();
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function campo(chave, valor) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  async function salvar() {
    if (!form.nome) {
      setErro('Informe ao menos o nome do fornecedor.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await api.criarFornecedor({ ...form, ativo: true });
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

      <CampoTexto label="Nome" value={form.nome} onChangeText={(v) => campo('nome', v)} placeholder="Madeplac Distribuidora" />
      <CampoTexto label="CNPJ" value={form.cnpj} onChangeText={(v) => campo('cnpj', v)} placeholder="00.000.000/0000-00" />
      <CampoTexto label="Telefone" value={form.telefone} onChangeText={(v) => campo('telefone', v)} keyboardType="phone-pad" />
      <CampoTexto label="E-mail" value={form.email} onChangeText={(v) => campo('email', v)} keyboardType="email-address" autoCapitalize="none" />

      <CampoTexto label="Logradouro" value={form.logradouro} onChangeText={(v) => campo('logradouro', v)} />
      <View style={styles.linha2}>
        <CampoTexto label="Número" value={form.numero} onChangeText={(v) => campo('numero', v)} style={{ flex: 1 }} />
        <CampoTexto label="CEP" value={form.cep} onChangeText={(v) => campo('cep', v)} keyboardType="numeric" style={{ flex: 1 }} />
      </View>
      <View style={styles.linha2}>
        <CampoTexto label="Cidade" value={form.cidade} onChangeText={(v) => campo('cidade', v)} style={{ flex: 2 }} />
        <CampoTexto label="UF" value={form.estado} onChangeText={(v) => campo('estado', v.toUpperCase())} maxLength={2} style={{ flex: 1 }} />
      </View>

      <Botao titulo="Adicionar fornecedor" onPress={salvar} carregando={salvando} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  conteudo: { padding: espacamento.lg, paddingBottom: espacamento.xxl },
  linha2: { flexDirection: 'row', gap: espacamento.sm },
});
