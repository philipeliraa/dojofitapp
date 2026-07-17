package com.dojofit.api.controller;

import com.dojofit.api.dto.request.CheckinRequest;
import com.dojofit.api.dto.request.ManualCheckinRequest;
import com.dojofit.api.dto.response.CheckinResponse;
import com.dojofit.api.dto.response.StreakResponse;
import com.dojofit.api.model.enums.TipoCheckin;
import com.dojofit.api.service.CheckinService;
import com.dojofit.api.service.StreakService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
public class CheckinController {

    private final CheckinService checkinService;
    private final StreakService streakService;

    @PostMapping
    public ResponseEntity<CheckinResponse> checkin(@Valid @RequestBody CheckinRequest request, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(checkinService.realizarCheckin(request.aulaId(), userId, TipoCheckin.PROPRIO, request.clientId()));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<CheckinResponse> checkinManual(@Valid @RequestBody ManualCheckinRequest request) {
        return ResponseEntity.ok(checkinService.realizarCheckin(request.aulaId(), request.alunoId(), TipoCheckin.PROFESSOR, request.clientId()));
    }

    @PostMapping("/{id}/excecao")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<CheckinResponse> liberarExcecao(@PathVariable Long id) {
        return ResponseEntity.ok(checkinService.liberarExcecao(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        checkinService.cancelarCheckin(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/aula/{aulaId}")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public List<CheckinResponse> findByAula(@PathVariable Long aulaId) {
        return checkinService.findByAula(aulaId);
    }

    @GetMapping("/historico")
    public List<CheckinResponse> historico(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return checkinService.findHistorico(userId);
    }

    @GetMapping("/semana")
    public Map<String, Object> checkinsSemana(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return checkinService.getResumoSemanal(userId);
    }

    @GetMapping("/streak")
    public StreakResponse streak(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return streakService.getStreak(userId);
    }
}
