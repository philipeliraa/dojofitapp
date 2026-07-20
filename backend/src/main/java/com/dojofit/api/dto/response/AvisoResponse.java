package com.dojofit.api.dto.response;

import com.dojofit.api.model.Aviso;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Resposta do feed. {@code feedbacks} já vem filtrado por visibilidade no
 * service (aluno vê só os próprios; Professor/Admin vê todos) — o feed é uma
 * única requisição, respeitando o princípio de poucas idas à rede (docs/05).
 */
public record AvisoResponse(
        Long id,
        String titulo,
        String conteudo,
        Long autorId,
        String autorNome,
        LocalDateTime criadoEm,
        List<FeedbackAvisoResponse> feedbacks
) {
    public static AvisoResponse from(Aviso a, List<FeedbackAvisoResponse> feedbacks) {
        return new AvisoResponse(
                a.getId(),
                a.getTitulo(),
                a.getConteudo(),
                a.getAutor().getId(),
                a.getAutor().getNome(),
                a.getCriadoEm(),
                feedbacks
        );
    }
}
