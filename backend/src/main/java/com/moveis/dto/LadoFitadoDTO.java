package com.moveis.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Um lado de peça a ser fitado, usado no cálculo de fita de borda. */
public class LadoFitadoDTO {
    @NotNull @Positive
    public Integer comprimentoLadoMm;

    // Quantidade de lados fitados para esta medida (ex.: 2 lados de 600mm)
    @NotNull @Positive
    public Integer quantidadeLados;
}
