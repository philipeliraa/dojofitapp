package com.dojofit.api.service;

import com.dojofit.api.dto.request.ConviteRequest;
import com.dojofit.api.dto.response.ConviteResponse;
import com.dojofit.api.exception.BusinessException;
import com.dojofit.api.model.Convite;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.repository.ConviteRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Convite de acesso (docs/06 fluxo 2): a academia define e-mail e papel;
 * o token de uso único é a única porta de entrada para criar conta.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConviteService {

    private static final int VALIDADE_DIAS = 7;

    private final ConviteRepository conviteRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public ConviteResponse criar(ConviteRequest request, Long criadoPorId) {
        var criador = usuarioRepository.findById(criadoPorId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado"));

        // Professor tem acesso parcial à Gestão (docs/02 seção 2): só convida alunos
        if (criador.getRole() == Role.PROFESSOR && request.role() != Role.ALUNO) {
            throw new BusinessException("Professor pode convidar apenas alunos");
        }

        if (usuarioRepository.findByEmail(request.email()).isPresent()) {
            throw new BusinessException("Email ja cadastrado");
        }

        var convite = new Convite();
        convite.setToken(UUID.randomUUID());
        convite.setEmail(request.email());
        convite.setRole(request.role());
        convite.setCriadoPor(criador);
        convite.setExpiraEm(LocalDateTime.now().plusDays(VALIDADE_DIAS));
        conviteRepository.save(convite);

        return ConviteResponse.from(convite);
    }

    public List<ConviteResponse> listarPendentes() {
        return conviteRepository.findByUsadoEmIsNullAndExpiraEmAfterOrderByCriadoEmDesc(LocalDateTime.now())
                .stream()
                .map(ConviteResponse::from)
                .toList();
    }

    /** Valida o token para uso: existe, não usado e não expirado — senão, erro de negócio. */
    public Convite validar(UUID token) {
        var convite = conviteRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Convite invalido. Acesso ao Dojofit requer convite da academia"));

        if (convite.getUsadoEm() != null) {
            throw new BusinessException("Este convite ja foi utilizado");
        }
        if (convite.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Este convite expirou. Peca um novo a academia");
        }
        return convite;
    }

    public Optional<Convite> buscarPendentePorEmail(String email) {
        return conviteRepository.findFirstByEmailIgnoreCaseAndUsadoEmIsNullAndExpiraEmAfterOrderByCriadoEmDesc(
                email, LocalDateTime.now());
    }

    @Transactional
    public void marcarUsado(Convite convite) {
        convite.setUsadoEm(LocalDateTime.now());
        conviteRepository.save(convite);
    }
}
