package com.dojofit.api.service;

import com.dojofit.api.dto.response.StreakResponse;
import com.dojofit.api.repository.CheckinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Streak SEMANAL (docs/01, CLAUDE.md): conta semanas consecutivas com pelo
 * menos 1 treino — não dias seguidos, porque o padrão de treino varia por
 * aluno. A semana corrente ainda em andamento não quebra a sequência se o
 * aluno ainda não treinou nela.
 */
@Service
@RequiredArgsConstructor
public class StreakService {

    private final CheckinRepository checkinRepository;
    private final AlunoStreakCache cache;
    private final Clock clock;

    public StreakResponse getStreak(Long alunoId) {
        return cache.getOrCompute(alunoId, currentWeek(), this::compute);
    }

    private StreakResponse compute(Long alunoId) {
        List<LocalDate> trainingDates = checkinRepository.findTrainingDatesByAlunoId(alunoId);
        Set<LocalDate> trainedWeeks = trainingDates.stream()
                .map(this::weekOf)
                .collect(Collectors.toSet());

        LocalDate currentWeek = currentWeek();
        boolean trainedThisWeek = trainedWeeks.contains(currentWeek);

        // Semana corrente sem treino não quebra a sequência — ela ainda não acabou
        LocalDate cursor = trainedThisWeek ? currentWeek : currentWeek.minusWeeks(1);
        int streak = 0;
        while (trainedWeeks.contains(cursor)) {
            streak++;
            cursor = cursor.minusWeeks(1);
        }

        double average = averageInStreak(trainingDates, currentWeek, trainedThisWeek, streak);

        return new StreakResponse(streak, average, trainedThisWeek,
                contextualMessage(streak, average, trainedThisWeek, trainedWeeks.isEmpty()));
    }

    /** Média de treinos por semana dentro do período do streak, com 1 casa decimal. */
    private double averageInStreak(List<LocalDate> trainingDates, LocalDate currentWeek,
                                   boolean trainedThisWeek, int streak) {
        if (streak == 0) {
            return 0;
        }
        LocalDate lastCountedWeek = trainedThisWeek ? currentWeek : currentWeek.minusWeeks(1);
        LocalDate firstCountedWeek = lastCountedWeek.minusWeeks(streak - 1);

        long totalInStreak = trainingDates.stream()
                .filter(d -> {
                    LocalDate week = weekOf(d);
                    return !week.isBefore(firstCountedWeek) && !week.isAfter(lastCountedWeek);
                })
                .count();

        return Math.round((double) totalInStreak / streak * 10) / 10.0;
    }

    /** Feedback contextual baseado no padrão do aluno (docs/01, docs/02). */
    private String contextualMessage(int streak, double average, boolean trainedThisWeek, boolean semHistorico) {
        if (streak == 0 && semHistorico) {
            return "Seu primeiro check-in comeca sua jornada";
        }
        if (streak == 0) {
            return "Sua sequencia foi interrompida — um treino esta semana recomeca a contagem";
        }
        if (!trainedThisWeek) {
            return "Treine esta semana para manter sua sequencia de " + streak
                    + (streak == 1 ? " semana" : " semanas");
        }
        if (streak == 1) {
            return "Primeira semana de treino — volte na proxima para criar sequencia";
        }
        return "Ritmo forte: " + streak + " semanas seguidas, media de "
                + formatAverage(average) + " treinos por semana";
    }

    private String formatAverage(double average) {
        return average == Math.floor(average)
                ? String.valueOf((int) average)
                : String.valueOf(average).replace('.', ',');
    }

    private LocalDate currentWeek() {
        return weekOf(LocalDate.now(clock));
    }

    private LocalDate weekOf(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
}
