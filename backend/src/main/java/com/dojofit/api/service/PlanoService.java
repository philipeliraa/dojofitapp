package com.dojofit.api.service;

import com.dojofit.api.dto.request.PlanoRequest;
import com.dojofit.api.dto.response.PlanoResponse;
import com.dojofit.api.model.Plano;
import com.dojofit.api.repository.PlanoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanoService {

    private final PlanoRepository planoRepository;

    public List<PlanoResponse> findAll() {
        return planoRepository.findAll().stream().map(PlanoResponse::from).toList();
    }

    public PlanoResponse findById(Long id) {
        return PlanoResponse.from(getPlano(id));
    }

    public PlanoResponse create(PlanoRequest request) {
        var plano = new Plano();
        plano.setNome(request.nome());
        plano.setLimiteSemanal(request.limiteSemanal());
        return PlanoResponse.from(planoRepository.save(plano));
    }

    public PlanoResponse update(Long id, PlanoRequest request) {
        var plano = getPlano(id);
        plano.setNome(request.nome());
        plano.setLimiteSemanal(request.limiteSemanal());
        return PlanoResponse.from(planoRepository.save(plano));
    }

    public void toggleAtivo(Long id) {
        var plano = getPlano(id);
        plano.setAtivo(!plano.getAtivo());
        planoRepository.save(plano);
    }

    public void delete(Long id) {
        var plano = getPlano(id);
        planoRepository.delete(plano);
    }

    private Plano getPlano(Long id) {
        return planoRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Plano nao encontrado"));
    }
}
