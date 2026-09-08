package com.moveis.dto;

import java.math.BigDecimal;

public class CalculoFitaBordaResponse {
    public BigDecimal perimetroBrutoM;
    public BigDecimal perimetroFitadoM; // já com o fator de segurança de 1.10 aplicado

    public CalculoFitaBordaResponse(BigDecimal perimetroBrutoM, BigDecimal perimetroFitadoM) {
        this.perimetroBrutoM = perimetroBrutoM;
        this.perimetroFitadoM = perimetroFitadoM;
    }
}
