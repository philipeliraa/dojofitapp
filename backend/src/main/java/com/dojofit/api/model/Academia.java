package com.dojofit.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Academia (tenant) — docs/01: multi-tenancy é princípio arquitetural, aqui
 * materializado como entidade mínima. Todo usuário pertence a uma academia; o
 * nome é o contexto de tenant exibido no Início (spec tela-inicio §4).
 */
@Entity
@Table(name = "academia")
@Getter
@Setter
@NoArgsConstructor
public class Academia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
