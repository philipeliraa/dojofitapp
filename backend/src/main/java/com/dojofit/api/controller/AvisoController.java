package com.dojofit.api.controller;

import com.dojofit.api.dto.request.AvisoRequest;
import com.dojofit.api.dto.request.FeedbackAvisoRequest;
import com.dojofit.api.dto.response.AvisoResponse;
import com.dojofit.api.dto.response.FeedbackAvisoResponse;
import com.dojofit.api.service.AvisoService;
import com.dojofit.api.service.FeedbackAvisoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avisos")
@RequiredArgsConstructor
public class AvisoController {

    private final AvisoService avisoService;
    private final FeedbackAvisoService feedbackAvisoService;

    @GetMapping
    public List<AvisoResponse> listar(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return avisoService.listar(userId);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<AvisoResponse> criar(@Valid @RequestBody AvisoRequest request, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(avisoService.criar(request, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        avisoService.deletar(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{avisoId}/feedbacks")
    public ResponseEntity<FeedbackAvisoResponse> adicionarFeedback(
            @PathVariable Long avisoId,
            @Valid @RequestBody FeedbackAvisoRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(feedbackAvisoService.adicionar(avisoId, userId, request));
    }

    @DeleteMapping("/{avisoId}/feedbacks/{feedbackId}")
    public ResponseEntity<Void> deletarFeedback(
            @PathVariable Long avisoId,
            @PathVariable Long feedbackId,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        feedbackAvisoService.deletar(avisoId, feedbackId, userId);
        return ResponseEntity.ok().build();
    }
}
