package com.dojofit.api.dto.request;

import com.dojofit.api.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConviteRequest(
        @NotBlank @Email String email,
        @NotNull Role role
) {
}
