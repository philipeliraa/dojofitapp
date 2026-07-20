package com.dojofit.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record GraduacaoRequest(
        @NotNull Long alunoId,
        @NotNull Long modalidadeId,
        @NotNull Long faixaId,
        @NotNull @Min(0) Integer grau,
        @NotNull LocalDate data,
        String observacao
) {}
