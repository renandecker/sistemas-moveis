package com.moveis.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * Tabela de preços: relaciona um Fornecedor a um Material com o valor
 * praticado e prazo de entrega. Um mesmo material pode ter vários
 * fornecedores (cotações), e o campo `preferencial` marca a opção padrão.
 */
@Entity
@Table(name = "fornecedor_material",
       uniqueConstraints = @UniqueConstraint(name = "uk_fornecedor_material", columnNames = {"fornecedor_id", "material_id"}))
public class FornecedorMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    public Fornecedor fornecedor;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    public Material material;

    @NotNull
    @Column(name = "preco_unitario", nullable = false, precision = 10, scale = 2)
    public BigDecimal precoUnitario;

    @Column(name = "prazo_entrega_dias")
    public Integer prazoEntregaDias;

    @Column(nullable = false)
    public Boolean preferencial = false;
}
