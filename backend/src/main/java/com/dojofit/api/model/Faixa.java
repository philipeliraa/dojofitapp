package com.dojofit.api.model;

import com.dojofit.api.model.enums.CorFaixa;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Faixa de uma modalidade (docs/09 §5: progressão configurável por modalidade).
 * A sequência é dado, não enum hardcoded: `ordem` define a posição na
 * progressão e `grausMax` o número de graus antes da próxima faixa.
 */
@Entity
@Table(name = "faixa")
@Getter
@Setter
@NoArgsConstructor
public class Faixa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modalidade_id", nullable = false)
    private Modalidade modalidade;

    @Column(nullable = false, length = 50)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CorFaixa cor;

    @Column(nullable = false)
    private Integer ordem;

    @Column(name = "graus_max", nullable = false)
    private Integer grausMax;

    // Meta indicativa de check-ins por grau (spec tela-inicio §3): base da barra
    // de progresso do Início. Indicativa — não promove ninguém automaticamente.
    // Editar a meta é de outro módulo (spec §7); faixas novas herdam este
    // default até existir essa ferramenta.
    @Column(name = "checkins_por_grau", nullable = false)
    private Integer checkinsPorGrau = 40;
}
