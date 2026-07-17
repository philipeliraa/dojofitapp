package com.dojofit.api.dto.response;

import com.dojofit.api.model.Convite;

/** Visão pública do convite na tela de cadastro: só o necessário para preencher o formulário. */
public record ConvitePreviewResponse(String email, String role) {
    public static ConvitePreviewResponse from(Convite convite) {
        return new ConvitePreviewResponse(convite.getEmail(), convite.getRole().name());
    }
}
