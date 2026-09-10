package com.moveis.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Registra entradas (compra de fornecedor, ajuste positivo) e saídas
 * (consumo em produção, ajuste negativo, perda) do estoque de um material.
 * Cada movimentação atualiza `materiais.estoque_atual` (ver EstoqueService).
 */
@Entity
@Table(name = "movimentacoes_estoque")
public class MovimentacaoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    public Material material;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    public TipoMovimentacao tipo;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 3)
    public BigDecimal quantidade;

    @Column(name = "custo_unitario", precision = 10, scale = 2)
    public BigDecimal custoUnitario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id")
    public Fornecedor fornecedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordem_montagem_id")
    public OrdemMontagem ordemMontagem;

    @Column(columnDefinition = "TEXT")
    public String observacao;

    @Column(name = "data_movimentacao")
    public LocalDateTime dataMovimentacao = LocalDateTime.now();
}
