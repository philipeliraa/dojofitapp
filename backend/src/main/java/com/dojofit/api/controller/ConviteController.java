package com.dojofit.api.controller;

import com.dojofit.api.dto.request.ConviteRequest;
import com.dojofit.api.dto.response.ConviteResponse;
import com.dojofit.api.service.ConviteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/convites")
@RequiredArgsConstructor
public class ConviteController {

    private final ConviteService conviteService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<ConviteResponse> criar(@Valid @RequestBody ConviteRequest request, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(conviteService.criar(request, userId));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public List<ConviteResponse> listarPendentes() {
        return conviteService.listarPendentes();
    }
}
