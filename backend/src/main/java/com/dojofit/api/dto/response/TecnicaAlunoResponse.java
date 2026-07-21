package com.dojofit.api.dto.response;

import com.dojofit.api.model.TecnicaAluno;
import com.dojofit.api.model.enums.StatusTecnica;

import java.time.LocalDateTime;

public record TecnicaAlunoResponse(
        Long tecnicaId,
        String tecnicaNome,
        Long modalidadeId,
        String modalidadeNome,
        StatusTecnica status,
        LocalDateTime atualizadoEm
) {
    public static TecnicaAlunoResponse from(TecnicaAluno ta) {
        return new TecnicaAlunoResponse(
                ta.getTecnica().getId(),
                ta.getTecnica().getNome(),
                ta.getTecnica().getModalidade().getId(),
                ta.getTecnica().getModalidade().getNome(),
                ta.getStatus(),
                ta.getAtualizadoEm()
        );
    }
}
