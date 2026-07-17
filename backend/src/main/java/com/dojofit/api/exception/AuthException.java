package com.dojofit.api.exception;

/**
 * Falha de autenticação (credencial/refresh token inválido ou expirado) —
 * mapeada para 401 no GlobalExceptionHandler, distinta de BusinessException (422).
 */
public class AuthException extends RuntimeException {
    public AuthException(String message) {
        super(message);
    }
}
