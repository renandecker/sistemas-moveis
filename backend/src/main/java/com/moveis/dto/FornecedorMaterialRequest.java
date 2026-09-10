package com.moveis.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class FornecedorMaterialRequest {
    @NotNull
    public Long materialId;

    @NotNull
    public BigDecimal precoUnitario;

    public Integer prazoEntregaDias;
    public Boolean preferencial;
}
