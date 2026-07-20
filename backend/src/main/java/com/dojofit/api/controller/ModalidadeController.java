package com.dojofit.api.controller;

import com.dojofit.api.dto.response.FaixaResponse;
import com.dojofit.api.dto.response.ModalidadeResponse;
import com.dojofit.api.service.FaixaService;
import com.dojofit.api.service.ModalidadeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modalidades")
@RequiredArgsConstructor
public class ModalidadeController {

    private final ModalidadeService modalidadeService;
    private final FaixaService faixaService;

    @GetMapping
    public List<ModalidadeResponse> listar() {
        return modalidadeService.listarAtivas();
    }

    @GetMapping("/{id}/faixas")
    public List<FaixaResponse> faixas(@PathVariable Long id) {
        return faixaService.listarPorModalidade(id);
    }
}
