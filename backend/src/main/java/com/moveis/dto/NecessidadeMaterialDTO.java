package com.moveis.dto;

import com.moveis.entity.TipoMaterial;
import java.math.BigDecimal;

/** Item da explosão de materiais (BOM) para produzir N unidades de um móvel. */
public class NecessidadeMaterialDTO {
    public Long materialId;
    public String sku;
    public String nome;
    public TipoMaterial tipo;
    public String unidadeMedida;
    public BigDecimal quantidadeBaseTotal;   // quantidade necessária x quantidade de móveis, sem perda
    public BigDecimal percentualPerdaAplicado;
    public BigDecimal quantidadeComPerda;    // quantidade já acrescida do fator de perda
    public BigDecimal custoUnitario;
    public BigDecimal custoTotalEstimado;
}
