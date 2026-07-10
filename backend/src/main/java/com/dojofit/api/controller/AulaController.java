package com.dojofit.api.controller;

import com.dojofit.api.dto.response.AulaResponse;
import com.dojofit.api.service.AulaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/aulas")
@RequiredArgsConstructor
public class AulaController {

    private final AulaService aulaService;

    @GetMapping
    public List<AulaResponse> findByDate(@RequestParam String data) {
        return aulaService.findByDate(LocalDate.parse(data));
    }

    @GetMapping("/semana")
    public List<AulaResponse> findByWeek(@RequestParam String inicio) {
        return aulaService.findByWeek(LocalDate.parse(inicio));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> generate(@RequestParam(defaultValue = "4") int weeks) {
        aulaService.generateAulas(weeks);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PROFESSOR')")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        aulaService.cancelAula(id);
        return ResponseEntity.ok().build();
    }
}
