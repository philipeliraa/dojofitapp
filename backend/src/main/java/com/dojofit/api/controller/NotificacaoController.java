package com.dojofit.api.controller;

import com.dojofit.api.dto.response.NotificacaoResponse;
import com.dojofit.api.service.NotificacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificacoes")
@RequiredArgsConstructor
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    @GetMapping
    public List<NotificacaoResponse> listar(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return notificacaoService.listar(userId);
    }

    @GetMapping("/nao-lidas")
    public Map<String, Long> contarNaoLidas(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return Map.of("count", notificacaoService.contarNaoLidas(userId));
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<Void> marcarLida(@PathVariable Long id, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        notificacaoService.marcarLida(id, userId);
        return ResponseEntity.ok().build();
    }
}
