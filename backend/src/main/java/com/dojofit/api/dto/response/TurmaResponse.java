package com.dojofit.api.dto.response;

import com.dojofit.api.model.Turma;

public record TurmaResponse(
        Long id, String nome, String diaSemana, String horaInicio, String horaFim,
        Integer capacidadeMaxima, Long professorId, String professorNome, Boolean ativo
) {
    public static TurmaResponse from(Turma t) {
        return new TurmaResponse(
                t.getId(), t.getNome(), t.getDiaSemana().name(),
                t.getHoraInicio().toString(), t.getHoraFim().toString(),
                t.getCapacidadeMaxima(), t.getProfessor().getId(),
                t.getProfessor().getNome(), t.getAtivo()
        );
    }
}
