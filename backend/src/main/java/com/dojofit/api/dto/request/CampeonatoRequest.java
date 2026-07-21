package com.dojofit.api.dto.request;

import com.dojofit.api.model.enums.ResultadoCampeonato;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CampeonatoRequest(
        @NotBlank String nome,
        @NotNull LocalDate data,
        @NotNull ResultadoCampeonato resultado,
        String categoria,
        String observacao
) {}
