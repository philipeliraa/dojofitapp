package com.dojofit.api.service;

import com.dojofit.api.dto.request.TecnicaRequest;
import com.dojofit.api.dto.response.TecnicaResponse;
import com.dojofit.api.model.Modalidade;
import com.dojofit.api.model.Tecnica;
import com.dojofit.api.repository.ModalidadeRepository;
import com.dojofit.api.repository.TecnicaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Catálogo de técnicas por modalidade (docs/09 §6). Leitura para todos;
 * configuração (criar/editar/remover) restrita ao Admin no controller.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TecnicaService {

    private final TecnicaRepository tecnicaRepository;
    private final ModalidadeRepository modalidadeRepository;

    public List<TecnicaResponse> listarPorModalidade(Long modalidadeId) {
        return tecnicaRepository.findByModalidadeIdAndAtivoTrueOrderByNomeAsc(modalidadeId).stream()
                .map(TecnicaResponse::from)
                .toList();
    }

    @Transactional
    public TecnicaResponse criar(Long modalidadeId, TecnicaRequest request) {
        Modalidade modalidade = modalidadeRepository.findById(modalidadeId)
                .orElseThrow(() -> new EntityNotFoundException("Modalidade nao encontrada"));
        var tecnica = new Tecnica();
        tecnica.setModalidade(modalidade);
        tecnica.setNome(request.nome());
        tecnica.setDescricao(request.descricao());
        return TecnicaResponse.from(tecnicaRepository.save(tecnica));
    }

    @Transactional
    public TecnicaResponse atualizar(Long tecnicaId, TecnicaRequest request) {
        Tecnica tecnica = getTecnica(tecnicaId);
        tecnica.setNome(request.nome());
        tecnica.setDescricao(request.descricao());
        return TecnicaResponse.from(tecnicaRepository.save(tecnica));
    }

    @Transactional
    public void deletar(Long tecnicaId) {
        tecnicaRepository.delete(getTecnica(tecnicaId));
    }

    private Tecnica getTecnica(Long id) {
        return tecnicaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tecnica nao encontrada"));
    }
}
