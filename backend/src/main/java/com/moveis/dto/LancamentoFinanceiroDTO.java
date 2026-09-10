package com.moveis.dto;

import com.moveis.entity.LancamentoFinanceiro;
import com.moveis.entity.StatusLancamento;
import com.moveis.entity.TipoLancamento;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LancamentoFinanceiroDTO {
    public Long id;
    public TipoLancamento tipo;
    public String categoria;
    public String descricao;
    public BigDecimal valor;
    public LocalDate dataVencimento;
    public LocalDateTime dataPagamento;
    public StatusLancamento status;
    public String formaPagamento;
    public Long vendaId;
    public String vendaClienteNome;
    public Long fornecedorId;
    public String fornecedorNome;
    public String observacao;
    public LocalDateTime dataCriacao;

    public static LancamentoFinanceiroDTO from(LancamentoFinanceiro l) {
        LancamentoFinanceiroDTO d = new LancamentoFinanceiroDTO();
        d.id = l.id;
        d.tipo = l.tipo;
        d.categoria = l.categoria;
        d.descricao = l.descricao;
        d.valor = l.valor;
        d.dataVencimento = l.dataVencimento;
        d.dataPagamento = l.dataPagamento;
        d.status = l.status;
        d.formaPagamento = l.formaPagamento;
        d.vendaId = l.venda != null ? l.venda.id : null;
        d.vendaClienteNome = l.venda != null ? l.venda.cliente.nome : null;
        d.fornecedorId = l.fornecedor != null ? l.fornecedor.id : null;
        d.fornecedorNome = l.fornecedor != null ? l.fornecedor.nome : null;
        d.observacao = l.observacao;
        d.dataCriacao = l.dataCriacao;
        return d;
    }
}
