package com.dojofit.api.service;

import com.dojofit.api.dto.request.GraduacaoRequest;
import com.dojofit.api.dto.response.GraduacaoResponse;
import com.dojofit.api.dto.response.ProgressaoResponse;
import com.dojofit.api.exception.BusinessException;
import com.dojofit.api.model.Faixa;
import com.dojofit.api.model.Graduacao;
import com.dojofit.api.model.Modalidade;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.TipoNotificacao;
import com.dojofit.api.repository.CheckinRepository;
import com.dojofit.api.repository.FaixaRepository;
import com.dojofit.api.repository.GraduacaoRepository;
import com.dojofit.api.repository.ModalidadeRepository;
import com.dojofit.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Concessão e consulta de graduação (docs/06 fluxo 3). Cada graduação é um
 * evento na história permanente do atleta (docs/01). A faixa atual do aluno
 * numa modalidade é sempre a graduação mais recente. A notificação in-app ao
 * aluno (docs/06 passo 8) será acoplada aqui quando o subsistema de notificação
 * existir (passo posterior da Fase 3a).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GraduacaoService {

    private final GraduacaoRepository graduacaoRepository;
    private final ModalidadeRepository modalidadeRepository;
    private final FaixaRepository faixaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CheckinRepository checkinRepository;
    private final NotificacaoService notificacaoService;

    @Transactional
    public GraduacaoResponse conceder(GraduacaoRequest request, Long concedidaPorId) {
        Usuario aluno = usuarioRepository.findById(request.alunoId())
                .orElseThrow(() -> new EntityNotFoundException("Aluno nao encontrado"));
        Modalidade modalidade = modalidadeRepository.findById(request.modalidadeId())
                .orElseThrow(() -> new EntityNotFoundException("Modalidade nao encontrada"));
        Faixa faixa = faixaRepository.findById(request.faixaId())
                .orElseThrow(() -> new EntityNotFoundException("Faixa nao encontrada"));
        Usuario concedidaPor = usuarioRepository.findById(concedidaPorId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado"));

        // Integridade: a faixa tem que pertencer à modalidade da graduação
        if (!faixa.getModalidade().getId().equals(modalidade.getId())) {
            throw new BusinessException("A faixa selecionada nao pertence a esta modalidade");
        }

        // Grau dentro do configurado para a faixa (docs/09 §5)
        if (request.grau() < 0 || request.grau() > faixa.getGrausMax()) {
            throw new BusinessException("Grau invalido para esta faixa (maximo " + faixa.getGrausMax() + ")");
        }

        var graduacao = new Graduacao();
        graduacao.setAluno(aluno);
        graduacao.setModalidade(modalidade);
        graduacao.setFaixa(faixa);
        graduacao.setGrau(request.grau());
        graduacao.setData(request.data());
        graduacao.setObservacao(request.observacao());
        graduacao.setConcedidaPor(concedidaPor);
        var salva = graduacaoRepository.save(graduacao);

        // Notifica o aluno da nova graduação (docs/06 passo 8)
        String grauTexto = salva.getGrau() > 0 ? " " + salva.getGrau() + "º grau" : "";
        String mensagem = "Você foi graduado para " + faixa.getNome() + grauTexto + " em " + modalidade.getNome() + ".";
        notificacaoService.criar(aluno, TipoNotificacao.GRADUACAO, "Nova graduação!", mensagem, salva.getId());

        return GraduacaoResponse.from(salva);
    }

    /** Faixa/grau atual do aluno em cada modalidade onde já foi graduado. */
    public List<ProgressaoResponse> progressaoDoAluno(Long alunoId) {
        return modalidadeRepository.findByAtivoTrueOrderByNomeAsc().stream()
                .map(m -> graduacaoRepository
                        .findFirstByAlunoIdAndModalidadeIdOrderByDataDescIdDesc(alunoId, m.getId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(g -> montarProgressao(alunoId, g))
                .toList();
    }

    /**
     * Enriquece a faixa/grau atual com os dados da barra de progresso do Início
     * (spec tela-inicio §3): check-ins acumulados desde a graduação atual, meta
     * indicativa da faixa e a próxima faixa da sequência (para o rótulo
     * "Rumo à faixa X" quando o aluno está no último grau).
     */
    private ProgressaoResponse montarProgressao(Long alunoId, Graduacao g) {
        Faixa faixa = g.getFaixa();
        int checkinsNoGrau = (int) checkinRepository.countTreinosDesde(alunoId, g.getData());
        Faixa proxima = faixaRepository
                .findByModalidadeIdOrderByOrdemAsc(faixa.getModalidade().getId()).stream()
                .filter(f -> f.getOrdem() == faixa.getOrdem() + 1)
                .findFirst()
                .orElse(null);
        return new ProgressaoResponse(
                g.getModalidade().getId(),
                g.getModalidade().getNome(),
                faixa.getNome(),
                faixa.getCor(),
                g.getGrau(),
                g.getData(),
                faixa.getGrausMax(),
                checkinsNoGrau,
                faixa.getCheckinsPorGrau(),
                proxima != null ? proxima.getNome() : null,
                proxima != null ? proxima.getCor() : null
        );
    }

    /** Linha do tempo de graduações do aluno (docs/01), mais recente primeiro. */
    public List<GraduacaoResponse> historico(Long alunoId) {
        return graduacaoRepository.findByAlunoIdOrderByDataDescIdDesc(alunoId).stream()
                .map(GraduacaoResponse::from)
                .toList();
    }
}
