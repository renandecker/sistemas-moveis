package com.moveis.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Requisição para o cálculo de fita de borda (Seção 2.2):
 * Perímetro Fitado (m) = Σ [(Lados Fitados) × Comprimento do Lado] × 1.10
 */
public class CalculoFitaBordaRequest {
    @NotEmpty
    @Valid
    public List<LadoFitadoDTO> itens;
}
