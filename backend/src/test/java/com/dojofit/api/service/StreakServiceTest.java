package com.dojofit.api.service;

import com.dojofit.api.repository.CheckinRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class StreakServiceTest {

    // Quarta-feira, 15/07/2026 — semana corrente começa na segunda 13/07
    private static final LocalDate HOJE = LocalDate.of(2026, 7, 15);
    private static final LocalDate SEGUNDA_ATUAL = LocalDate.of(2026, 7, 13);
    private static final Long ALUNO_ID = 1L;

    private CheckinRepository checkinRepository;
    private StreakService streakService;

    @BeforeEach
    void setUp() {
        checkinRepository = org.mockito.Mockito.mock(CheckinRepository.class);
        var clock = Clock.fixed(
                HOJE.atStartOfDay(ZoneId.systemDefault()).toInstant(),
                ZoneId.systemDefault());
        streakService = new StreakService(checkinRepository, new AlunoStreakCache(), clock);
    }

    @Test
    @DisplayName("Sem histórico: streak zero com mensagem de primeira jornada")
    void noHistoryYieldsZeroStreakWithWelcomeMessage() {
        when(checkinRepository.findTrainingDatesByAlunoId(ALUNO_ID)).thenReturn(List.of());

        var streak = streakService.getStreak(ALUNO_ID);

        assertEquals(0, streak.weeklyStreak());
        assertEquals(0, streak.averagePerWeek());
        assertEquals("Seu primeiro check-in comeca sua jornada", streak.contextualMessage());
    }

    @Test
    @DisplayName("Streak conta SEMANAS consecutivas com treino, não dias (docs/01)")
    void streakCountsConsecutiveWeeksNotDays() {
        when(checkinRepository.findTrainingDatesByAlunoId(ALUNO_ID)).thenReturn(List.of(
                HOJE.minusDays(1), HOJE,                        // semana atual: 2 treinos
                SEGUNDA_ATUAL.minusWeeks(1),                    // semana passada: 1 treino
                SEGUNDA_ATUAL.minusWeeks(2), SEGUNDA_ATUAL.minusWeeks(2).plusDays(2),
                SEGUNDA_ATUAL.minusWeeks(2).plusDays(4)         // duas semanas atrás: 3 treinos
        ));

        var streak = streakService.getStreak(ALUNO_ID);

        assertEquals(3, streak.weeklyStreak());
        assertEquals(2.0, streak.averagePerWeek());
        assertTrue(streak.trainedThisWeek());
        assertEquals("Ritmo forte: 3 semanas seguidas, media de 2 treinos por semana",
                streak.contextualMessage());
    }

    @Test
    @DisplayName("Semana sem treino no meio quebra a sequência")
    void gapWeekBreaksTheStreak() {
        when(checkinRepository.findTrainingDatesByAlunoId(ALUNO_ID)).thenReturn(List.of(
                HOJE,                            // semana atual
                SEGUNDA_ATUAL.minusWeeks(3)      // três semanas atrás (buraco no meio)
        ));

        var streak = streakService.getStreak(ALUNO_ID);

        assertEquals(1, streak.weeklyStreak());
    }

    @Test
    @DisplayName("Semana corrente ainda sem treino NÃO quebra a sequência em andamento")
    void currentWeekWithoutTrainingDoesNotBreakStreak() {
        when(checkinRepository.findTrainingDatesByAlunoId(ALUNO_ID)).thenReturn(List.of(
                SEGUNDA_ATUAL.minusWeeks(1),
                SEGUNDA_ATUAL.minusWeeks(2)
        ));

        var streak = streakService.getStreak(ALUNO_ID);

        assertEquals(2, streak.weeklyStreak());
        assertFalse(streak.trainedThisWeek());
        assertEquals("Treine esta semana para manter sua sequencia de 2 semanas",
                streak.contextualMessage());
    }

    @Test
    @DisplayName("Sequência interrompida há semanas: streak zera com mensagem de recomeço")
    void interruptedStreakResetsWithRestartMessage() {
        when(checkinRepository.findTrainingDatesByAlunoId(ALUNO_ID)).thenReturn(List.of(
                SEGUNDA_ATUAL.minusWeeks(3)
        ));

        var streak = streakService.getStreak(ALUNO_ID);

        assertEquals(0, streak.weeklyStreak());
        assertEquals("Sua sequencia foi interrompida — um treino esta semana recomeca a contagem",
                streak.contextualMessage());
    }

    @Test
    @DisplayName("Média com casa decimal usa vírgula na mensagem (pt-BR)")
    void averageWithDecimalsUsesCommaInMessage() {
        when(checkinRepository.findTrainingDatesByAlunoId(ALUNO_ID)).thenReturn(List.of(
                HOJE, HOJE.minusDays(1),         // semana atual: 2
                SEGUNDA_ATUAL.minusWeeks(1)      // semana passada: 1
        ));

        var streak = streakService.getStreak(ALUNO_ID);

        assertEquals(1.5, streak.averagePerWeek());
        assertEquals("Ritmo forte: 2 semanas seguidas, media de 1,5 treinos por semana",
                streak.contextualMessage());
    }

    @Test
    @DisplayName("Cache evita recálculo dentro da mesma semana (docs/02 seção 7)")
    void cacheAvoidsRecomputationWithinSameWeek() {
        when(checkinRepository.findTrainingDatesByAlunoId(ALUNO_ID)).thenReturn(List.of(HOJE));

        streakService.getStreak(ALUNO_ID);
        streakService.getStreak(ALUNO_ID);

        verify(checkinRepository, times(1)).findTrainingDatesByAlunoId(ALUNO_ID);
    }
}
