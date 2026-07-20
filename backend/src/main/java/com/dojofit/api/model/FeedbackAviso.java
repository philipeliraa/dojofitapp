package com.dojofit.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Feedback do aluno em resposta a um aviso (docs/02 §4, Fase 2). Privado: só o
 * próprio autor e a academia (Professor/Admin) enxergam — a filtragem por
 * visibilidade vive no {@code FeedbackAvisoService}, nunca no controller.
 */
@Entity
@Table(name = "feedback_aviso")
@Getter
@Setter
@NoArgsConstructor
public class FeedbackAviso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aviso_id", nullable = false)
    private Aviso aviso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @Column(nullable = false, columnDefinition = "text")
    private String conteudo;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
