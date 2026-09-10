package com.moveis.dto;

import com.moveis.entity.TipoLancamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Payload para lançamentos manuais (ex.: aluguel, salários, outras receitas/despesas). */
public class LancamentoFinanceiroRequest {
    @NotNull
    public TipoLancamento tipo;

    @NotBlank
    public String categoria;

    @NotBlank
    public String descricao;

    @NotNull
    @Positive
    public BigDecimal valor;

    @NotNull
    public LocalDate dataVencimento;

    public String formaPagamento;
    public Long fornecedorId; // opcional, para despesas ligadas a um fornecedor específico
    public String observacao;
}
