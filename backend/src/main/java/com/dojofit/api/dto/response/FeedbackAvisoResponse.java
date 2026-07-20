package com.dojofit.api.dto.response;

import com.dojofit.api.model.FeedbackAviso;

import java.time.LocalDateTime;

public record FeedbackAvisoResponse(
        Long id,
        Long avisoId,
        Long autorId,
        String autorNome,
        String conteudo,
        LocalDateTime criadoEm
) {
    public static FeedbackAvisoResponse from(FeedbackAviso f) {
        return new FeedbackAvisoResponse(
                f.getId(),
                f.getAviso().getId(),
                f.getAutor().getId(),
                f.getAutor().getNome(),
                f.getConteudo(),
                f.getCriadoEm()
        );
    }
}
