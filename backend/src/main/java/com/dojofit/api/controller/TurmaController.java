package com.dojofit.api.controller;

import com.dojofit.api.dto.request.TurmaRequest;
import com.dojofit.api.dto.response.TurmaResponse;
import com.dojofit.api.service.TurmaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turmas")
@RequiredArgsConstructor
public class TurmaController {

    private final TurmaService turmaService;

    @GetMapping
    public List<TurmaResponse> findAll() {
        return turmaService.findAll();
    }

    @GetMapping("/{id}")
    public TurmaResponse findById(@PathVariable Long id) {
        return turmaService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<TurmaResponse> create(@Valid @RequestBody TurmaRequest request) {
        return ResponseEntity.ok(turmaService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public TurmaResponse update(@PathVariable Long id, @Valid @RequestBody TurmaRequest request) {
        return turmaService.update(id, request);
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> toggleAtivo(@PathVariable Long id) {
        turmaService.toggleAtivo(id);
        return ResponseEntity.ok().build();
    }
}
