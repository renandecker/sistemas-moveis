package com.moveis.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

/**
 * Cadastro de fornecedores de materiais.
 */
@Entity
@Table(name = "fornecedores")
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotBlank
    @Column(nullable = false, length = 150)
    public String nome;

    @Column(unique = true, length = 20)
    public String cnpj;

    @Column(length = 150)
    public String email;

    @Column(length = 20)
    public String telefone;

    @Column(length = 150)
    public String logradouro;

    @Column(length = 20)
    public String numero;

    @Column(length = 100)
    public String cidade;

    @Column(length = 2)
    public String estado;

    @Column(length = 9)
    public String cep;

    @Column(nullable = false)
    public Boolean ativo = true;

    @OneToMany(mappedBy = "fornecedor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<FornecedorMaterial> materiaisFornecidos = new ArrayList<>();
}
