package com.dojofit.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Modalidade esportiva (docs/01: multi-esporte é princípio arquitetural). A
 * progressão de faixa/grau é configurável POR modalidade (docs/09 §5) — nada
 * assume uma única modalidade de forma hardcoded.
 */
@Entity
@Table(name = "modalidade")
@Getter
@Setter
@NoArgsConstructor
public class Modalidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false)
    private Boolean ativo = true;
}
