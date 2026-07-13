package com.dojofit.api.controller;

import com.dojofit.api.dto.request.ContratoRequest;
import com.dojofit.api.dto.response.ContratoResponse;
import com.dojofit.api.service.ContratoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contratos")
@RequiredArgsConstructor
public class ContratoController {

    private final ContratoService contratoService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<ContratoResponse> findAll() {
        return contratoService.findAll();
    }

    @GetMapping("/meu")
    public List<ContratoResponse> meuContrato(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return contratoService.findByAluno(userId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ContratoResponse> create(@Valid @RequestBody ContratoRequest request) {
        return ResponseEntity.ok(contratoService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ContratoResponse update(@PathVariable Long id, @Valid @RequestBody ContratoRequest request) {
        return contratoService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contratoService.delete(id);
        return ResponseEntity.ok().build();
    }
}
