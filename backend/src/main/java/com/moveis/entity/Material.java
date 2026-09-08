package com.moveis.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * Tabela de Materiais (Catálogo/Estoque).
 * Corresponde à tabela `materiais` do DDL da especificação técnica (Seção 3).
 */
@Entity
@Table(name = "materiais")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotBlank
    @Column(unique = true, nullable = false, length = 50)
    public String sku;

    @NotBlank
    @Column(nullable = false, length = 100)
    public String nome;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    public TipoMaterial tipo;

    @NotBlank
    @Column(name = "unidade_medida", nullable = false, length = 10)
    public String unidadeMedida; // UN, M2, M, KG, ML

    @Column(name = "comprimento_mm")
    public Integer comprimentoMm;

    @Column(name = "largura_mm")
    public Integer larguraMm;

    @Column(name = "espessura_mm")
    public Integer espessuraMm;

    @NotNull
    @Column(name = "custo_unitario", nullable = false, precision = 10, scale = 2)
    public BigDecimal custoUnitario;

    @Column(name = "estoque_minimo", precision = 10, scale = 2)
    public BigDecimal estoqueMinimo = BigDecimal.ZERO;

    @Column(name = "estoque_atual", precision = 10, scale = 2)
    public BigDecimal estoqueAtual = BigDecimal.ZERO;

    // Faixa: 0.05-0.10 (ferragem) ou 0.15-0.25 (chapa) conforme Seção 1
    @Column(name = "fator_perda_padrao", precision = 5, scale = 2)
    public BigDecimal fatorPerdaPadrao = new BigDecimal("0.05");

    // Campos adicionais úteis para o catálogo (Seção 4 - Chapas / Ferragens)
    @Column(name = "cor_acabamento", length = 60)
    public String corAcabamento;

    @Column(name = "tipo_borda", length = 40)
    public String tipoBorda;

    @Column(name = "tipo_ferragem", length = 40)
    public String tipoFerragem; // Dobradiça, Corrediça, Parafuso...

    @Column(name = "carga_maxima_kg", precision = 10, scale = 2)
    public BigDecimal cargaMaximaKg;
}
