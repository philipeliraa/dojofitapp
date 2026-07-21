package com.dojofit.api.dto.request;

import com.dojofit.api.model.enums.TipoAvaliacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AvaliacaoRequest(
        @NotNull TipoAvaliacao tipo,
        @NotBlank String conteudo,
        boolean publico
) {}
