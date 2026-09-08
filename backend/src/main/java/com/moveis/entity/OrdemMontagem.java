package com.moveis.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Tabela de Ordens de Montagem. Corresponde a `ordens_montagem` no DDL (Seção 3).
 */
@Entity
@Table(name = "ordens_montagem")
public class OrdemMontagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movel_id", nullable = false)
    public Movel movel;

    @NotNull
    @Column(name = "quantidade_moveis", nullable = false)
    public Integer quantidadeMoveis;

    @Column(name = "data_criacao")
    public LocalDateTime dataCriacao = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    public StatusOrdem status = StatusOrdem.RASCUNHO;
}
