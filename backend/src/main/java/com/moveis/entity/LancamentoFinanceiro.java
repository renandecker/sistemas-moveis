package com.moveis.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Lançamento do fluxo de caixa: uma receita (dinheiro entrando) ou despesa
 * (dinheiro saindo). Pode ser criado manualmente (ex.: aluguel, salários) ou
 * automaticamente pelo sistema:
 *  - RECEITA ao registrar uma Venda (contas a receber do cliente)
 *  - DESPESA ao registrar uma entrada de estoque com fornecedor (contas a
 *    pagar pela compra de material)
 */
@Entity
@Table(name = "lancamentos_financeiros")
public class LancamentoFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    public TipoLancamento tipo;

    @NotBlank
    @Column(nullable = false, length = 60)
    public String categoria; // ex.: VENDA_MOVEL, COMPRA_MATERIAL, SALARIOS, ALUGUEL, ENERGIA, IMPOSTOS, OUTROS

    @NotBlank
    @Column(nullable = false, length = 200)
    public String descricao;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    public BigDecimal valor;

    @NotNull
    @Column(name = "data_vencimento", nullable = false)
    public LocalDate dataVencimento;

    @Column(name = "data_pagamento")
    public LocalDateTime dataPagamento;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    public StatusLancamento status = StatusLancamento.PENDENTE;

    @Column(name = "forma_pagamento", length = 30)
    public String formaPagamento; // DINHEIRO, PIX, CARTAO, BOLETO, TRANSFERENCIA...

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venda_id")
    public Venda venda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id")
    public Fornecedor fornecedor;

    @Column(columnDefinition = "TEXT")
    public String observacao;

    @Column(name = "data_criacao")
    public LocalDateTime dataCriacao = LocalDateTime.now();
}
