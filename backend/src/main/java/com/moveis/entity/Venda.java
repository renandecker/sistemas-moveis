package com.moveis.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Registra a compra de um cliente, com os dados do móvel adquirido
 * (modelo, quantidade e valores). Pode opcionalmente estar vinculada a uma
 * ordem de montagem que vai produzir o(s) móvel(is) vendido(s).
 */
@Entity
@Table(name = "vendas")
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    public Cliente cliente;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movel_id", nullable = false)
    public Movel movel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordem_montagem_id")
    public OrdemMontagem ordemMontagem;

    @NotNull
    @Column(nullable = false)
    public Integer quantidade;

    @NotNull
    @Column(name = "valor_unitario", nullable = false, precision = 10, scale = 2)
    public BigDecimal valorUnitario;

    @NotNull
    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    public BigDecimal valorTotal;

    @Column(name = "data_venda")
    public LocalDateTime dataVenda = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    public StatusVenda status = StatusVenda.PENDENTE;
}
