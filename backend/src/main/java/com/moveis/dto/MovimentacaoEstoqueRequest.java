package com.moveis.dto;

import com.moveis.entity.TipoMovimentacao;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class MovimentacaoEstoqueRequest {
    @NotNull
    public Long materialId;

    @NotNull
    public TipoMovimentacao tipo;

    @NotNull
    @Positive
    public BigDecimal quantidade;

    // Custo unitário desta entrada (opcional). Se informado numa ENTRADA,
    // também atualiza o custo_unitario cadastrado no material.
    public BigDecimal custoUnitario;

    public Long fornecedorId;      // opcional, tipicamente usado em ENTRADA
    public Long ordemMontagemId;   // opcional, tipicamente usado em SAIDA (consumo de produção)
    public String observacao;
}
