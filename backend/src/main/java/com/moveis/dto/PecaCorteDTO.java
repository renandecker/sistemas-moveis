package com.moveis.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Uma peça a ser cortada de uma chapa (mm), usada no cálculo de plano de corte. */
public class PecaCorteDTO {
    @NotNull @Positive
    public Integer comprimentoMm;

    @NotNull @Positive
    public Integer larguraMm;

    @NotNull @Positive
    public Integer quantidade;
}
