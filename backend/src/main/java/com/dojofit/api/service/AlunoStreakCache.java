package com.dojofit.api.service;

import com.dojofit.api.dto.response.StreakResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

/**
 * Cache do streak por aluno (docs/02 seção 7): evita recálculo a cada acesso
 * ao Início. Uma entrada vale enquanto durar a semana em que foi calculada
 * (o streak só muda com novo check-in — que invalida explicitamente — ou com
 * a virada de semana, coberta pela chave de semana).
 */
@Component
public class AlunoStreakCache {

    private record Entry(StreakResponse value, LocalDate week) {
    }

    private final Map<Long, Entry> cache = new ConcurrentHashMap<>();

    public StreakResponse getOrCompute(Long alunoId, LocalDate currentWeek, Function<Long, StreakResponse> compute) {
        var cached = cache.get(alunoId);
        if (cached != null && cached.week().equals(currentWeek)) {
            return cached.value();
        }
        var value = compute.apply(alunoId);
        cache.put(alunoId, new Entry(value, currentWeek));
        return value;
    }

    public void invalidate(Long alunoId) {
        cache.remove(alunoId);
    }
}
