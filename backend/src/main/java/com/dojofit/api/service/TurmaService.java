package com.dojofit.api.service;

import com.dojofit.api.dto.request.TurmaRequest;
import com.dojofit.api.dto.response.TurmaResponse;
import com.dojofit.api.model.Turma;
import com.dojofit.api.model.enums.DiaSemana;
import com.dojofit.api.repository.TurmaRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TurmaService {

    private final TurmaRepository turmaRepository;
    private final UsuarioRepository usuarioRepository;

    public List<TurmaResponse> findAll() {
        return turmaRepository.findAll().stream().map(TurmaResponse::from).toList();
    }

    public TurmaResponse findById(Long id) {
        return TurmaResponse.from(getTurma(id));
    }

    public TurmaResponse create(TurmaRequest request) {
        var professor = usuarioRepository.findById(request.professorId())
                .orElseThrow(() -> new EntityNotFoundException("Professor nao encontrado"));

        var turma = new Turma();
        turma.setNome(request.nome());
        turma.setDiaSemana(DiaSemana.valueOf(request.diaSemana()));
        turma.setHoraInicio(LocalTime.parse(request.horaInicio()));
        turma.setHoraFim(LocalTime.parse(request.horaFim()));
        turma.setCapacidadeMaxima(request.capacidadeMaxima());
        turma.setProfessor(professor);

        return TurmaResponse.from(turmaRepository.save(turma));
    }

    public TurmaResponse update(Long id, TurmaRequest request) {
        var turma = getTurma(id);
        var professor = usuarioRepository.findById(request.professorId())
                .orElseThrow(() -> new EntityNotFoundException("Professor nao encontrado"));

        turma.setNome(request.nome());
        turma.setDiaSemana(DiaSemana.valueOf(request.diaSemana()));
        turma.setHoraInicio(LocalTime.parse(request.horaInicio()));
        turma.setHoraFim(LocalTime.parse(request.horaFim()));
        turma.setCapacidadeMaxima(request.capacidadeMaxima());
        turma.setProfessor(professor);

        return TurmaResponse.from(turmaRepository.save(turma));
    }

    public void toggleAtivo(Long id) {
        var turma = getTurma(id);
        turma.setAtivo(!turma.getAtivo());
        turmaRepository.save(turma);
    }

    private Turma getTurma(Long id) {
        return turmaRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Turma nao encontrada"));
    }
}
