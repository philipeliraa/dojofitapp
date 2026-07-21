package com.dojofit.api.service;

import com.dojofit.api.dto.response.RankingItemResponse;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.CheckinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Ranking da academia (docs/09 §9). Critério da 1ª versão: nº de treinos
 * (check-ins) do aluno no mês corrente. Só alunos entram no ranking. A posição
 * é sequencial (1..n) na ordem de mais treinos.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RankingService {

    private final CheckinRepository checkinRepository;

    public List<RankingItemResponse> rankingDoMes() {
        LocalDate hoje = LocalDate.now();
        LocalDate inicio = hoje.withDayOfMonth(1);
        LocalDate fim = hoje.withDayOfMonth(hoje.lengthOfMonth());

        var projecoes = checkinRepository.ranking(inicio, fim, Role.ALUNO);
        var itens = new ArrayList<RankingItemResponse>(projecoes.size());
        int posicao = 1;
        for (var p : projecoes) {
            itens.add(new RankingItemResponse(posicao++, p.getAlunoId(), p.getAlunoNome(), p.getTotalTreinos()));
        }
        return itens;
    }
}
