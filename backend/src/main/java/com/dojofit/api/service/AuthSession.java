package com.dojofit.api.service;

import com.dojofit.api.dto.response.UserResponse;

/**
 * Resultado interno de autenticação: o controller transforma o accessToken em
 * corpo de resposta e o refreshToken em cookie httpOnly (docs/07 seção 7).
 */
public record AuthSession(String accessToken, String refreshToken, UserResponse user) {
}
