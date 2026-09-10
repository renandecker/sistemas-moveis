package com.moveis.dto;

import java.time.LocalDateTime;

/** Payload para marcar um lançamento como pago/recebido. */
public class RegistrarPagamentoRequest {
    public LocalDateTime dataPagamento; // se omitido, usa o momento atual
    public String formaPagamento;
}
