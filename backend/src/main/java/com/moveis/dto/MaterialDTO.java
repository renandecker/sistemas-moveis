package com.moveis.dto;

import com.moveis.entity.Material;
import com.moveis.entity.TipoMaterial;
import java.math.BigDecimal;

public class MaterialDTO {
    public Long id;
    public String sku;
    public String nome;
    public TipoMaterial tipo;
    public String unidadeMedida;
    public Integer comprimentoMm;
    public Integer larguraMm;
    public Integer espessuraMm;
    public BigDecimal custoUnitario;
    public BigDecimal estoqueMinimo;
    public BigDecimal estoqueAtual;
    public BigDecimal fatorPerdaPadrao;
    public String corAcabamento;
    public String tipoBorda;
    public String tipoFerragem;
    public BigDecimal cargaMaximaKg;

    public static MaterialDTO from(Material m) {
        MaterialDTO d = new MaterialDTO();
        d.id = m.id;
        d.sku = m.sku;
        d.nome = m.nome;
        d.tipo = m.tipo;
        d.unidadeMedida = m.unidadeMedida;
        d.comprimentoMm = m.comprimentoMm;
        d.larguraMm = m.larguraMm;
        d.espessuraMm = m.espessuraMm;
        d.custoUnitario = m.custoUnitario;
        d.estoqueMinimo = m.estoqueMinimo;
        d.estoqueAtual = m.estoqueAtual;
        d.fatorPerdaPadrao = m.fatorPerdaPadrao;
        d.corAcabamento = m.corAcabamento;
        d.tipoBorda = m.tipoBorda;
        d.tipoFerragem = m.tipoFerragem;
        d.cargaMaximaKg = m.cargaMaximaKg;
        return d;
    }

    public Material toEntity() {
        Material m = new Material();
        applyTo(m);
        return m;
    }

    public void applyTo(Material m) {
        m.sku = sku;
        m.nome = nome;
        m.tipo = tipo;
        m.unidadeMedida = unidadeMedida;
        m.comprimentoMm = comprimentoMm;
        m.larguraMm = larguraMm;
        m.espessuraMm = espessuraMm;
        m.custoUnitario = custoUnitario;
        m.estoqueMinimo = estoqueMinimo != null ? estoqueMinimo : BigDecimal.ZERO;
        m.estoqueAtual = estoqueAtual != null ? estoqueAtual : BigDecimal.ZERO;
        m.fatorPerdaPadrao = fatorPerdaPadrao != null ? fatorPerdaPadrao : new BigDecimal("0.05");
        m.corAcabamento = corAcabamento;
        m.tipoBorda = tipoBorda;
        m.tipoFerragem = tipoFerragem;
        m.cargaMaximaKg = cargaMaximaKg;
    }
}
