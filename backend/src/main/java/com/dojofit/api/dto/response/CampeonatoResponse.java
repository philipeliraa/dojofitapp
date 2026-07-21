package com.dojofit.api.dto.response;

import com.dojofit.api.model.Campeonato;
import com.dojofit.api.model.enums.ResultadoCampeonato;

import java.time.LocalDate;

public record CampeonatoResponse(
        Long id,
        Long alunoId,
        String nome,
        LocalDate data,
        ResultadoCampeonato resultado,
        String categoria,
        String observacao,
        String registradoPorNome
) {
    public static CampeonatoResponse from(Campeonato c) {
        return new CampeonatoResponse(
                c.getId(),
                c.getAluno().getId(),
                c.getNome(),
                c.getData(),
                c.getResultado(),
                c.getCategoria(),
                c.getObservacao(),
                c.getRegistradoPor().getNome()
        );
    }
}
