-- Dados de exemplo para desenvolvimento/demonstração
INSERT INTO materiais (sku, nome, tipo, unidade_medida, comprimento_mm, largura_mm, espessura_mm, custo_unitario, estoque_minimo, estoque_atual, fator_perda_padrao) VALUES
('CHP-MDF-BCO-15', 'Chapa MDF Branco 15mm (2750x1830)', 'CHAPA', 'UN', 2750, 1830, 15, 189.90, 5, 40, 0.20),
('CHP-MDP-CARV-18', 'Chapa MDP Carvalho 18mm (2750x1830)', 'CHAPA', 'UN', 2750, 1830, 18, 210.50, 5, 25, 0.18),
('FER-DOBR-35', 'Dobradiça 35mm com Amortecedor', 'FERRAGEM', 'UN', NULL, NULL, NULL, 4.90, 100, 480, 0.05),
('FER-CORR-45', 'Corrediça Telescópica 45cm', 'FERRAGEM', 'UN', NULL, NULL, NULL, 22.30, 40, 96, 0.05),
('FER-PARAF-4X40', 'Parafuso Chipboard 4x40mm', 'FERRAGEM', 'UN', NULL, NULL, NULL, 0.15, 1000, 5200, 0.10),
('CONS-FITA-BCO-22', 'Fita de Borda Branca 22mm', 'CONSUMIVEL', 'M', NULL, NULL, NULL, 0.85, 200, 610, 0.10),
('CONS-COLA-HOT', 'Cola Hotmelt para Fita de Borda', 'CONSUMIVEL', 'KG', NULL, NULL, NULL, 32.00, 5, 18, 0.05),
('ACAB-TAPA-BCO', 'Tapa-furos Branco', 'ACABAMENTO', 'UN', NULL, NULL, NULL, 0.10, 500, 1200, 0.05);

INSERT INTO moveis (codigo, nome, descricao, tempo_estimado_montagem_min) VALUES
('MOV-001', 'Guarda-Roupa Casal 6 Portas', 'Guarda-roupa em MDF branco com 6 portas e 2 gavetas.', 180),
('MOV-002', 'Rack para TV 180cm', 'Rack suspenso em MDP carvalho com portas e nichos.', 90);

-- Estrutura (BOM) do Guarda-Roupa (MOV-001, id=1)
INSERT INTO estrutura_movel (movel_id, material_id, quantidade_necessaria, percentual_perda_aplicado, comprimento_peca_mm, largura_peca_mm, lados_fitados) VALUES
(1, 1, 8.000, 0.20, 2400, 600, 2),
(1, 3, 12.000, 0.05, NULL, NULL, NULL),
(1, 5, 60.000, 0.10, NULL, NULL, NULL),
(1, 6, 45.000, 0.10, NULL, NULL, NULL);

-- Estrutura (BOM) do Rack (MOV-002, id=2)
INSERT INTO estrutura_movel (movel_id, material_id, quantidade_necessaria, percentual_perda_aplicado, comprimento_peca_mm, largura_peca_mm, lados_fitados) VALUES
(2, 2, 3.000, 0.18, 1800, 400, 2),
(2, 3, 4.000, 0.05, NULL, NULL, NULL),
(2, 4, 2.000, 0.05, NULL, NULL, NULL),
(2, 6, 20.000, 0.10, NULL, NULL, NULL);
