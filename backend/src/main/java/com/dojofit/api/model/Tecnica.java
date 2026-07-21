package com.dojofit.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Técnica do catálogo de uma modalidade (docs/09 §6, Fase 3b). Configurável
 * por modalidade (como as faixas) — nada assume uma modalidade única.
 */
@Entity
@Table(name = "tecnica")
@Getter
@Setter
@NoArgsConstructor
public class Tecnica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modalidade_id", nullable = false)
    private Modalidade modalidade;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(columnDefinition = "text")
    private String descricao;

    @Column(nullable = false)
    private Boolean ativo = true;
}
