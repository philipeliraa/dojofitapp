package com.dojofit.api.model;

import com.dojofit.api.model.enums.StatusTecnica;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Status de uma técnica para um aluno (docs/09 §6). Avaliação de coaching —
 * definida pela equipe (Professor/Admin), nunca autodeclarada. Um único
 * registro por (aluno, técnica).
 */
@Entity
@Table(name = "tecnica_aluno", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"aluno_id", "tecnica_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class TecnicaAluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnica_id", nullable = false)
    private Tecnica tecnica;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusTecnica status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avaliado_por_id", nullable = false)
    private Usuario avaliadoPor;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm = LocalDateTime.now();
}
