package com.moveis.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * Requisição para o cálculo de plano de corte (Seção 2.1 da especificação):
 * Área Total (m²) = Σ (Comprimento × Largura × Quantidade)
 * Chapas Necessárias = ⌈ Área Total / (Área Útil da Chapa × (1 - Perda Corte)) ⌉
 *
 * A área útil da chapa pode ser informada manualmente OU derivada
 * automaticamente a partir de um material (chapa) cadastrado — nesse caso,
 * informe materialId (e opcionalmente fornecedorId, para usar o preço
 * daquele fornecedor específico no custo estimado em vez do custo padrão
 * cadastrado no material).
 */
public class CalculoChapaRequest {
    // Opcional: se informado, a área útil da chapa é calculada a partir das
    // dimensões cadastradas do material (comprimentoMm × larguraMm), e o
    // custo unitário da chapa passa a vir do material (ou do fornecedor,
    // se fornecedorId também for informado).
    public Long materialId;

    // Opcional: só tem efeito se materialId também for informado. Usa o
    // preço daquele fornecedor específico para este material (tabela
    // fornecedor_material) em vez do custo padrão do material.
    public Long fornecedorId;

    // Obrigatório apenas se materialId NÃO for informado.
    public BigDecimal areaUtilChapaM2;

    // Percentual de perda de corte, ex.: 0.15 a 0.25 (15% a 25%) conforme Seção 1
    @NotNull
    public BigDecimal percentualPerdaCorte;

    @NotEmpty
    @Valid
    public List<PecaCorteDTO> pecas;
}
