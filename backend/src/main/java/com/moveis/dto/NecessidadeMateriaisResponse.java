package com.moveis.dto;

import java.math.BigDecimal;
import java.util.List;

public class NecessidadeMateriaisResponse {
    public Long movelId;
    public String movelNome;
    public Integer quantidadeMoveis;
    public List<NecessidadeMaterialDTO> itens;
    public BigDecimal custoTotalEstimado;
    public Integer tempoTotalEstimadoMin;
}
