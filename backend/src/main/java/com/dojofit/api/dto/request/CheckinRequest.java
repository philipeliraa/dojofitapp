package com.dojofit.api.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CheckinRequest(
        @NotNull(message = "aulaId é obrigatório")
        Long aulaId,

        // Gerado no cliente via crypto.randomUUID() — chave de idempotência (docs/07 seção 6)
        @NotNull(message = "clientId é obrigatório")
        UUID clientId
) {
}
