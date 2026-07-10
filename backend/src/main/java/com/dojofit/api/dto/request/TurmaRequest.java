package com.dojofit.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TurmaRequest(
        @NotBlank String nome,
        @NotBlank String diaSemana,
        @NotBlank String horaInicio,
        @NotBlank String horaFim,
        @NotNull @Positive Integer capacidadeMaxima,
        @NotNull Long professorId
) {}
