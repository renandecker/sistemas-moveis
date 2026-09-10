import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { cores, espacamento } from '../theme';
import { Cartao, CampoTexto, Botao, Banner, LinhaVazia, Etiqueta } from '../components/ui';

const STATUS = ['PENDENTE', 'ENTREGUE', 'CANCELADA'];
const COMPRA_VAZIA = { movelId: null, movelLabel: '', quantidade: '1', valorUnitario: '' };

export default function ClienteDetalheScreen({ route }) {
  const { id } = route.params;
  const api = useApi();

  const [cliente, setCliente] = useState(null);
  const [compras, setCompras] = useState([]);
  const [moveis, setMoveis] = useState([]);
  const [form, setForm] = useState(COMPRA_VAZIA);
  const [modalAberto, setModalAberto] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(() => {
    api.buscarCliente(id).then(setCliente).catch((e) => setErro(e.message));
    api.listarComprasDoCliente(id).then(setCompras).catch((e) => setErro(e.message));
  }, [api, id]);

  useFocusEffect(carregar);

  useEffect(() => {
    api.listarMoveis().then(setMoveis).catch((e) => setErro(e.message));
  }, [api]);

  async function registrarCompra() {
    if (!form.movelId || !form.quantidade || !form.valorUnitario) {
      setErro('Selecione um móvel e informe quantidade e valor unitário.');
      return;
    }
    setErro(null);
    try {
      await api.criarVenda({
        clienteId: id,
        movelId: form.movelId,
        quantidade: Number(form.quantidade),
        valorUnitario: Number(form.valorUnitario),
      });
      setForm(COMPRA_VAZIA);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function mudarStatus(vendaId, status) {
    try {
      await api.atualizarStatusVenda(vendaId, status);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (!cliente) {
    return (
      <View style={styles.tela}>
        <Text style={{ padding: espacamento.lg, color: cores.muted }}>Carregando cliente…</Text>
      </View>
    );
  }

  const endereco = [cliente.logradouro, cliente.numero, cliente.complemento].filter(Boolean).join(', ');
  const localidade = [cliente.bairro, cliente.cidade && `${cliente.cidade}/${cliente.estado}`, cliente.cep]
    .filter(Boolean).join(' — ');

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>{cliente.nome}</Text>
      <Text style={styles.doc}>{cliente.cpfCnpj}</Text>
      <Text style={styles.contato}>
        {[cliente.telefone, cliente.email].filter(Boolean).join(' · ') || 'Sem contato cadastrado'}
      </Text>
      {endereco ? <Text style={styles.endereco}>{endereco}</Text> : null}
      {localidade ? <Text style={styles.endereco}>{localidade}</Text> : null}

      {erro && <Banner tipo="erro">{erro}</Banner>}

      <Cartao>
        <Text style={styles.cartaoTitulo}>Registrar compra</Text>

        <Text style={styles.label}>Móvel</Text>
        <TouchableOpacity style={styles.seletor} onPress={() => setModalAberto(true)}>
          <Text style={form.movelLabel ? styles.seletorTexto : styles.seletorPlaceholder}>
            {form.movelLabel || 'Selecione…'}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: espacamento.sm }}>
          <CampoTexto label="Quantidade" keyboardType="numeric" value={form.quantidade}
                      onChangeText={(v) => setForm({ ...form, quantidade: v })} style={{ flex: 1 }} />
          <CampoTexto label="Valor unitário (R$)" keyboardType="decimal-pad" value={form.valorUnitario}
                      onChangeText={(v) => setForm({ ...form, valorUnitario: v })} style={{ flex: 1 }} />
        </View>

        <Botao titulo="Registrar compra" onPress={registrarCompra} />
      </Cartao>

      <Cartao>
        <Text style={styles.cartaoTitulo}>Histórico de compras</Text>
        {compras.length === 0 && <LinhaVazia texto="Nenhuma compra registrada ainda." />}
        {compras.map((v) => (
          <View key={v.id} style={styles.compraLinha}>
            <View style={{ flex: 1 }}>
              <Text style={styles.compraMovel}>{v.movelNome}</Text>
              <Text style={styles.compraCodigo}>{v.movelCodigo} · {v.quantidade}x</Text>
              <Text style={styles.compraData}>{new Date(v.dataVenda).toLocaleDateString('pt-BR')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={styles.compraValor}>R$ {Number(v.valorTotal).toFixed(2)}</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {STATUS.map((s) => (
                  <TouchableOpacity key={s} onPress={() => mudarStatus(v.id, s)}>
                    <Etiqueta texto={s} tom={s === v.status ? (s === 'CANCELADA' ? 'warn' : 'teal') : 'accent'} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ))}
      </Cartao>

      <Modal visible={modalAberto} animationType="slide" onRequestClose={() => setModalAberto(false)}>
        <View style={styles.modalTela}>
          <FlatList
            data={moveis}
            keyExtractor={(m) => String(m.id)}
            renderItem={({ item: m }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setForm((f) => ({ ...f, movelId: m.id, movelLabel: `${m.codigo} — ${m.nome}` }));
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
  titulo: { fontSize: 22, fontWeight: '700', color: cores.ink },
  doc: { fontSize: 12, color: cores.muted, fontFamily: 'monospace', marginTop: 2 },
  contato: { fontSize: 13, color: cores.ink, marginTop: 8 },
  endereco: { fontSize: 12, color: cores.muted, marginTop: 2 },
  cartaoTitulo: { fontSize: 15, fontWeight: '600', color: cores.ink, marginBottom: espacamento.sm },
  label: { fontSize: 12, color: cores.muted, marginBottom: 6, fontWeight: '500' },
  seletor: {
    borderWidth: 1, borderColor: cores.lineForte, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: cores.paper, marginBottom: espacamento.md,
  },
  seletorTexto: { color: cores.ink, fontSize: 14 },
  seletorPlaceholder: { color: cores.muted, fontSize: 14 },
  compraLinha: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: cores.line,
  },
  compraMovel: { fontSize: 13, fontWeight: '600', color: cores.ink },
  compraCodigo: { fontSize: 11, color: cores.muted, fontFamily: 'monospace', marginTop: 2 },
  compraData: { fontSize: 11, color: cores.muted, marginTop: 2 },
  compraValor: { fontSize: 13, color: cores.ink, fontFamily: 'monospace', fontWeight: '600' },
  modalTela: { flex: 1, backgroundColor: cores.bg, padding: espacamento.lg, paddingTop: 60 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: cores.line },
  modalCodigo: { fontSize: 11, color: cores.muted, fontFamily: 'monospace' },
  modalNome: { fontSize: 14, color: cores.ink, marginTop: 2 },
});
