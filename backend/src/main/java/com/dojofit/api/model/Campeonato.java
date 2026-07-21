package com.dojofit.api.model;

import com.dojofit.api.model.enums.ResultadoCampeonato;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Participação de um aluno em um campeonato (docs/09 §7, Fase 3c). Cada registro
 * é um evento na linha do tempo permanente do atleta (docs/01). Registrado pela
 * equipe (nunca autodeclarado).
 */
@Entity
@Table(name = "campeonato")
@Getter
@Setter
@NoArgsConstructor
public class Campeonato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false)
    private LocalDate data;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ResultadoCampeonato resultado;

    @Column(length = 100)
    private String categoria;

    @Column(columnDefinition = "text")
    private String observacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por_id", nullable = false)
    private Usuario registradoPor;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
