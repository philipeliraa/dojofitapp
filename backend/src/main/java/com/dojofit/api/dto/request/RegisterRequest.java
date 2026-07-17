package com.dojofit.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Cadastro só via convite (docs/06 fluxo 2): e-mail e papel vêm do convite
 * validado no backend — o cliente não os envia.
 */
public record RegisterRequest(
        @NotBlank String nome,
        @NotBlank @Size(min = 6) String senha,
        @NotNull UUID conviteToken
) {
}
