package com.moveis.dto;

import com.moveis.entity.Cliente;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class ClienteDTO {
    public Long id;

    @NotBlank
    public String nome;

    public String cpfCnpj;
    public String email;
    public String telefone;
    public String logradouro;
    public String numero;
    public String complemento;
    public String bairro;
    public String cidade;
    public String estado;
    public String cep;
    public LocalDateTime dataCadastro;

    public static ClienteDTO from(Cliente c) {
        ClienteDTO d = new ClienteDTO();
        d.id = c.id;
        d.nome = c.nome;
        d.cpfCnpj = c.cpfCnpj;
        d.email = c.email;
        d.telefone = c.telefone;
        d.logradouro = c.logradouro;
        d.numero = c.numero;
        d.complemento = c.complemento;
        d.bairro = c.bairro;
        d.cidade = c.cidade;
        d.estado = c.estado;
        d.cep = c.cep;
        d.dataCadastro = c.dataCadastro;
        return d;
    }

    public Cliente toEntity() {
        Cliente c = new Cliente();
        applyTo(c);
        return c;
    }

    public void applyTo(Cliente c) {
        c.nome = nome;
        c.cpfCnpj = cpfCnpj;
        c.email = email;
        c.telefone = telefone;
        c.logradouro = logradouro;
        c.numero = numero;
        c.complemento = complemento;
        c.bairro = bairro;
        c.cidade = cidade;
        c.estado = estado;
        c.cep = cep;
    }
}
