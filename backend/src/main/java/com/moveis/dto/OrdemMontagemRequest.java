package com.moveis.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class OrdemMontagemRequest {
    @NotNull
    public Long movelId;

    @NotNull
    @Min(1)
    public Integer quantidadeMoveis;
}
