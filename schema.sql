-- ============================================================================
-- Móveis Pajé — Sistema de Gestão
-- Script DDL completo (PostgreSQL) — todas as tabelas e campos do backend
-- ============================================================================
-- Gerado a partir das entidades JPA do backend (Quarkus + Hibernate ORM).
-- Ordem de criação respeita as dependências de chave estrangeira.
--
-- Uso:
--   psql -U moveis -d moveis_db -f schema.sql
--
-- Observação: em desenvolvimento, o próprio Hibernate ORM cria/atualiza esse
-- schema automaticamente (quarkus.hibernate-orm.database.generation=update).
-- Este script serve para documentação, migrações manuais, ou subir o banco
-- em outro ambiente sem depender do Hibernate.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. MATERIAIS — catálogo/estoque de matéria-prima
-- ============================================================================
CREATE TABLE materiais (
    id                  SERIAL PRIMARY KEY,
    sku                 VARCHAR(50)     NOT NULL,
    nome                VARCHAR(100)    NOT NULL,
    tipo                VARCHAR(30)     NOT NULL,
    unidade_medida      VARCHAR(10)     NOT NULL,       -- UN, M2, M, KG, ML
    comprimento_mm      INTEGER,
    largura_mm          INTEGER,
    espessura_mm        INTEGER,
    custo_unitario      NUMERIC(10,2)   NOT NULL,
    estoque_minimo      NUMERIC(10,2)   DEFAULT 0,
    estoque_atual       NUMERIC(10,2)   DEFAULT 0,
    fator_perda_padrao  NUMERIC(5,2)    DEFAULT 0.05,   -- 0.05–0.10 ferragens · 0.15–0.25 chapas
    cor_acabamento      VARCHAR(60),
    tipo_borda          VARCHAR(40),
    tipo_ferragem       VARCHAR(40),                    -- Dobradiça, Corrediça, Parafuso...
    carga_maxima_kg     NUMERIC(10,2),

    CONSTRAINT uk_materiais_sku UNIQUE (sku),
    CONSTRAINT ck_materiais_tipo CHECK (tipo IN ('CHAPA', 'FERRAGEM', 'CONSUMIVEL', 'ACABAMENTO'))
);

COMMENT ON TABLE materiais IS 'Catálogo de materiais (chapas, ferragens, consumíveis, acabamentos) e seu estoque.';

-- ============================================================================
-- 2. MOVEIS — modelos de móveis
-- ============================================================================
CREATE TABLE moveis (
    id                              SERIAL PRIMARY KEY,
    codigo                          VARCHAR(50)     NOT NULL,
    nome                            VARCHAR(100)    NOT NULL,
    descricao                       TEXT,
    tempo_estimado_montagem_min     INTEGER,

    CONSTRAINT uk_moveis_codigo UNIQUE (codigo)
);

COMMENT ON TABLE moveis IS 'Modelos de móveis cadastrados (cada um com uma BOM fixa em estrutura_movel).';

-- ============================================================================
-- 3. ESTRUTURA_MOVEL — BOM (Bill of Materials) de cada móvel
-- ============================================================================
CREATE TABLE estrutura_movel (
    id                          SERIAL PRIMARY KEY,
    movel_id                    INTEGER         NOT NULL,
    material_id                 INTEGER         NOT NULL,
    quantidade_necessaria       NUMERIC(10,3)   NOT NULL,
    percentual_perda_aplicado   NUMERIC(5,2),               -- se nulo, usa materiais.fator_perda_padrao
    comprimento_peca_mm         INTEGER,
    largura_peca_mm             INTEGER,
    lados_fitados                INTEGER,                   -- 0 a 4

    CONSTRAINT fk_estrutura_movel_movel
        FOREIGN KEY (movel_id) REFERENCES moveis(id) ON DELETE CASCADE,
    CONSTRAINT fk_estrutura_movel_material
        FOREIGN KEY (material_id) REFERENCES materiais(id),
    CONSTRAINT uk_movel_material UNIQUE (movel_id, material_id)
);

COMMENT ON TABLE estrutura_movel IS 'Lista de componentes (BOM) de cada móvel: quais materiais e quantidades.';

CREATE INDEX idx_estrutura_movel_movel_id ON estrutura_movel(movel_id);
CREATE INDEX idx_estrutura_movel_material_id ON estrutura_movel(material_id);

-- ============================================================================
-- 4. ORDENS_MONTAGEM — ordens de produção
-- ============================================================================
CREATE TABLE ordens_montagem (
    id                  SERIAL PRIMARY KEY,
    movel_id            INTEGER         NOT NULL,
    quantidade_moveis   INTEGER         NOT NULL,
    data_criacao        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    status              VARCHAR(20)     DEFAULT 'RASCUNHO',

    CONSTRAINT fk_ordens_montagem_movel
        FOREIGN KEY (movel_id) REFERENCES moveis(id),
    CONSTRAINT ck_ordens_montagem_status
        CHECK (status IN ('RASCUNHO', 'APROVADA', 'EM_PRODUCAO', 'CONCLUIDA', 'CANCELADA'))
);

COMMENT ON TABLE ordens_montagem IS 'Ordens de produção: montar N unidades de um modelo de móvel.';

CREATE INDEX idx_ordens_montagem_movel_id ON ordens_montagem(movel_id);

-- ============================================================================
-- 5. CLIENTES — cadastro de clientes
-- ============================================================================
CREATE TABLE clientes (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(150)    NOT NULL,
    cpf_cnpj        VARCHAR(20),
    email           VARCHAR(150),
    telefone        VARCHAR(20),
    logradouro      VARCHAR(150),
    numero          VARCHAR(20),
    complemento     VARCHAR(100),
    bairro          VARCHAR(100),
    cidade          VARCHAR(100),
    estado          VARCHAR(2),
    cep             VARCHAR(9),
    data_cadastro   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_clientes_cpf_cnpj UNIQUE (cpf_cnpj)
);

COMMENT ON TABLE clientes IS 'Clientes: dados de contato, endereço e histórico de compras (ver vendas).';

-- ============================================================================
-- 6. FORNECEDORES — cadastro de fornecedores de materiais
-- ============================================================================
CREATE TABLE fornecedores (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(150)    NOT NULL,
    cnpj            VARCHAR(20),
    email           VARCHAR(150),
    telefone        VARCHAR(20),
    logradouro      VARCHAR(150),
    numero          VARCHAR(20),
    cidade          VARCHAR(100),
    estado          VARCHAR(2),
    cep             VARCHAR(9),
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,

    CONSTRAINT uk_fornecedores_cnpj UNIQUE (cnpj)
);

COMMENT ON TABLE fornecedores IS 'Fornecedores de materiais.';

-- ============================================================================
-- 7. FORNECEDOR_MATERIAL — tabela de preços (cotações) por fornecedor
-- ============================================================================
CREATE TABLE fornecedor_material (
    id                      SERIAL PRIMARY KEY,
    fornecedor_id           INTEGER         NOT NULL,
    material_id             INTEGER         NOT NULL,
    preco_unitario          NUMERIC(10,2)   NOT NULL,
    prazo_entrega_dias      INTEGER,
    preferencial            BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_fornecedor_material_fornecedor
        FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE CASCADE,
    CONSTRAINT fk_fornecedor_material_material
        FOREIGN KEY (material_id) REFERENCES materiais(id) ON DELETE CASCADE,
    CONSTRAINT uk_fornecedor_material UNIQUE (fornecedor_id, material_id)
);

COMMENT ON TABLE fornecedor_material IS 'Preço e prazo de entrega de cada material, por fornecedor (cotações).';

CREATE INDEX idx_fornecedor_material_fornecedor_id ON fornecedor_material(fornecedor_id);
CREATE INDEX idx_fornecedor_material_material_id ON fornecedor_material(material_id);

-- ============================================================================
-- 8. VENDAS — compras dos clientes (com os dados do móvel adquirido)
-- ============================================================================
CREATE TABLE vendas (
    id                     SERIAL PRIMARY KEY,
    cliente_id             INTEGER         NOT NULL,
    movel_id               INTEGER         NOT NULL,
    ordem_montagem_id      INTEGER,
    quantidade             INTEGER         NOT NULL,
    valor_unitario         NUMERIC(10,2)   NOT NULL,
    valor_total            NUMERIC(10,2)   NOT NULL,
    data_venda             TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    status                 VARCHAR(20)     DEFAULT 'PENDENTE',

    CONSTRAINT fk_vendas_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT fk_vendas_movel
        FOREIGN KEY (movel_id) REFERENCES moveis(id),
    CONSTRAINT fk_vendas_ordem_montagem
        FOREIGN KEY (ordem_montagem_id) REFERENCES ordens_montagem(id),
    CONSTRAINT ck_vendas_status
        CHECK (status IN ('PENDENTE', 'ENTREGUE', 'CANCELADA'))
);

COMMENT ON TABLE vendas IS 'Compra de um cliente: modelo de móvel, quantidade e valores.';

CREATE INDEX idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX idx_vendas_movel_id ON vendas(movel_id);

-- ============================================================================
-- 9. MOVIMENTACOES_ESTOQUE — entrada e saída de materiais
-- ============================================================================
CREATE TABLE movimentacoes_estoque (
    id                     SERIAL PRIMARY KEY,
    material_id            INTEGER         NOT NULL,
    tipo                   VARCHAR(10)     NOT NULL,
    quantidade             NUMERIC(10,3)   NOT NULL,
    custo_unitario         NUMERIC(10,2),
    fornecedor_id          INTEGER,
    ordem_montagem_id      INTEGER,
    observacao             TEXT,
    data_movimentacao      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movimentacoes_material
        FOREIGN KEY (material_id) REFERENCES materiais(id),
    CONSTRAINT fk_movimentacoes_fornecedor
        FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
    CONSTRAINT fk_movimentacoes_ordem_montagem
        FOREIGN KEY (ordem_montagem_id) REFERENCES ordens_montagem(id),
    CONSTRAINT ck_movimentacoes_tipo
        CHECK (tipo IN ('ENTRADA', 'SAIDA'))
);

COMMENT ON TABLE movimentacoes_estoque IS 'Histórico de entrada (compra) e saída (consumo/perda) de estoque. Cada linha atualiza materiais.estoque_atual.';

CREATE INDEX idx_movimentacoes_material_id ON movimentacoes_estoque(material_id);
CREATE INDEX idx_movimentacoes_fornecedor_id ON movimentacoes_estoque(fornecedor_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_estoque(data_movimentacao);

-- ============================================================================
-- 10. LANCAMENTOS_FINANCEIROS — fluxo de caixa (receitas e despesas)
-- ============================================================================
CREATE TABLE lancamentos_financeiros (
    id                  SERIAL PRIMARY KEY,
    tipo                VARCHAR(10)     NOT NULL,
    categoria           VARCHAR(60)     NOT NULL,          -- VENDA_MOVEL, COMPRA_MATERIAL, SALARIOS, ALUGUEL...
    descricao           VARCHAR(200)    NOT NULL,
    valor               NUMERIC(10,2)   NOT NULL,
    data_vencimento     DATE            NOT NULL,
    data_pagamento      TIMESTAMP,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDENTE',
    forma_pagamento     VARCHAR(30),                        -- DINHEIRO, PIX, CARTAO, BOLETO, TRANSFERENCIA...
    venda_id            INTEGER,
    fornecedor_id       INTEGER,
    observacao          TEXT,
    data_criacao        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lancamentos_venda
        FOREIGN KEY (venda_id) REFERENCES vendas(id),
    CONSTRAINT fk_lancamentos_fornecedor
        FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
    CONSTRAINT ck_lancamentos_tipo
        CHECK (tipo IN ('RECEITA', 'DESPESA')),
    CONSTRAINT ck_lancamentos_status
        CHECK (status IN ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO'))
);

COMMENT ON TABLE lancamentos_financeiros IS 'Fluxo de caixa: receitas (vendas) e despesas (compras, aluguel, salários...), com vencimento e status.';

CREATE INDEX idx_lancamentos_venda_id ON lancamentos_financeiros(venda_id);
CREATE INDEX idx_lancamentos_fornecedor_id ON lancamentos_financeiros(fornecedor_id);
CREATE INDEX idx_lancamentos_status ON lancamentos_financeiros(status);
CREATE INDEX idx_lancamentos_data_vencimento ON lancamentos_financeiros(data_vencimento);

COMMIT;

-- ============================================================================
-- Fim do script. Para popular com dados de exemplo, veja
-- backend/src/main/resources/import.sql
-- ============================================================================
