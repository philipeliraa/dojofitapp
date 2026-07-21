package com.dojofit.api.model;

import com.dojofit.api.model.enums.TipoAvaliacao;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Registro do professor sobre o aluno (docs/09 §8): avaliação, observação ou
 * recomendação. Escrito pela equipe. A visibilidade é por registro: privado
 * (só equipe) por padrão; público torna a nota visível ao aluno no Perfil —
 * útil para recomendações de melhoria.
 */
@Entity
@Table(name = "avaliacao")
@Getter
@Setter
@NoArgsConstructor
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoAvaliacao tipo;

    @Column(nullable = false, columnDefinition = "text")
    private String conteudo;

    @Column(nullable = false)
    private Boolean publico = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
