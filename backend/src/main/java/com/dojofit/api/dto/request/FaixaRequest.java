package com.dojofit.api.dto.request;

import com.dojofit.api.model.enums.CorFaixa;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FaixaRequest(
        @NotBlank String nome,
        @NotNull CorFaixa cor,
        @NotNull Integer ordem,
        @NotNull @Min(0) Integer grausMax
) {}
