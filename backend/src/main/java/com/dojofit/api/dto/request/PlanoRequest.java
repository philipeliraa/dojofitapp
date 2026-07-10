package com.dojofit.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PlanoRequest(
        @NotBlank String nome,
        Integer limiteSemanal
) {}
