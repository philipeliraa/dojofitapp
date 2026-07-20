package com.dojofit.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Evento de graduação (docs/01: cada graduação é parte da história permanente
 * do atleta; docs/06 fluxo 3). Concedida pela equipe (nunca autodeclarada). A
 * faixa atual do aluno numa modalidade é a graduação mais recente.
 */
@Entity
@Table(name = "graduacao")
@Getter
@Setter
@NoArgsConstructor
public class Graduacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modalidade_id", nullable = false)
    private Modalidade modalidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faixa_id", nullable = false)
    private Faixa faixa;

    @Column(nullable = false)
    private Integer grau;

    @Column(nullable = false)
    private LocalDate data;

    @Column(columnDefinition = "text")
    private String observacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concedida_por_id", nullable = false)
    private Usuario concedidaPor;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
