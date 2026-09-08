package com.moveis.dto;

import com.moveis.entity.Movel;
import java.util.List;
import java.util.stream.Collectors;

public class MovelDTO {
    public Long id;
    public String codigo;
    public String nome;
    public String descricao;
    public Integer tempoEstimadoMontagemMin;
    public List<EstruturaMovelDTO> estrutura;

    public static MovelDTO from(Movel m) {
        MovelDTO d = new MovelDTO();
        d.id = m.id;
        d.codigo = m.codigo;
        d.nome = m.nome;
        d.descricao = m.descricao;
        d.tempoEstimadoMontagemMin = m.tempoEstimadoMontagemMin;
        return d;
    }

    public static MovelDTO fromWithEstrutura(Movel m) {
        MovelDTO d = from(m);
        d.estrutura = m.estrutura.stream().map(EstruturaMovelDTO::from).collect(Collectors.toList());
        return d;
    }

    public Movel toEntity() {
        Movel m = new Movel();
        applyTo(m);
        return m;
    }

    public void applyTo(Movel m) {
        m.codigo = codigo;
        m.nome = nome;
        m.descricao = descricao;
        m.tempoEstimadoMontagemMin = tempoEstimadoMontagemMin;
    }
}
