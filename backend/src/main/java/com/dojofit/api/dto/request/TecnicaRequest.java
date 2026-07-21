package com.dojofit.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record TecnicaRequest(
        @NotBlank String nome,
        String descricao
) {}
