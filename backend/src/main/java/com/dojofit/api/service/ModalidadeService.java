package com.dojofit.api.service;

import com.dojofit.api.dto.request.ModalidadeRequest;
import com.dojofit.api.dto.response.ModalidadeResponse;
import com.dojofit.api.model.Modalidade;
import com.dojofit.api.repository.ModalidadeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Modalidades esportivas (docs/01: multi-esporte). Leitura para todos; a
 * configuração (criar/editar/ativar) é restrita ao Admin no controller.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ModalidadeService {

    private final ModalidadeRepository modalidadeRepository;

    public List<ModalidadeResponse> listarAtivas() {
        return modalidadeRepository.findByAtivoTrueOrderByNomeAsc().stream()
                .map(ModalidadeResponse::from)
                .toList();
    }

    public Modalidade getModalidade(Long id) {
        return modalidadeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Modalidade nao encontrada"));
    }

    @Transactional
    public ModalidadeResponse criar(ModalidadeRequest request) {
        var modalidade = new Modalidade();
        modalidade.setNome(request.nome());
        return ModalidadeResponse.from(modalidadeRepository.save(modalidade));
    }

    @Transactional
    public ModalidadeResponse atualizar(Long id, ModalidadeRequest request) {
        var modalidade = getModalidade(id);
        modalidade.setNome(request.nome());
        return ModalidadeResponse.from(modalidadeRepository.save(modalidade));
    }

    @Transactional
    public void toggleAtivo(Long id) {
        var modalidade = getModalidade(id);
        modalidade.setAtivo(!modalidade.getAtivo());
        modalidadeRepository.save(modalidade);
    }
}
