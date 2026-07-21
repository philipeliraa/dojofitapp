package com.dojofit.api.controller;

import com.dojofit.api.dto.response.RankingItemResponse;
import com.dojofit.api.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Ranking da academia (docs/09 §9). Visível a todos os papéis autenticados.
 */
@RestController
@RequestMapping("/api/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping
    public List<RankingItemResponse> ranking() {
        return rankingService.rankingDoMes();
    }
}
