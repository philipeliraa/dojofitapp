package com.dojofit.api.service;

import com.dojofit.api.repository.CheckinRepository;
import com.dojofit.api.repository.RankingProjection;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RankingServiceTest {

    @Mock
    private CheckinRepository checkinRepository;

    @InjectMocks
    private RankingService service;

    private record Proj(Long alunoId, String alunoNome, long totalTreinos) implements RankingProjection {
        @Override public Long getAlunoId() { return alunoId; }
        @Override public String getAlunoNome() { return alunoNome; }
        @Override public long getTotalTreinos() { return totalTreinos; }
    }

    @Test
    @DisplayName("Atribui posição sequencial preservando a ordem da query")
    void posicaoSequencial() {
        when(checkinRepository.ranking(any(), any(), any())).thenReturn(List.of(
                new Proj(2L, "Ana", 8),
                new Proj(3L, "Bruno", 5),
                new Proj(4L, "Carla", 5)
        ));

        var ranking = service.rankingDoMes();

        assertEquals(3, ranking.size());
        assertEquals(1, ranking.get(0).posicao());
        assertEquals("Ana", ranking.get(0).alunoNome());
        assertEquals(8, ranking.get(0).totalTreinos());
        assertEquals(2, ranking.get(1).posicao());
        assertEquals(3, ranking.get(2).posicao());
    }

    @Test
    @DisplayName("Ranking sem treinos no mês vem vazio")
    void rankingVazio() {
        when(checkinRepository.ranking(any(), any(), any())).thenReturn(List.of());
        assertTrue(service.rankingDoMes().isEmpty());
    }
}
