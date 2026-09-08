package com.moveis.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/** Payload para adicionar/atualizar um item de BOM (estrutura_movel) de um móvel. */
public class EstruturaMovelRequest {
    @NotNull
    public Long materialId;

    @NotNull
    public BigDecimal quantidadeNecessaria;

    public BigDecimal percentualPerdaAplicado;
    public Integer comprimentoPecaMm;
    public Integer larguraPecaMm;
    public Integer ladosFitados;
}
