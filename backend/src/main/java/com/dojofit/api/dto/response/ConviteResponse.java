package com.dojofit.api.dto.response;

import com.dojofit.api.model.Convite;

public record ConviteResponse(
        Long id,
        String token,
        String email,
        String role,
        String criadoEm,
        String expiraEm
) {
    public static ConviteResponse from(Convite convite) {
        return new ConviteResponse(
                convite.getId(),
                convite.getToken().toString(),
                convite.getEmail(),
                convite.getRole().name(),
                convite.getCriadoEm().toString(),
                convite.getExpiraEm().toString()
        );
    }
}
