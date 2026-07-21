package com.dojofit.api.service;

import com.dojofit.api.dto.response.TecnicaAlunoResponse;
import com.dojofit.api.model.TecnicaAluno;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.StatusTecnica;
import com.dojofit.api.repository.TecnicaAlunoRepository;
import com.dojofit.api.repository.TecnicaRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Status de técnicas do aluno (docs/09 §6). Avaliação de coaching: definir o
 * status é ação da equipe (garantido por @PreAuthorize no controller); o aluno
 * apenas lê a própria evolução (Perfil). Um registro por (aluno, técnica) —
 * definir de novo faz upsert.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TecnicaAlunoService {

    private final TecnicaAlunoRepository tecnicaAlunoRepository;
    private final TecnicaRepository tecnicaRepository;
    private final UsuarioRepository usuarioRepository;

    public List<TecnicaAlunoResponse> listarDoAluno(Long alunoId) {
        return tecnicaAlunoRepository.findByAlunoIdOrderByAtualizadoEmDesc(alunoId).stream()
                .map(TecnicaAlunoResponse::from)
                .toList();
    }

    @Transactional
    public TecnicaAlunoResponse definirStatus(Long alunoId, Long tecnicaId, StatusTecnica status, Long avaliadoPorId) {
        var tecnicaAluno = tecnicaAlunoRepository.findByAlunoIdAndTecnicaId(alunoId, tecnicaId)
                .orElseGet(() -> {
                    var nova = new TecnicaAluno();
                    nova.setAluno(usuarioRepository.findById(alunoId)
                            .orElseThrow(() -> new EntityNotFoundException("Aluno nao encontrado")));
                    nova.setTecnica(tecnicaRepository.findById(tecnicaId)
                            .orElseThrow(() -> new EntityNotFoundException("Tecnica nao encontrada")));
                    return nova;
                });

        Usuario avaliador = usuarioRepository.findById(avaliadoPorId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado"));

        tecnicaAluno.setStatus(status);
        tecnicaAluno.setAvaliadoPor(avaliador);
        tecnicaAluno.setAtualizadoEm(LocalDateTime.now());
        return TecnicaAlunoResponse.from(tecnicaAlunoRepository.save(tecnicaAluno));
    }

    @Transactional
    public void remover(Long alunoId, Long tecnicaId) {
        tecnicaAlunoRepository.findByAlunoIdAndTecnicaId(alunoId, tecnicaId)
                .ifPresent(tecnicaAlunoRepository::delete);
    }
}
