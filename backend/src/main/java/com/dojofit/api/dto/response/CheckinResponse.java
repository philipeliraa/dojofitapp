package com.dojofit.api.dto.response;

import com.dojofit.api.model.Checkin;

public record CheckinResponse(
        Long id, Long aulaId, Long alunoId, String alunoNome,
        String dataHoraCheckin, String tipo, String status,
        String turmaNome, String aulaData, String aulaHoraInicio
) {
    public static CheckinResponse from(Checkin c) {
        String turmaNome = c.getAula().getTurma() != null ? c.getAula().getTurma().getNome() : "Aula Avulsa";
        return new CheckinResponse(
                c.getId(),
                c.getAula().getId(),
                c.getAluno().getId(),
                c.getAluno().getNome(),
                c.getDataHoraCheckin().toString(),
                c.getTipo().name(),
                c.getStatus().name(),
                turmaNome,
                c.getAula().getData().toString(),
                c.getAula().getHoraInicio().toString()
        );
    }
}
