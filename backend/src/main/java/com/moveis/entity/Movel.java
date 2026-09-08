package com.moveis.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

/**
 * Tabela de Modelos de Móveis. Corresponde a `moveis` no DDL (Seção 3).
 */
@Entity
@Table(name = "moveis")
public class Movel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotBlank
    @Column(unique = true, nullable = false, length = 50)
    public String codigo;

    @NotBlank
    @Column(nullable = false, length = 100)
    public String nome;

    @Column(columnDefinition = "TEXT")
    public String descricao;

    @Column(name = "tempo_estimado_montagem_min")
    public Integer tempoEstimadoMontagemMin;

    @OneToMany(mappedBy = "movel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<EstruturaMovel> estrutura = new ArrayList<>();
}
