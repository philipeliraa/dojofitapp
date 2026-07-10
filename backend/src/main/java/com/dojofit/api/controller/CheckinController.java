package com.dojofit.api.controller;

import com.dojofit.api.dto.response.CheckinResponse;
import com.dojofit.api.model.enums.TipoCheckin;
import com.dojofit.api.service.CheckinService;
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

    @PostMapping
    public ResponseEntity<CheckinResponse> checkin(@RequestBody Map<String, Long> body, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        Long aulaId = body.get("aulaId");
        return ResponseEntity.ok(checkinService.realizarCheckin(aulaId, userId, TipoCheckin.PROPRIO));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyAuthority('PROFESSOR', 'ADMIN')")
    public ResponseEntity<CheckinResponse> checkinManual(@RequestBody Map<String, Long> body) {
        Long aulaId = body.get("aulaId");
        Long alunoId = body.get("alunoId");
        return ResponseEntity.ok(checkinService.realizarCheckin(aulaId, alunoId, TipoCheckin.PROFESSOR));
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
    public Map<String, Long> checkinsSemana(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return Map.of("count", checkinService.countCheckinsNaSemana(userId));
    }
}
