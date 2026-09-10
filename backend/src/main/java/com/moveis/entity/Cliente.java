package com.moveis.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Cadastro de clientes: dados pessoais/empresariais, endereço e histórico
 * de compras (ver entidade Venda).
 */
@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotBlank
    @Column(nullable = false, length = 150)
    public String nome;

    @Column(name = "cpf_cnpj", unique = true, length = 20)
    public String cpfCnpj;

    @Column(length = 150)
    public String email;

    @Column(length = 20)
    public String telefone;

    // ---- Endereço ----
    @Column(length = 150)
    public String logradouro;

    @Column(length = 20)
    public String numero;

    @Column(length = 100)
    public String complemento;

    @Column(length = 100)
    public String bairro;

    @Column(length = 100)
    public String cidade;

    @Column(length = 2)
    public String estado;

    @Column(length = 9)
    public String cep;

    @Column(name = "data_cadastro")
    public LocalDateTime dataCadastro = LocalDateTime.now();

    @OneToMany(mappedBy = "cliente", fetch = FetchType.LAZY)
    public List<Venda> compras = new ArrayList<>();
}
