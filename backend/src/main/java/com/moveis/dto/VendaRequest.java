package com.moveis.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class VendaRequest {
    @NotNull
    public Long clienteId;

    @NotNull
    public Long movelId;

    public Long ordemMontagemId; // opcional: vincula a uma ordem de montagem já criada

    @NotNull
    @Min(1)
    public Integer quantidade;

    @NotNull
    public BigDecimal valorUnitario;
}
