package com.dojofit.api.dto.response;

public record AuthResponse(
        String token,
        UserResponse user
) {}
