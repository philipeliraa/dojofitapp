package com.dojofit.api.controller;

import com.dojofit.api.dto.request.TecnicaAlunoRequest;
import com.dojofit.api.dto.response.TecnicaAlunoResponse;
import com.dojofit.api.service.TecnicaAlunoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Status de técnicas do aluno (docs/09 §6). Definição pela equipe; leitura da
 * própria evolução pelo aluno.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TecnicaAlunoController {

    private final TecnicaAlunoService tecnicaAlunoService;

    @GetMapping("/alunos/{alunoId}/tecnicas")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public List<TecnicaAlunoResponse> doAluno(@PathVariable Long alunoId) {
        return tecnicaAlunoService.listarDoAluno(alunoId);
    }

    @PutMapping("/alunos/{alunoId}/tecnicas/{tecnicaId}")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public TecnicaAlunoResponse definirStatus(
            @PathVariable Long alunoId,
            @PathVariable Long tecnicaId,
            @Valid @RequestBody TecnicaAlunoRequest request,
            Authentication auth) {
        Long avaliadoPorId = (Long) auth.getPrincipal();
        return tecnicaAlunoService.definirStatus(alunoId, tecnicaId, request.status(), avaliadoPorId);
    }

    @DeleteMapping("/alunos/{alunoId}/tecnicas/{tecnicaId}")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable Long alunoId, @PathVariable Long tecnicaId) {
        tecnicaAlunoService.remover(alunoId, tecnicaId);
        return ResponseEntity.ok().build();
    }

    /** Técnicas do próprio usuário (Perfil — docs/02). */
    @GetMapping("/eu/tecnicas")
    public List<TecnicaAlunoResponse> minhas(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return tecnicaAlunoService.listarDoAluno(userId);
    }
}
