package com.dojofit.api.service;

import com.dojofit.api.dto.request.GraduacaoRequest;
import com.dojofit.api.exception.BusinessException;
import com.dojofit.api.model.Faixa;
import com.dojofit.api.model.Graduacao;
import com.dojofit.api.model.Modalidade;
import com.dojofit.api.model.Usuario;
import com.dojofit.api.model.enums.CorFaixa;
import com.dojofit.api.model.enums.Role;
import com.dojofit.api.model.enums.TipoNotificacao;
import com.dojofit.api.repository.FaixaRepository;
import com.dojofit.api.repository.GraduacaoRepository;
import com.dojofit.api.repository.ModalidadeRepository;
import com.dojofit.api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GraduacaoServiceTest {

    @Mock
    private GraduacaoRepository graduacaoRepository;
    @Mock
    private ModalidadeRepository modalidadeRepository;
    @Mock
    private FaixaRepository faixaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private NotificacaoService notificacaoService;

    @InjectMocks
    private GraduacaoService graduacaoService;

    private Usuario aluno;
    private Usuario professor;
    private Modalidade jiujitsu;
    private Faixa azul;

    @BeforeEach
    void setUp() {
        aluno = usuario(2L, "Aluno Joao", Role.ALUNO);
        professor = usuario(1L, "Professor Carlos", Role.PROFESSOR);

        jiujitsu = new Modalidade();
        jiujitsu.setId(10L);
        jiujitsu.setNome("Jiu-Jitsu");
        jiujitsu.setAtivo(true);

        azul = faixa(100L, "Azul", CorFaixa.AZUL, 2, 4, jiujitsu);
    }

    private Usuario usuario(Long id, String nome, Role role) {
        var u = new Usuario();
        u.setId(id);
        u.setNome(nome);
        u.setRole(role);
        return u;
    }

    private Faixa faixa(Long id, String nome, CorFaixa cor, int ordem, int grausMax, Modalidade m) {
        var f = new Faixa();
        f.setId(id);
        f.setNome(nome);
        f.setCor(cor);
        f.setOrdem(ordem);
        f.setGrausMax(grausMax);
        f.setModalidade(m);
        return f;
    }

    private void stubEntidadesConceder() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(aluno));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(professor));
        when(modalidadeRepository.findById(10L)).thenReturn(Optional.of(jiujitsu));
        when(faixaRepository.findById(100L)).thenReturn(Optional.of(azul));
    }

    @Test
    @DisplayName("Concede graduação com faixa, grau e quem concedeu")
    void concedeGraduacao() {
        stubEntidadesConceder();
        when(graduacaoRepository.save(any(Graduacao.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = graduacaoService.conceder(
                new GraduacaoRequest(2L, 10L, 100L, 2, LocalDate.of(2026, 7, 19), "Boa evolução"), 1L);

        var captor = ArgumentCaptor.forClass(Graduacao.class);
        verify(graduacaoRepository).save(captor.capture());
        assertEquals(aluno, captor.getValue().getAluno());
        assertEquals(azul, captor.getValue().getFaixa());
        assertEquals(professor, captor.getValue().getConcedidaPor());
        assertEquals("Azul", response.faixaNome());
        assertEquals(CorFaixa.AZUL, response.cor());
        assertEquals(2, response.grau());
        // Notifica o aluno da nova graduação (docs/06 passo 8)
        verify(notificacaoService).criar(eq(aluno), eq(TipoNotificacao.GRADUACAO), any(), any(), any());
    }

    @Test
    @DisplayName("Rejeita faixa que não pertence à modalidade")
    void rejeitaFaixaDeOutraModalidade() {
        var outra = new Modalidade();
        outra.setId(99L);
        azul.setModalidade(outra);
        stubEntidadesConceder();

        assertThrows(BusinessException.class, () -> graduacaoService.conceder(
                new GraduacaoRequest(2L, 10L, 100L, 2, LocalDate.now(), null), 1L));
        verify(graduacaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Rejeita grau acima do máximo da faixa")
    void rejeitaGrauAcimaDoMaximo() {
        stubEntidadesConceder();

        assertThrows(BusinessException.class, () -> graduacaoService.conceder(
                new GraduacaoRequest(2L, 10L, 100L, 5, LocalDate.now(), null), 1L));
        verify(graduacaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Progressão retorna a faixa atual por modalidade onde há graduação")
    void progressaoRetornaFaixaAtual() {
        var semGraduacao = new Modalidade();
        semGraduacao.setId(20L);
        semGraduacao.setNome("Muay Thai");
        semGraduacao.setAtivo(true);

        var grad = new Graduacao();
        grad.setAluno(aluno);
        grad.setModalidade(jiujitsu);
        grad.setFaixa(azul);
        grad.setGrau(3);
        grad.setData(LocalDate.of(2026, 6, 1));

        when(modalidadeRepository.findByAtivoTrueOrderByNomeAsc()).thenReturn(List.of(jiujitsu, semGraduacao));
        when(graduacaoRepository.findFirstByAlunoIdAndModalidadeIdOrderByDataDescIdDesc(2L, 10L))
                .thenReturn(Optional.of(grad));
        when(graduacaoRepository.findFirstByAlunoIdAndModalidadeIdOrderByDataDescIdDesc(2L, 20L))
                .thenReturn(Optional.empty());

        var progressao = graduacaoService.progressaoDoAluno(2L);

        assertEquals(1, progressao.size());
        assertEquals("Jiu-Jitsu", progressao.get(0).modalidadeNome());
        assertEquals(CorFaixa.AZUL, progressao.get(0).cor());
        assertEquals(3, progressao.get(0).grau());
    }
}
