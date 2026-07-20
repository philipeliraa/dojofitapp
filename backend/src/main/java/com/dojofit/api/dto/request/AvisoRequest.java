package com.dojofit.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AvisoRequest(
        @NotBlank @Size(max = 150) String titulo,
        @NotBlank String conteudo
) {}
