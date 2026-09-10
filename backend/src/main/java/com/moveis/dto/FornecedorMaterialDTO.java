package com.moveis.dto;

import com.moveis.entity.FornecedorMaterial;
import java.math.BigDecimal;

public class FornecedorMaterialDTO {
    public Long id;
    public Long fornecedorId;
    public String fornecedorNome;
    public Long materialId;
    public String materialSku;
    public String materialNome;
    public BigDecimal precoUnitario;
    public Integer prazoEntregaDias;
    public Boolean preferencial;

    public static FornecedorMaterialDTO from(FornecedorMaterial fm) {
        FornecedorMaterialDTO d = new FornecedorMaterialDTO();
        d.id = fm.id;
        d.fornecedorId = fm.fornecedor.id;
        d.fornecedorNome = fm.fornecedor.nome;
        d.materialId = fm.material.id;
        d.materialSku = fm.material.sku;
        d.materialNome = fm.material.nome;
        d.precoUnitario = fm.precoUnitario;
        d.prazoEntregaDias = fm.prazoEntregaDias;
        d.preferencial = fm.preferencial;
        return d;
    }
}
