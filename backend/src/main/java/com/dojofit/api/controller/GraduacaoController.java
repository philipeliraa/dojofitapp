package com.dojofit.api.controller;

import com.dojofit.api.dto.request.GraduacaoRequest;
import com.dojofit.api.dto.response.GraduacaoResponse;
import com.dojofit.api.dto.response.ProgressaoResponse;
import com.dojofit.api.service.GraduacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GraduacaoController {

    private final GraduacaoService graduacaoService;

    /** Concessão de graduação (docs/06 fluxo 3): apenas equipe, nunca o próprio aluno. */
    @PostMapping("/graduacoes")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<GraduacaoResponse> conceder(@Valid @RequestBody GraduacaoRequest request, Authentication auth) {
        Long concedidaPorId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(graduacaoService.conceder(request, concedidaPorId));
    }

    @GetMapping("/alunos/{alunoId}/progressao")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public List<ProgressaoResponse> progressaoDoAluno(@PathVariable Long alunoId) {
        return graduacaoService.progressaoDoAluno(alunoId);
    }

    @GetMapping("/alunos/{alunoId}/graduacoes")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public List<GraduacaoResponse> historicoDoAluno(@PathVariable Long alunoId) {
        return graduacaoService.historico(alunoId);
    }

    /** Progressão do próprio usuário logado (Início/Perfil — docs/02). */
    @GetMapping("/eu/progressao")
    public List<ProgressaoResponse> minhaProgressao(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return graduacaoService.progressaoDoAluno(userId);
    }

    @GetMapping("/eu/graduacoes")
    public List<GraduacaoResponse> minhasGraduacoes(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return graduacaoService.historico(userId);
    }
}
