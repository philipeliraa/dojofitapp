package com.dojofit.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "lista_espera", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"aula_id", "aluno_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class ListaEspera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aula_id", nullable = false)
    private Aula aula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @Column(nullable = false)
    private Integer posicao;

    @Column(name = "data_hora_entrada", nullable = false)
    private LocalDateTime dataHoraEntrada = LocalDateTime.now();
}
