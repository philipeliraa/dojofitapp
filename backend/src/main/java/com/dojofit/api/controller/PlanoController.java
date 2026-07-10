package com.dojofit.api.controller;

import com.dojofit.api.dto.request.PlanoRequest;
import com.dojofit.api.dto.response.PlanoResponse;
import com.dojofit.api.service.PlanoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planos")
@RequiredArgsConstructor
public class PlanoController {

    private final PlanoService planoService;

    @GetMapping
    public List<PlanoResponse> findAll() {
        return planoService.findAll();
    }

    @GetMapping("/{id}")
    public PlanoResponse findById(@PathVariable Long id) {
        return planoService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PlanoResponse> create(@Valid @RequestBody PlanoRequest request) {
        return ResponseEntity.ok(planoService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public PlanoResponse update(@PathVariable Long id, @Valid @RequestBody PlanoRequest request) {
        return planoService.update(id, request);
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> toggleAtivo(@PathVariable Long id) {
        planoService.toggleAtivo(id);
        return ResponseEntity.ok().build();
    }
}
