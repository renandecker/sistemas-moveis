package com.moveis.dto;

import com.moveis.entity.TipoLancamento;
import java.math.BigDecimal;

public class CategoriaResumoDTO {
    public String categoria;
    public TipoLancamento tipo;
    public BigDecimal total;

    public CategoriaResumoDTO(String categoria, TipoLancamento tipo, BigDecimal total) {
        this.categoria = categoria;
        this.tipo = tipo;
        this.total = total;
    }
}
