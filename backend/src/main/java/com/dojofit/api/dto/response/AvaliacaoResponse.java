package com.dojofit.api.dto.response;

import com.dojofit.api.model.Avaliacao;
import com.dojofit.api.model.enums.TipoAvaliacao;

import java.time.LocalDateTime;

public record AvaliacaoResponse(
        Long id,
        Long alunoId,
        TipoAvaliacao tipo,
        String conteudo,
        boolean publico,
        String autorNome,
        LocalDateTime criadoEm
) {
    public static AvaliacaoResponse from(Avaliacao a) {
        return new AvaliacaoResponse(
                a.getId(),
                a.getAluno().getId(),
                a.getTipo(),
                a.getConteudo(),
                a.getPublico(),
                a.getAutor().getNome(),
                a.getCriadoEm()
        );
    }
}
