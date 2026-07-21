package com.dojofit.api.controller;

import com.dojofit.api.dto.request.AvaliacaoRequest;
import com.dojofit.api.dto.response.AvaliacaoResponse;
import com.dojofit.api.service.AvaliacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Avaliações do professor (docs/09 §8). Escrita/leitura completa pela equipe;
 * o aluno lê apenas as próprias avaliações marcadas como públicas.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @GetMapping("/alunos/{alunoId}/avaliacoes")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public List<AvaliacaoResponse> doAluno(@PathVariable Long alunoId) {
        return avaliacaoService.listarDoAluno(alunoId);
    }

    @PostMapping("/alunos/{alunoId}/avaliacoes")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<AvaliacaoResponse> registrar(
            @PathVariable Long alunoId,
            @Valid @RequestBody AvaliacaoRequest request,
            Authentication auth) {
        Long autorId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(avaliacaoService.registrar(alunoId, request, autorId));
    }

    @PutMapping("/alunos/{alunoId}/avaliacoes/{avaliacaoId}")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public AvaliacaoResponse atualizar(
            @PathVariable Long alunoId,
            @PathVariable Long avaliacaoId,
            @Valid @RequestBody AvaliacaoRequest request) {
        return avaliacaoService.atualizar(alunoId, avaliacaoId, request);
    }

    @DeleteMapping("/alunos/{alunoId}/avaliacoes/{avaliacaoId}")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable Long alunoId, @PathVariable Long avaliacaoId) {
        avaliacaoService.remover(alunoId, avaliacaoId);
        return ResponseEntity.ok().build();
    }

    /** Avaliações públicas do próprio usuário (Perfil — docs/02). */
    @GetMapping("/eu/avaliacoes")
    public List<AvaliacaoResponse> minhas(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return avaliacaoService.listarPublicasDoAluno(userId);
    }
}
