# Sistema de Montagem de Móveis

Monolito para gestão de catálogo de materiais, BOM (Bill of Materials) de móveis,
cálculo de insumos (chapas e fita de borda) e ordens de montagem — baseado na
especificação técnica fornecida.

**Stack:** React (Vite) · Java 21 + Quarkus · PostgreSQL

---

## 1. Estrutura do projeto

```
moveis-sistema/
├── backend/            # API REST em Quarkus
│   └── src/main/java/com/moveis/
│       ├── entity/     # Material, Movel, EstruturaMovel (BOM), OrdemMontagem
│       ├── repository/ # Panache repositories
│       ├── service/    # CalculoService (fórmulas da Seção 2)
│       ├── resource/   # Endpoints REST
│       └── dto/        # Objetos de transporte
├── frontend/           # SPA em React (web)
│   └── src/
│       ├── pages/       Painel, Materiais, Moveis, MovelDetalhe, OrdensMontagem, Calculadoras
│       └── api/client.js
├── mobile/             # App React Native (Expo) — consome a mesma API
│   └── src/
│       ├── screens/     mesmas telas do web, adaptadas para toque
│       ├── context/ConfigContext.js  # URL da API configurável no app
│       └── api/client.js
├── windows/            # scripts de inicialização local (Windows)
└── docker-compose.yml  # PostgreSQL para desenvolvimento
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
4. Para encerrar tudo (containers + processos das portas 8080/5173):
   dê duplo clique em **`windows\stop-local.bat`** ou rode `.\windows\stop-local.ps1`.

**Não usa Docker?** Instale o PostgreSQL localmente e rode
`.\windows\create-database.ps1` (cria o usuário `moveis` e o banco `moveis_db`
via `psql`) antes de iniciar o backend manualmente.

> Se o Windows bloquear a execução do `.ps1` com um aviso de política de
> execução, rode primeiro: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
> (os `.bat` já fazem isso automaticamente).

## 3. Banco de dados

O schema segue o DDL da especificação (`materiais`, `moveis`, `estrutura_movel`,
`ordens_montagem`), com pequenas extensões para tornar o sistema operável:

- `materiais`: adicionado **`estoque_atual`** (para comparar com `estoque_minimo` e
  alertar reposição) e os campos de cadastro da Seção 4 (`cor_acabamento`,
  `tipo_borda`, `tipo_ferragem`, `carga_maxima_kg`).
- `estrutura_movel`: adicionados **`comprimento_peca_mm`, `largura_peca_mm`,
  `lados_fitados`** — necessários para alimentar as fórmulas de plano de corte e
  fita de borda a partir da própria BOM.

O restante do schema (tabelas, PK/FK, `CHECK` de `tipo`, unicidade de
`(movel_id, material_id)`) é exatamente o da especificação. O Hibernate ORM
cria/atualiza as tabelas automaticamente em desenvolvimento
(`quarkus.hibernate-orm.database.generation=update`); troque para `validate` e
adote Flyway/Liquibase em produção.

Um `import.sql` popula dados de exemplo (chapas, ferragens, 2 móveis com BOM
completa) para você já abrir o front-end e ver dados reais.

### Subindo o PostgreSQL

```bash
docker compose up -d
```

Isso cria o banco `moveis_db` (usuário `moveis` / senha `moveis123`) na porta 5432.

## 4. Rodando o backend (Quarkus)

Pré-requisitos: **JDK 21** e **Maven 3.8+**.

```bash
cd backend
mvn quarkus:dev
```

- API disponível em `http://localhost:8080/api`
- Swagger UI em `http://localhost:8080/swagger-ui`
- CORS já liberado para o front-end em dev.

Variáveis de ambiente (opcionais, com defaults já em `application.properties`):
`DB_URL`, `DB_USER`, `DB_PASSWORD`.

## 5. Rodando o frontend (React)

Pré-requisito: **Node.js 18+**.

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. As chamadas a `/api/*` são redirecionadas
(proxy do Vite) para o backend em `localhost:8080`.

Build de produção: `npm run build` gera os arquivos estáticos em `frontend/dist`,
que podem ser servidos por qualquer servidor HTTP (ou copiados para
`src/main/resources/META-INF/resources` do Quarkus para formar um artefato
único, se preferir empacotar tudo em um só deploy).

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

## 7. App mobile (React Native / Expo)

A pasta `mobile/` traz um app React Native que consome a mesma API REST do
backend, com telas equivalentes ao front-end web (Painel, Materiais, Móveis ·
BOM, Ordens de Montagem, Calculadoras) mais uma aba **Config** para apontar o
app para o IP do backend na sua rede local — item essencial em mobile, já que
não existe proxy de dev nem "localhost" compartilhado com o navegador.

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
GET/POST/PUT/DELETE  /api/materiais
GET                   /api/materiais/abaixo-estoque-minimo
GET/POST/PUT/DELETE  /api/moveis
GET/POST/PUT/DELETE  /api/moveis/{id}/estrutura(/{itemId})
GET                   /api/moveis/{id}/necessidade-materiais?quantidade=N
GET/POST/PATCH/DELETE /api/ordens-montagem(/{id}/status)
POST                  /api/calculos/chapas
POST                  /api/calculos/fita-borda
```
