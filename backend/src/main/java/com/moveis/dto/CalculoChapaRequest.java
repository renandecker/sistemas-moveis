package com.moveis.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

/**
 * Requisição para o cálculo de plano de corte (Seção 2.1 da especificação):
 * Área Total (m²) = Σ (Comprimento × Largura × Quantidade)
 * Chapas Necessárias = ⌈ Área Total / (Área Útil da Chapa × (1 - Perda Corte)) ⌉
 */
public class CalculoChapaRequest {
    @NotNull @Positive
    public BigDecimal areaUtilChapaM2;

    // Percentual de perda de corte, ex.: 0.15 a 0.25 (15% a 25%) conforme Seção 1
    @NotNull
    public BigDecimal percentualPerdaCorte;

    @NotEmpty
    @Valid
    public List<PecaCorteDTO> pecas;
}
