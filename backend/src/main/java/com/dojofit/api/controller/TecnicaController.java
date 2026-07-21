package com.dojofit.api.controller;

import com.dojofit.api.dto.request.TecnicaRequest;
import com.dojofit.api.dto.response.TecnicaResponse;
import com.dojofit.api.service.TecnicaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Catálogo de técnicas por modalidade (docs/09 §6). Leitura para todos;
 * configuração restrita ao Admin.
 */
@RestController
@RequestMapping("/api/modalidades/{modalidadeId}/tecnicas")
@RequiredArgsConstructor
public class TecnicaController {

    private final TecnicaService tecnicaService;

    @GetMapping
    public List<TecnicaResponse> listar(@PathVariable Long modalidadeId) {
        return tecnicaService.listarPorModalidade(modalidadeId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<TecnicaResponse> criar(@PathVariable Long modalidadeId, @Valid @RequestBody TecnicaRequest request) {
        return ResponseEntity.ok(tecnicaService.criar(modalidadeId, request));
    }

    @PutMapping("/{tecnicaId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public TecnicaResponse atualizar(@PathVariable Long modalidadeId, @PathVariable Long tecnicaId, @Valid @RequestBody TecnicaRequest request) {
        return tecnicaService.atualizar(tecnicaId, request);
    }

    @DeleteMapping("/{tecnicaId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable Long modalidadeId, @PathVariable Long tecnicaId) {
        tecnicaService.deletar(tecnicaId);
        return ResponseEntity.ok().build();
    }
}
