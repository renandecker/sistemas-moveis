import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { criarApi } from '../api/client';
import { cores, espacamento } from '../theme';
import { CampoTexto, Botao, Banner, Cartao } from '../components/ui';

export default function ConfiguracoesScreen() {
  const { apiBaseUrl, setApiBaseUrl, urlPadrao } = useConfig();
  const [valor, setValor] = useState(apiBaseUrl);
  const [status, setStatus] = useState(null); // 'ok' | 'erro' | null
  const [mensagem, setMensagem] = useState('');
  const [testando, setTestando] = useState(false);

  async function salvarESalvar() {
    await setApiBaseUrl(valor);
    setStatus(null);
    setMensagem('');
  }

  async function testarConexao() {
    setTestando(true);
    setStatus(null);
    try {
      const api = criarApi(valor.trim().replace(/\/+$/, ''));
      await api.testarConexao();
      setStatus('ok');
      setMensagem('Conexão bem-sucedida! O backend respondeu normalmente.');
    } catch (e) {
      setStatus('erro');
      setMensagem(e.message || 'Não foi possível conectar ao backend.');
    } finally {
      setTestando(false);
    }
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.eyebrow}>Conexão</Text>
      <Text style={styles.titulo}>Configurações</Text>
      <Text style={styles.lede}>
        Endereço do backend que este app consome. Por padrão já vem configurado
        para o backend publicado — só troque isto se for testar contra um
        backend rodando na sua própria máquina.
      </Text>

      <Cartao>
        <CampoTexto
          label="URL base da API"
          value={valor}
          onChangeText={setValor}
          placeholder="http://192.168.0.10:9190/api"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        {status === 'ok' && <Banner tipo="info">{mensagem}</Banner>}
        {status === 'erro' && <Banner tipo="erro">{mensagem}</Banner>}

        <View style={{ flexDirection: 'row', gap: espacamento.sm }}>
          <Botao titulo="Testar conexão" variante="secundario" onPress={testarConexao} carregando={testando} />
          <Botao titulo="Salvar" onPress={salvarESalvar} />
        </View>
      </Cartao>

      <Cartao>
        <Text style={styles.cartaoTitulo}>Testando contra um backend local</Text>
        <Text style={styles.dica}>
          Por padrão o app já aponta para o backend publicado. Se quiser testar contra
          um backend rodando na sua máquina (<Text style={styles.mono}>mvn quarkus:dev</Text>), troque
          a URL acima por uma destas:
        </Text>
        <Text style={styles.dica}>
          <Text style={styles.dicaDestaque}>Emulador Android:</Text>{' '}
          <Text style={styles.mono}>http://10.0.2.2:9190/api</Text>
        </Text>
        <Text style={styles.dica}>
          <Text style={styles.dicaDestaque}>Simulador iOS:</Text>{' '}
          <Text style={styles.mono}>http://localhost:9190/api</Text>
        </Text>
        <Text style={styles.dica}>
          <Text style={styles.dicaDestaque}>Celular físico (Expo Go):</Text> descubra o IP da sua
          máquina na rede Wi-Fi (Windows: <Text style={styles.mono}>ipconfig</Text>, procure "Endereço
          IPv4") e use algo como{' '}
          <Text style={styles.mono}>http://192.168.0.10:9190/api</Text>. O celular e o computador
          precisam estar na mesma rede.
        </Text>
        <Text style={styles.dica}>
          Lembre-se de rodar o backend com <Text style={styles.mono}>quarkus.http.host=0.0.0.0</Text>{' '}
          (padrão do Quarkus) e liberar a porta 9190 no firewall do Windows para conexões da rede local.
        </Text>
      </Cartao>

      <Cartao>
        <Text style={styles.cartaoTitulo}>Primeiro acesso pode demorar</Text>
        <Text style={styles.dica}>
          O backend publicado "dorme" depois de 15 minutos sem uso. O primeiro acesso
          seguinte pode levar até 30 segundos para responder — é normal, não precisa
          tentar de novo, só aguardar.
        </Text>
      </Cartao>

      <Text style={styles.urlAtual}>URL padrão de fábrica: {urlPadrao}</Text>
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
  dica: { fontSize: 13, color: cores.ink, marginBottom: 10, lineHeight: 19 },
  dicaDestaque: { fontWeight: '600' },
  mono: { fontFamily: 'monospace', backgroundColor: cores.paper, color: cores.accent },
  urlAtual: { fontSize: 11, color: cores.muted, textAlign: 'center', marginTop: espacamento.md },
});
