package com.moveis.dto;

import java.math.BigDecimal;

public class CalculoChapaResponse {
    public BigDecimal areaTotalM2;
    public BigDecimal areaUtilLiquidaChapaM2; // área útil já descontada a perda de corte
    public int chapasNecessarias;

    public CalculoChapaResponse(BigDecimal areaTotalM2, BigDecimal areaUtilLiquidaChapaM2, int chapasNecessarias) {
        this.areaTotalM2 = areaTotalM2;
        this.areaUtilLiquidaChapaM2 = areaUtilLiquidaChapaM2;
        this.chapasNecessarias = chapasNecessarias;
    }
}
