package com.dojofit.api.dto.request;

import com.dojofit.api.model.enums.StatusTecnica;
import jakarta.validation.constraints.NotNull;

public record TecnicaAlunoRequest(
        @NotNull StatusTecnica status
) {}
