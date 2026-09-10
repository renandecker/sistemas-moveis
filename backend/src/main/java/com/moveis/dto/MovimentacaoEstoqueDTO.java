package com.moveis.dto;

import com.moveis.entity.MovimentacaoEstoque;
import com.moveis.entity.TipoMovimentacao;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MovimentacaoEstoqueDTO {
    public Long id;
    public Long materialId;
    public String materialSku;
    public String materialNome;
    public String unidadeMedida;
    public TipoMovimentacao tipo;
    public BigDecimal quantidade;
    public BigDecimal custoUnitario;
    public Long fornecedorId;
    public String fornecedorNome;
    public Long ordemMontagemId;
    public String observacao;
    public LocalDateTime dataMovimentacao;
    public BigDecimal estoqueResultante; // estoque do material logo após esta movimentação

    public static MovimentacaoEstoqueDTO from(MovimentacaoEstoque m) {
        MovimentacaoEstoqueDTO d = new MovimentacaoEstoqueDTO();
        d.id = m.id;
        d.materialId = m.material.id;
        d.materialSku = m.material.sku;
        d.materialNome = m.material.nome;
        d.unidadeMedida = m.material.unidadeMedida;
        d.tipo = m.tipo;
        d.quantidade = m.quantidade;
        d.custoUnitario = m.custoUnitario;
        d.fornecedorId = m.fornecedor != null ? m.fornecedor.id : null;
        d.fornecedorNome = m.fornecedor != null ? m.fornecedor.nome : null;
        d.ordemMontagemId = m.ordemMontagem != null ? m.ordemMontagem.id : null;
        d.observacao = m.observacao;
        d.dataMovimentacao = m.dataMovimentacao;
        return d;
    }
}
