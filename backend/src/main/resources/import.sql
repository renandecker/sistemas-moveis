-- Dados de exemplo para desenvolvimento/demonstração.
--
-- IMPORTANTE: este script roda TODA VEZ que o Quarkus inicia (não só na
-- primeira vez), então os INSERTs abaixo usam "ON CONFLICT ... DO NOTHING"
-- nas tabelas que têm uma chave única de negócio (sku, código, CNPJ, CPF,
-- par movel+material, par fornecedor+material) — assim, reiniciar o
-- backend várias vezes sem apagar o volume do Postgres não gera erro de
-- violação de chave única. As tabelas puramente transacionais (vendas,
-- movimentações de estoque, lançamentos financeiros) não têm chave de
-- negócio natural; elas se acumulam a cada restart. Se quiser dados de
-- demonstração "limpos" de novo, rode: docker compose down -v && docker compose up -d

INSERT INTO materiais (sku, nome, tipo, unidade_medida, comprimento_mm, largura_mm, espessura_mm, custo_unitario, estoque_minimo, estoque_atual, fator_perda_padrao) VALUES
('CHP-MDF-BCO-15', 'Chapa MDF Branco 15mm (2750x1830)', 'CHAPA', 'UN', 2750, 1830, 15, 189.90, 5, 40, 0.20),
('CHP-MDP-CARV-18', 'Chapa MDP Carvalho 18mm (2750x1830)', 'CHAPA', 'UN', 2750, 1830, 18, 210.50, 5, 25, 0.18),
('FER-DOBR-35', 'Dobradiça 35mm com Amortecedor', 'FERRAGEM', 'UN', NULL, NULL, NULL, 4.90, 100, 480, 0.05),
('FER-CORR-45', 'Corrediça Telescópica 45cm', 'FERRAGEM', 'UN', NULL, NULL, NULL, 22.30, 40, 96, 0.05),
('FER-PARAF-4X40', 'Parafuso Chipboard 4x40mm', 'FERRAGEM', 'UN', NULL, NULL, NULL, 0.15, 1000, 5200, 0.10),
('CONS-FITA-BCO-22', 'Fita de Borda Branca 22mm', 'CONSUMIVEL', 'M', NULL, NULL, NULL, 0.85, 200, 610, 0.10),
('CONS-COLA-HOT', 'Cola Hotmelt para Fita de Borda', 'CONSUMIVEL', 'KG', NULL, NULL, NULL, 32.00, 5, 18, 0.05),
('ACAB-TAPA-BCO', 'Tapa-furos Branco', 'ACABAMENTO', 'UN', NULL, NULL, NULL, 0.10, 500, 1200, 0.05)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO moveis (codigo, nome, descricao, tempo_estimado_montagem_min) VALUES
('MOV-001', 'Guarda-Roupa Casal 6 Portas', 'Guarda-roupa em MDF branco com 6 portas e 2 gavetas.', 180),
('MOV-002', 'Rack para TV 180cm', 'Rack suspenso em MDP carvalho com portas e nichos.', 90)
ON CONFLICT (codigo) DO NOTHING;

-- Estrutura (BOM) do Guarda-Roupa (MOV-001, id=1)
INSERT INTO estrutura_movel (movel_id, material_id, quantidade_necessaria, percentual_perda_aplicado, comprimento_peca_mm, largura_peca_mm, lados_fitados) VALUES
(1, 1, 8.000, 0.20, 2400, 600, 2),
(1, 3, 12.000, 0.05, NULL, NULL, NULL),
(1, 5, 60.000, 0.10, NULL, NULL, NULL),
(1, 6, 45.000, 0.10, NULL, NULL, NULL)
ON CONFLICT (movel_id, material_id) DO NOTHING;

-- Estrutura (BOM) do Rack (MOV-002, id=2)
INSERT INTO estrutura_movel (movel_id, material_id, quantidade_necessaria, percentual_perda_aplicado, comprimento_peca_mm, largura_peca_mm, lados_fitados) VALUES
(2, 2, 3.000, 0.18, 1800, 400, 2),
(2, 3, 4.000, 0.05, NULL, NULL, NULL),
(2, 4, 2.000, 0.05, NULL, NULL, NULL),
(2, 6, 20.000, 0.10, NULL, NULL, NULL)
ON CONFLICT (movel_id, material_id) DO NOTHING;

-- Fornecedores de materiais
INSERT INTO fornecedores (nome, cnpj, email, telefone, logradouro, numero, cidade, estado, cep, ativo) VALUES
('Madeplac Distribuidora', '12.345.678/0001-90', 'vendas@madeplac.com.br', '(51) 3222-1000', 'Av. das Indústrias', '1200', 'Lajeado', 'RS', '95900-000', true),
('Ferragens Sul Ltda', '23.456.789/0001-11', 'comercial@ferragensul.com.br', '(51) 3222-2000', 'Rua dos Metalúrgicos', '450', 'Estrela', 'RS', '95880-000', true),
('Insumos & Cia', '34.567.890/0001-22', 'contato@insumosecia.com.br', '(51) 3222-3000', 'Rua Industrial', '80', 'Lajeado', 'RS', '95900-100', true)
ON CONFLICT (cnpj) DO NOTHING;

-- Tabela de preços por fornecedor (cotações)
INSERT INTO fornecedor_material (fornecedor_id, material_id, preco_unitario, prazo_entrega_dias, preferencial) VALUES
(1, 1, 189.90, 5, true),
(1, 2, 210.50, 5, true),
(2, 3, 4.75, 3, true),
(2, 4, 21.90, 3, true),
(2, 5, 0.14, 2, true),
(3, 6, 0.85, 4, true),
(3, 7, 32.00, 4, true),
(3, 8, 0.10, 2, true)
ON CONFLICT (fornecedor_id, material_id) DO NOTHING;

-- Clientes
INSERT INTO clientes (nome, cpf_cnpj, email, telefone, logradouro, numero, complemento, bairro, cidade, estado, cep) VALUES
('Ana Beatriz Souza', '123.456.789-00', 'ana.souza@email.com', '(51) 99911-2233', 'Rua das Flores', '234', 'Ap. 302', 'Centro', 'Lajeado', 'RS', '95900-010'),
('Carlos Eduardo Lima', '987.654.321-00', 'cadu.lima@email.com', '(51) 99922-3344', 'Av. Sete de Setembro', '1500', NULL, 'Moinhos', 'Lajeado', 'RS', '95900-020')
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- Vendas, movimentações de estoque e lançamentos financeiros não têm chave
-- de negócio única (só o id serial) — inserimos apenas se ainda não existir
-- NENHUMA venda cadastrada, para não duplicar a cada restart do backend.
INSERT INTO vendas (cliente_id, movel_id, quantidade, valor_unitario, valor_total, status)
SELECT 1, 1, 1, 2890.00, 2890.00, 'ENTREGUE'
WHERE NOT EXISTS (SELECT 1 FROM vendas);

INSERT INTO vendas (cliente_id, movel_id, quantidade, valor_unitario, valor_total, status)
SELECT 2, 2, 2, 1290.00, 2580.00, 'PENDENTE'
WHERE NOT EXISTS (SELECT 1 FROM vendas WHERE cliente_id = 2);

INSERT INTO movimentacoes_estoque (material_id, tipo, quantidade, custo_unitario, fornecedor_id, observacao)
SELECT 1, 'ENTRADA', 10.000, 189.90, 1, 'Compra inicial de estoque'
WHERE NOT EXISTS (SELECT 1 FROM movimentacoes_estoque);

INSERT INTO movimentacoes_estoque (material_id, tipo, quantidade, custo_unitario, fornecedor_id, observacao)
SELECT 3, 'ENTRADA', 200.000, 4.75, 2, 'Reposição de dobradiças'
WHERE NOT EXISTS (SELECT 1 FROM movimentacoes_estoque WHERE material_id = 3);

INSERT INTO movimentacoes_estoque (material_id, tipo, quantidade, custo_unitario, fornecedor_id, observacao)
SELECT 1, 'SAIDA', 2.000, NULL, NULL, 'Consumo em produção (ajuste manual)'
WHERE NOT EXISTS (SELECT 1 FROM movimentacoes_estoque WHERE material_id = 1 AND tipo = 'SAIDA');

-- Fluxo de caixa: lançamentos correspondentes às vendas/compras acima
-- (em uso normal via API, esses lançamentos são criados automaticamente
-- pelo FluxoCaixaService; aqui inserimos manualmente só para popular o demo).
INSERT INTO lancamentos_financeiros (tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, forma_pagamento, venda_id, fornecedor_id, observacao)
SELECT 'RECEITA', 'VENDA_MOVEL', 'Venda: Guarda-Roupa Casal 6 Portas (1x) — Ana Beatriz Souza', 2890.00, CURRENT_DATE, CURRENT_TIMESTAMP, 'PAGO', 'PIX', 1, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM lancamentos_financeiros);

INSERT INTO lancamentos_financeiros (tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, forma_pagamento, venda_id, fornecedor_id, observacao)
SELECT 'RECEITA', 'VENDA_MOVEL', 'Venda: Rack para TV 180cm (2x) — Carlos Eduardo Lima', 2580.00, CURRENT_DATE + INTERVAL '10 days', NULL, 'PENDENTE', NULL, 2, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM lancamentos_financeiros WHERE categoria = 'VENDA_MOVEL' AND venda_id = 2);

INSERT INTO lancamentos_financeiros (tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, forma_pagamento, venda_id, fornecedor_id, observacao)
SELECT 'DESPESA', 'COMPRA_MATERIAL', 'Compra: Chapa MDF Branco 15mm (10 UN)', 1899.00, CURRENT_DATE, CURRENT_TIMESTAMP, 'PAGO', 'BOLETO', NULL, 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM lancamentos_financeiros WHERE categoria = 'COMPRA_MATERIAL' AND fornecedor_id = 1);

INSERT INTO lancamentos_financeiros (tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, forma_pagamento, venda_id, fornecedor_id, observacao)
SELECT 'DESPESA', 'COMPRA_MATERIAL', 'Compra: Dobradiça 35mm com Amortecedor (200 UN)', 950.00, CURRENT_DATE + INTERVAL '5 days', NULL, 'PENDENTE', NULL, NULL, 2, NULL
WHERE NOT EXISTS (SELECT 1 FROM lancamentos_financeiros WHERE categoria = 'COMPRA_MATERIAL' AND fornecedor_id = 2);

INSERT INTO lancamentos_financeiros (tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, forma_pagamento, venda_id, fornecedor_id, observacao)
SELECT 'DESPESA', 'ALUGUEL', 'Aluguel do galpão — mês corrente', 3200.00, CURRENT_DATE + INTERVAL '3 days', NULL, 'PENDENTE', NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM lancamentos_financeiros WHERE categoria = 'ALUGUEL');

INSERT INTO lancamentos_financeiros (tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, forma_pagamento, venda_id, fornecedor_id, observacao)
SELECT 'DESPESA', 'SALARIOS', 'Folha de pagamento — equipe de montagem', 8500.00, CURRENT_DATE - INTERVAL '2 days', CURRENT_TIMESTAMP, 'PAGO', 'TRANSFERENCIA', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM lancamentos_financeiros WHERE categoria = 'SALARIOS');
