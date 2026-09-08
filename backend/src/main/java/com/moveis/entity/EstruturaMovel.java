package com.moveis.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * Tabela de Estrutura do Móvel (BOM - Bill of Materials).
 * Corresponde a `estrutura_movel` no DDL (Seção 3).
 */
@Entity
@Table(name = "estrutura_movel",
       uniqueConstraints = @UniqueConstraint(name = "uk_movel_material", columnNames = {"movel_id", "material_id"}))
public class EstruturaMovel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movel_id", nullable = false)
    public Movel movel;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    public Material material;

    @NotNull
    @Column(name = "quantidade_necessaria", nullable = false, precision = 10, scale = 3)
    public BigDecimal quantidadeNecessaria;

    @Column(name = "percentual_perda_aplicado", precision = 5, scale = 2)
    public BigDecimal percentualPerdaAplicado;

    // Dimensões da peça (necessário para o cálculo de chapa/fita de borda quando o material é CHAPA)
    @Column(name = "comprimento_peca_mm")
    public Integer comprimentoPecaMm;

    @Column(name = "largura_peca_mm")
    public Integer larguraPecaMm;

    @Column(name = "lados_fitados")
    public Integer ladosFitados; // 0 a 4, usado no cálculo de fita de borda
}
