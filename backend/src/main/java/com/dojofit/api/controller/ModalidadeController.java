package com.dojofit.api.controller;

import com.dojofit.api.dto.request.FaixaRequest;
import com.dojofit.api.dto.request.ModalidadeRequest;
import com.dojofit.api.dto.response.FaixaResponse;
import com.dojofit.api.dto.response.ModalidadeResponse;
import com.dojofit.api.service.FaixaService;
import com.dojofit.api.service.ModalidadeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modalidades")
@RequiredArgsConstructor
public class ModalidadeController {

    private final ModalidadeService modalidadeService;
    private final FaixaService faixaService;

    // --- Leitura (todos os papéis autenticados) ---

    @GetMapping
    public List<ModalidadeResponse> listar() {
        return modalidadeService.listarAtivas();
    }

    @GetMapping("/{id}/faixas")
    public List<FaixaResponse> faixas(@PathVariable Long id) {
        return faixaService.listarPorModalidade(id);
    }

    // --- Configuração (Admin) ---

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ModalidadeResponse> criar(@Valid @RequestBody ModalidadeRequest request) {
        return ResponseEntity.ok(modalidadeService.criar(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ModalidadeResponse atualizar(@PathVariable Long id, @Valid @RequestBody ModalidadeRequest request) {
        return modalidadeService.atualizar(id, request);
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> toggleAtivo(@PathVariable Long id) {
        modalidadeService.toggleAtivo(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/faixas")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<FaixaResponse> criarFaixa(@PathVariable Long id, @Valid @RequestBody FaixaRequest request) {
        return ResponseEntity.ok(faixaService.criar(id, request));
    }

    @PutMapping("/{id}/faixas/{faixaId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public FaixaResponse atualizarFaixa(@PathVariable Long id, @PathVariable Long faixaId, @Valid @RequestBody FaixaRequest request) {
        return faixaService.atualizar(faixaId, request);
    }

    @DeleteMapping("/{id}/faixas/{faixaId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletarFaixa(@PathVariable Long id, @PathVariable Long faixaId) {
        faixaService.deletar(faixaId);
        return ResponseEntity.ok().build();
    }
}
