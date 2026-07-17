package com.dojofit.api.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ManualCheckinRequest(
        @NotNull(message = "aulaId é obrigatório")
        Long aulaId,

        @NotNull(message = "alunoId é obrigatório")
        Long alunoId,

        @NotNull(message = "clientId é obrigatório")
        UUID clientId
) {
}
