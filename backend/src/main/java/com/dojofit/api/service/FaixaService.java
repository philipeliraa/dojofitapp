package com.dojofit.api.service;

import com.dojofit.api.dto.response.FaixaResponse;
import com.dojofit.api.repository.FaixaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Faixas de uma modalidade (docs/09 §5: progressão configurável por
 * modalidade). Leitura na Fase 3a; configuração pelo Admin em passo posterior.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaixaService {

    private final FaixaRepository faixaRepository;

    public List<FaixaResponse> listarPorModalidade(Long modalidadeId) {
        return faixaRepository.findByModalidadeIdOrderByOrdemAsc(modalidadeId).stream()
                .map(FaixaResponse::from)
                .toList();
    }
}
