package com.moveis.dto;

import com.moveis.entity.OrdemMontagem;
import com.moveis.entity.StatusOrdem;
import java.time.LocalDateTime;

public class OrdemMontagemDTO {
    public Long id;
    public Long movelId;
    public String movelNome;
    public Integer quantidadeMoveis;
    public LocalDateTime dataCriacao;
    public StatusOrdem status;

    public static OrdemMontagemDTO from(OrdemMontagem o) {
        OrdemMontagemDTO d = new OrdemMontagemDTO();
        d.id = o.id;
        d.movelId = o.movel.id;
        d.movelNome = o.movel.nome;
        d.quantidadeMoveis = o.quantidadeMoveis;
        d.dataCriacao = o.dataCriacao;
        d.status = o.status;
        return d;
    }
}

