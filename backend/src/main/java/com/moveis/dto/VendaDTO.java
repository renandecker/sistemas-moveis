package com.moveis.dto;

import com.moveis.entity.StatusVenda;
import com.moveis.entity.Venda;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VendaDTO {
    public Long id;
    public Long clienteId;
    public String clienteNome;
    public Long movelId;
    public String movelNome;
    public String movelCodigo;
    public Long ordemMontagemId;
    public Integer quantidade;
    public BigDecimal valorUnitario;
    public BigDecimal valorTotal;
    public LocalDateTime dataVenda;
    public StatusVenda status;

    public static VendaDTO from(Venda v) {
        VendaDTO d = new VendaDTO();
        d.id = v.id;
        d.clienteId = v.cliente.id;
        d.clienteNome = v.cliente.nome;
        d.movelId = v.movel.id;
        d.movelNome = v.movel.nome;
        d.movelCodigo = v.movel.codigo;
        d.ordemMontagemId = v.ordemMontagem != null ? v.ordemMontagem.id : null;
        d.quantidade = v.quantidade;
        d.valorUnitario = v.valorUnitario;
        d.valorTotal = v.valorTotal;
        d.dataVenda = v.dataVenda;
        d.status = v.status;
        return d;
    }
}
