package com.dojofit.api.service;

import com.dojofit.api.dto.request.TurmaRequest;
import com.dojofit.api.dto.response.TurmaResponse;
import com.dojofit.api.exception.BusinessException;
import com.dojofit.api.model.Turma;
import com.dojofit.api.model.enums.DiaSemana;
import com.dojofit.api.repository.TurmaRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TurmaService {

    private final TurmaRepository turmaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AulaService aulaService;

    public List<TurmaResponse> findAll() {
        return turmaRepository.findAll().stream().map(TurmaResponse::from).toList();
    }

    public TurmaResponse findById(Long id) {
        return TurmaResponse.from(getTurma(id));
    }

    @Transactional
    public TurmaResponse create(TurmaRequest request) {
        var professor = usuarioRepository.findById(request.professorId())
                .orElseThrow(() -> new EntityNotFoundException("Professor nao encontrado"));

        LocalTime horaInicio = LocalTime.parse(request.horaInicio());
        LocalTime horaFim = LocalTime.parse(request.horaFim());
        validarHorario(horaInicio, horaFim);

        var turma = new Turma();
        turma.setNome(request.nome());
        turma.setDiaSemana(DiaSemana.valueOf(request.diaSemana()));
        turma.setHoraInicio(horaInicio);
        turma.setHoraFim(horaFim);
        turma.setCapacidadeMaxima(request.capacidadeMaxima());
        turma.setProfessor(professor);

        var saved = turmaRepository.save(turma);
        aulaService.generateAulas(4);
        return TurmaResponse.from(saved);
    }

    @Transactional
    public TurmaResponse update(Long id, TurmaRequest request) {
        var turma = getTurma(id);
        var professor = usuarioRepository.findById(request.professorId())
                .orElseThrow(() -> new EntityNotFoundException("Professor nao encontrado"));

        LocalTime horaInicio = LocalTime.parse(request.horaInicio());
        LocalTime horaFim = LocalTime.parse(request.horaFim());
        validarHorario(horaInicio, horaFim);

        turma.setNome(request.nome());
        turma.setDiaSemana(DiaSemana.valueOf(request.diaSemana()));
        turma.setHoraInicio(horaInicio);
        turma.setHoraFim(horaFim);
        turma.setCapacidadeMaxima(request.capacidadeMaxima());
        turma.setProfessor(professor);

        return TurmaResponse.from(turmaRepository.save(turma));
    }

    // Turma nao pode atravessar a meia-noite: Aula so guarda uma data unica
    // (sem data de termino separada), entao horaFim <= horaInicio faria a aula
    // parecer encerrada antes mesmo de comecar (bug ao gerar aula 23:00-00:00).
    private void validarHorario(LocalTime horaInicio, LocalTime horaFim) {
        if (!horaFim.isAfter(horaInicio)) {
            throw new BusinessException("Hora fim deve ser depois da hora inicio. Turmas nao podem atravessar a meia-noite");
        }
    }

    @Transactional
    public void toggleAtivo(Long id) {
        var turma = getTurma(id);
        turma.setAtivo(!turma.getAtivo());
        turmaRepository.save(turma);
    }

    @Transactional
    public void delete(Long id) {
        var turma = getTurma(id);
        turmaRepository.delete(turma);
    }

    private Turma getTurma(Long id) {
        return turmaRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Turma nao encontrada"));
    }
}
