package com.dojofit.api.controller;

import com.dojofit.api.dto.response.AlunoDetalheResponse;
import com.dojofit.api.dto.response.AlunoResumoResponse;
import com.dojofit.api.service.AlunoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Coaching de alunos (docs/02 §2). Leitura para equipe (Professor + Admin) —
 * suporta o fluxo de graduação (docs/06). A gestão de usuários (CRUD) segue
 * exclusiva do Admin em AdminUsuarioController.
 */
@RestController
@RequestMapping("/api/alunos")
@PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
@RequiredArgsConstructor
public class AlunoController {

    private final AlunoService alunoService;

    @GetMapping
    public List<AlunoResumoResponse> listar() {
        return alunoService.listar();
    }

    @GetMapping("/{id}")
    public AlunoDetalheResponse detalhe(@PathVariable Long id) {
        return alunoService.detalhe(id);
    }
}
