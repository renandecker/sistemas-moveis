# Móveis Pajé — Sistema de Gestão

Monolito para gestão de catálogo de materiais, BOM (Bill of Materials) de móveis,
cálculo de insumos (chapas e fita de borda), estoque, clientes, fornecedores,
fluxo de caixa e ordens de montagem — desenvolvido para a **Móveis Pajé**.

**Stack:** React (Vite) · Java 21 + Quarkus · PostgreSQL · React Native (Expo)

## Identidade visual

O tema (web e mobile) segue a paleta do logo da Móveis Pajé:
- **Verde-petróleo quase preto** `#101C1C` — barra lateral, cabeçalhos, elementos de marca
- **Dourado bronze** `#84692F` — botões primários, links, destaques (contraste testado para WCAG AA)
- Tipografia de destaque em **Cormorant Garamond** (serifada elegante, ecoando o logo)

O arquivo do logo está em `frontend/public/logo-moveis-paje.png` (web) e
`mobile/assets/logo-moveis-paje.png` (mobile/ícone do app).

## 1. Estrutura do projeto

```
moveis-sistema/
├── backend/            # API REST em Quarkus
│   ├── Dockerfile      # build multi-stage (Maven -> imagem JRE Alpine)
│   ├── .dockerignore
│   └── src/main/java/com/moveis/
│       ├── entity/     # Material, Movel, EstruturaMovel (BOM), OrdemMontagem...
│       ├── repository/ # Panache repositories
│       ├── service/    # CalculoService (fórmulas da Seção 2), FluxoCaixaService, EstoqueService
│       ├── resource/   # Endpoints REST
│       └── dto/        # Objetos de transporte
├── frontend/           # SPA em React (web)
│   ├── wrangler.toml   # deploy como site estático (Cloudflare Workers Static Assets)
│   ├── .env.production # aponta o build de produção para o backend publicado
│   └── src/
│       ├── pages/       Painel, Materiais, Moveis, MovelDetalhe, OrdensMontagem, Calculadoras...
│       └── api/client.js
├── mobile/             # App React Native (Expo) — consome a mesma API
│   └── src/
│       ├── screens/     mesmas telas do web, adaptadas para toque
│       ├── context/ConfigContext.js  # URL da API configurável no app
│       └── api/client.js
├── windows/            # scripts de inicialização local (Windows)
├── schema.sql          # DDL completo (documentação/migração manual)
└── docker-compose.yml  # PostgreSQL + backend (opcional)
```

## 2. Início rápido no Windows (scripts prontos)

A pasta `windows/` traz scripts que sobem tudo de uma vez — Postgres, backend
e frontend — cada um em sua própria janela, **e gravam log em arquivo** para
facilitar ver erros depois.

**Pré-requisitos:** Docker Desktop (recomendado, para o banco), JDK 21, Maven
3.8+ e Node.js 18+, todos no PATH.

1. Dê duplo clique em **`windows\start-local.bat`**
   (ou, num terminal PowerShell: `.\windows\start-local.ps1`).
2. O script vai:
   - subir o PostgreSQL via `docker compose up -d` e esperar ele ficar pronto;
   - abrir uma janela rodando `mvn quarkus:dev` (backend);
   - abrir outra janela rodando `npm install` (se necessário) e `npm run dev` (frontend);
   - abrir o navegador em `http://localhost:5173`.
3. Os logs de cada serviço ficam em `logs\backend.log`, `logs\frontend.log` e
   `logs\database.log`. Para acompanhar erros em tempo real sem trocar de
   janela, abra outro terminal e rode:
   ```powershell
   Get-Content -Path logs\backend.log  -Wait -Tail 50
   Get-Content -Path logs\frontend.log -Wait -Tail 50
   ```
4. Para encerrar tudo (containers + processos das portas 9190/5173):
   dê duplo clique em **`windows\stop-local.bat`** ou rode `.\windows\stop-local.ps1`.

**Não usa Docker?** Instale o PostgreSQL localmente e rode
`.\windows\create-database.ps1` (cria o usuário `moveis` e o banco `moveis_db`
via `psql`) antes de iniciar o backend manualmente.

> Se o Windows bloquear a execução do `.ps1` com um aviso de política de
> execução, rode primeiro: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
> (os `.bat` já fazem isso automaticamente).

## 3. Banco de dados

O schema segue o DDL da especificação (`materiais`, `moveis`, `estrutura_movel`,
`ordens_montagem`), com extensões para tornar o sistema operável e para os
módulos de clientes, fornecedores e estoque:

- `materiais`: adicionado **`estoque_atual`** (para comparar com `estoque_minimo` e
  alertar reposição) e os campos de cadastro da Seção 4 (`cor_acabamento`,
  `tipo_borda`, `tipo_ferragem`, `carga_maxima_kg`).
- `estrutura_movel`: adicionados **`comprimento_peca_mm`, `largura_peca_mm`,
  `lados_fitados`** — necessários para alimentar as fórmulas de plano de corte e
  fita de borda a partir da própria BOM.
- **`clientes`** (nova): dados de contato e endereço completo (logradouro,
  número, complemento, bairro, cidade, UF, CEP).
- **`vendas`** (nova): compra de um cliente, com os dados do móvel adquirido
  (referência a `moveis`), quantidade, valor unitário/total e status
  (`PENDENTE`, `ENTREGUE`, `CANCELADA`). Pode opcionalmente referenciar a
  `ordem_montagem` que vai produzir o móvel vendido.
- **`fornecedores`** (nova): dados de contato e endereço dos fornecedores de
  materiais.
- **`fornecedor_material`** (nova): tabela de preços — relaciona um fornecedor
  a um material com `preco_unitario`, `prazo_entrega_dias` e um flag
  `preferencial`. Um mesmo material pode ter várias cotações (fornecedores
  diferentes).
- **`movimentacoes_estoque`** (nova): histórico de **entrada** (compra de
  fornecedor) e **saída** (consumo em produção, ajuste, perda) de cada
  material. Cada movimentação registrada via API atualiza automaticamente
  `materiais.estoque_atual` (ver `EstoqueService`), e uma saída é bloqueada
  se o estoque disponível for insuficiente.
- **`lancamentos_financeiros`** (nova): o fluxo de caixa — receitas e
  despesas, com vencimento, status (`PENDENTE`, `PAGO`, `ATRASADO`,
  `CANCELADO`) e forma de pagamento. É criada automaticamente pelo
  `FluxoCaixaService` sempre que uma **venda** é registrada (conta a
  receber) ou uma **entrada de estoque com fornecedor** é registrada (conta
  a pagar); também aceita lançamentos manuais (aluguel, salários, etc.).

O restante do schema (tabelas, PK/FK, `CHECK` de `tipo`, unicidade de
`(movel_id, material_id)`) é exatamente o da especificação. O Hibernate ORM
cria/atualiza as tabelas automaticamente em desenvolvimento
(`quarkus.hibernate-orm.database.generation=update`); troque para `validate` e
adote Flyway/Liquibase em produção.

Um `import.sql` popula dados de exemplo (chapas, ferragens, 2 móveis com BOM
completa, fornecedores com preços, clientes com compras e movimentações de
estoque) para você já abrir o front-end e ver dados reais.

### Subindo o PostgreSQL

```bash
docker compose up -d
```

Isso cria o banco `moveis_db` (usuário `moveis` / senha `moveis123`) na porta
**5452** do host (em vez da porta padrão 5432, para não conflitar com uma
eventual instalação nativa do PostgreSQL já rodando na sua máquina).

## 4. Rodando o backend (Quarkus)

Pré-requisitos: **JDK 21** e **Maven 3.8+**.

```bash
cd backend
mvn quarkus:dev
```

- API disponível em `http://localhost:9190/api`
- Swagger UI em `http://localhost:9190/swagger-ui`
- CORS já liberado para o front-end em dev.

Variáveis de ambiente (opcionais, com defaults já em `application.properties`):
`DB_URL`, `DB_USER`, `DB_PASSWORD`.

> **Porta ocupada por outro programa?** A porta da API (`quarkus.http.port`,
> padrão **9190**) já teve que ser trocada neste projeto uma vez porque o
> **AnyDesk** usa a porta 7070 por padrão para conexões diretas — e ele
> segura essa porta o tempo todo enquanto está aberto, mesmo minimizado,
> sem dar pra matar o processo sem ser administrador. Se no futuro a API
> parecer "travada" (conexão reseta, nunca responde), rode
> `netstat -ano | findstr :9190` e confira se o processo dono da porta é
> mesmo `java.exe` — se for outro programa (AnyDesk, Skype, algum outro
> app), troque a porta no `application.properties` e no
> `frontend/vite.config.js` para algo incomum, em vez de tentar liberar a
> porta do outro programa. O script `windows\diagnostico.ps1` automatiza
> essa checagem (mostra o nome do processo dono da porta antes de tentar
> subir o backend).

### 4.1. Usando o Neon (Postgres na nuvem) em vez do Docker local

O projeto também pode rodar contra um banco Neon, usando o perfil `neon` do
Quarkus, sem precisar do Docker/Postgres local:

1. **Crie o schema no Neon primeiro** (o perfil `neon` usa
   `hibernate-orm.database.generation=validate` — ele não cria tabelas
   sozinho, só confere se já existem). Rode o `schema.sql` da raiz do
   projeto contra o banco `paje`:
   ```bash
   psql "postgresql://neondb_owner:SUA_SENHA@ep-young-water-acjoayuy-pooler.sa-east-1.aws.neon.tech/paje?sslmode=require" -f schema.sql
   ```
   (ou cole o conteúdo de `schema.sql` no SQL Editor do painel do Neon).

2. **Rode o backend com o perfil `neon`**, informando usuário/senha por
   variável de ambiente (a senha nunca fica gravada em nenhum arquivo do
   projeto):
   ```bash
   # Linux/macOS
   export DB_USER=neondb_owner
   export DB_PASSWORD=sua-senha-aqui
   cd backend
   mvn quarkus:dev -Dquarkus.profile=neon
   ```
   No Windows, use o script pronto `windows\start-backend-neon.ps1` — ele
   pede a senha na hora (sem ecoar na tela) e já ativa o perfil certo.

3. O host e o nome do banco (`ep-young-water-acjoayuy-pooler.sa-east-1.aws.neon.tech`,
   database `paje`) já estão fixos em `application.properties` sob o
   prefixo `%neon.` — só usuário e senha vêm de fora.

> **Segurança:** não faça commit de senhas reais em `application.properties`
> nem em nenhum `.ps1`. Se este projeto for parar num repositório Git
> (mesmo privado), rotacione a senha do Neon depois de ela ter sido colada
> em qualquer lugar fora do painel do Neon — trate qualquer senha de banco
> que passou por chat, print ou arquivo de texto como potencialmente
> exposta.

### 4.2. Rodando o backend via Docker

O backend tem um `Dockerfile` multi-stage (`backend/Dockerfile`): a primeira
etapa compila com Maven, a segunda roda só o JAR empacotado (modo *fast-jar*
do Quarkus) numa imagem enxuta baseada em JRE Alpine, com usuário não-root.

**Opção mais simples — tudo via docker-compose (Postgres + backend juntos):**
```bash
docker compose up -d --build
```
Isso builda a imagem do backend, sobe o Postgres, espera ele ficar saudável
(`depends_on: condition: service_healthy`) e só então inicia o backend, já
conectado ao Postgres pela rede interna do compose. API em
`http://localhost:9190/api`.

> Se você usa `windows\start-local.ps1` para o dia a dia (com live-reload via
> `mvn quarkus:dev`), ele continua subindo **só o Postgres** via Docker — o
> serviço `backend` do compose é para testar a imagem de produção de ponta a
> ponta, ou rodar tudo containerizado, não para desenvolvimento com reload.

**Só a imagem do backend (Postgres rodando por fora):**
```bash
cd backend
docker build -t moveis-paje-backend .
docker run -p 9190:9190 \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5452/moveis_db \
  -e DB_USER=moveis -e DB_PASSWORD=moveis123 \
  moveis-paje-backend
```
(`host.docker.internal` é como um container acessa a máquina host no
Docker Desktop/Windows/Mac; no Linux, use o IP da interface `docker0` ou
rode o Postgres também em container na mesma rede.)

**Porta e memória customizáveis sem rebuild:** `-e PORT=8080` (plataformas
cloud tipo Render/Railway injetam isso automaticamente) e
`-e JAVA_OPTS="-Xmx256m"` (ou qualquer flag JVM) funcionam via variável de
ambiente, sem precisar reconstruir a imagem.

## 5. Rodando o frontend (React)

Pré-requisito: **Node.js 18+**.

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. As chamadas a `/api/*` são redirecionadas
(proxy do Vite) para o backend em `localhost:9190`.

### 5.1. Backend publicado (produção)

O backend está publicado em **`https://paje-micro-service-1.onrender.com`**
(plano gratuito do Render — por isso ele "dorme" após 15 minutos sem acesso;
veja a nota sobre cold start logo abaixo).

Build de produção do front-end: `npm run build` gera os arquivos estáticos em
`frontend/dist`, que podem ser servidos por qualquer servidor HTTP estático.
O arquivo `frontend/.env.production` já configura esse build para chamar o
backend publicado acima (via `VITE_API_URL`) em vez do proxy local — não
precisa editar código para isso. Se o backend publicado mudar de endereço,
basta atualizar essa única variável.

Em desenvolvimento (`npm run dev`), essa variável é ignorada e o front-end
continua usando o proxy do Vite para o backend local, normalmente.

O front-end é publicado como site estático num **Cloudflare Worker** (Static
Assets), configurado em `frontend/wrangler.toml`:

```bash
cd frontend
npm install
npm run deploy   # builda (vite build) e publica (wrangler deploy) em sequência
```

Dois pontos importantes nessa configuração (já resolvidos no
`wrangler.toml`, mas bom saber o porquê):

- **`[assets] directory = "./dist"`** — serve os arquivos estáticos gerados
  pelo `vite build` direto do Worker, sem precisar de servidor Node rodando.
- **`not_found_handling = "single-page-application"`** — essencial porque o
  front-end usa React Router (rotas como `/materiais`, `/fornecedores/:id`,
  `/moveis/:id`). Sem essa opção, recarregar a página em qualquer rota que
  não seja a raiz dá 404, porque esses caminhos não existem como arquivos
  reais em `./dist` — só existem no roteamento do lado do cliente. Com essa
  opção, qualquer caminho não encontrado cai de volta no `index.html`, e o
  React Router assume a partir daí. (Atenção ao nome exato do valor: é
  `"single-page-application"`, não `"single-page-app"` — testei com o
  Wrangler real e ele rejeita a variação abreviada.)

> **Cold start:** como o backend está no plano gratuito do Render, se ficar
> 15 minutos sem receber acessos ele entra em modo de espera. O primeiro
> acesso seguinte leva de 15 a 30 segundos para responder, enquanto o
> servidor "acorda". O front-end (web e mobile) já trata isso automaticamente:
> aumenta o tempo de espera das chamadas para 45s e mostra um aviso
> "Acordando o servidor…" na tela em vez de parecer travado.

## 6. O que o sistema cobre

| Regra da especificação | Onde está implementada |
| --- | --- |
| BOM fixa por móvel (Seção 1) | tabela `estrutura_movel` + tela "Móveis · BOM" |
| Fator de perda 5–10% (ferragem) / 15–25% (chapa) | campo `fator_perda_padrao` no material, usado como default na explosão de BOM |
| Tolerância dimensional ±1mm | documentada na barra lateral do app e nos comentários do schema |
| Tempo estimado de montagem | `moveis.tempo_estimado_montagem_min`, multiplicado pela quantidade na explosão de BOM |
| Área total de peças / Chapas necessárias (Seção 2.1) | `CalculoService.calcularChapas` + tela "Calculadoras" |
| Perímetro de fita de borda (Seção 2.2) | `CalculoService.calcularFitaBorda` + tela "Calculadoras" |
| Explosão de materiais para N unidades de um móvel | `GET /api/moveis/{id}/necessidade-materiais?quantidade=N` + aba "Explosão de materiais" na tela do móvel |
| Ordens de montagem com status | tabela `ordens_montagem` + tela "Ordens de Montagem" |
| Clientes com dados, endereço e compras (dados do móvel) | tabelas `clientes` + `vendas` + telas "Clientes" e "Detalhe do cliente" (histórico de compras) |
| Fornecedores de materiais com valores | tabelas `fornecedores` + `fornecedor_material` + tela "Fornecedores" |
| Entrada e saída de estoque | tabela `movimentacoes_estoque` + `EstoqueService` (atualiza `estoque_atual` automaticamente) + tela "Entrada · Saída" |
| Fluxo de caixa (contas a pagar/receber, saldo) | tabela `lancamentos_financeiros` + `FluxoCaixaService` (lança automaticamente a partir de vendas e compras) + tela "Fluxo de Caixa" |

## 7. App mobile (React Native / Expo)

A pasta `mobile/` traz um app React Native que consome a mesma API REST do
backend, com telas equivalentes ao front-end web: Painel, Materiais, Móveis ·
BOM, Clientes (com histórico de compras), e uma aba **Mais** reunindo Ordens
de Montagem, Fornecedores (com tabela de preços), Entrada/Saída de estoque,
Fluxo de Caixa e Calculadoras — além de uma aba **Config** dentro do menu
"Mais" para trocar o endereço do backend, caso queira testar contra um
backend local em vez do publicado (item essencial em mobile, já que não
existe proxy de dev nem "localhost" compartilhado com o navegador).

Por padrão o app já vem configurado para o backend publicado
(`https://paje-micro-service-1.onrender.com/api`) — não precisa configurar
nada para começar a usar. A mesma nota sobre cold start da seção 5.1 vale
aqui também: o primeiro acesso após o backend "dormir" pode levar até 30s,
e o app mostra um aviso na tela enquanto isso.

```bash
cd mobile
npm install
npm start
```

Depois, escaneie o QR Code com o app **Expo Go** (celular físico) ou pressione
`a`/`i` no terminal para abrir num emulador/simulador. Instruções completas de
configuração de rede e diagnóstico de conexão estão em `mobile/README.md`.

## 8. Principais endpoints REST

```
GET/POST/PUT/DELETE   /api/materiais
GET                    /api/materiais/abaixo-estoque-minimo
GET                    /api/materiais/{id}/fornecedores        # cotações de preço do material
GET/POST/PUT/DELETE   /api/moveis
GET/POST/PUT/DELETE   /api/moveis/{id}/estrutura(/{itemId})
GET                    /api/moveis/{id}/necessidade-materiais?quantidade=N
GET/POST/PATCH/DELETE  /api/ordens-montagem(/{id}/status)
POST                   /api/calculos/chapas
POST                   /api/calculos/fita-borda

GET/POST/PUT/DELETE   /api/clientes
GET                    /api/clientes/{id}/compras              # histórico de compras (vendas)
GET/POST/PATCH/DELETE  /api/vendas(/{id}/status)

GET/POST/PUT/DELETE   /api/fornecedores
GET/POST/PUT/DELETE   /api/fornecedores/{id}/materiais(/{itemId})  # tabela de preços

GET/POST              /api/movimentacoes?materialId=&tipo=      # entrada/saída de estoque

GET/POST               /api/fluxo-caixa/lancamentos?tipo=&status=
PATCH                  /api/fluxo-caixa/lancamentos/{id}/pagar
PATCH                  /api/fluxo-caixa/lancamentos/{id}/cancelar
GET                     /api/fluxo-caixa/resumo?inicio=&fim=      # saldo, a receber/pagar, por categoria
```
