package com.dojofit.api.dto.response;

import com.dojofit.api.model.Aula;

public record AulaResponse(
        Long id, Long turmaId, String turmaNome, String data,
        String horaInicio, String horaFim, Integer capacidadeMaxima,
        Long professorId, String professorNome, Boolean cancelada,
        String observacao, Long checkinsConfirmados, Integer vagasDisponiveis
) {
    public static AulaResponse from(Aula a, long checkinsConfirmados) {
        int capacidade = a.getCapacidadeEfetiva();
        int vagas = Math.max(0, capacidade - (int) checkinsConfirmados);
        return new AulaResponse(
                a.getId(),
                a.getTurma() != null ? a.getTurma().getId() : null,
                a.getTurma() != null ? a.getTurma().getNome() : null,
                a.getData().toString(),
                a.getHoraInicio().toString(),
                a.getHoraFim().toString(),
                capacidade,
                a.getProfessor().getId(),
                a.getProfessor().getNome(),
                a.getCancelada(),
                a.getObservacao(),
                checkinsConfirmados,
                vagas
        );
    }
}
