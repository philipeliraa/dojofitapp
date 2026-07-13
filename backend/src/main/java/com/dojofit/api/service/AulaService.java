package com.dojofit.api.service;

import com.dojofit.api.dto.response.AulaResponse;
import com.dojofit.api.model.Aula;
import com.dojofit.api.model.Turma;
import com.dojofit.api.model.enums.DiaSemana;
import com.dojofit.api.model.enums.StatusCheckin;
import com.dojofit.api.repository.AulaRepository;
import com.dojofit.api.repository.CheckinRepository;
import com.dojofit.api.repository.TurmaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AulaService {

    private final AulaRepository aulaRepository;
    private final TurmaRepository turmaRepository;
    private final CheckinRepository checkinRepository;

    public List<AulaResponse> findByDate(LocalDate date) {
        return aulaRepository.findByData(date).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AulaResponse> findByWeek(LocalDate start) {
        LocalDate end = start.plusDays(6);
        return aulaRepository.findByDataBetween(start, end).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void generateAulas(int weeks) {
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<Turma> turmasAtivas = turmaRepository.findByAtivoTrue();

        for (int w = 0; w < weeks; w++) {
            LocalDate weekStart = monday.plusWeeks(w);
            for (Turma turma : turmasAtivas) {
                DayOfWeek targetDay = turma.getDiaSemana().toDayOfWeek();
                LocalDate aulaDate = weekStart.with(TemporalAdjusters.nextOrSame(targetDay));

                // Only generate for future or today
                if (aulaDate.isBefore(today)) continue;

                // Idempotent: skip if already exists
                if (aulaRepository.findByTurmaIdAndData(turma.getId(), aulaDate).isPresent()) continue;

                var aula = new Aula();
                aula.setTurma(turma);
                aula.setData(aulaDate);
                aula.setHoraInicio(turma.getHoraInicio());
                aula.setHoraFim(turma.getHoraFim());
                aula.setProfessor(turma.getProfessor());
                aulaRepository.save(aula);
            }
        }
    }

    @Transactional
    public void cancelAula(Long id) {
        var aula = getAula(id);
        aula.setCancelada(true);
        aulaRepository.save(aula);
    }

    public Aula getAula(Long id) {
        return aulaRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Aula nao encontrada"));
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void scheduledGeneration() {
        generateAulas(4);
    }

    private AulaResponse toResponse(Aula aula) {
        long confirmados = checkinRepository.countByAulaIdAndStatus(aula.getId(), StatusCheckin.CONFIRMADO)
                + checkinRepository.countByAulaIdAndStatus(aula.getId(), StatusCheckin.EXCECAO_LIBERADA);
        return AulaResponse.from(aula, confirmados);
    }
}
