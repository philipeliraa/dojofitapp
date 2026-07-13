package com.dojofit.api.service;

import com.dojofit.api.dto.request.ContratoRequest;
import com.dojofit.api.dto.response.ContratoResponse;
import com.dojofit.api.model.Contrato;
import com.dojofit.api.model.enums.StatusContrato;
import com.dojofit.api.repository.ContratoRepository;
import com.dojofit.api.repository.PlanoRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContratoService {

    private final ContratoRepository contratoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PlanoRepository planoRepository;

    public List<ContratoResponse> findAll() {
        return contratoRepository.findAll().stream().map(ContratoResponse::from).toList();
    }

    public ContratoResponse findById(Long id) {
        return ContratoResponse.from(getContrato(id));
    }

    public List<ContratoResponse> findByAluno(Long alunoId) {
        return contratoRepository.findByAlunoId(alunoId).stream().map(ContratoResponse::from).toList();
    }

    @Transactional
    public ContratoResponse create(ContratoRequest request) {
        var aluno = usuarioRepository.findById(request.alunoId())
                .orElseThrow(() -> new EntityNotFoundException("Aluno nao encontrado"));
        var plano = planoRepository.findById(request.planoId())
                .orElseThrow(() -> new EntityNotFoundException("Plano nao encontrado"));

        var contrato = new Contrato();
        contrato.setAluno(aluno);
        contrato.setPlano(plano);
        contrato.setDataInicio(LocalDate.parse(request.dataInicio()));
        contrato.setDataValidade(LocalDate.parse(request.dataValidade()));
        contrato.setStatus(StatusContrato.ATIVO);

        return ContratoResponse.from(contratoRepository.save(contrato));
    }

    @Transactional
    public ContratoResponse update(Long id, ContratoRequest request) {
        var contrato = getContrato(id);
        var plano = planoRepository.findById(request.planoId())
                .orElseThrow(() -> new EntityNotFoundException("Plano nao encontrado"));

        contrato.setPlano(plano);
        contrato.setDataInicio(LocalDate.parse(request.dataInicio()));
        contrato.setDataValidade(LocalDate.parse(request.dataValidade()));

        // Auto-update status based on validity date
        if (contrato.getDataValidade().isBefore(LocalDate.now())) {
            contrato.setStatus(StatusContrato.EXPIRADO);
        } else {
            contrato.setStatus(StatusContrato.ATIVO);
        }

        return ContratoResponse.from(contratoRepository.save(contrato));
    }

    @Transactional
    public void delete(Long id) {
        var contrato = getContrato(id);
        contratoRepository.delete(contrato);
    }

    private Contrato getContrato(Long id) {
        return contratoRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Contrato nao encontrado"));
    }
}
