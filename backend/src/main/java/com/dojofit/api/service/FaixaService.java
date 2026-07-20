package com.dojofit.api.service;

import com.dojofit.api.dto.request.FaixaRequest;
import com.dojofit.api.dto.response.FaixaResponse;
import com.dojofit.api.model.Faixa;
import com.dojofit.api.model.Modalidade;
import com.dojofit.api.repository.FaixaRepository;
import com.dojofit.api.repository.ModalidadeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Faixas de uma modalidade (docs/09 §5: progressão configurável por
 * modalidade). Leitura para todos; configuração restrita ao Admin no controller.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaixaService {

    private final FaixaRepository faixaRepository;
    private final ModalidadeRepository modalidadeRepository;

    public List<FaixaResponse> listarPorModalidade(Long modalidadeId) {
        return faixaRepository.findByModalidadeIdOrderByOrdemAsc(modalidadeId).stream()
                .map(FaixaResponse::from)
                .toList();
    }

    @Transactional
    public FaixaResponse criar(Long modalidadeId, FaixaRequest request) {
        Modalidade modalidade = modalidadeRepository.findById(modalidadeId)
                .orElseThrow(() -> new EntityNotFoundException("Modalidade nao encontrada"));
        var faixa = new Faixa();
        faixa.setModalidade(modalidade);
        aplicar(faixa, request);
        return FaixaResponse.from(faixaRepository.save(faixa));
    }

    @Transactional
    public FaixaResponse atualizar(Long faixaId, FaixaRequest request) {
        Faixa faixa = faixaRepository.findById(faixaId)
                .orElseThrow(() -> new EntityNotFoundException("Faixa nao encontrada"));
        aplicar(faixa, request);
        return FaixaResponse.from(faixaRepository.save(faixa));
    }

    @Transactional
    public void deletar(Long faixaId) {
        Faixa faixa = faixaRepository.findById(faixaId)
                .orElseThrow(() -> new EntityNotFoundException("Faixa nao encontrada"));
        faixaRepository.delete(faixa);
    }

    private void aplicar(Faixa faixa, FaixaRequest request) {
        faixa.setNome(request.nome());
        faixa.setCor(request.cor());
        faixa.setOrdem(request.ordem());
        faixa.setGrausMax(request.grausMax());
    }
}
