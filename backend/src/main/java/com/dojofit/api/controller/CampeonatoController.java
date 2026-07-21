package com.dojofit.api.controller;

import com.dojofit.api.dto.request.CampeonatoRequest;
import com.dojofit.api.dto.response.CampeonatoResponse;
import com.dojofit.api.service.CampeonatoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Campeonatos e medalhas (docs/09 §7). Registro pela equipe; leitura da própria
 * linha do tempo pelo aluno.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CampeonatoController {

    private final CampeonatoService campeonatoService;

    @GetMapping("/alunos/{alunoId}/campeonatos")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public List<CampeonatoResponse> doAluno(@PathVariable Long alunoId) {
        return campeonatoService.listarDoAluno(alunoId);
    }

    @PostMapping("/alunos/{alunoId}/campeonatos")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<CampeonatoResponse> registrar(
            @PathVariable Long alunoId,
            @Valid @RequestBody CampeonatoRequest request,
            Authentication auth) {
        Long registradoPorId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(campeonatoService.registrar(alunoId, request, registradoPorId));
    }

    @PutMapping("/alunos/{alunoId}/campeonatos/{campeonatoId}")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public CampeonatoResponse atualizar(
            @PathVariable Long alunoId,
            @PathVariable Long campeonatoId,
            @Valid @RequestBody CampeonatoRequest request) {
        return campeonatoService.atualizar(alunoId, campeonatoId, request);
    }

    @DeleteMapping("/alunos/{alunoId}/campeonatos/{campeonatoId}")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable Long alunoId, @PathVariable Long campeonatoId) {
        campeonatoService.remover(alunoId, campeonatoId);
        return ResponseEntity.ok().build();
    }

    /** Campeonatos do próprio usuário (Perfil — docs/02). */
    @GetMapping("/eu/campeonatos")
    public List<CampeonatoResponse> meus(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return campeonatoService.listarDoAluno(userId);
    }
}
