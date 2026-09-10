# App Mobile — Móveis Pajé

App em **React Native (Expo)** que consome a mesma API REST do backend Quarkus
usada pelo front-end web, com as mesmas telas/funcionalidades adaptadas para
toque: Painel, Materiais, Móveis (BOM), Clientes (com compras), e uma aba
**Mais** reunindo Ordens de Montagem, Fornecedores, Estoque (Entrada/Saída),
Fluxo de Caixa e Calculadoras.

## 1. Pré-requisitos

- Node.js 18+
- App **Expo Go** instalado no celular (Android/iOS) — ou um emulador
  Android / simulador iOS configurado.
- O backend (Quarkus) rodando e acessível pela rede (veja seção 3).

## 2. Instalação e execução

```bash
cd mobile
npm install
npm start
```

Isso abre o Metro Bundler com um QR Code:

- **Celular físico:** abra o app **Expo Go** e escaneie o QR Code (celular e
  computador precisam estar na mesma rede Wi-Fi).
- **Emulador Android:** com o emulador já aberto, pressione `a` no terminal.
- **Simulador iOS** (só em macOS): pressione `i` no terminal.

## 3. Apontando o app para o backend — MUITO IMPORTANTE

Diferente do front-end web (que roda no navegador e usa um proxy), o app
mobile roda fora do navegador e precisa da **URL completa** do backend. Isso é
configurado na aba **"Config"** dentro do próprio app, e fica salvo entre
sessões (AsyncStorage).

| Onde o app roda | URL a usar |
| --- | --- |
| Emulador Android | `http://10.0.2.2:7070/api` (já é o padrão) |
| Simulador iOS | `http://localhost:7070/api` |
| Celular físico (Expo Go) | `http://SEU_IP_LOCAL:7070/api`, ex.: `http://192.168.0.10:7070/api` |

Para descobrir o IP da sua máquina no Windows: abra o `cmd` e rode `ipconfig`,
procure por "Endereço IPv4" na sua rede Wi-Fi/Ethernet ativa.

Depois de digitar a URL na aba Config, toque em **"Testar conexão"** antes de
salvar — o app faz uma chamada real (`GET /moveis`) e avisa se deu certo ou
qual foi o erro (timeout, CORS, DNS, etc.), para facilitar o diagnóstico.

**Checklist se a conexão falhar:**
1. O backend está rodando (`mvn quarkus:dev` no terminal do backend sem erros)?
2. O celular e o computador estão na mesma rede Wi-Fi?
3. O Firewall do Windows está liberando a porta 7070 para conexões da rede local?
4. Você usou o IP correto (não `localhost`, a menos que seja emulador/simulador)?

## 4. Estrutura do projeto

```
mobile/
├── App.js
├── src/
│   ├── api/client.js        # cliente HTTP (fetch) parametrizado por baseUrl
│   ├── context/ConfigContext.js  # guarda a URL da API (AsyncStorage)
│   ├── hooks/useApi.js       # hook que já entrega a API vinculada à URL atual
│   ├── navigation/index.js   # bottom tabs (5) + stacks
│   ├── components/ui.js      # Cartao, Botao, CampoTexto, Banner, Etiqueta...
│   └── screens/
│       ├── PainelScreen.js
│       ├── MateriaisScreen.js / NovoMaterialScreen.js
│       ├── MoveisScreen.js / MovelDetalheScreen.js / NovoMovelScreen.js
│       ├── ClientesScreen.js / NovoClienteScreen.js / ClienteDetalheScreen.js
│       ├── MaisMenuScreen.js         # menu da aba "Mais"
│       ├── OrdensScreen.js / NovaOrdemScreen.js
│       ├── FornecedoresScreen.js / NovoFornecedorScreen.js / FornecedorDetalheScreen.js
│       ├── EstoqueScreen.js
│       ├── FluxoCaixaScreen.js
│       ├── CalculadorasScreen.js
│       └── ConfiguracoesScreen.js
```

### Navegação

Para não sobrecarregar a barra de abas inferior, o app usa **5 abas**
(Painel, Materiais, Móveis, Clientes, **Mais**) — a aba "Mais" abre um menu
que leva a Ordens de Montagem, Fornecedores, Estoque e Calculadoras/Config,
todos dentro da mesma pilha de navegação.

## 5. Build para distribuição (opcional)

Para gerar um `.apk`/`.aab` (Android) ou `.ipa` (iOS) fora do Expo Go, use o
[EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```

Nesse caso, a URL da API configurável na aba "Config" continua funcionando
normalmente — mas para produção real, considere publicar o backend atrás de
um domínio/HTTPS em vez de um IP de rede local.
