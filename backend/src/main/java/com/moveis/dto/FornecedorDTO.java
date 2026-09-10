package com.moveis.dto;

import com.moveis.entity.Fornecedor;
import jakarta.validation.constraints.NotBlank;

public class FornecedorDTO {
    public Long id;

    @NotBlank
    public String nome;

    public String cnpj;
    public String email;
    public String telefone;
    public String logradouro;
    public String numero;
    public String cidade;
    public String estado;
    public String cep;
    public Boolean ativo;

    public static FornecedorDTO from(Fornecedor f) {
        FornecedorDTO d = new FornecedorDTO();
        d.id = f.id;
        d.nome = f.nome;
        d.cnpj = f.cnpj;
        d.email = f.email;
        d.telefone = f.telefone;
        d.logradouro = f.logradouro;
        d.numero = f.numero;
        d.cidade = f.cidade;
        d.estado = f.estado;
        d.cep = f.cep;
        d.ativo = f.ativo;
        return d;
    }

    public Fornecedor toEntity() {
        Fornecedor f = new Fornecedor();
        applyTo(f);
        return f;
    }

    public void applyTo(Fornecedor f) {
        f.nome = nome;
        f.cnpj = cnpj;
        f.email = email;
        f.telefone = telefone;
        f.logradouro = logradouro;
        f.numero = numero;
        f.cidade = cidade;
        f.estado = estado;
        f.cep = cep;
        f.ativo = ativo != null ? ativo : true;
    }
}
