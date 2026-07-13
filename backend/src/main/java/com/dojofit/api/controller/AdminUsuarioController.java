package com.dojofit.api.controller;

import com.dojofit.api.dto.request.UsuarioRequest;
import com.dojofit.api.dto.response.UserResponse;
import com.dojofit.api.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
public class AdminUsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<UserResponse> findAll(@RequestParam(required = false) String role) {
        return usuarioService.findAll(role);
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.create(request));
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UsuarioRequest request) {
        return usuarioService.update(id, request);
    }

    @PatchMapping("/{id}/toggle-ativo")
    public ResponseEntity<Void> toggleAtivo(@PathVariable Long id) {
        usuarioService.toggleAtivo(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        usuarioService.delete(id);
        return ResponseEntity.ok().build();
    }
}
