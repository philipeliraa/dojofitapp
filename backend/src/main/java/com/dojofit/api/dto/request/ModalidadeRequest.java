package com.dojofit.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ModalidadeRequest(@NotBlank String nome) {}
