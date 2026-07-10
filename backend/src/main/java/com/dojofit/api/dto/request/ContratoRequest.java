package com.dojofit.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ContratoRequest(
        @NotNull Long alunoId,
        @NotNull Long planoId,
        @NotBlank String dataInicio,
        @NotBlank String dataValidade
) {}
