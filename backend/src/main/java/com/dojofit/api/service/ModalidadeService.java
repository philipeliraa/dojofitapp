package com.dojofit.api.service;

import com.dojofit.api.dto.response.ModalidadeResponse;
import com.dojofit.api.model.Modalidade;
import com.dojofit.api.repository.ModalidadeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Modalidades esportivas (docs/01: multi-esporte). Nesta fase (3a) expõe apenas
 * leitura — a configuração pelo Admin (CRUD) entra num passo posterior.
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
}
