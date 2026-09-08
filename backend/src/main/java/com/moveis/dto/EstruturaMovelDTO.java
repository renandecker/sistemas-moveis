package com.moveis.dto;

import com.moveis.entity.EstruturaMovel;
import java.math.BigDecimal;

public class EstruturaMovelDTO {
    public Long id;
    public Long materialId;
    public String materialNome;
    public String materialSku;
    public BigDecimal quantidadeNecessaria;
    public BigDecimal percentualPerdaAplicado;
    public Integer comprimentoPecaMm;
    public Integer larguraPecaMm;
    public Integer ladosFitados;

    public static EstruturaMovelDTO from(EstruturaMovel e) {
        EstruturaMovelDTO d = new EstruturaMovelDTO();
        d.id = e.id;
        d.materialId = e.material.id;
        d.materialNome = e.material.nome;
        d.materialSku = e.material.sku;
        d.quantidadeNecessaria = e.quantidadeNecessaria;
        d.percentualPerdaAplicado = e.percentualPerdaAplicado;
        d.comprimentoPecaMm = e.comprimentoPecaMm;
        d.larguraPecaMm = e.larguraPecaMm;
        d.ladosFitados = e.ladosFitados;
        return d;
    }
}
