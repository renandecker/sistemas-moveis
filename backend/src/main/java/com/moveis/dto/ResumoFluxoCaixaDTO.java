package com.moveis.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ResumoFluxoCaixaDTO {
    public LocalDate periodoInicio;
    public LocalDate periodoFim;

    // Realizado no período (com base na data de pagamento/recebimento)
    public BigDecimal totalRecebido;
    public BigDecimal totalPago;
    public BigDecimal saldoPeriodo;

    // Em aberto no momento (independente do período filtrado)
    public BigDecimal totalAReceber;
    public BigDecimal totalAPagar;

    // Posição de caixa acumulada (todo o histórico já pago/recebido)
    public BigDecimal saldoAtual;

    public List<CategoriaResumoDTO> porCategoria;
}
